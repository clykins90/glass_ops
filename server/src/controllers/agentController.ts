import { Request, Response } from 'express';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import fetch from 'node-fetch';


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory storage (replace with database in production)
const conversations = new Map<string, Conversation>();

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    user_id?: string;
    company_id?: string | number;
  };
}

// Define agent message type
interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  timestamp?: Date;
}

// Define state structure
interface AgentState {
  customer?: any;
  vehicle?: any;
  appointment?: any;
  workOrder?: any;
  savedCustomer?: any;
  savedVehicle?: any;
  currentStep: 'customer_info' | 'vehicle_info' | 'scheduling' | 'confirmation';
}

// Define conversation structure
interface Conversation {
  id: string;
  userId: string;
  companyId: string;
  messages: AgentMessage[];
  state: AgentState;
  createdAt: Date;
  updatedAt: Date;
}

// Define system prompt for the agent
const SYSTEM_PROMPT = `
You are an AI assistant for GlassOps, a glass repair and installation service. 
Your job is to help customers schedule appointments for glass repair or installation in a friendly, empathetic manner.

Today's date is ${new Date().toLocaleDateString()}.

PROCESS GUIDELINES:
1. Collect customer information (name, phone, email, address)
2. Collect vehicle information (make, model, year, VIN optional)
3. Schedule an appointment by collecting:
   - Service details (type of glass damage, location, severity)
   - Date and time preferences
   - Contact preferences
4. Confirm all details and create a work order

SCHEDULING CAPABILITIES:
- You can check technician availability for specific dates and times
- Different services require different amounts of time (repairs ~60 min, replacements ~120 min)
- You should suggest alternative times if a customer's preferred time is not available
- Once availability is confirmed, you can schedule with a specific technician

Be conversational and helpful throughout the entire interaction. Use the functions available to you when you have collected the necessary information at each step.
`;

// Define agent functions
const agentFunctions = [
  {
    name: "create_customer",
    description: "Create a customer record when all required customer information has been collected",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Full name (first and last name)"
        },
        phone: {
          type: "string",
          description: "Phone number (10 digits)"
        },
        email: {
          type: "string",
          description: "Email address (optional)"
        },
        address: {
          type: "string",
          description: "Complete address (optional)"
        }
      },
      required: ["name", "phone"]
    }
  },
  {
    name: "create_vehicle",
    description: "Create a vehicle record when all required vehicle information has been collected",
    parameters: {
      type: "object",
      properties: {
        make: {
          type: "string",
          description: "Vehicle manufacturer"
        },
        model: {
          type: "string",
          description: "Vehicle model"
        },
        year: {
          type: "integer",
          description: "Production year"
        },
        vin: {
          type: "string",
          description: "Vehicle identification number (optional)"
        }
      },
      required: ["make", "model", "year"]
    }
  },
  {
    name: "create_appointment",
    description: "Create an appointment when the customer has confirmed a date and time",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Appointment date (YYYY-MM-DD format)"
        },
        time: {
          type: "string",
          description: "Appointment time (HH:MM format, 24-hour)"
        },
        service_type: {
          type: "string",
          description: "Type of glass service needed (e.g., windshield repair, windshield replacement, door glass, etc.)"
        },
        description: {
          type: "string",
          description: "Description of the issue (e.g., crack location, chip size, etc.)"
        },
        notes: {
          type: "string",
          description: "Additional notes (optional)"
        }
      },
      required: ["date", "time", "service_type", "description"]
    }
  },
  {
    name: "create_work_order",
    description: "Create a work order when all information has been collected and confirmed",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "check_technician_availability",
    description: "Check for available technicians and assign the work order to one that's free",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "The date to check availability for (YYYY-MM-DD format)"
        },
        time: {
          type: "string",
          description: "The time to check availability for (HH:MM format, 24-hour)"
        },
        service_type: {
          type: "string",
          description: "Type of service needed (optional, will use previously recorded service type if not provided)"
        }
      },
      required: ["date", "time"]
    }
  }
];

// Generate a random ID (simplified)
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Start a new conversation
export const startConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.user?.user_id || req.body.userId;
    const companyId = req.user?.company_id || req.body.companyId;
    
    if (!userId || !companyId) {
      return res.status(400).json({ error: 'User ID and company ID are required' });
    }
    
    const conversationId = generateId();
    const newConversation: Conversation = {
      id: conversationId,
      userId: userId.toString(),
      companyId: companyId.toString(),
      messages: [
        {
          role: 'assistant',
          content: 'Hello! Welcome to GlassOps. How can I help you today with your glass repair or installation needs?',
          timestamp: new Date()
        }
      ],
      state: {
        currentStep: 'customer_info',
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    conversations.set(conversationId, newConversation);
    
    return res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error starting conversation:', error);
    return res.status(500).json({ error: 'Failed to start conversation' });
  }
};

