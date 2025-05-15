import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon,
  color
}) => {
  return (
    <motion.div 
      className="bg-gray-900 rounded-lg p-4 shadow"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={`${color.replace('bg-', 'bg-opacity-20')} rounded-full p-2`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        {isPositive ? (
          <ArrowUp size={16} className="text-green-500 mr-1" />
        ) : (
          <ArrowDown size={16} className="text-red-500 mr-1" />
        )}
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
        <span className="text-gray-400 text-sm ml-2">from last month</span>
      </div>
    </motion.div>
  );
};

export default StatCard;