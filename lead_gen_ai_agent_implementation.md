# AI Agent Implementation Blueprint

## Frontend Implementation

### New Files to Create

1. **Agent Page Component (`client/src/pages/AgentChat.tsx`)**
   - Main page for interacting with the AI agent
   - Contains chat interface and workflow visualization
   - Handles conversation state and message display

2. **Agent Service (`client/src/services/agentService.ts`)**
   - Manages API calls to the backend agent endpoints
   - Handles message sending and receiving
   - Manages conversation state

3. **Agent Components**
   - `client/src/components/agent/ChatWindow.tsx` - Renders the conversation
   - `client/src/components/agent/MessageBubble.tsx` - Individual message display
   - `client/src/components/agent/ChatInput.tsx` - User input for messages
   - `client/src/components/agent/WorkflowProgress.tsx` - Visual indicator of scheduling progress

4. **Agent Types (`client/src/types/agent.ts`)**
   - Define types for conversation, messages, agent state
   - Define workflow steps and progress tracking

## Backend Implementation

### New Files to Create

1. **OpenAI Service (`server/src/services/openaiService.ts`)**
   - Handles integration with OpenAI API
   - Manages API key and rate limiting
   - Processes conversations and generates responses

2. **Agent Controller (`server/src/controllers/agentController.ts`)**
   - Handles API endpoints for agent interaction
   - Processes incoming messages
   - Manages conversation context and state

3. **Agent Routes (`server/src/routes/agentRoutes.ts`)**
   - Defines API routes for agent interaction
   - Handles authentication and validation

4. **Conversation Service (`server/src/services/conversationService.ts`)**
   - Manages conversation persistence
   - Handles context tracking and state management
   - Processes workflow steps

5. **Conversation Model (`server/src/models/conversation.ts`)**
   - Defines database schema for conversations
   - Handles conversation and message storage

## Implementation Steps

### 1. Environment Setup

```bash
# Add OpenAI API key to environment files
# server/.env.development, server/.env.production
OPENAI_API_KEY=your_api_key_here
OPENAI_API_MODEL=gpt-4-turbo # or other appropriate model
```

### 2. Backend OpenAI Integration

Create a service to handle OpenAI API calls:

```typescript
// server/src/services/openaiService.ts
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define system prompt for the scheduling agent
const SYSTEM_PROMPT = `
You are an AI assistant for GlassOps, a glass repair and installation service. 
Your job is to help customers schedule appointments for glass repair or installation.
Follow these steps:
1. Collect customer information (name, phone, email, address)
2. Collect vehicle information (make, model, year, VIN)
3. Determine the service needs (windshield repair, replacement, etc.)
4. Check availability and schedule the appointment
Be friendly, professional, and efficient.
`;

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AgentState {
  customer?: any;
  vehicle?: any;
  service?: any;
  appointment?: any;
  currentStep: 'customer_info' | 'vehicle_info' | 'service_info' | 'scheduling' | 'confirmation';
}

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

    // Add current state as context
    allMessages.push({
      role: 'system', 
      content: `Current information collected: ${JSON.stringify(state)}`
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

// Function to extract structured data from conversations
export const extractInformation = async (
  messages: AgentMessage[],
  extractionTarget: 'customer' | 'vehicle' | 'service'
): Promise<any> => {
  try {
    // Create a prompt to extract specific information
    const extractionPrompt = `
      Based on the conversation, extract the following information about the ${extractionTarget}:
      ${extractionTarget === 'customer' ? 'name, phone, email, address' : ''}
      ${extractionTarget === 'vehicle' ? 'make, model, year, VIN' : ''}
      ${extractionTarget === 'service' ? 'service type, description, urgency' : ''}
      
      Respond with a valid JSON object containing only the extracted fields.
    `;
    
    // Prepare messages for the extraction request
    const extractionMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'You are a data extraction assistant. Extract structured data from conversations.' },
      ...messages as ChatCompletionMessageParam[],
      { role: 'user', content: extractionPrompt }
    ];
    
    // Call OpenAI API for extraction
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL || 'gpt-4-turbo',
      messages: extractionMessages,
      temperature: 0.1, // Lower temperature for more deterministic extraction
    });
    
    const extractedText = completion.choices[0].message.content || '{}';
    
    // Try to parse JSON from the response
    try {
      return JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Failed to parse extracted data:', parseError);
      return {};
    }
  } catch (error) {
    console.error('Error extracting information:', error);
    return {};
  }
};
```

