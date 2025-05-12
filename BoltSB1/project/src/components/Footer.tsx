import React from 'react';
import { Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© 2025 TikTok PDF Scraper. All rights reserved.</p>
          </div>
          <div className="flex items-center">
            <a 
              href="https://github.com/username/tiktok-pdf-scraper" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
            >
              <Github size={18} className="mr-2" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};