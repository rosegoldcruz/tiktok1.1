import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import TrendDiscovery from './pages/TrendDiscovery';
import ContentGenerator from './pages/ContentGenerator';
import VideoProduction from './pages/VideoProduction';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ContentMonetization from './pages/ContentMonetization';
import RevenueAnalytics from './pages/RevenueAnalytics';
import NotFound from './pages/NotFound';

// New Components
import HumanAIInterface from './components/optimization/HumanAIInterface';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="trends" element={<TrendDiscovery />} />
          <Route path="generator" element={<ContentGenerator />} />
          <Route path="production" element={<VideoProduction />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="monetization" element={<ContentMonetization />} />
          <Route path="revenue" element={<RevenueAnalytics />} />
          <Route path="optimization" element={<HumanAIInterface />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App