### 3. Backend Conversation Management

Create a service to manage conversations:

```typescript
// server/src/services/conversationService.ts
import { AgentMessage, AgentState, createChatCompletion, extractInformation } from './openaiService';
import { workOrderApi, customerApi, vehicleApi, technicianApi } from './api';

export interface Conversation {
  id: string;
  messages: AgentMessage[];
  state: AgentState;
  userId: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Simple in-memory storage for the POC
// In production, this would use a database
const conversations = new Map<string, Conversation>();

export const createConversation = (userId: string, companyId: string): Conversation => {
  const id = `conv_${Date.now()}`;
  const conversation: Conversation = {
    id,
    messages: [],
    state: {
      currentStep: 'customer_info',
    },
    userId,
    companyId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Add initial assistant message
  addMessage(id, {
    role: 'assistant',
    content: 'Hello! I\'m the GlassOps virtual assistant. I can help you schedule a glass repair or installation. To get started, could you please provide your name, phone number, and email?'
  });
  
  conversations.set(id, conversation);
  return conversation;
};

export const getConversation = (id: string): Conversation | undefined => {
  return conversations.get(id);
};

export const addMessage = (conversationId: string, message: AgentMessage): void => {
  const conversation = conversations.get(conversationId);
  if (!conversation) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }
  
  conversation.messages.push(message);
  conversation.updatedAt = new Date();
  conversations.set(conversationId, conversation);
};

export const processUserMessage = async (conversationId: string, userMessage: string): Promise<string> => {
  const conversation = conversations.get(conversationId);
  if (!conversation) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }
  
  // Add user message to conversation
  addMessage(conversationId, {
    role: 'user',
    content: userMessage,
  });
  
  // Process the message based on the current state
  await updateConversationState(conversationId);
  
  // Generate AI response
  const response = await createChatCompletion(conversation.messages, conversation.state);
  
  // Add AI response to conversation
  addMessage(conversationId, {
    role: 'assistant',
    content: response,
  });
  
  return response;
};

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
      state.customer = customerInfo;
      state.currentStep = 'vehicle_info';
    }
  } else if (state.currentStep === 'vehicle_info' && state.customer) {
    const vehicleInfo = await extractInformation(messages, 'vehicle');
    if (Object.keys(vehicleInfo).length > 2) { // If we have sufficient vehicle info
      state.vehicle = vehicleInfo;
      state.currentStep = 'service_info';
    }
  } else if (state.currentStep === 'service_info' && state.vehicle) {
    const serviceInfo = await extractInformation(messages, 'service');
    if (Object.keys(serviceInfo).length > 1) { // If we have sufficient service info
      state.service = serviceInfo;
      state.currentStep = 'scheduling';
    }
  }
  
  // Update the conversation in storage
  conversation.updatedAt = new Date();
  conversations.set(conversationId, conversation);
};

// Function to create actual records in the database
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
    // Create or update customer
    let customer = await customerApi.create({
      ...state.customer,
      companyId,
    });
    
    // Create or update vehicle
    let vehicle = await vehicleApi.create({
      ...state.vehicle,
      customerId: customer.id,
      companyId,
    });
    
    // Create work order
    const workOrder = await workOrderApi.create({
      vehicleId: vehicle.id,
      customerId: customer.id,
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

### 4. Backend API Endpoints

Create API endpoints for the agent:

```typescript
// server/src/controllers/agentController.ts
import { Request, Response } from 'express';
import { 
  createConversation, 
  getConversation, 
  processUserMessage,
  createWorkOrderFromConversation
} from '../services/conversationService';

