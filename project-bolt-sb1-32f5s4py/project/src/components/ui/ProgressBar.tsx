import React from 'react';

interface ProgressBarProps {
  value: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, className = '' }) => {
  // Ensure value is between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};