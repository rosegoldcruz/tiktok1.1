import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrendingCardProps {
  title: string;
  platform: string;
  growth: number;
  category: string;
}

const platformColors: Record<string, string> = {
  TikTok: 'bg-pink-500',
  YouTube: 'bg-red-500',
  Reddit: 'bg-orange-500',
  Twitter: 'bg-blue-400',
  Instagram: 'bg-purple-500',
};

const categoryColors: Record<string, string> = {
  Tech: 'bg-blue-500 text-blue-100',
  Lifestyle: 'bg-green-500 text-green-100',
  Productivity: 'bg-purple-500 text-purple-100',
  Food: 'bg-yellow-500 text-yellow-100',
  Finance: 'bg-emerald-500 text-emerald-100',
};

const TrendingCard: React.FC<TrendingCardProps> = ({ title, platform, growth, category }) => {
  const platformColor = platformColors[platform] || 'bg-gray-500';
  const categoryColor = categoryColors[category] || 'bg-gray-500 text-gray-100';

  return (
    <motion.div 
      className="bg-gray-800 rounded-lg p-3 cursor-pointer"
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(55, 65, 81, 1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex space-x-2 items-center">
          <div className={`w-2 h-2 rounded-full ${platformColor}`}></div>
          <span className="text-xs text-gray-400">{platform}</span>
        </div>
        <div className="flex items-center text-green-400 text-xs font-medium">
          <ArrowUpRight size={12} className="mr-0.5" />
          {growth}%
        </div>
      </div>
      
      <h3 className="mt-2 font-medium text-white">{title}</h3>
      
      <div className="mt-2 flex justify-between items-center">
        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor}`}>
          {category}
        </span>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          Generate
        </button>
      </div>
    </motion.div>
  );
};

export default TrendingCard;