export const startConversation = async (req: Request, res: Response) => {
  try {
    const { userId, companyId } = req.body;
    
    if (!userId || !companyId) {
      return res.status(400).json({ error: 'userId and companyId are required' });
    }
    
    const conversation = createConversation(userId, companyId);
    return res.status(201).json(conversation);
  } catch (error) {
    console.error('Error starting conversation:', error);
    return res.status(500).json({ error: 'Failed to start conversation' });
  }
};

export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = getConversation(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    return res.status(200).json(conversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    return res.status(500).json({ error: 'Failed to get conversation' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await processUserMessage(id, message);
    const conversation = getConversation(id);
    
    return res.status(200).json({
      message: response,
      conversation,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to process message' });
  }
};

export const createWorkOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const workOrder = await createWorkOrderFromConversation(id);
    return res.status(201).json(workOrder);
  } catch (error) {
    console.error('Error creating work order:', error);
    return res.status(500).json({ error: 'Failed to create work order from conversation' });
  }
};
```

```typescript
// server/src/routes/agentRoutes.ts
import express from 'express';
import { 
  startConversation, 
  getConversationById, 
  sendMessage,
  createWorkOrder
} from '../controllers/agentController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Agent routes
router.post('/conversations', startConversation);
router.get('/conversations/:id', getConversationById);
router.post('/conversations/:id/messages', sendMessage);
router.post('/conversations/:id/workorders', createWorkOrder);

export default router;
```

### 5. Frontend Agent Service

Create a service to interact with the agent API:

```typescript
// client/src/services/agentService.ts
import { apiRequest } from './api';
import { AgentMessage, Conversation } from '../types/agent';

export const startConversation = async (): Promise<Conversation> => {
  return apiRequest<Conversation>('agent/conversations', {
    method: 'POST',
    body: JSON.stringify({}),
  });
};

export const getConversation = async (id: string): Promise<Conversation> => {
  return apiRequest<Conversation>(`agent/conversations/${id}`);
};

export const sendMessage = async (id: string, message: string): Promise<{ message: string; conversation: Conversation }> => {
  return apiRequest<{ message: string; conversation: Conversation }>(`agent/conversations/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
};

export const createWorkOrder = async (id: string): Promise<any> => {
  return apiRequest<any>(`agent/conversations/${id}/workorders`, {
    method: 'POST',
  });
};
```

### 6. Frontend Types

Define the agent types:

```typescript
// client/src/types/agent.ts
export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface AgentState {
  customer?: any;
  vehicle?: any;
  service?: any;
  appointment?: any;
  currentStep: 'customer_info' | 'vehicle_info' | 'service_info' | 'scheduling' | 'confirmation';
}

export interface Conversation {
  id: string;
  messages: AgentMessage[];
  state: AgentState;
  userId: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 7. Frontend Chat Components

Create components for the chat interface:

```typescript
// client/src/components/agent/MessageBubble.tsx
import React from 'react';
import { AgentMessage } from '../../types/agent';

interface MessageBubbleProps {
  message: AgentMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`px-4 py-2 rounded-lg max-w-[80%] ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;
```

```typescript
// client/src/components/agent/ChatInput.tsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" disabled={disabled || !message.trim()}>
        Send
      </Button>
    </form>
  );
};

export default ChatInput;
```

```typescript
// client/src/components/agent/ChatWindow.tsx
import React, { useRef, useEffect } from 'react';
import { AgentMessage } from '../../types/agent';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  messages: AgentMessage[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
```

```typescript
// client/src/components/agent/WorkflowProgress.tsx
import React from 'react';
import { AgentState } from '../../types/agent';

interface WorkflowProgressProps {
  state: AgentState;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ state }) => {
  const steps = [
    { id: 'customer_info', label: 'Customer Info' },
    { id: 'vehicle_info', label: 'Vehicle Info' },
    { id: 'service_info', label: 'Service Details' },
    { id: 'scheduling', label: 'Scheduling' },
    { id: 'confirmation', label: 'Confirmation' },
  ];
  
  const currentIndex = steps.findIndex(step => step.id === state.currentStep);
  
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="text-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
                index <= currentIndex 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index + 1}
            </div>
            <div className="text-xs">{step.label}</div>
          </div>
        ))}
      </div>
      <div className="w-full bg-muted h-2 rounded-full">
        <div 
          className="bg-primary h-2 rounded-full" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default WorkflowProgress;
```

### 8. Frontend Agent Page

Create the main agent page:

```typescript
// client/src/pages/AgentChat.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import ChatWindow from '../components/agent/ChatWindow';
import ChatInput from '../components/agent/ChatInput';
import WorkflowProgress from '../components/agent/WorkflowProgress';
import { startConversation, sendMessage, createWorkOrder } from '../services/agentService';
import { Conversation, AgentMessage } from '../types/agent';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';

const AgentChat: React.FC = () => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      setLoading(true);
      try {
        const newConversation = await startConversation();
        setConversation(newConversation);
      } catch (error) {
        console.error('Error starting conversation:', error);
        toast({
          title: 'Error',
          description: 'Failed to start a conversation with the agent.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    initConversation();
  }, [toast]);
  
  const handleSendMessage = async (message: string) => {
    if (!conversation) return;
    
    // Optimistically update UI
    const newMessage: AgentMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setConversation(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
      };
    });
    
    setSendingMessage(true);
    
    try {
      // Send message to API
      const response = await sendMessage(conversation.id, message);
      
      // Update conversation with response
      setConversation(response.conversation);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };
  
  const handleCreateWorkOrder = async () => {
    if (!conversation) return;
    
    setLoading(true);
    
    try {
      const workOrder = await createWorkOrder(conversation.id);
      toast({
        title: 'Success',
        description: 'Work order created successfully!',
      });
      
      // Navigate to work order details
      navigate(`/work-orders/${workOrder.id}`);
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create work order from conversation.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !conversation) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 flex justify-center items-center">
            <div>Loading agent...</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!conversation) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 flex justify-center items-center">
            <div>Failed to load agent.</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const showCreateWorkOrder = 
    conversation.state.currentStep === 'confirmation' &&
    conversation.state.customer &&
    conversation.state.vehicle &&
    conversation.state.service &&
    conversation.state.appointment;
  
  return (
    <div className="container mx-auto p-4">
      <Card className="h-[80vh] flex flex-col">
        <CardHeader>
          <CardTitle>Virtual Scheduling Assistant</CardTitle>
          <WorkflowProgress state={conversation.state} />
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <ChatWindow messages={conversation.messages} />
          <div className="p-4 border-t">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={sendingMessage}
            />
            {showCreateWorkOrder && (
              <div className="mt-4">
                <Button 
                  onClick={handleCreateWorkOrder}
                  disabled={loading}
                  className="w-full"
                >
                  Create Work Order
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentChat;
```

### 9. App Routing Updates

Update the app routes to include the new agent page:

```typescript
// client/src/App.tsx
// Add the new import
import AgentChat from './pages/AgentChat';

// Then in the routes section add:
<Route path="/agent" element={
  <ProtectedRoute>
    <CompanyRequiredRoute>
      <DashboardLayout>
        <AgentChat />
      </DashboardLayout>
    </CompanyRequiredRoute>
  </ProtectedRoute>
} />
```

### 10. Navbar Updates

Add a navigation link to the agent page:

```typescript
// In the appropriate navbar component
<NavLink to="/agent" className={({ isActive }) => 
  isActive ? activeClassName : inactiveClassName
}>
  AI Assistant
</NavLink>
```

## Testing Strategy

1. **Unit Tests**
   - Test OpenAI service with mocked API responses
   - Test conversation state management
   - Test data extraction functionality

2. **Integration Tests**
   - Test end-to-end API flow with mocked OpenAI
   - Test database integration for saving records

3. **UI Tests**
   - Test chat interface with simulated messages
   - Test progress tracking functionality

## Deployment Considerations

1. **API Key Security**
   - Store OpenAI API key securely in environment variables
   - Do not expose the key to frontend code

2. **Rate Limiting**
   - Implement rate limiting for OpenAI API calls
   - Add retries with exponential backoff for API failures

3. **Monitoring**
   - Log API usage and errors
   - Monitor conversation success rates and completion rates

4. **Cost Management**
   - Track token usage for OpenAI API
   - Optimize prompts to reduce token usage 