// Get a conversation by ID
export const getConversationById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = conversations.get(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    return res.status(200).json(conversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    return res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Process a message from the user
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const conversation = conversations.get(id) as Conversation;
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Prepare messages for OpenAI
    const openaiMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `Current state: ${JSON.stringify(conversation.state)}` },
      ...conversation.messages.map(msg => ({
        role: msg.role as any,
        content: msg.content,
        name: msg.name
      }))
    ];
    
    // Determine which functions to include based on current state
    let availableFunctions = [];
    if (conversation.state.currentStep === 'customer_info' && !conversation.state.savedCustomer) {
      availableFunctions.push(agentFunctions[0]);
    } else if (conversation.state.currentStep === 'vehicle_info' && !conversation.state.savedVehicle) {
      availableFunctions.push(agentFunctions[1]);
    } else if (conversation.state.currentStep === 'scheduling' && !conversation.state.appointment) {
      availableFunctions.push(agentFunctions[2]);
    } else if (conversation.state.currentStep === 'confirmation' && !conversation.state.workOrder) {
      availableFunctions.push(agentFunctions[3]);
    } else if (conversation.state.workOrder && !conversation.state.workOrder.technician_id) {
      availableFunctions.push(agentFunctions[4]);
    }
    
    // Get response from OpenAI – if functions are available, force a function call by setting function_call
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL || 'gpt-4o-mini',
      messages: openaiMessages,
      functions: availableFunctions.length > 0 ? availableFunctions : undefined,
      function_call: availableFunctions.length > 0 ? { name: availableFunctions[0].name } : "auto",
      temperature: 0.7,
      max_tokens: 500,
    });
    
    // Extract the response message from OpenAI
    const responseMessage = completion.choices[0].message;
    let responseContent = responseMessage.content || '';
    
    // If a function call was returned, process it
    if (responseMessage.function_call) {
      const { name: functionName, arguments: functionArguments } = responseMessage.function_call;
      const functionArgs = JSON.parse(functionArguments || '{}');
      console.log(`Function called: ${functionName} with args:`, functionArgs);
      
      let functionResult = null;
      if (functionName === 'create_customer') {
        functionResult = await handleCreateCustomer(conversation, functionArgs);
        console.log(`[DEBUG] handleCreateCustomer executed, result: ${JSON.stringify(functionResult)}`);
      } else if (functionName === 'create_vehicle') {
        functionResult = await handleCreateVehicle(conversation, functionArgs);
        console.log(`[DEBUG] handleCreateVehicle executed, result: ${JSON.stringify(functionResult)}`);
      } else if (functionName === 'create_appointment') {
        functionResult = await handleCreateAppointment(conversation, functionArgs);
        console.log(`[DEBUG] handleCreateAppointment executed, result: ${JSON.stringify(functionResult)}`);
      } else if (functionName === 'create_work_order') {
        functionResult = await handleCreateWorkOrder(conversation);
        console.log(`[DEBUG] handleCreateWorkOrder executed, result: ${JSON.stringify(functionResult)}`);
      } else if (functionName === 'check_technician_availability') {
        functionResult = await handleCheckTechnicianAvailability(conversation, functionArgs);
        console.log(`[DEBUG] handleCheckTechnicianAvailability executed, result: ${JSON.stringify(functionResult)}`);
      }
      
      // Add function result to messages
      conversation.messages.push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResult),
        timestamp: new Date()
      });
      
      // Get a follow-up response from the assistant after the function call
      const followUpMessages: ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: `Current state: ${JSON.stringify(conversation.state)}` },
        ...conversation.messages.map(msg => {
          if (msg.role === 'function') {
            return { role: 'function', name: msg.name, content: msg.content } as ChatCompletionMessageParam;
          } else {
            return { role: msg.role as any, content: msg.content } as ChatCompletionMessageParam;
          }
        })
      ];
      
      const followUpCompletion = await openai.chat.completions.create({
        model: process.env.OPENAI_API_MODEL || 'gpt-4o-mini',
        messages: followUpMessages,
        temperature: 0.7,
        max_tokens: 500
      });
      
      responseContent = followUpCompletion.choices[0].message.content || '';
    }
    
    // Add assistant response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: responseContent,
      timestamp: new Date()
    });
    
    conversation.updatedAt = new Date();
    
    return res.status(200).json({
      message: responseContent,
      conversation
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to process message' });
  }
};

