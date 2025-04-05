import React from 'react';
import { AgentState } from '../../types/agent';
import { CheckCircle } from 'lucide-react';

interface WorkflowProgressProps {
  state: AgentState;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ state }) => {
  const steps = [
    { 
      id: 'customer_info', 
      label: 'Customer Info',
      complete: Boolean(state.savedCustomer)
    },
    { 
      id: 'vehicle_info', 
      label: 'Vehicle Info',
      complete: Boolean(state.savedVehicle)
    },
    { 
      id: 'scheduling', 
      label: 'Scheduling & Service',
      complete: Boolean(state.appointment?.date && state.appointment?.time && state.appointment?.service_type)
    },
    { 
      id: 'confirmation', 
      label: 'Confirmation',
      complete: state.currentStep === 'confirmation'
    },
  ];
  
  const currentIndex = steps.findIndex(step => step.id === state.currentStep);
  
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="text-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
                step.complete
                  ? 'bg-green-500 text-white' 
                  : index <= currentIndex 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.complete ? <CheckCircle className="w-4 h-4" /> : index + 1}
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