import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({ error, className = '', ...props }) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  
  const errorClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : 'border-gray-300';
  
  const disabledClasses = props.disabled 
    ? 'bg-gray-100 cursor-not-allowed' 
    : '';
  
  const classes = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;
  
  return (
    <div>
      <input className={classes} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};