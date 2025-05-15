import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex ml-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search trends, content..."
            className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <span className="hidden md:inline text-gray-300">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;