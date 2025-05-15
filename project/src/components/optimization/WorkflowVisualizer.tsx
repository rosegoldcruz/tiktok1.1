```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X, AlertCircle } from 'lucide-react';

interface WorkflowStep {
  type: string;
  config: Record<string, any>;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface WorkflowVisualizerProps {
  workflow: {
    steps: WorkflowStep[];
    fallback: { type: string };
  };
  currentStep?: number;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ 
  workflow, 
  currentStep = -1 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {workflow.steps.map((step, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ArrowRight className="text-gray-500" size={20} />
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex-1 p-4 rounded-lg border ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                  : index < currentStep
                  ? 'border-green-500 bg-green-500 bg-opacity-10'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">
                  {formatStepType(step.type)}
                </h3>
                {getStepIcon(step.status, index, currentStep)}
              </div>
              
              <div className="space-y-2">
                {Object.entries(step.config).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-400">{formatConfigKey(key)}:</span>
                    <span className="text-gray-300">{formatConfigValue(value)}</span>
                  </div>
                ))}
              </div>

              {index === currentStep && (
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500"
                  layoutId="step-indicator"
                />
              )}
            </motion.div>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <AlertCircle size={16} />
          <span>Fallback: {formatStepType(workflow.fallback.type)}</span>
        </div>
      </div>
    </div>
  );
};

function formatStepType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatConfigKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatConfigValue(value: any): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return value;
}

function getStepIcon(
  status: string | undefined,
  index: number,
  currentStep: number
) {
  if (index === currentStep) {
    return (
      <div className="h-5 w-5 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
      </div>
    );
  }

  if (index < currentStep) {
    return (
      <div className="h-5 w-5 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
        <Check size={12} className="text-green-500" />
      </div>
    );
  }

  switch (status) {
    case 'completed':
      return (
        <div className="h-5 w-5 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
          <Check size={12} className="text-green-500" />
        </div>
      );
    case 'failed':
      return (
        <div className="h-5 w-5 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center">
          <X size={12} className="text-red-500" />
        </div>
      );
    case 'in_progress':
      return (
        <div className="h-5 w-5 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
      );
    default:
      return (
        <div className="h-5 w-5 rounded-full bg-gray-700 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-gray-500" />
        </div>
      );
  }
}

export default WorkflowVisualizer;
```