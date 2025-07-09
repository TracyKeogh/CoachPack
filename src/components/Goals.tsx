import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { 
  ChevronDown,
  ChevronUp,
  Plus, 
  Target,
  Edit3,
  X,
  Check,
  Move,
  Flag,
  Star,
  Calendar as CalendarIcon,
  Pencil,
  Save,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { ActionItem, Milestone } from '../types/goals';

type GoalTimeframe = 'annual' | 'quarterly' | 'weekly';

interface GoalCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface GoalItem {
  id: string;
  category: string;
  text: string;
  mantra?: string;
  actions: string[];
  isEditing?: boolean;
}

const CATEGORIES: GoalCategory[] = [
  { id: 'personal', name: 'Personal', icon: '⚖️', color: '#3b82f6' },
  { id: 'physical', name: 'Physical', icon: '💪', color: '#10b981' },
  { id: 'professional', name: 'Professional', icon: '💼', color: '#8b5cf6' }
];

const DEFAULT_GOALS: Record<GoalTimeframe, GoalItem[]> = {
  annual: [
    { 
      id: 'annual-personal', 
      category: 'personal', 
      text: 'Happy home full of love and fun.',
      mantra: 'The bedrock of life.',
      actions: []
    },
    { 
      id: 'annual-physical', 
      category: 'physical', 
      text: 'Healthy, active, light body',
      mantra: 'Energy to live life.',
      actions: []
    },
    { 
      id: 'annual-professional', 
      category: 'professional', 
      text: '100k in the year.',
      mantra: 'Money is energy is life.',
      actions: []
    }
  ],
  quarterly: [
    { 
      id: 'quarterly-personal', 
      category: 'personal', 
      text: 'A happy home full of fun and love',
      actions: [
        '2x friends and family each weekly',
        'Get out and meet people x1 per week',
        'Organise (cleaner, meals, clothes process, dishwasher)'
      ]
    },
    { 
      id: 'quarterly-physical', 
      category: 'physical', 
      text: '8.8 on the way to happy healthy active and light',
      actions: [
        'Prep meal weekly and count the calories',
        '3x gym, 10k steps, 1 cycle at least',
        'A focus on the feeling of light, which can happen at any time'
      ]
    },
    { 
      id: 'quarterly-professional', 
      category: 'professional', 
      text: '10k in sales',
      actions: [
        'Build',
        'Sell',
        'Build'
      ]
    }
  ],
  weekly: [
    { 
      id: 'weekly-personal', 
      category: 'personal', 
      text: 'Weekly Actions:',
      actions: [
        '2x friends and family - calls in the evening, on walks/while cooking',
        'Meet new people - join a club or attend an event',
        'Home organization - 30 minutes daily'
      ]
    },
    { 
      id: 'weekly-physical', 
      category: 'physical', 
      text: 'Weekly Actions:',
      actions: [
        'Prep every Sunday - including tracking in MyFitnessPal',
        'Monday/Wednesday/Friday gym sessions - 45 minutes each',
        'Daily 10k step minimum - walk during calls'
      ]
    },
    { 
      id: 'weekly-professional', 
      category: 'professional', 
      text: 'Weekly Actions:',
      actions: [
        'Launch the app before the end of April',
        'Contact 10 potential clients',
        'Complete product documentation'
      ]
    }
  ]
}

const Goals: React.FC = () => {
  const [activeTimeframe, setActiveTimeframe] = useState<GoalTimeframe>('annual');
  const [goals, setGoals] = useState<Record<GoalTimeframe, GoalItem[]>>(DEFAULT_GOALS);
  const [expandedSections, setExpandedSections] = useState<Record<GoalTimeframe, boolean>>({
    annual: true,
    quarterly: true,
    weekly: true
  });

  const toggleSection = (timeframe: GoalTimeframe) => {
    setExpandedSections(prev => ({
      ...prev,
      [timeframe]: !prev[timeframe]
    }));
  };

  const startEditing = (timeframe: GoalTimeframe, goalId: string) => {
    setGoals(prev => ({
      ...prev,
      [timeframe]: prev[timeframe].map(goal => 
        goal.id === goalId ? { ...goal, isEditing: true } : goal
      )
    }));
  };

  const saveGoal = (timeframe: GoalTimeframe, goalId: string, text: string, mantra?: string) => {
    setGoals(prev => ({
      ...prev,
      [timeframe]: prev[timeframe].map(goal => 
        goal.id === goalId ? { 
          ...goal, 
          text, 
          mantra: mantra || goal.mantra,
          isEditing: false 
        } : goal
      )
    }));
  };

  const addAction = (timeframe: GoalTimeframe, goalId: string) => {
    setGoals(prev => ({
      ...prev,
      [timeframe]: prev[timeframe].map(goal => 
        goal.id === goalId ? { 
          ...goal, 
          actions: [...goal.actions, 'New action item'] 
        } : goal
      )
    }));
  };

  const updateAction = (timeframe: GoalTimeframe, goalId: string, actionIndex: number, text: string) => {
    setGoals(prev => ({
      ...prev,
      [timeframe]: prev[timeframe].map(goal => {
        if (goal.id === goalId) {
          const newActions = [...goal.actions];
          newActions[actionIndex] = text;
          return { ...goal, actions: newActions };
        }
        return goal;
      })
    }));
  };

  const removeAction = (timeframe: GoalTimeframe, goalId: string, actionIndex: number) => {
    setGoals(prev => ({
      ...prev,
      [timeframe]: prev[timeframe].map(goal => {
        if (goal.id === goalId) {
          const newActions = [...goal.actions];
          newActions.splice(actionIndex, 1);
          return { ...goal, actions: newActions };
        }
        return goal;
      })
    }));
  };

  const getTimeframeTitle = (timeframe: GoalTimeframe): string => {
    switch (timeframe) {
      case 'annual': return 'Annual Goals';
      case 'quarterly': return '90-Day Focus';
      case 'weekly': return 'Weekly Actions';
      default: return '';
    }
  };

  const getTimeframeIcon = (timeframe: GoalTimeframe) => {
    switch (timeframe) {
      case 'annual': return <Target className="w-6 h-6 text-blue-600" />;
      case 'quarterly': return <Flag className="w-6 h-6 text-blue-600" />;
      case 'weekly': return <CalendarIcon className="w-6 h-6 text-blue-600" />;
      default: return null;
    }
  };

  const renderGoalItem = (goal: GoalItem, timeframe: GoalTimeframe) => {
    const category = CATEGORIES.find(c => c.id === goal.category);
    
    if (!category) return null;

  return (
    <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {goal.isEditing ? (
        <div className="p-4">
          <textarea
            value={goal.text}
            onChange={(e) => saveGoal(timeframe, goal.id, e.target.value, goal.mantra)}
            className="w-full p-3 border border-slate-200 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
          
          {timeframe === 'annual' && (
            <div className="mb-3">
              <label className="block text-sm text-slate-600 mb-1">Mantra (optional)</label>
              <input
                type="text"
                value={goal.mantra || ''}
                onChange={(e) => saveGoal(timeframe, goal.id, goal.text, e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="A short phrase to remember this goal"
              />
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={() => saveGoal(timeframe, goal.id, goal.text, goal.mantra)}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: category.color }}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-slate-800">{category.name}</h3>
              </div>
              <button
                onClick={() => startEditing(timeframe, goal.id)}
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-slate-700 font-medium">{goal.text}</p>
            
            {goal.mantra && (
              <p className="text-sm text-slate-500 italic mt-2">"{goal.mantra}"</p>
            )}
          </div>
          
          {goal.actions.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-700">Action Items</h4>
                <button
                  onClick={() => addAction(timeframe, goal.id)}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {goal.actions.map((action, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div
                        className="text-sm text-slate-700 group-hover:hidden"
                        onClick={() => {
                          const newText = prompt('Edit action item:', action);
                          if (newText) updateAction(timeframe, goal.id, index, newText);
                        }}
                      >
                        {action}
                      </div>
                      <div className="hidden group-hover:flex items-center space-x-2">
                        <input
                          type="text"
                          value={action}
                          onChange={(e) => updateAction(timeframe, goal.id, index, e.target.value)}
                          className="text-sm flex-1 p-1 border border-slate-200 rounded"
                        />
                        <button
                          onClick={() => removeAction(timeframe, goal.id, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Goal Setting</h1>
        <p className="text-slate-600 mt-2">
          Define your goals from annual vision to weekly actions
        </p>
      </div>

      {/* Annual Goals Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Annual Goals</h2>
          </div>
          <button
            onClick={() => toggleSection('annual')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            {expandedSections.annual ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {expandedSections.annual && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {goals.annual.map(goal => renderGoalItem(goal, 'annual'))}
          </div>
        )}
      </div>

      {/* 90-Day Focus Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Flag className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">90-Day Focus</h2>
          </div>
          <button
            onClick={() => toggleSection('quarterly')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            {expandedSections.quarterly ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {expandedSections.quarterly && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {goals.quarterly.map(goal => renderGoalItem(goal, 'quarterly'))}
          </div>
        )}
      </div>

      {/* Weekly Actions Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Weekly Actions</h2>
          </div>
          <button
            onClick={() => toggleSection('weekly')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            {expandedSections.weekly ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {expandedSections.weekly && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {goals.weekly.map(goal => renderGoalItem(goal, 'weekly'))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-slate-700 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">How to Use This Goal Framework</h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Start with your annual vision for each life area</li>
              <li>• Break down into 90-day focus areas with specific targets</li>
              <li>• Create weekly action items that move you toward your goals</li>
              <li>• Click the edit button to modify any goal or action item</li>
              <li>• Schedule your weekly actions in the calendar for accountability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;