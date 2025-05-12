import React, { useState, useEffect } from 'react';
import { FileDown, CheckCircle, XCircle, Clock, DownloadCloud, RefreshCw } from 'lucide-react';

type Status = 'success' | 'failed' | 'pending' | 'processing';

interface DownloadItem {
  id: string;
  url: string;
  filename: string;
  status: Status;
  date: string;
  retries: number;
}

export const DownloadHistory: React.FC = () => {
  const [history, setHistory] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading history data
    const fetchHistory = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockHistory: DownloadItem[] = [
        {
          id: '1',
          url: 'https://www.tiktok.com/help/article/123',
          filename: 'tiktok-help-123.pdf',
          status: 'success',
          date: '2025-05-10T15:30:00Z',
          retries: 0
        },
        {
          id: '2',
          url: 'https://www.tiktok.com/help/article/456',
          filename: 'tiktok-help-456.pdf',
          status: 'failed',
          date: '2025-05-10T14:45:00Z',
          retries: 3
        },
        {
          id: '3',
          url: 'https://www.tiktok.com/help/article/789',
          filename: 'tiktok-help-789.pdf',
          status: 'processing',
          date: '2025-05-10T16:15:00Z',
          retries: 1
        },
        {
          id: '4',
          url: 'https://www.tiktok.com/help/article/101',
          filename: 'tiktok-help-101.pdf',
          status: 'pending',
          date: '2025-05-10T16:20:00Z',
          retries: 0
        },
        {
          id: '5',
          url: 'https://www.tiktok.com/help/article/202',
          filename: 'tiktok-help-202.pdf',
          status: 'success',
          date: '2025-05-09T11:30:00Z',
          retries: 2
        },
      ];
      
      setHistory(mockHistory);
      setLoading(false);
    };
    
    fetchHistory();
  }, []);

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'failed':
        return <XCircle size={18} className="text-red-500" />;
      case 'pending':
        return <Clock size={18} className="text-amber-500" />;
      case 'processing':
        return <RefreshCw size={18} className="text-blue-500 animate-spin" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
        <p className="text-gray-600">Loading download history...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Download History</h2>
      
      {history.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FileDown size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No download history yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div 
              key={item.id}
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 truncate">{item.filename}</h3>
                  <p className="text-sm text-gray-500 truncate">{item.url}</p>
                  
                  <div className="mt-2 flex items-center text-sm">
                    <span className="mr-4 flex items-center">
                      {getStatusIcon(item.status)}
                      <span className="ml-1 capitalize">{item.status}</span>
                    </span>
                    <span className="text-gray-500">{formatDate(item.date)}</span>
                  </div>
                  
                  {item.retries > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Retried {item.retries} {item.retries === 1 ? 'time' : 'times'}
                    </p>
                  )}
                </div>
                
                {item.status === 'success' && (
                  <button 
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Download again"
                  >
                    <DownloadCloud size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};