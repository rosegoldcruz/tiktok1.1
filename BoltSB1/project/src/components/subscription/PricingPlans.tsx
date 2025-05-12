import React from 'react';
import { Check, X } from 'lucide-react';
import config from '../../config/config.json';

export const PricingPlans: React.FC = () => {
  const { plans } = config.monetization;
  
  const features = {
    free: plans.free.features,
    pro: plans.pro.features,
    enterprise: plans.enterprise.features
  };
  
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Growth Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Scale your TikTok empire with our AI-powered platform
          </p>
        </div>
        
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Free</h3>
              <p className="mt-4 text-sm text-gray-500">Perfect for getting started with TikTok automation</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <button className="mt-8 block w-full bg-gray-800 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900">
                Start Free
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">Features</h4>
              <ul className="mt-6 space-y-4">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Pro</h3>
              <p className="mt-4 text-sm text-gray-500">For serious creators and growing brands</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$299</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <button className="mt-8 block w-full bg-blue-600 border border-blue-600 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">
                Upgrade to Pro
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">Features</h4>
              <ul className="mt-6 space-y-4">
                {features.pro.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Enterprise Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Enterprise</h3>
              <p className="mt-4 text-sm text-gray-500">For agencies and large-scale operations</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$2,999</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <button className="mt-8 block w-full bg-blue-600 border border-blue-600 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">
                Contact Sales
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">Features</h4>
              <ul className="mt-6 space-y-4">
                {features.enterprise.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};