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

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* TEST ELEMENT - VERY PROMINENT */}
      <div className="bg-red-600 text-white p-8 rounded-xl border-4 border-red-800 shadow-xl">
        <h1 className="text-3xl font-bold mb-4">DASHBOARD IS RENDERING!</h1>
        <p className="text-xl">This is a test element to confirm the Dashboard component is being rendered.</p>
      </div>

      {/* Simple Dashboard Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Journey</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate('wheel')}
            className="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="w-12 h-12 text-purple-600 mb-3" />
            <span className="text-lg font-medium text-slate-900">Wheel of Life</span>
          </button>
          
          <button 
            onClick={() => onNavigate('values')}
            className="flex flex-col items-center p-6 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Heart className="w-12 h-12 text-red-600 mb-3" />
            <span className="text-lg font-medium text-slate-900">Values Clarity</span>
          </button>
          
          <button 
            onClick={() => onNavigate('vision')}
            className="flex flex-col items-center p-6 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <ImageIcon className="w-12 h-12 text-teal-600 mb-3" />
            <span className="text-lg font-medium text-slate-900">Vision Board</span>
          </button>
          
          <button 
            onClick={() => onNavigate('goals')}
            className="flex flex-col items-center p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Target className="w-12 h-12 text-orange-600 mb-3" />
            <span className="text-lg font-medium text-slate-900">Goals</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;