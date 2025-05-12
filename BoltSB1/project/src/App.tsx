import React from 'react';
import { RevenueDashboard } from './components/dashboard/RevenueDashboard';
import { WealthIntelligence } from './components/dashboard/WealthIntelligence';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <WealthIntelligence />
        <RevenueDashboard />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;