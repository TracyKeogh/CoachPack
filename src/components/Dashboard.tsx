import React from 'react';
import type { ViewType } from '../App';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  console.log('Dashboard: Component rendering');
  console.log('Dashboard: onNavigate function:', typeof onNavigate);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          🎯 Dashboard Debug Mode
        </h1>
        <p className="text-slate-600 mb-6">
          If you can see this message, the Dashboard component is rendering successfully.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">Environment Check</h2>
            <p className="text-sm text-blue-800">
              Environment: {import.meta.env.MODE || 'unknown'}
            </p>
            <p className="text-sm text-blue-800">
              Dev mode: {import.meta.env.DEV ? 'Yes' : 'No'}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h2 className="font-semibold text-green-900 mb-2">Component Status</h2>
            <p className="text-sm text-green-800">
              ✅ Dashboard component loaded
            </p>
            <p className="text-sm text-green-800">
              ✅ Props received: onNavigate = {typeof onNavigate}
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h2 className="font-semibold text-purple-900 mb-2">Navigation Test</h2>
            <button
              onClick={() => {
                console.log('Dashboard: Testing navigation to wheel');
                onNavigate('wheel');
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Test Navigation (Wheel)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;