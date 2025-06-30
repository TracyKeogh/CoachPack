import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock,
  Edit3,
  X,
  Check,
  Move,
  Flag,
  Star,
  Trophy,
  Sparkles,
  Crown,
  Zap,
  Target,
  CheckCircle2,
  Circle,
  Heart,
  BarChart3
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { ActionItem, Milestone } from '../types/goals';

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

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
  milestoneData?: Milestone;
}

interface DraggableLifeAreaProps {
  area: {
    area: string;
    score: number;
    targetChange: number;
    color: string;
  };
  sourceCategory: string;
  onMove: (area: any, sourceCategory: string, targetCategory: string) => void;
}

const DraggableLifeArea: React.FC<DraggableLifeAreaProps> = ({ area, sourceCategory, onMove }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'life-area',
    item: { area, sourceCategory },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  const formatChange = (change: number) => {
    if (change > 0) return `+${change}`;
    return change.toString();
  };

  return (
    <div
      ref={drag}
      className={`flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-move transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-sm hover:border-slate-300'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: area.color }}
        />
        <span className="font-medium text-slate-900">{area.area}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-semibold ${getChangeColor(area.targetChange)}`}>
          {formatChange(area.targetChange)}
        </span>
        <Move className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
};

interface DroppableGoalSectionProps {
  category: string;
  title: string;
  icon: string;
  description: string;
  lifeAreas: any[];
  onDrop: (area: any, sourceCategory: string, targetCategory: string) => void;
  goalValue: string;
  onGoalChange: (value: string) => void;
}

const DroppableGoalSection: React.FC<DroppableGoalSectionProps> = ({ 
  category, 
  title, 
  icon, 
  description, 
  lifeAreas, 
  onDrop,
  goalValue,
  onGoalChange
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'life-area',
    drop: (item: { area: any; sourceCategory: string }) => {
      if (item.sourceCategory !== category) {
        onDrop(item.area, item.sourceCategory, category);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${
        isOver ? 'border-purple-300 bg-purple-50' : 'border-slate-200'
      }`}
    >
      {/* Goal Title Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-100">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-600 text-sm">{description}</p>
          </div>
        </div>

        <textarea
          value={goalValue}
          onChange={(e) => onGoalChange(e.target.value)}
          placeholder={`What's your main ${title.toLowerCase()} goal for the next 12 weeks?`}
          className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Connected Life Areas Section */}
      <div ref={drop} className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Connected Life Areas
          </h3>
        </div>
        <div className="space-y-2">
          {lifeAreas.map((area, index) => (
            <DraggableLifeArea
              key={`${category}-${area.area}-${index}`}
              area={area}
              sourceCategory={category}
              onMove={onDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Goals: React.FC = () => {
  const { data: goalData } = useGoalSettingData();
  
  // Pre-populate life areas for each category with target change values
  const [categoryLifeAreas, setCategoryLifeAreas] = useState({
    business: [
      { area: 'Career', score: 7, targetChange: 2, color: '#8B5CF6' },
      { area: 'Finances', score: 6, targetChange: 2, color: '#10B981' },
      { area: 'Personal Growth', score: 8, targetChange: 2, color: '#06B6D4' }
    ],
    body: [
      { area: 'Health', score: 8, targetChange: 2, color: '#F59E0B' },
      { area: 'Fun & Recreation', score: 6, targetChange: 2, color: '#84CC16' }
    ],
    balance: [
      { area: 'Family', score: 9, targetChange: 1, color: '#EF4444' },
      { area: 'Romance', score: 5, targetChange: 2, color: '#EC4899' },
      { area: 'Environment', score: 7, targetChange: 2, color: '#F97316' }
    ]
  });

  const [goals, setGoals] = useState({
    business: '',
    body: '',
    balance: ''
  });

  const [mantra, setMantra] = useState('');

  const handleLifeAreaMove = (area: any, sourceCategory: string, targetCategory: string) => {
    if (sourceCategory === targetCategory) return;

    setCategoryLifeAreas(prev => ({
      ...prev,
      [sourceCategory]: prev[sourceCategory as keyof typeof prev].filter(a => a.area !== area.area),
      [targetCategory]: [...prev[targetCategory as keyof typeof prev], area]
    }));
  };

  const handleGoalChange = (category: string, value: string) => {
    setGoals(prev => ({
      ...prev,
      [category]: value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">12-Week Goals</h1>
          <p className="text-slate-600 mt-2">
            Set your quarterly goals and align them with your life areas
          </p>
        </div>
      </div>

      {/* Annual Vision */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-900">Your Annual Vision</h2>
            <p className="text-purple-700">Imagine it's one year from now...</p>
          </div>
        </div>

        <textarea
          value="I feel energized and healthy. My career is thriving with new opportunities and growth. My relationships are deep and fulfilling, and I'm living with purpose and joy every day."
          readOnly
          className="w-full p-4 bg-white/50 border border-purple-200 rounded-lg text-purple-900 font-medium resize-none"
          rows={3}
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-purple-800 mb-2">
            Personal Mantra <span className="text-purple-600">(optional)</span>
            <br />
          </label>
          <input
            type="text"
            value={mantra}
            onChange={(e) => setMantra(e.target.value)}
            placeholder="Living with purpose and joy"
            className="w-full p-3 bg-white/50 border border-purple-200 rounded-lg text-purple-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Goal Categories - Now in a horizontal line */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DroppableGoalSection
          category="business"
          title="Business & Career"
          icon="💼"
          description="Professional growth and financial success"
          lifeAreas={categoryLifeAreas.business}
          onDrop={handleLifeAreaMove}
          goalValue={goals.business}
          onGoalChange={(value) => handleGoalChange('business', value)}
        />

        <DroppableGoalSection
          category="body"
          title="Health & Body"
          icon="💪"
          description="Physical wellness and fitness goals"
          lifeAreas={categoryLifeAreas.body}
          onDrop={handleLifeAreaMove}
          goalValue={goals.body}
          onGoalChange={(value) => handleGoalChange('body', value)}
        />

        <DroppableGoalSection
          category="balance"
          title="Life Balance"
          icon="⚖️"
          description="Relationships and lifestyle balance"
          lifeAreas={categoryLifeAreas.balance}
          onDrop={handleLifeAreaMove}
          goalValue={goals.balance}
          onGoalChange={(value) => handleGoalChange('balance', value)}
        />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <Move className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">How to Use</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Write your 12-week goal for each life category</li>
              <li>• Drag and drop life areas between categories to align them with your goals</li>
              <li>• Numbers show the target change (+/-) you're aiming for in each life area</li>
              <li>• Use these connections to ensure your goals address the right life areas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;