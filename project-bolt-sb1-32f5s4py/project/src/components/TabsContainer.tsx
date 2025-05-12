import React from 'react';
import { FileText, Files, History, Code } from 'lucide-react';

interface TabsContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TabsContainer: React.FC<TabsContainerProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'single', label: 'Single URL', icon: <FileText size={18} /> },
    { id: 'batch', label: 'Batch Processing', icon: <Files size={18} /> },
    { id: 'history', label: 'Download History', icon: <History size={18} /> },
    { id: 'api', label: 'API Info', icon: <Code size={18} /> },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              transition-colors duration-200
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};