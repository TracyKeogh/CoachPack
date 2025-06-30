import React from 'react';
import { 
  BarChart3, 
  Heart, 
  ImageIcon, 
  Target, 
  Calendar as CalendarIcon,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { ViewType } from '../App';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Test Element - This should be visible */}
      <div className="bg-red-500 text-white p-4 rounded-lg border-4 border-red-700">
        <h1 className="text-2xl font-bold">Dashboard is rendering!</h1>
        <p>If you can see this red box, the Dashboard component is working.</p>
      </div>

      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Welcome to Your Coaching Journey
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Transform your life through structured self-coaching tools designed to help you live with greater intention and purpose.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
            <p className="text-purple-100">Keep building momentum on your transformation journey</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">25%</div>
            <div className="text-purple-200 text-sm">Overall Complete</div>
          </div>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: '25%' }}
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          {
            id: 'wheel',
            title: 'Wheel of Life',
            description: 'Assess your life balance across 8 key areas',
            icon: BarChart3,
            color: 'purple',
            progress: 70
          },
          {
            id: 'values',
            title: 'Values Clarity',
            description: 'Discover and rank your core values',
            icon: Heart,
            color: 'red',
            progress: 20
          },
          {
            id: 'vision',
            title: 'Vision Board',
            description: 'Create visual representations of your goals',
            icon: ImageIcon,
            color: 'teal',
            progress: 10
          },
          {
            id: 'goals',
            title: 'Goal Setting',
            description: 'Set and track your 12-week goals',
            icon: Target,
            color: 'orange',
            progress: 0
          }
        ].map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:scale-[1.02]"
              onClick={() => onNavigate(tool.id as ViewType)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
                  <Icon className="w-8 h-8 text-slate-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{tool.progress}%</div>
                  <div className="text-sm text-slate-600">Complete</div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                {tool.title}
              </h3>
              <p className="text-slate-600 mb-4">{tool.description}</p>
              
              <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${tool.progress}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-slate-700">Continue Journey</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Simple Stats */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Journey Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">7.2</div>
            <div className="text-slate-600">Life Balance</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">3</div>
            <div className="text-slate-600">Core Values</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">5</div>
            <div className="text-slate-600">Vision Items</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">2</div>
            <div className="text-slate-600">Active Goals</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;