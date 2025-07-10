import React, { useState } from 'react';
import { 
  Target,
  BarChart3,
  Heart,
  ImageIcon,
  Calendar,
  ArrowRight,
  Flag,
  Clock,
  Trophy,
  Check,
  X,
  Edit3,
  Plus,
  Pencil,
  ArrowLeft,
  Save,
  CalendarIcon
} from 'lucide-react';

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const features = [
    {
      id: 'wheel',
      name: 'Wheel of Life',
      description: 'Assess your satisfaction across 8 key life areas',
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-100',
      progress: 0
    },
    {
      id: 'values',
      name: 'Values Clarity',
      description: 'Discover what truly matters to you',
      icon: <Heart className="w-6 h-6 text-red-500" />,
      color: 'bg-red-100',
      progress: 0
    },
    {
      id: 'vision',
      name: 'Vision Board',
      description: 'Create visual representations of your goals',
      icon: <ImageIcon className="w-6 h-6 text-teal-600" />,
      color: 'bg-teal-100',
      progress: 0
    },
    {
      id: 'goals',
      name: 'Goal Setting',
      description: 'Define your goals from annual vision to weekly actions',
      icon: <Target className="w-6 h-6 text-orange-500" />,
      color: 'bg-orange-100',
      progress: 0
    },
    {
      id: 'calendar',
      name: 'Action Calendar',
      description: 'Schedule time for what matters most',
      icon: <Calendar className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-100',
      progress: 0
    }
  ];

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Welcome to Coach Pack. Start your journey to intentional living.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div 
            key={feature.id}
            className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleNavigate(feature.id)}
          >
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${feature.color} flex items-center justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-slate-800">{feature.name}</h3>
              </div>
              
              <p className="text-sm text-slate-600 mb-3">{feature.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full"
                      style={{ width: `${feature.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{feature.progress}%</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(feature.id);
                  }}
                  className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  <span>Start</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;