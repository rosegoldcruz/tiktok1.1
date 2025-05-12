import React from 'react';
import { Code2 } from 'lucide-react';

export const ApiInfo: React.FC = () => {
  const apiEndpoint = 'http://localhost:3000/download';
  
  const requestExample = `fetch('${apiEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com',
    outputName: 'example.pdf'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;

  const curlExample = `curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com","outputName":"example.pdf"}'`;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">API Information</h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          Use our REST API to integrate PDF scraping capabilities into your own applications.
          The API server runs on port 3000 by default.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <Code2 size={18} className="mr-2 text-blue-500" />
            Endpoint
          </h3>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
            POST {apiEndpoint}
          </p>
          
          <h3 className="font-medium text-gray-900 mt-4 mb-2">Request Body</h3>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "url": "https://example.com",
  "outputName": "example.pdf"  // Optional
}`}
          </pre>
          
          <h3 className="font-medium text-gray-900 mt-4 mb-2">Response</h3>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
{`{
  "success": true,
  "file": "example.pdf",
  "message": "PDF created successfully"
}`}
          </pre>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Fetch Example</h3>
          <pre className="text-sm bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
            {requestExample}
          </pre>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-2">cURL Example</h3>
          <pre className="text-sm bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
            {curlExample}
          </pre>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Running the API Server</h3>
        <p className="text-sm text-blue-700 mb-2">
          Start the API server with:
        </p>
        <pre className="text-sm bg-blue-100 text-blue-800 p-2 rounded">
          npm run scrape:api
        </pre>
      </div>
    </div>
  );
};