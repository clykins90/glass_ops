export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  timestamp?: Date;
}

export interface AgentState {
  customer?: any;
  vehicle?: any;
  appointment?: any;
  workOrder?: any;
  savedCustomer?: any;
  savedVehicle?: any;
  currentStep: 'customer_info' | 'vehicle_info' | 'scheduling' | 'confirmation';
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