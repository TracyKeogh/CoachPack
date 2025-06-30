import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Heart, 
  ImageIcon, 
  Target, 
  Calendar as CalendarIcon,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  Zap,
  Trophy,
  Flag,
  ArrowRight,
  Sparkles,
  Crown,
  Circle,
  ChevronRight,
  Activity,
  Users,
  Compass,
  Wind,
  Globe,
  BookOpen,
  Shield,
  Lightbulb,
  Eye,
  Mountain,
  Sunrise,
  Flame,
  Rocket,
  Diamond,
  Edit3,
  Plus,
  Move,
  ArrowDown,
  Link,
  Quote,
  CheckSquare,
  Repeat,
  StickyNote
} from 'lucide-react';
import type { ViewType } from '../App';
import { useWheelData } from '../hooks/useWheelData';
import { useValuesData } from '../hooks/useValuesData';
import { useVisionBoardData } from '../hooks/useVisionBoardData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import NotesPanel from './NotesPanel';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

// Calendar data interface (matching Calendar component)
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: 'business' | 'body' | 'balance' | 'personal';
  duration: number;
  frequency?: 'daily' | 'weekly' | 'multiple';
  specificDays?: string[];
  isGoalAction?: boolean;
  goalCategory?: string;
  isMilestone?: boolean;
}

// Default data for when no user data exists
const defaultWheelData = [
  { area: 'Career', score: 7, color: '#8B5CF6', lightColor: '#EDE9FE', darkColor: '#7C3AED' },
  { area: 'Finances', score: 6, color: '#10B981', lightColor: '#D1FAE5', darkColor: '#059669' },
  { area: 'Health', score: 8, color: '#F59E0B', lightColor: '#FEF3C7', darkColor: '#D97706' },
  { area: 'Family', score: 9, color: '#EF4444', lightColor: '#FEE2E2', darkColor: '#DC2626' },
  { area: 'Romance', score: 5, color: '#EC4899', lightColor: '#FCE7F3', darkColor: '#DB2777' },
  { area: 'Personal Growth', score: 8, color: '#06B6D4', lightColor: '#CFFAFE', darkColor: '#0891B2' },
  { area: 'Fun & Recreation', score: 6, color: '#84CC16', lightColor: '#ECFCCB', darkColor: '#65A30D' },
  { area: 'Environment', score: 7, color: '#F97316', lightColor: '#FED7AA', darkColor: '#EA580C' }
];

const defaultCalendarEvents = [
  {
    id: '1',
    title: 'Morning Workout',
    description: 'Gym session focusing on strength training',
    date: new Date().toISOString().split('T')[0],
    time: '07:00',
    category: 'body' as const,
    duration: 60,
    frequency: 'daily' as const,
    isGoalAction: true,
    goalCategory: 'body'
  },
  {
    id: '2',
    title: 'Deep Work Session',
    description: 'Focus time for important projects',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    category: 'business' as const,
    duration: 90,
    frequency: 'daily' as const,
    isGoalAction: true,
    goalCategory: 'business'
  },
  {
    id: '3',
    title: 'Family Time',
    description: 'Quality time with loved ones',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    category: 'balance' as const,
    duration: 60,
    frequency: 'daily' as const,
    isGoalAction: true,
    goalCategory: 'balance'
  }
];

