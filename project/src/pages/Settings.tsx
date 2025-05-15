import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Lock, Bell, Globe, Database, Video, FileText, User, Server } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  const tabs = [
    { id: 'general', label: 'General', icon: <Globe size={18} /> },
    { id: 'connections', label: 'API Connections', icon: <Database size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'content', label: 'Content Settings', icon: <FileText size={18} /> },
    { id: 'video', label: 'Video Settings', icon: <Video size={18} /> },
    { id: 'account', label: 'Account', icon: <User size={18} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <SettingsIcon className="mr-2 text-blue-500" />
          Settings
        </h1>
      </div>

      <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="sm:flex">
          <div className="w-full sm:w-56 bg-gray-800">
            <nav className="flex sm:flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium w-full text-left ${
                    activeTab === tab.id 
                      ? 'bg-gray-700 text-white border-l-4 border-blue-500' 
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex-1 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">General Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Application Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="TrendMonitor"
                      defaultValue="TrendMonitor"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Language</label>
                    <select 
                      className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Mandarin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date Format</label>
                    <select 
                      className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      id="dark-mode" 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                      defaultChecked
                    />
                    <label htmlFor="dark-mode" className="ml-2 block text-sm text-gray-300">Dark Mode</label>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'connections' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">API Connections</h2>
                
                <div className="space-y-6">
                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Server size={18} className="text-green-500" />
                        <h3 className="font-medium text-white">AI Service Providers</h3>
                      </div>
                      <div className="text-xs bg-green-500 bg-opacity-20 text-green-400 px-2 py-0.5 rounded-full">
                        Connected
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Minimax API Key</label>
                        <div className="flex">
                          <input 
                            type="password" 
                            className="flex-1 bg-gray-800 text-white rounded-l-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value="●●●●●●●●●●●●●●●●●●●●●●●●"
                            readOnly
                          />
                          <button className="bg-gray-700 px-4 rounded-r-lg flex items-center text-gray-300 hover:text-white transition-colors">
                            <Lock size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">OpenAI API Key (Optional)</label>
                        <div className="flex">
                          <input 
                            type="password" 
                            className="flex-1 bg-gray-800 text-white rounded-l-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter OpenAI API key"
                          />
                          <button className="bg-gray-700 px-4 rounded-r-lg flex items-center text-gray-300 hover:text-white transition-colors">
                            <Lock size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-gray-400">
                          Last verified: 2 hours ago
                        </div>
                        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                          Verify Connection
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Server size={18} className="text-blue-500" />
                        <h3 className="font-medium text-white">Content Platforms</h3>
                      </div>
                      <div className="text-xs bg-yellow-500 bg-opacity-20 text-yellow-400 px-2 py-0.5 rounded-full">
                        Partial
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                            T
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">TikTok API</div>
                            <div className="text-xs text-gray-400">Connected</div>
                          </div>
                        </div>
                        <button className="text-xs bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded transition-colors">
                          Disconnect
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                            Y
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">YouTube API</div>
                            <div className="text-xs text-gray-400">Connected</div>
                          </div>
                        </div>
                        <button className="text-xs bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded transition-colors">
                          Disconnect
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            T
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">Twitter API</div>
                            <div className="text-xs text-gray-400">Not connected</div>
                          </div>
                        </div>
                        <button className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded transition-colors">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Content Generation Alerts</h3>
                        <p className="text-sm text-gray-400 mt-1">Notifications for script generation and content updates</p>
                      </div>
                      <div className="relative inline-block w-12 h-6 ml-2">
                        <input 
                          type="checkbox" 
                          id="toggle-1" 
                          className="opacity-0 w-0 h-0"
                          defaultChecked 
                        />
                        <label 
                          htmlFor="toggle-1" 
                          className="block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer before:absolute before:content-[''] before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 before:transition-all checked:before:translate-x-6 checked:bg-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3 ml-6 space-y-2">
                      <div className="flex items-center">
                        <input id="script-complete" type="checkbox" className="h-4 w-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800" defaultChecked />
                        <label htmlFor="script-complete" className="ml-2 block text-sm text-gray-300">Script generation completed</label>
                      </div>
                      <div className="flex items-center">
                        <input id="rendering-complete" type="checkbox" className="h-4 w-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800" defaultChecked />
                        <label htmlFor="rendering-complete" className="ml-2 block text-sm text-gray-300">Video rendering completed</label>
                      </div>
                      <div className="flex items-center">
                        <input id="rendering-failed" type="checkbox" className="h-4 w-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800" defaultChecked />
                        <label htmlFor="rendering-failed" className="ml-2 block text-sm text-gray-300">Video rendering failed</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Trend Discovery Notifications</h3>
                        <p className="text-sm text-gray-400 mt-1">Get alerts about new trending topics</p>
                      </div>
                      <div className="relative inline-block w-12 h-6 ml-2">
                        <input 
                          type="checkbox" 
                          id="toggle-2" 
                          className="opacity-0 w-0 h-0"
                          defaultChecked 
                        />
                        <label 
                          htmlFor="toggle-2" 
                          className="block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer before:absolute before:content-[''] before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 before:transition-all checked:before:translate-x-6 checked:bg-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3 ml-6 space-y-2">
                      <div className="flex items-center">
                        <input id="high-potential" type="checkbox" className="h-4 w-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800" defaultChecked />
                        <label htmlFor="high-potential" className="ml-2 block text-sm text-gray-300">High potential trends (&gt;50% growth)</label>
                      </div>
                      <div className="flex items-center">
                        <input id="daily-digest" type="checkbox" className="h-4 w-4 rounded border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800" defaultChecked />
                        <label htmlFor="daily-digest" className="ml-2 block text-sm text-gray-300">Daily trend digest</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Analytics Reports</h3>
                        <p className="text-sm text-gray-400 mt-1">Scheduled performance reports</p>
                      </div>
                      <div className="relative inline-block w-12 h-6 ml-2">
                        <input 
                          type="checkbox" 
                          id="toggle-3" 
                          className="opacity-0 w-0 h-0"
                        />
                        <label 
                          htmlFor="toggle-3" 
                          className="block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer before:absolute before:content-[''] before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 before:transition-all checked:before:translate-x-6 checked:bg-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {/* Other tabs would be implemented similarly */}
            {(activeTab !== 'general' && activeTab !== 'connections' && activeTab !== 'notifications') && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  {tabs.find(tab => tab.id === activeTab)?.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.label} Settings
                </h3>
                <p className="text-gray-400 text-center max-w-md">
                  These settings are coming soon in the next update. Stay tuned for more features!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;