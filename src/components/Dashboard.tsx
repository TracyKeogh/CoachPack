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
    category: 'body',
    duration: 60,
    frequency: 'daily',
    isGoalAction: true,
    goalCategory: 'body'
  },
  {
    id: '2',
    title: 'Deep Work Session',
    description: 'Focus time for important projects',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    category: 'business',
    duration: 90,
    frequency: 'daily',
    isGoalAction: true,
    goalCategory: 'business'
  },
  {
    id: '3',
    title: 'Family Time',
    description: 'Quality time with loved ones',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    category: 'balance',
    duration: 60,
    frequency: 'daily',
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
  // Test element to confirm rendering
  const [showTestElement, setShowTestElement] = useState(true);

  return (
    <div className="space-y-8">
      {/* Test element to confirm rendering */}
      {showTestElement && (
        <div className="bg-red-100 border-2 border-red-500 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <p className="text-red-700 font-bold">Dashboard is rendering!</p>
            <button 
              onClick={() => setShowTestElement(false)}
              className="text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Simple Dashboard Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Welcome to Coach Pack</h1>
        <p className="text-slate-600 mb-6">Select a tool to begin your intentional living journey</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate('wheel')}
            className="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
          >
            <BarChart3 className="w-10 h-10 text-purple-600 mb-3" />
            <span className="font-medium text-slate-900">Wheel of Life</span>
            <span className="text-sm text-slate-600 mt-1">Life assessment</span>
          </button>
          
          <button 
            onClick={() => onNavigate('values')}
            className="flex flex-col items-center p-6 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
          >
            <Heart className="w-10 h-10 text-red-600 mb-3" />
            <span className="font-medium text-slate-900">Values Clarity</span>
            <span className="text-sm text-slate-600 mt-1">Core values discovery</span>
          </button>
          
          <button 
            onClick={() => onNavigate('vision')}
            className="flex flex-col items-center p-6 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200"
          >
            <ImageIcon className="w-10 h-10 text-teal-600 mb-3" />
            <span className="font-medium text-slate-900">Vision Board</span>
            <span className="text-sm text-slate-600 mt-1">Visual goal setting</span>
          </button>
          
          <button 
            onClick={() => onNavigate('goals')}
            className="flex flex-col items-center p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
          >
            <Target className="w-10 h-10 text-orange-600 mb-3" />
            <span className="font-medium text-slate-900">Goals</span>
            <span className="text-sm text-slate-600 mt-1">12-week planning</span>
          </button>
        </div>
      </div>
      
      {/* Quick Access Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Today's Schedule</h2>
          <button 
            onClick={() => onNavigate('calendar')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Full Calendar</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {defaultCalendarEvents.map(event => (
            <div key={event.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium">{event.time}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.category === 'business' ? 'bg-purple-100 text-purple-700' :
                  event.category === 'body' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {event.category}
                </span>
              </div>
              <h3 className="font-medium text-slate-900">{event.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;