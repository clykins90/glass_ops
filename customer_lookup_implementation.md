# Customer Lookup Implementation for AI Agent

To enable the AI agent to check if a customer already exists in the system before creating a new record, we need to make several modifications to the implementation plan.

## API Enhancement

First, we need to add a search endpoint to the backend API:

```typescript
// server/src/controllers/customer.controller.ts

/**
 * Search for customers by email, phone, or name
 * @route GET /api/customers/search
 */
export const searchCustomers = async (req: Request, res: Response) => {
  try {
    // Validate that req.user and company_id exist
    const companyId = (req as any).user?.company_id;
    if (!companyId) {
      return res.status(401).json({
        error: 'Authentication required',
        details: 'Missing company ID - you may need to log in again'
      });
    }

    const { email, phone, name } = req.query;
    
    if (!email && !phone && !name) {
      return res.status(400).json({
        error: 'At least one search parameter is required',
        details: 'Please provide email, phone, or name'
      });
    }

    // Build the query
    let query = supabase
      .from('customers')
      .select('*')
      .match({ company_id: companyId });
    
    // Apply filters if provided
    if (email) {
      query = query.eq('email', email);
    }
    
    if (phone) {
      query = query.eq('phone', phone);
    }
    
    if (name) {
      // Split name into potential first and last name parts
      const nameParts = String(name).split(' ');
      if (nameParts.length > 1) {
        // Search for potential first and last name matches
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        query = query.or(`firstName.ilike.%${firstName}%,lastName.ilike.%${lastName}%`);
      } else {
        // Single name part - search in both first and last name
        query = query.or(`firstName.ilike.%${name}%,lastName.ilike.%${name}%`);
      }
    }

    const { data: customers, error } = await query;

    if (error) throw error;

    res.json(customers);
  } catch (error: any) {
    console.error('Error searching customers:', error);
    res.status(500).json({
      error: 'Failed to search customers',
      details: error.message
    });
  }
};
```

Then, we need to add this endpoint to the router:

```typescript
// server/src/routes/customer.routes.ts

// GET /api/customers/search - Search for customers
router.get('/search', requirePermission('customers', 'read'), searchCustomers);
```

## Client Service Update

Next, we need to extend the client-side customer API service:

```typescript
// client/src/services/api.ts

export const customerApi = {
  ...createCrudApi<Customer>('customers'),
  getVehicles: async (customerId: string | number) => 
    apiRequest<Vehicle[]>(`customers/${customerId}/vehicles`),
  getWorkOrders: async (customerId: string | number) => 
    apiRequest<WorkOrder[]>(`customers/${customerId}/workorders`),
  search: async (params: { email?: string; phone?: string; name?: string }) => {
    const queryParams = new URLSearchParams();
    
    if (params.email) queryParams.append('email', params.email);
    if (params.phone) queryParams.append('phone', params.phone);
    if (params.name) queryParams.append('name', params.name);
    
    return apiRequest<Customer[]>(`customers/search?${queryParams.toString()}`);
  }
};
```

## AI Agent Service Enhancement

Now, let's update the conversation service to include customer lookup:

```typescript
// server/src/services/conversationService.ts

import { customerApi } from './api';

// Add this function to the conversation service
export const findExistingCustomer = async (
  customerInfo: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }
): Promise<Customer | null> => {
  try {
    let results: Customer[] = [];
    
    // Try to search by phone first (most reliable identifier)
    if (customerInfo.phone) {
      const phoneResults = await customerApi.search({ phone: customerInfo.phone });
      if (phoneResults.length > 0) {
        return phoneResults[0];
      }
    }
    
    // If no results, try by email
    if (customerInfo.email) {
      const emailResults = await customerApi.search({ email: customerInfo.email });
      if (emailResults.length > 0) {
        return emailResults[0];
      }
    }
    
    // Finally, try by name if we have at least a first and last name
    if ((customerInfo.firstName && customerInfo.lastName) || customerInfo.name) {
      const nameQuery = customerInfo.name || 
        `${customerInfo.firstName} ${customerInfo.lastName}`;
      
      const nameResults = await customerApi.search({ name: nameQuery });
      if (nameResults.length > 0) {
        return nameResults[0];
      }
    }
    
    // No matching customer found
    return null;
  } catch (error) {
    console.error('Error finding existing customer:', error);
    return null;
  }
};
```

