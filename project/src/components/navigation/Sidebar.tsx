import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  FileText, 
  Video, 
  BarChart3, 
  Settings,
  Monitor,
  User,
  HelpCircle,
  Brain,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/trends', icon: <TrendingUp size={20} />, label: 'Trend Discovery' },
    { to: '/generator', icon: <FileText size={20} />, label: 'Content Generator' },
    { to: '/production', icon: <Video size={20} />, label: 'Video Production' },
    { to: '/monetization', icon: <Brain size={20} />, label: 'Monetization' },
    { to: '/revenue', icon: <DollarSign size={20} />, label: 'Revenue' },
    { to: '/optimization', icon: <Brain size={20} />, label: 'Human-AI Optimization' },
    { to: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <motion.aside 
      className="bg-gray-900 text-gray-100 z-20 border-r border-gray-700"
      initial={{ width: collapsed ? 70 : 240 }}
      animate={{ width: collapsed ? 70 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          {collapsed ? (
            <Monitor size={24} className="text-blue-500" />
          ) : (
            <div className="flex items-center gap-2">
              <Monitor size={24} className="text-blue-500" />
              <span className="font-bold text-xl tracking-tight">TrendMonitor</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 ${
                  isActive 
                    ? 'bg-gray-800 text-blue-400 border-l-4 border-blue-500' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                } transition-all duration-200 ${
                  collapsed ? 'justify-center' : 'space-x-3'
                }`
              }
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className={`flex ${collapsed ? 'justify-center' : 'space-x-3'} items-center text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer`}>
            <User size={20} />
            {!collapsed && <span>Profile</span>}
          </div>
          <div className={`mt-3 flex ${collapsed ? 'justify-center' : 'space-x-3'} items-center text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer`}>
            <HelpCircle size={20} />
            {!collapsed && <span>Help</span>}
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;