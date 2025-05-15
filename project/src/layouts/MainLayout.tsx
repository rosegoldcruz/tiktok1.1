import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import { Toaster } from 'react-hot-toast';

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar collapsed={sidebarCollapsed} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-800">
          <Outlet />
        </main>
      </div>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#2D3748',
            color: '#fff',
            borderRadius: '0.5rem',
          },
          success: {
            iconTheme: {
              primary: '#68D391',
              secondary: '#2D3748',
            },
          },
          error: {
            iconTheme: {
              primary: '#F56565',
              secondary: '#2D3748',
            },
          },
        }}
      />
    </div>
  );
};

export default MainLayout;