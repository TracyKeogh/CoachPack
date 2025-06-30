import React from 'react';
import type { ViewType } from '../App';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-purple-600 mb-4">Dashboard</h1>
      <p className="text-lg text-slate-700 mb-6">Welcome to Coach Pack! Select a tool to get started.</p>
      
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('wheel')}
          className="p-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          Wheel of Life
        </button>
        
        <button 
          onClick={() => onNavigate('values')}
          className="p-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Values Clarity
        </button>
        
        <button 
          onClick={() => onNavigate('vision')}
          className="p-4 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
        >
          Vision Board
        </button>
        
        <button 
          onClick={() => onNavigate('goals')}
          className="p-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
        >
          Goals
        </button>
      </div>
    </div>
  );
};

export default Dashboard;