const defaultMilestones = [
  {
    id: 'milestone-1',
    title: 'Complete Wheel of Life Assessment',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    category: 'business',
    completed: false,
    daysFromStart: 7,
    urgency: 'soon',
    icon: Trophy
  },
  {
    id: 'milestone-2',
    title: 'Identify Core Values',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
    category: 'balance',
    completed: false,
    daysFromStart: 14,
    urgency: 'normal',
    icon: Star
  },
  {
    id: 'milestone-3',
    title: 'Create Vision Board',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 21)).toISOString().split('T')[0],
    category: 'body',
    completed: false,
    daysFromStart: 21,
    urgency: 'normal',
    icon: Mountain
  }
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { data: wheelData, getCompletionStats: getWheelStats } = useWheelData();
  const { data: valuesData, getCompletionStats: getValuesStats } = useValuesData();
  const { visionItems, getCompletionStats: getVisionStats } = useVisionBoardData();
  const { data: goalData, getProgress: getGoalProgress } = useGoalSettingData();

  const [showNotes, setShowNotes] = useState(false);

  // Use actual data if available, otherwise use defaults
  const displayWheelData = wheelData && wheelData.length > 0 ? wheelData : defaultWheelData;
  const wheelStats = getWheelStats ? getWheelStats() : { averageScore: 6.8, completedReflections: 0, totalAreas: 8 };
  const valuesStats = getValuesStats ? getValuesStats() : { completionPercentage: 0, currentStep: 1 };
  const visionStats = getVisionStats ? getVisionStats() : { totalItems: 0, completionPercentage: 0 };
  const goalProgress = getGoalProgress ? getGoalProgress() : { percentage: 0, completed: 0, total: 1 };

  // Calculate overall progress
  const overallProgress = Math.round((
    (wheelStats.averageScore / 10 * 100) * 0.25 +
    valuesStats.completionPercentage * 0.25 +
    visionStats.completionPercentage * 0.25 +
    goalProgress.percentage * 0.25
  ));

  const tools = [
    {
      id: 'wheel',
      title: 'Wheel of Life',
      description: 'Assess your life balance across 8 key areas',
      icon: BarChart3,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600',
      hoverColor: 'hover:bg-purple-100',
      progress: Math.round((wheelStats.averageScore / 10) * 100),
      status: wheelStats.averageScore >= 7 ? 'Excellent' : wheelStats.averageScore >= 5 ? 'Good' : 'Needs Attention',
      lastActivity: 'Updated today',
      completionText: `${wheelStats.completedReflections}/${wheelStats.totalAreas} reflections completed`
    },
    {
      id: 'values',
      title: 'Values Clarity',
      description: 'Discover and rank your core values',
      icon: Heart,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      hoverColor: 'hover:bg-red-100',
      progress: valuesStats.completionPercentage,
      status: valuesStats.currentStep === 5 ? 'Complete' : `Step ${valuesStats.currentStep}/5`,
      lastActivity: 'In progress',
      completionText: `${valuesStats.completionPercentage}% complete`
    },
    {
      id: 'vision',
      title: 'Vision Board',
      description: 'Create visual representations of your goals',
      icon: ImageIcon,
      color: 'teal',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      iconColor: 'text-teal-600',
      hoverColor: 'hover:bg-teal-100',
      progress: visionStats.completionPercentage,
      status: visionStats.totalItems > 0 ? `${visionStats.totalItems} items` : 'Not started',
      lastActivity: visionStats.totalItems > 0 ? 'Updated recently' : 'Not started',
      completionText: `${visionStats.completionPercentage}% customized`
    },
    {
      id: 'goals',
      title: 'Goal Setting',
      description: 'Set and track your 12-week goals',
      icon: Target,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      hoverColor: 'hover:bg-orange-100',
      progress: goalProgress.percentage,
      status: goalProgress.completed > 0 ? `${goalProgress.completed}/${goalProgress.total} complete` : 'Not started',
      lastActivity: goalProgress.completed > 0 ? 'In progress' : 'Not started',
      completionText: `${goalProgress.percentage}% complete`
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      business: 'bg-purple-100 text-purple-700 border-purple-200',
      body: 'bg-green-100 text-green-700 border-green-200',
      balance: 'bg-blue-100 text-blue-700 border-blue-200',
      personal: 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return colors[category as keyof typeof colors] || colors.personal;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {tools.map((tool) => (
            <div key={tool.id} className="text-center">
              <div className="text-2xl font-bold">{tool.progress}%</div>
              <div className="text-purple-200 text-sm">{tool.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className={`${tool.bgColor} ${tool.borderColor} border-2 rounded-2xl p-6 ${tool.hoverColor} transition-all duration-200 cursor-pointer group hover:shadow-lg hover:scale-[1.02]`}
              onClick={() => onNavigate(tool.id as ViewType)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-white rounded-xl shadow-sm ${tool.borderColor} border`}>
                  <Icon className={`w-8 h-8 ${tool.iconColor}`} />
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
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-medium text-slate-900">{tool.status}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Progress:</span>
                  <span className="font-medium text-slate-900">{tool.completionText}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Last Activity:</span>
                  <span className="font-medium text-slate-900">{tool.lastActivity}</span>
                </div>
              </div>
              
              <div className="mt-4 w-full bg-white/50 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${tool.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    tool.color === 'red' ? 'from-red-500 to-red-600' :
                    tool.color === 'teal' ? 'from-teal-500 to-teal-600' :
                    'from-orange-500 to-orange-600'
                  } rounded-full h-2 transition-all duration-500`}
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

      {/* Today's Schedule */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900">Today's Schedule</h2>
          </div>
          <button 
            onClick={() => onNavigate('calendar')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
          >
            <span>View Full Calendar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {defaultCalendarEvents.map(event => (
            <div key={event.id} className="group">
              <div className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-slate-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-900">{event.time}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-slate-600 mb-3">{event.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{event.duration} min</span>
                  {event.isGoalAction && (
                    <span className="flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>Goal Action</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {defaultCalendarEvents.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No events scheduled</h3>
            <p className="text-slate-600 mb-4">Start by setting up your goals and scheduling actions</p>
            <button 
              onClick={() => onNavigate('calendar')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Open Calendar
            </button>
          </div>
        )}
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Flag className="w-6 h-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Milestones</h2>
          </div>
          <button 
            onClick={() => onNavigate('goals')}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
          >
            <span>Manage Goals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          {defaultMilestones.map(milestone => {
            const Icon = milestone.icon;
            const isOverdue = new Date(milestone.dueDate) < new Date();
            const isDueSoon = !isOverdue && new Date(milestone.dueDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
            
            return (
              <div key={milestone.id} className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-sm ${
                isOverdue ? 'border-red-200 bg-red-50' :
                isDueSoon ? 'border-orange-200 bg-orange-50' :
                'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      isOverdue ? 'bg-red-100' :
                      isDueSoon ? 'bg-orange-100' :
                      'bg-slate-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isOverdue ? 'text-red-600' :
                        isDueSoon ? 'text-orange-600' :
                        'text-slate-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
                      <p className="text-sm text-slate-600">Due {formatDate(milestone.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isOverdue && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Overdue
                      </span>
                    )}
                    {isDueSoon && !isOverdue && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        Due Soon
                      </span>
                    )}
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-slate-400 hover:text-green-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Life Balance Score</span>
              <span className="font-semibold text-slate-900">{wheelStats.averageScore.toFixed(1)}/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Values Identified</span>
              <span className="font-semibold text-slate-900">{valuesStats.currentStep > 2 ? '12' : '0'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Vision Items</span>
              <span className="font-semibold text-slate-900">{visionStats.totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Active Goals</span>
              <span className="font-semibold text-slate-900">{goalProgress.total}</span>
            </div>
          </div>
        </div>

        {/* Notes Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Quick Notes</h3>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <StickyNote className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          
          {showNotes ? (
            <NotesPanel feature="general" compact />
          ) : (
            <div className="text-center py-8">
              <StickyNote className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-3">Capture insights and ideas</p>
              <button
                onClick={() => setShowNotes(true)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                Open Notes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;