## Update Processing Logic

Now, we need to update the customer information processing logic to check for existing customers:

```typescript
// server/src/services/conversationService.ts

// Update the updateConversationState function
export const updateConversationState = async (conversationId: string): Promise<void> => {
  const conversation = conversations.get(conversationId);
  if (!conversation) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }
  
  const { state, messages } = conversation;
  
  // Extract information based on the current step
  if (state.currentStep === 'customer_info' && messages.length >= 3) {
    const customerInfo = await extractInformation(messages, 'customer');
    
    if (Object.keys(customerInfo).length > 2) { // If we have sufficient customer info
      // Check if the customer already exists
      const existingCustomer = await findExistingCustomer(customerInfo);
      
      if (existingCustomer) {
        // Customer exists, use the existing record
        state.customer = existingCustomer;
        state.customerExists = true;
        
        // Add a system message about the existing customer
        addMessage(conversationId, {
          role: 'system',
          content: `Found existing customer: ${existingCustomer.firstName} ${existingCustomer.lastName} (${existingCustomer.email || existingCustomer.phone})`
        });
        
        // If the customer has vehicles, we can check those too
        try {
          const vehicles = await customerApi.getVehicles(existingCustomer.id);
          if (vehicles && vehicles.length > 0) {
            state.customerVehicles = vehicles;
            
            // Add a system message about existing vehicles
            addMessage(conversationId, {
              role: 'system',
              content: `Customer has ${vehicles.length} existing vehicle(s)`
            });
          }
        } catch (error) {
          console.error('Error fetching customer vehicles:', error);
        }
      } else {
        // New customer
        state.customer = customerInfo;
        state.customerExists = false;
      }
      
      // Move to next step
      state.currentStep = 'vehicle_info';
    }
  } else if (state.currentStep === 'vehicle_info' && state.customer) {
    // Handle vehicle information collection
    const vehicleInfo = await extractInformation(messages, 'vehicle');
    
    if (Object.keys(vehicleInfo).length > 2) { // If we have sufficient vehicle info
      // If customer exists, check if this vehicle already exists
      if (state.customerExists && state.customerVehicles) {
        const matchingVehicle = state.customerVehicles.find(vehicle => {
          // Match by VIN (most reliable)
          if (vehicleInfo.vin && vehicle.vin === vehicleInfo.vin) {
            return true;
          }
          
          // Alternative matching by make/model/year
          if (
            vehicleInfo.make && 
            vehicleInfo.model && 
            vehicleInfo.year && 
            vehicle.make === vehicleInfo.make &&
            vehicle.model === vehicleInfo.model &&
            vehicle.year == vehicleInfo.year
          ) {
            return true;
          }
          
          return false;
        });
        
        if (matchingVehicle) {
          // Use existing vehicle
          state.vehicle = matchingVehicle;
          state.vehicleExists = true;
          
          addMessage(conversationId, {
            role: 'system',
            content: `Found existing vehicle: ${matchingVehicle.year} ${matchingVehicle.make} ${matchingVehicle.model}`
          });
        } else {
          // New vehicle for existing customer
          state.vehicle = vehicleInfo;
          state.vehicleExists = false;
        }
      } else {
        // New vehicle for new customer
        state.vehicle = vehicleInfo;
        state.vehicleExists = false;
      }
      
      // Move to next step
      state.currentStep = 'service_info';
    }
  } else if (state.currentStep === 'service_info' && state.vehicle) {
    // Continue with existing logic...
  }
  
  // Update the conversation in storage
  conversation.updatedAt = new Date();
  conversations.set(conversationId, conversation);
};
```

## Update System Prompt

Let's also update the system prompt to instruct the AI to check for existing customers:

```typescript
// server/src/services/openaiService.ts

// Define system prompt for the scheduling agent
const SYSTEM_PROMPT = `
You are an AI assistant for GlassOps, a glass repair and installation service. 
Your job is to help customers schedule appointments for glass repair or installation.

Follow these steps:
1. Collect customer information (name, phone, email, address)
   - If the customer already exists in the system, confirm their details
   - If not, collect all necessary information for a new customer
2. Collect vehicle information (make, model, year, VIN)
   - If the customer has existing vehicles, ask if they want to use one of those
   - If not, collect all necessary information for a new vehicle