// Create a work order from a conversation
export const createWorkOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = conversations.get(id) as Conversation;
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const workOrderResult = await handleCreateWorkOrder(conversation);
    
    if (!workOrderResult) {
      return res.status(400).json({ error: 'Missing required information for work order' });
    }
    
    return res.status(201).json(workOrderResult);
  } catch (error) {
    console.error('Error creating work order:', error);
    return res.status(500).json({ error: 'Failed to create work order' });
  }
};

// -------------------------
// Handler Functions
// -------------------------

// Create customer record
async function handleCreateCustomer(conversation: Conversation, args: any): Promise<any> {
  if (!args.name || !args.phone) {
    return { success: false, error: 'Name and phone are required' };
  }
  
  conversation.state.customer = args;
  conversation.state.savedCustomer = args;
  conversation.state.currentStep = 'vehicle_info';
  
  const nameParts = args.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const apiUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/customers`;
  const customerData = {
    firstName,
    lastName,
    phone: args.phone,
    email: args.email || null,
    address: args.address || null,
    company_id: conversation.companyId,
    isLead: false
  };
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Internal-Request': 'true',
      'X-Company-ID': conversation.companyId,
      'X-User-ID': conversation.userId
    };
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(customerData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ERROR] API error creating customer: ${response.status} - ${errorText}`);
      return { success: false, error: errorText };
    }
    const newCustomer = await response.json();
    console.log('[SUCCESS] Customer created successfully via API:', newCustomer);
    
    if (newCustomer && newCustomer.id) {
      conversation.state.customer.id = newCustomer.id;
      conversation.state.savedCustomer.id = newCustomer.id;
    }
    return { success: true, customer: newCustomer };
  } catch (error: any) {
    console.error('[ERROR] Exception in customer API call:', error);
    return { success: false, error: error.message || error };
  }
}

// Create vehicle record
async function handleCreateVehicle(conversation: Conversation, args: any): Promise<any> {
  if (!args.make || !args.model || !args.year) {
    return { success: false, error: 'Make, model, and year are required' };
  }
  
  conversation.state.vehicle = args;
  conversation.state.savedVehicle = args;
  conversation.state.currentStep = 'scheduling';
  
  const customerId = conversation.state.customer?.id || conversation.state.savedCustomer?.id;
  const apiUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/vehicles`;
  const vehicleData = {
    make: args.make,
    model: args.model,
    year: args.year,
    vinNumber: args.vin || null,
    customerId: customerId,
    company_id: conversation.companyId
  };
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Internal-Request': 'true',
      'X-Company-ID': conversation.companyId,
      'X-User-ID': conversation.userId
    };
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(vehicleData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ERROR] API error creating vehicle: ${response.status} - ${errorText}`);
      return { success: false, error: errorText };
    }
    const newVehicle = await response.json();
    console.log('[SUCCESS] Vehicle created successfully via API:', newVehicle);
    
    if (newVehicle && newVehicle.id) {
      conversation.state.vehicle.id = newVehicle.id;
      conversation.state.savedVehicle.id = newVehicle.id;
    }
    return { success: true, vehicle: newVehicle };
  } catch (error: any) {
    console.error('[ERROR] Exception in vehicle API call:', error);
    return { success: false, error: error.message || error };
  }
}

// Create appointment
async function handleCreateAppointment(conversation: Conversation, args: any): Promise<any> {
  if (!args.date || !args.time || !args.service_type || !args.description) {
    return { success: false, error: 'Date, time, service type and description are required' };
  }
  
  conversation.state.appointment = args;
  conversation.state.currentStep = 'confirmation';
  
  const customerId = conversation.state.customer?.id || conversation.state.savedCustomer?.id;
  const vehicleId = conversation.state.vehicle?.id || conversation.state.savedVehicle?.id;
  const apiUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/appointments`;
  const appointmentData = {
    date: args.date,
    time: args.time,
    notes: args.notes || '',
    customer_id: customerId,
    vehicle_id: vehicleId,
    service_type: args.service_type,
    description: args.description,
    company_id: conversation.companyId,
    status: 'scheduled'
  };
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Internal-Request': 'true',
      'X-Company-ID': conversation.companyId,
      'X-User-ID': conversation.userId
    };
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(appointmentData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ERROR] API error creating appointment: ${response.status} - ${errorText}`);
      return { success: false, error: errorText };
    }
    const newAppointment = await response.json();
    console.log('[SUCCESS] Appointment created successfully via API:', newAppointment);
    
    if (newAppointment && newAppointment.id) {
      conversation.state.appointment.id = newAppointment.id;
    }
    return { success: true, appointment: newAppointment };
  } catch (error: any) {
    console.error('[ERROR] Exception in appointment API call:', error);
    return { success: false, error: error.message || error };
  }
}

