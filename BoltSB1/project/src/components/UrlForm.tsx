import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const UrlForm: React.FC = () => {
  const [url, setUrl] = useState('');
  const [outputName, setOutputName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setResult({ success: false, message: 'Please enter a URL' });
      return;
    }
    
    try {
      setLoading(true);
      setResult(null);
      
      // In a real app, this would call the actual API
      // For demo purposes, we'll simulate a successful response after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResult({ 
        success: true, 
        message: `Successfully downloaded PDF: ${outputName || 'output.pdf'}` 
      });
    } catch (error) {
      setResult({ 
        success: false, 
        message: 'Failed to download the PDF. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Download Single URL</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL to download
          </label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="outputName" className="block text-sm font-medium text-gray-700 mb-1">
            Output filename (optional)
          </label>
          <Input
            id="outputName"
            type="text"
            placeholder="output.pdf"
            value={outputName}
            onChange={(e) => setOutputName(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            If not specified, the filename will be derived from the URL
          </p>
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={loading || !url}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download size={18} className="mr-2" />
                Download as PDF
              </>
            )}
          </Button>
        </div>
      </form>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
};