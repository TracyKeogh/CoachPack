import React, { useState, useEffect } from 'react';
import { 
  User, 
  Eye, 
  CheckSquare, 
  CalendarIcon, 
  TrendingUp,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import type { ViewType } from '../App';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [currentDay, setCurrentDay] = useState(28);
  const [overallProgress, setOverallProgress] = useState(49);

  // Mock data for journey progress
  const journeySteps = [
    { 
      id: 'wheel' as ViewType, 
      icon: User, 
      title: 'Baseline', 
      progress: 75,
      active: false
    },
    { 
      id: 'vision' as ViewType, 
      icon: Eye, 
      title: 'Vision', 
      progress: 85,
      active: true
    },
    { 
      id: 'goals' as ViewType, 
      icon: CheckSquare, 
      title: 'Plan', 
      progress: 45,
      active: false
    },
    { 
      id: 'calendar' as ViewType, 
      icon: CalendarIcon, 
      title: 'Track', 
      progress: 30,
      active: false
    }
  ];

  const coreValues = ['Growth', 'Connection', 'Purpose'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r border-slate-200 min-h-screen p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your Journey</h2>
            <p className="text-slate-600 text-sm">From values to daily action</p>
          </div>

          {/* Journey Steps */}
          <div className="space-y-4 mb-8">
            {journeySteps.map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    step.active ? 'bg-purple-100 border-l-4 border-purple-500' : 'hover:bg-slate-100'
                  }`}
                  onClick={() => onNavigate(step.id)}
                >
                  <Icon className={`w-5 h-5 ${
                    step.active ? 'text-purple-600' : step.progress > 0 ? 'text-slate-600' : 'text-slate-400'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        step.active ? 'text-purple-900' : step.progress > 0 ? 'text-slate-700' : 'text-slate-500'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          step.progress > 0 ? 'bg-purple-500' : 'bg-slate-300'
                        }`}
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{step.progress}%</span>
                </div>
              );
            })}
          </div>

          {/* Overall Progress */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <h3 className="font-semibold mb-2">Overall Progress</h3>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <p className="text-purple-100 text-sm">Keep building momentum</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6" />
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  Day {currentDay} of Your Journey
                </span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              Building a life of impact, growth, and deep connection
            </h1>
            
            <p className="text-purple-100 text-lg mb-6">
              Establishing daily habits that align with my values
            </p>

            {/* Core Values */}
            <div className="flex items-center space-x-4">
              {coreValues.map((value, index) => (
                <div key={value} className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-pink-300" />
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vision Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Vision</h2>
              <p className="text-slate-600">The life you're creating</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Vision Image 1 */}
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Vision 1"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-semibold">Professional Growth</h3>
                  <p className="text-sm opacity-90">Leading with purpose</p>
                </div>
              </div>

              {/* Vision Image 2 */}
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src="https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Vision 2"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-semibold">Health & Vitality</h3>
                  <p className="text-sm opacity-90">Strong body, clear mind</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex items-center justify-center space-x-4">
              <button
                onClick={() => onNavigate('vision')}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Eye className="w-5 h-5" />
                <span>Edit Vision Board</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onNavigate('goals')}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Target className="w-5 h-5" />
                <span>Set Goals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;