// Create work order
async function handleCreateWorkOrder(conversation: Conversation): Promise<any> {
  const { customer, vehicle, appointment } = conversation.state;
  
  if (!customer?.name || !customer?.phone) {
    return null;
  }
  
  if (!vehicle?.make || !vehicle?.model || !vehicle?.year) {
    return null;
  }
  
  if (!appointment?.date || !appointment?.time || !appointment?.service_type) {
    return null;
  }
  
  const workOrder = {
    id: generateId(),
    customer,
    vehicle,
    appointment,
    status: 'scheduled',
    createdAt: new Date()
  };
  
  conversation.state.workOrder = workOrder;
  
  const customerId = conversation.state.customer?.id || conversation.state.savedCustomer?.id;
  const vehicleId = conversation.state.vehicle?.id || conversation.state.savedVehicle?.id;
  const technicianId = conversation.state.appointment?.technician_id;
  const estimatedDuration = conversation.state.appointment?.estimated_duration || 60;
  const apiUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/workorders`;
  const workOrderData = {
    customerId: customerId,
    vehicleId: vehicleId,
    technicianId: technicianId,
    company_id: conversation.companyId,
    status: 'scheduled',
    serviceType: appointment.service_type,
    glassLocation: appointment.description,
    notes: appointment.notes || '',
    insuranceClaim: false,
    scheduledDate: `${appointment.date}T${appointment.time}:00`,
    estimated_duration_minutes: estimatedDuration
  };
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Internal-Request': 'true',
      'X-Company-ID': conversation.companyId,
      'X-User-ID': conversation.userId
    };
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(workOrderData)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ERROR] API error creating work order: ${response.status} - ${errorText}`);
      return { success: false, error: errorText };
    }
    const newWorkOrder = await response.json();
    console.log('[SUCCESS] Work order created successfully via API:', newWorkOrder);
    
    if (newWorkOrder && newWorkOrder.id) {
      conversation.state.workOrder.id = newWorkOrder.id;
    }
    return { success: true, workOrder: newWorkOrder };
  } catch (error: any) {
    console.error('[ERROR] Exception in work order API call:', error);
    return { success: false, error: error.message || error };
  }
}

// Check technician availability and assign work order
async function handleCheckTechnicianAvailability(conversation: Conversation, args: any): Promise<any> {
  if (!args.date || !args.time) {
    return { success: false, error: 'Date and time are required' };
  }

  const serviceType = args.service_type || conversation.state.appointment?.service_type;
  const companyId = conversation.companyId;
  
  // Calculate estimated duration based on service type
  let estimatedDuration = 60;
  if (serviceType) {
    if (serviceType.toLowerCase().includes('repair')) {
      estimatedDuration = 60;
    } else if (serviceType.toLowerCase().includes('replacement')) {
      estimatedDuration = 120;
    } else if (serviceType.toLowerCase().includes('emergency')) {
      estimatedDuration = 90;
    }
  }

  try {
    const availabilityUrl = `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/availability?date=${args.date}&time=${args.time}&duration=${estimatedDuration}`;
    const response = await fetch(availabilityUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || ''}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error checking technician availability:', errorData);
      return { 
        success: false, 
        error: 'Failed to check technician availability', 
        message: 'We couldn\'t check technician availability at this time. Please try a different date or time.'
      };
    }

    const availableTechnicians = await response.json();
    const actuallyAvailable = availableTechnicians.filter((tech: any) => tech.available === true);
    
    if (actuallyAvailable.length === 0) {
      return { 
        success: true, 
        available: false, 
        message: `We don't have any technicians available on ${args.date} at ${args.time}. Would you like to try a different date or time?`
      };
    }
    
    const selectedTechnician = actuallyAvailable[0];
    
    conversation.state.appointment = {
      ...conversation.state.appointment,
      date: args.date,
      time: args.time,
      technician_id: selectedTechnician.id,
      technician_name: selectedTechnician.full_name,
      estimated_duration: estimatedDuration
    };
    
    if (conversation.state.workOrder) {
      conversation.state.workOrder.technicianId = selectedTechnician.id;
      conversation.state.workOrder.scheduledDate = new Date(`${args.date}T${args.time}`);
      conversation.state.workOrder.estimated_duration_minutes = estimatedDuration;
    }
    
    return { 
      success: true, 
      available: true, 
      technician: {
        id: selectedTechnician.id,
        name: selectedTechnician.full_name
      },
      date: args.date,
      time: args.time,
      message: `Great! Technician ${selectedTechnician.full_name} is available on ${args.date} at ${args.time}. I've reserved this time slot for your appointment.`
    };
  } catch (error: any) {
    console.error('Error checking technician availability:', error);
    return { 
      success: false, 
      error: 'Failed to check technician availability', 
      message: 'We experienced a technical issue while checking technician availability. Please try again later or call our office directly.'
    };
  }
}