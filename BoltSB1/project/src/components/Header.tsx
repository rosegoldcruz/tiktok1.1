import React from 'react';
import { FileDown } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-6 flex items-center">
        <div className="flex items-center">
          <FileDown size={32} className="mr-3" />
          <div>
            <h1 className="text-2xl font-bold">TikTok PDF Scraper</h1>
            <p className="text-blue-100 text-sm">Download webpages as PDFs at scale</p>
          </div>
        </div>
      </div>
    </header>
  );
};