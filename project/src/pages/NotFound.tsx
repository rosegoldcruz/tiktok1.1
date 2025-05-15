import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
            <AlertCircle size={48} className="text-red-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl text-gray-300 mb-6">Page Not Found</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;