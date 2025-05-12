import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';

export const BatchProcessing: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ completed: number; failed: number; total: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    
    setProcessing(true);
    setProgress(0);
    setResults(null);
    
    // Simulate batch processing with progress updates
    const total = 10; // Simulate 10 URLs
    let completed = 0;
    let failed = 0;
    
    for (let i = 1; i <= total; i++) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Randomly simulate success/failure for demo
      const success = Math.random() > 0.2;
      
      if (success) {
        completed++;
      } else {
        failed++;
      }
      
      setProgress(Math.floor((i / total) * 100));
    }
    
    setResults({ completed, failed, total });
    setProcessing(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Batch Processing</h2>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
        <div className="mb-4">
          <Upload size={36} className="mx-auto text-gray-400" />
        </div>
        
        {file ? (
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            <button 
              onClick={() => setFile(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Upload a JSON file containing URLs to process
            </p>
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <span>Select file</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>
        )}
      </div>
      
      {file && (
        <div>
          {processing ? (
            <div className="space-y-4">
              <ProgressBar value={progress} />
              <p className="text-center text-sm text-gray-600">
                Processing... {progress}% complete
              </p>
            </div>
          ) : (
            <Button 
              onClick={handleProcess}
              className="w-full" 
              disabled={!file}
            >
              Process Batch
            </Button>
          )}
        </div>
      )}
      
      {results && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Batch Results</h3>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{results.total}</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex justify-center mb-1">
                <CheckCircle2 size={16} className="text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Success</p>
              <p className="text-xl font-bold text-green-600">{results.completed}</p>
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex justify-center mb-1">
                <AlertCircle size={16} className="text-red-600" />
              </div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-xl font-bold text-red-600">{results.failed}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};