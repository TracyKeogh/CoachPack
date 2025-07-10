import React, { useState } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  Plus, 
  Target,
  Edit3,
  X,
  Check,
  Flag,
  Calendar as CalendarIcon,
  Pencil
} from 'lucide-react';

type GoalTimeframe = 'annual' | '90day' | 'weekly';

interface GoalCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
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
  { 
    id: 'personal', 
    name: 'Personal', 
    icon: <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">⚖️</div>, 
    color: 'blue' 
  },
  { 
    id: 'physical', 
    name: 'Physical', 
    icon: <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">💪</div>, 
    color: 'green' 
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    icon: <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">💼</div>, 
    color: 'purple' 
  }
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
  '90day': [
    { 
      id: '90day-personal', 
      category: 'personal', 
      text: 'A happy home full of fun and love',
      actions: [
        '2x friends and family each weekly',
        'Get out and meet people x1 per week',
        'Organise (cleaner, meals, clothes process, dishwasher)'
      ]
    },
    { 
      id: '90day-physical', 
      category: 'physical', 
      text: '8.8 on the way to happy healthy active and light',
      actions: [
        'Prep meal weekly and count the calories',
        '3x gym, 10k steps, 1 cycle at least',
        'A focus on the feeling of light, which can happen at any time'
      ]
    },
    { 
      id: '90day-professional', 
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
};

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Record<GoalTimeframe, GoalItem[]>>(DEFAULT_GOALS);
  const [expandedSections, setExpandedSections] = useState<Record<GoalTimeframe, boolean>>({
    annual: true,
    '90day': true,
    weekly: true
  });
  const [editingGoal, setEditingGoal] = useState<{timeframe: GoalTimeframe, id: string} | null>(null);
  const [editingAction, setEditingAction] = useState<{timeframe: GoalTimeframe, goalId: string, index: number} | null>(null);
  const [newGoalText, setNewGoalText] = useState('');
  const [newMantra, setNewMantra] = useState('');
  const [newActionText, setNewActionText] = useState('');

  const toggleSection = (timeframe: GoalTimeframe) => {
    setExpandedSections(prev => ({
      ...prev,
      [timeframe]: !prev[timeframe]
    }));
  };

  const startEditingGoal = (timeframe: GoalTimeframe, id: string) => {
    const goal = goals[timeframe].find(g => g.id === id);
    if (goal) {
      setNewGoalText(goal.text);
      setNewMantra(goal.mantra || '');
      setEditingGoal({timeframe, id});
    }
  };

  const saveGoal = () => {
    if (!editingGoal) return;
    
    setGoals(prev => ({
      ...prev,
      [editingGoal.timeframe]: prev[editingGoal.timeframe].map(goal => 
        goal.id === editingGoal.id ? { 
          ...goal, 
          text: newGoalText,
          mantra: editingGoal.timeframe === 'annual' ? newMantra : goal.mantra
        } : goal
      )
    }));
    
    setEditingGoal(null);
    setNewGoalText('');
    setNewMantra('');
  };

  const cancelEditGoal = () => {
    setEditingGoal(null);
    setNewGoalText('');
    setNewMantra('');
  };

  const startEditingAction = (timeframe: GoalTimeframe, goalId: string, index: number) => {
    const goal = goals[timeframe].find(g => g.id === goalId);
    if (goal && goal.actions[index]) {
      setNewActionText(goal.actions[index]);
      setEditingAction({timeframe, goalId, index});
    }
  };

  const saveAction = () => {
    if (!editingAction) return;
    
    setGoals(prev => ({
      ...prev,
      [editingAction.timeframe]: prev[editingAction.timeframe].map(goal => {
        if (goal.id === editingAction.goalId) {
          const newActions = [...goal.actions];
          newActions[editingAction.index] = newActionText;
          return { ...goal, actions: newActions };
        }
        return goal;
      })
    }));
    
    setEditingAction(null);
    setNewActionText('');
  };

  const cancelEditAction = () => {
    setEditingAction(null);
    setNewActionText('');
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

  const removeAction = (timeframe: GoalTimeframe, goalId: string, index: number) => {
    setGoals(prev => ({
      ...prev,
      [timeframe]: prev[timeframe].map(goal => {
        if (goal.id === goalId) {
          const newActions = [...goal.actions];
          newActions.splice(index, 1);
          return { ...goal, actions: newActions };
        }
        return goal;
      })
    }));
  };

  const getTimeframeIcon = (timeframe: GoalTimeframe) => {
    switch (timeframe) {
      case 'annual': return <Target className="w-6 h-6 text-blue-600" />;
      case '90day': return <Flag className="w-6 h-6 text-blue-600" />;
      case 'weekly': return <CalendarIcon className="w-6 h-6 text-blue-600" />;
    }
  };

  const getTimeframeTitle = (timeframe: GoalTimeframe) => {
    switch (timeframe) {
      case 'annual': return 'Annual Goals';
      case '90day': return '90-Day Focus';
      case 'weekly': return 'Weekly Actions';
    }
  };

  const renderGoalsByCategory = (timeframe: GoalTimeframe) => {
    return CATEGORIES.map(category => {
      const categoryGoals = goals[timeframe].filter(goal => goal.category === category.id);
      if (categoryGoals.length === 0) return null;
      
      const goal = categoryGoals[0]; // We expect one goal per category per timeframe
      
      return (
        <div key={`${timeframe}-${category.id}`} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {category.icon}
                <h3 className="text-xl font-semibold text-slate-800">{category.name}</h3>
              </div>
              
              <button
                onClick={() => startEditingGoal(timeframe, goal.id)}
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            
            {editingGoal && editingGoal.id === goal.id ? (
              <div className="space-y-4">
                <textarea
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
                
                {timeframe === 'annual' && (
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Mantra (optional)</label>
                    <input
                      type="text"
                      value={newMantra}
                      onChange={(e) => setNewMantra(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="A short phrase to remember this goal"
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={cancelEditGoal}
                    className="px-3 py-1 text-slate-600 hover:text-slate-800 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveGoal}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-slate-700 text-lg font-medium mb-2">{goal.text}</p>
                
                {timeframe === 'annual' && goal.mantra && (
                  <p className="text-slate-500 italic mb-4">"{goal.mantra}"</p>
                )}
                
                {timeframe !== 'annual' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-700">Action Items</h4>
                      <button
                        onClick={() => addAction(timeframe, goal.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    
                    <div className="space-y-2">
                      {goal.actions.map((action, index) => (
                        <div key={index} className="flex items-start group">
                          {editingAction && 
                           editingAction.goalId === goal.id && 
                           editingAction.index === index ? (
                            <div className="flex-1 flex items-center space-x-2">
                              <input
                                type="text"
                                value={newActionText}
                                onChange={(e) => setNewActionText(e.target.value)}
                                className="flex-1 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                onClick={saveAction}
                                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditAction}
                                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-2 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-sm text-slate-700">{action}</div>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditingAction(timeframe, goal.id, index)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => removeAction(timeframe, goal.id, index)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    });
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Annual Goals</h2>
          </div>
          <button
            onClick={() => toggleSection('annual')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            {expandedSections.annual ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {expandedSections.annual && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderGoalsByCategory('annual')}
          </div>
        )}
      </div>

      {/* 90-Day Focus Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Flag className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">90-Day Focus</h2>
          </div>
          <button
            onClick={() => toggleSection('90day')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            {expandedSections['90day'] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {expandedSections['90day'] && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderGoalsByCategory('90day')}
          </div>
        )}
      </div>

      {/* Weekly Actions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Weekly Actions</h2>
          </div>
          <button
            onClick={() => toggleSection('weekly')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            {expandedSections.weekly ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {expandedSections.weekly && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderGoalsByCategory('weekly')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;