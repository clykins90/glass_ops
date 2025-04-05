import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import ChatWindow from '../components/agent/ChatWindow';
import ChatInput from '../components/agent/ChatInput';
import WorkflowProgress from '../components/agent/WorkflowProgress';
import { startConversation, sendMessage, createWorkOrder } from '../services/agentService';
import { Conversation } from '../types/agent';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../context/AuthContext';

// Storage key for conversation
const STORAGE_KEY = 'glass_agent_conversation';

// Helper functions for localStorage
const saveConversation = (conversation: Conversation) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
    return true;
  } catch (error) {
    console.error('Error saving conversation to localStorage:', error);
    return false;
  }
};

const loadConversation = (): Conversation | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const conversation = JSON.parse(saved);
    return conversation;
  } catch (error) {
    console.error('Error loading conversation from localStorage:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const clearSavedConversation = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const AgentChat: React.FC = () => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (conversation) {
      saveConversation(conversation);
    }
  }, [conversation]);
  
  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to use the AI assistant.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }
      
      // Try to load from localStorage first
      const savedConversation = loadConversation();
      if (savedConversation) {
        setConversation(savedConversation);
        return;
      }
      
      // If no saved conversation or error parsing, create a new one
      setLoading(true);
      try {
        const newConversation = await startConversation();
        setConversation(newConversation);
      } catch (error: any) {
        console.error('Error starting conversation:', error);
        
        toast({
          title: 'Error',
          description: `Failed to start a conversation: ${error.message}`,
          variant: 'destructive',
        });
        
        if (error.message.includes('not authenticated')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    initConversation();
  }, [toast, user, navigate]);
  
  // Show toast when work order is created
  useEffect(() => {
    if (conversation?.state?.workOrder?.id) {
      const workOrder = conversation.state.workOrder;
      
      toast({
        title: 'Work Order Created',
        description: `Work order #${workOrder.id} has been created successfully!`,
      });
      
      // Clear the stored conversation since we've completed the workflow
      clearSavedConversation();
    }
  }, [conversation?.state?.workOrder, toast]);
  
  const handleSendMessage = async (message: string) => {
    if (!conversation) return;
    
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
      
      // If there was a conversation not found error, restart
      if (error instanceof Error && error.message.includes('not found')) {
        clearSavedConversation();
        setConversation(null);
        
        // Try to restart conversation
        setLoading(true);
        try {
          const newConversation = await startConversation();
          setConversation(newConversation);
        } catch (startError) {
          console.error('Failed to restart conversation:', startError);
        } finally {
          setLoading(false);
        }
      }
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
      
      // Clear the stored conversation
      clearSavedConversation();
    } catch (error) {
      console.error('Error creating work order:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to create work order.',
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
    !conversation.state.workOrder;
  
  return (
    <div className="container mx-auto p-4">
      <Card className="h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Virtual Scheduling Assistant</CardTitle>
            <WorkflowProgress state={conversation.state} />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              clearSavedConversation();
              setConversation(null);
              setLoading(true);
              try {
                const newConversation = await startConversation();
                setConversation(newConversation);
              } catch (error) {
                console.error('Error restarting conversation:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to restart conversation.',
                  variant: 'destructive',
                });
              } finally {
                setLoading(false);
              }
            }}
          >
            Reset Conversation
          </Button>
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