3. Determine the service needs (windshield repair, replacement, etc.)
4. Check availability and schedule the appointment

Be friendly, professional, and efficient. When a customer or vehicle already exists in our system, 
acknowledge that to the customer and confirm the information is still correct.
`;
```

## Update Response Generation

Finally, we need to update the chat completion function to handle existing records appropriately:

```typescript
// server/src/services/openaiService.ts

export const createChatCompletion = async (
  messages: AgentMessage[],
  state: AgentState
): Promise<string> => {
  try {
    // Add system prompt
    const allMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages as ChatCompletionMessageParam[]
    ];

    // Add current state as context with special handling for existing records
    let contextMessage = `Current information collected: `;
    
    if (state.customer) {
      contextMessage += `\nCustomer: ${state.customerExists ? 'EXISTING RECORD' : 'NEW RECORD'}`;
      contextMessage += `\n${JSON.stringify(state.customer)}`;
    }
    
    if (state.vehicle) {
      contextMessage += `\nVehicle: ${state.vehicleExists ? 'EXISTING RECORD' : 'NEW RECORD'}`;
      contextMessage += `\n${JSON.stringify(state.vehicle)}`;
    }
    
    if (state.service) {
      contextMessage += `\nService: ${JSON.stringify(state.service)}`;
    }
    
    if (state.appointment) {
      contextMessage += `\nAppointment: ${JSON.stringify(state.appointment)}`;
    }
    
    // Add extra context about existing vehicles if present
    if (state.customerVehicles && state.customerVehicles.length > 0) {
      contextMessage += `\nExisting vehicles for this customer:`;
      state.customerVehicles.forEach((vehicle, index) => {
        contextMessage += `\n${index + 1}. ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.vin || 'No VIN'})`;
      });
    }
    
    allMessages.push({
      role: 'system', 
      content: contextMessage
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL || 'gpt-4-turbo',
      messages: allMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0].message.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to communicate with AI service');
  }
};
```

## Update the AgentState Interface

We need to extend the AgentState interface to include the new properties:

```typescript
// server/src/services/openaiService.ts

export interface AgentState {
  customer?: any;
  customerExists?: boolean;
  customerVehicles?: any[];
  vehicle?: any;
  vehicleExists?: boolean;
  service?: any;
  appointment?: any;
  currentStep: 'customer_info' | 'vehicle_info' | 'service_info' | 'scheduling' | 'confirmation';
}
```

## Update Work Order Creation Logic

Finally, let's update the work order creation logic to handle existing records:

```typescript
// server/src/services/conversationService.ts

export const createWorkOrderFromConversation = async (conversationId: string): Promise<any> => {
  const conversation = conversations.get(conversationId);
  if (!conversation) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }
  
  const { state, companyId } = conversation;
  
  if (!state.customer || !state.vehicle || !state.service || !state.appointment) {
    throw new Error('Incomplete information for work order creation');
  }
  
  try {
    let customerId;
    let vehicleId;
    
    // Handle customer record
    if (state.customerExists) {
      // Use existing customer
      customerId = state.customer.id;
    } else {
      // Create new customer
      const newCustomer = await customerApi.create({
        ...state.customer,
        companyId,
      });
      customerId = newCustomer.id;
    }
    
    // Handle vehicle record
    if (state.vehicleExists) {
      // Use existing vehicle
      vehicleId = state.vehicle.id;
    } else {
      // Create new vehicle
      const newVehicle = await vehicleApi.create({
        ...state.vehicle,
        customerId,
        companyId,
      });
      vehicleId = newVehicle.id;
    }
    
    // Create work order
    const workOrder = await workOrderApi.create({
      vehicleId,
      customerId,
      description: state.service.description,
      status: 'scheduled',
      scheduledDate: state.appointment.date,
      technicianId: state.appointment.technicianId,
      companyId,
    });
    
    return workOrder;
  } catch (error) {
    console.error('Error creating work order:', error);
    throw new Error('Failed to create work order from conversation');
  }
};
```

## Updated Todo List

Add these tasks to the AI agent implementation todo list:

- [ ] Implement customer search API endpoint
- [ ] Add vehicle lookup by customer ID
- [ ] Update agent state management to track existing records
- [ ] Enhance conversation flow to handle existing customers and vehicles
- [ ] Update system prompt to guide the AI in handling existing records
- [ ] Add testing for customer lookup functionality 