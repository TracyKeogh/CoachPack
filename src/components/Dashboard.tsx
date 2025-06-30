import React from 'react';
import { 
  BarChart3, 
  Heart, 
  ImageIcon, 
  Target, 
  Calendar as CalendarIcon,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Star
} from 'lucide-react';
import type { ViewType } from '../App';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // Mock data for demonstration
  const tools = [
    {
      id: 'wheel',
      title: 'Wheel of Life',
      description: 'Assess your life balance across 8 key areas',
      icon: BarChart3,
      color: 'purple',
      progress: 70,
      status: 'In Progress',
      lastActivity: '2 days ago'
    },
    {
      id: 'values',
      title: 'Values Clarity',
      description: 'Discover and rank your core values',
      icon: Heart,
      color: 'red',
      progress: 20,
      status: 'Started',
      lastActivity: '1 week ago'
    },
    {
      id: 'vision',
      title: 'Vision Board',
      description: 'Create visual representations of your goals',
      icon: ImageIcon,
      color: 'teal',
      progress: 10,
      status: 'Not Started',
      lastActivity: 'Never'
    },
    {
      id: 'goals',
      title: 'Goal Setting',
      description: 'Set and track your 12-week goals',
      icon: Target,
      color: 'orange',
      progress: 0,
      status: 'Not Started',
      lastActivity: 'Never'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50';
      case 'In Progress': return 'text-blue-600 bg-blue-50';
      case 'Started': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-green-600';
    if (progress >= 50) return 'from-blue-500 to-blue-600';
    if (progress >= 20) return 'from-yellow-500 to-yellow-600';
    return 'from-slate-400 to-slate-500';
  };

  const overallProgress = Math.round(tools.reduce((sum, tool) => sum + tool.progress, 0) / tools.length);

  return (
    <div className="space-y-8">
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
            <div className="text-4xl font-bold">{overallProgress}%</div>
            <div className="text-purple-200 text-sm">Overall Complete</div>
          </div>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:scale-[1.02]"
              onClick={() => onNavigate(tool.id as ViewType)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-xl shadow-sm border border-slate-200 group-hover:bg-slate-200 transition-colors">
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
              
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tool.status)}`}>
                  {tool.status}
                </span>
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {tool.lastActivity}
                </div>
              </div>
              
              <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${getProgressColor(tool.progress)} rounded-full h-2 transition-all duration-500`}
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

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => onNavigate('wheel')}
            className="p-6 text-left border border-slate-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all group"
          >
            <BarChart3 className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-slate-900 mb-2">Update Life Wheel</h3>
            <p className="text-sm text-slate-600">Rate your current satisfaction levels</p>
          </button>
          
          <button 
            onClick={() => onNavigate('values')}
            className="p-6 text-left border border-slate-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all group"
          >
            <Heart className="w-8 h-8 text-red-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-slate-900 mb-2">Clarify Values</h3>
            <p className="text-sm text-slate-600">Discover what truly matters to you</p>
          </button>
          
          <button 
            onClick={() => onNavigate('vision')}
            className="p-6 text-left border border-slate-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-all group"
          >
            <ImageIcon className="w-8 h-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-slate-900 mb-2">Create Vision</h3>
            <p className="text-sm text-slate-600">Visualize your ideal future</p>
          </button>
        </div>
      </div>

      {/* Journey Stats */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Journey Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">7.2</div>
            <div className="text-slate-600 text-sm">Life Balance Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">3</div>
            <div className="text-slate-600 text-sm">Core Values Identified</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">5</div>
            <div className="text-slate-600 text-sm">Vision Items Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">2</div>
            <div className="text-slate-600 text-sm">Active Goals</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Updated Wheel of Life scores</p>
              <p className="text-sm text-slate-600">Improved Health rating from 6 to 8</p>
            </div>
            <div className="text-sm text-slate-500">2 days ago</div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Completed values discovery</p>
              <p className="text-sm text-slate-600">Identified top 3 core values</p>
            </div>
            <div className="text-sm text-slate-500">1 week ago</div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">Started coaching journey</p>
              <p className="text-sm text-slate-600">Welcome to Coach Pack!</p>
            </div>
            <div className="text-sm text-slate-500">2 weeks ago</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;