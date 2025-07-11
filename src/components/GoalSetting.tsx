import React, { useState } from 'react';
import { 
  ArrowRight, 
import { Plus, Target, Edit3, X, Check, Flag, Calendar, Pencil, ArrowRight, ArrowLeft, Save } from 'lucide-react';
import MilestonesSection from './MilestonesSection';
import { getTwelveWeeksFromNow } from '../types/goals';
import { useValuesData } from '../hooks/useValuesData';
import MilestonesSection from './MilestonesSection';

type GoalTimeframe = 'annual' | '90day' | 'weekly';

interface GoalCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

interface GoalItem {
  id: string;
  category: string;
  text: string;
  mantra?: string;
  whyImportant?: string;
  values?: string[];
  actions: string[];
  milestones?: Milestone[];
  deadline?: string;
  isEditing?: boolean;
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

const CATEGORIES: GoalCategory[] = [
  { 
    id: 'personal', 
    name: 'Personal', 
    icon: <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">⚖️</div>, 
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800'
  },
  { 
    id: 'physical', 
    name: 'Physical', 
    icon: <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">💪</div>, 
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800'
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    icon: <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">💼</div>, 
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800'
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
      ],
      milestones: [
        {
          id: 'ms-personal-1',
          title: 'Family dinner night established',
          dueDate: getTwelveWeeksFromNow(4),
          completed: false
        },
        {
          id: 'ms-personal-2',
          title: 'Home organization system implemented',
          dueDate: getTwelveWeeksFromNow(8),
          completed: false
        }
      ],
      deadline: getTwelveWeeksFromNow(12)
    },
    { 
      id: '90day-physical', 
      category: 'physical', 
      text: '8.8 on the way to happy healthy active and light',
      actions: [
        'Prep meal weekly and count the calories',
        '3x gym, 10k steps, 1 cycle at least',
        'A focus on the feeling of light, which can happen at any time'
      ],
      milestones: [
        {
          id: 'ms-physical-1',
          title: 'Complete first 5k run',
          dueDate: getTwelveWeeksFromNow(4),
          completed: false
        },
        {
          id: 'ms-physical-2',
          title: 'Establish consistent meal prep routine',
          dueDate: getTwelveWeeksFromNow(6),
          completed: false
        }
      ],
      deadline: getTwelveWeeksFromNow(12)
    },
    { 
      id: '90day-professional', 
      category: 'professional', 
      text: '10k in sales',
      actions: [
        'Build',
        'Sell',
        'Build'
      ],
      milestones: [
        {
          id: 'ms-professional-1',
          title: 'Launch MVP',
          dueDate: getTwelveWeeksFromNow(4),
          completed: false
        },
        {
          id: 'ms-professional-2',
          title: 'First 5 paying customers',
          dueDate: getTwelveWeeksFromNow(8),
          completed: false
        }
      ],
      deadline: getTwelveWeeksFromNow(12)
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

const GoalSetting: React.FC = () => {
  const [goals, setGoals] = useState<Record<GoalTimeframe, GoalItem[]>>(DEFAULT_GOALS);
  const { data: valuesData } = useValuesData();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentTimeframe, setCurrentTimeframe] = useState<GoalTimeframe>('annual');
  const [currentCategory, setCurrentCategory] = useState<string>('personal');
  const [editingGoal, setEditingGoal] = useState<{timeframe: GoalTimeframe, id: string} | null>(null);
  const [editingAction, setEditingAction] = useState<{timeframe: GoalTimeframe, goalId: string, index: number} | null>(null);
  const [newGoalText, setNewGoalText] = useState('');
  const [newMantra, setNewMantra] = useState('');
  const [newWhyImportant, setNewWhyImportant] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]); 
  const [newActionText, setNewActionText] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const startEditingGoal = (timeframe: GoalTimeframe, id: string) => {
    const goal = goals[timeframe].find(g => g.id === id);
    if (goal) {
      setNewGoalText(goal.text);
      setNewMantra(goal.mantra || '');
      setNewWhyImportant(goal.whyImportant || '');
      setSelectedValues(goal.values || []); 
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
          mantra: editingGoal.timeframe === 'annual' ? newMantra : goal.mantra,
          whyImportant: editingGoal.timeframe === 'annual' ? newWhyImportant : goal.whyImportant,
          values: selectedValues
        } : goal
      )
    }));
    
    setEditingGoal(null);
    setNewGoalText('');
    setNewMantra('');
    setNewWhyImportant('');
  };

  const cancelEditGoal = () => {
    setEditingGoal(null);
    setNewGoalText('');
    setNewMantra('');
    setNewWhyImportant('');
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

  const addMilestone = (timeframe: GoalTimeframe, goalId: string) => {
    const newMilestone: Milestone = {
      id: `ms-${Date.now()}`,
      title: 'New milestone',
      dueDate: getTwelveWeeksFromNow(6),
      completed: false
    };
    
    setGoals(prev => ({
      ...prev,
      [timeframe]: prev[timeframe].map(goal => 
        goal.id === goalId ? { 
          ...goal, 
          milestones: [...(goal.milestones || []), newMilestone]
        } : goal
      )
    }));
  };

  const updateDeadline = (timeframe: GoalTimeframe, goalId: string, deadline: string) => {
    setGoals(prev => ({
      ...prev,
      [timeframe]: prev[timeframe].map(goal => 
        goal.id === goalId ? { ...goal, deadline } : goal
      )
    }));
  };

  const toggleValue = (value: string) => {
    setSelectedValues(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value) 
        : [...prev, value]
    );
  };

  // Get values from the values data
  const getAvailableValues = () => {
    // First try to use the user's actual values
    if (valuesData.rankedCoreValues.length > 0 || valuesData.supportingValues.length > 0) {
      const coreValues = valuesData.rankedCoreValues.map(v => v.name);
      const supportingValues = valuesData.supportingValues.map(v => v.name);
      return [...coreValues, ...supportingValues];
    }
    
    // Fallback to sample values
    return [
      'Growth', 'Excellence', 'Health', 'Balance', 'Family', 
      'Freedom', 'Creativity', 'Connection', 'Integrity', 'Adventure',
      'Wisdom', 'Courage', 'Gratitude', 'Joy', 'Peace'
    ];
  };

  const getTimeframeIcon = (timeframe: GoalTimeframe) => {
    switch (timeframe) {
      case 'annual': return <Target className="w-6 h-6 text-slate-700" />;
      case '90day': return <Flag className="w-6 h-6 text-slate-700" />;
      case 'weekly': return <Calendar className="w-6 h-6 text-blue-600" />;
    }
  };

  const getTimeframeTitle = (timeframe: GoalTimeframe) => {
    switch (timeframe) {
      case 'annual': return 'Annual Vision';
      case '90day': return '90-Day Focus';
      case 'weekly': return 'Weekly Actions';
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Move from annual to 90-day
      setCurrentTimeframe('90day');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Move from 90-day to weekly
      setCurrentTimeframe('weekly');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Show summary
      setShowSummary(true);
    }
  };

  const prevStep = () => {
    if (currentStep === 2) {
      // Move from 90-day to annual
      setCurrentTimeframe('annual');
      setCurrentStep(1);
    } else if (currentStep === 3) {
      // Move from weekly to 90-day
      setCurrentTimeframe('90day');
      setCurrentStep(2);
    } else if (showSummary) {
      // Go back to weekly from summary
      setShowSummary(false);
      setCurrentTimeframe('weekly');
      setCurrentStep(3);
    }
  };

  const renderGoalForm = (timeframe: GoalTimeframe, category: string) => {
    const goal = goals[timeframe].find(g => g.category === category);
    if (!goal) return null;
    
    const categoryData = CATEGORIES.find(c => c.id === category);
    if (!categoryData) return null;
    
    return (
      <div className={`rounded-xl shadow-sm border overflow-hidden ${categoryData.borderColor}`}>
        <div className={`p-4 ${categoryData.bgColor}`}>
          <div className="flex items-center space-x-3">
            {categoryData.icon}
            <h3 className={`text-xl font-semibold ${categoryData.textColor}`}>{categoryData.name}</h3>
          </div>
        </div>
        
        <div className="p-6 bg-white">
          {editingGoal && editingGoal.id === goal.id ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {timeframe === 'annual' ? 'Annual Vision' : timeframe === '90day' ? '90-Day Focus' : 'Weekly Actions Title'}
                </label>
                <textarea
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Why is this important?</label>
                <textarea
                  value={newWhyImportant}
                  onChange={(e) => setNewWhyImportant(e.target.value)}
                  placeholder="Describe why this goal matters to you..."
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Connecting your goal to your deeper motivation increases your likelihood of success
                </p>
              </div>
              
              {timeframe === 'annual' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mantra (optional)</label>
                  <input
                    type="text"
                    value={newMantra}
                    onChange={(e) => setNewMantra(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="A short phrase to remember this goal"
                  />
                </div>
              )}
              
              {/* Values Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Which values does this goal support?
                </label>
                <div className="flex flex-wrap gap-2 mb-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                  {getAvailableValues().map(value => (
                    <button
                      key={value}
                      onClick={() => toggleValue(value)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedValues.includes(value)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-blue-600 mt-2">
                  {selectedValues.length} values selected
                </div>
              </div>
              
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
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-slate-900 mb-3">{goal.text}</h4>
                    
                    {timeframe === 'annual' && goal.mantra && (
                      <p className="text-slate-500 italic mt-2 mb-4">"{goal.mantra}"</p>
                    )}
                    
                    {goal.whyImportant && (
                      <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-1">Why This Matters:</h4>
                        <p className="text-sm text-slate-600">
                          {goal.whyImportant}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => startEditingGoal(timeframe, goal.id)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ml-2"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Values Display */}
                {goal.values && goal.values.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <h4 className="text-sm font-medium text-slate-700">Connected Values</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {goal.values.map(value => (
                        <div 
                          key={value}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm border border-blue-300"
                        >
                          {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {timeframe !== 'annual' && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <label className="text-sm font-medium text-slate-700">Action Items</label>
                    <button
                      onClick={() => addAction(timeframe, goal.id)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {goal.actions.map((action, index) => (
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
                    
                    {goal.actions.length === 0 && (
                      <div className="text-center py-4 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                        <p>No action items yet</p>
                        <button
                          onClick={() => addAction(timeframe, goal.id)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          + Add your first action
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Milestones Section (only for 90-day) */}
              {timeframe === '90day' && goal.milestones && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <MilestonesSection 
                    milestones={goal.milestones || []}
                    onAddMilestone={() => addMilestone(timeframe, goal.id)}
                    onEditMilestone={(milestoneId, title, dueDate) => {
                      setNewMilestoneTitle(title);
                      setNewMilestoneDueDate(dueDate);
                      setEditingMilestone({timeframe, goalId: goal.id, milestoneId});
                      saveMilestone();
                    }}
                    onToggleMilestoneCompletion={(milestoneId) => toggleMilestoneCompletion(timeframe, goal.id, milestoneId)}
                    onRemoveMilestone={(milestoneId) => removeMilestone(timeframe, goal.id, milestoneId)}
                  />
                );
              })}
            </div>
          </div>

          {/* 90-Day Focus Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <Flag className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">90-Day Focus</h2>
              </div>
              <button
                onClick={() => {
                  setCurrentTimeframe('90day');
                  setCurrentStep(2);
                  setShowSummary(false);
                }}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Edit
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIES.map(category => {
                const goal = goals['90day'].find(g => g.category === category.id);
                if (!goal) return null;
                
                return (
                  <div key={category.id} className={`rounded-xl shadow-sm border overflow-hidden ${category.borderColor}`}>
                    <div className={`p-4 ${category.bgColor}`}>
                      <div className="flex items-center space-x-3">
                        {category.icon}
                        <h3 className={`font-semibold ${category.textColor}`}>{category.name}</h3>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-slate-700 font-medium mb-3">{goal.text}</p>
                      
                      <div className="space-y-2">
                        {goal.actions?.map((action, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm text-slate-700">{action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Show milestones for 90-day goals in summary */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="mt-3 border-t border-slate-100 pt-3 px-4 pb-4 bg-white">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <Sparkles className="w-3 h-3 text-amber-500 mr-1" /> Milestones
                        </h4>
                        <div className="space-y-2">
                          {goal.milestones.map(milestone => (
                            <div key={milestone.id} className="flex items-center space-x-2 text-xs">
                              <div className={`w-3 h-3 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                              <span className={milestone.completed ? 'line-through text-slate-500' : 'text-slate-700'}>
                                {milestone.title} ({new Date(milestone.dueDate).toLocaleDateString()})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Actions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Weekly Actions</h2>
              </div>
              <button
                onClick={() => {
                  setCurrentTimeframe('weekly');
                  setCurrentStep(3);
                  setShowSummary(false);
                }}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Edit
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIES.map(category => {
                const goal = goals.weekly.find(g => g.category === category.id);
                if (!goal) return null;
                
                return (
                  <div key={category.id} className={`rounded-xl shadow-sm border overflow-hidden ${category.borderColor}`}>
                    <div className={`p-4 ${category.bgColor}`}>
                      <div className="flex items-center space-x-3">
                        {category.icon}
                        <h3 className={`font-semibold ${category.textColor}`}>{category.name}</h3>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-slate-700 font-medium mb-3">{goal.text}</p>
                      
                      <div className="space-y-2">
                        {goal.actions?.map((action, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm text-slate-700">{action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              {getTimeframeIcon(currentTimeframe)}
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{getTimeframeTitle(currentTimeframe)}</h2>
                <p className="text-slate-600">
                  {currentTimeframe === 'annual' 
                    ? 'Define your vision for the year ahead' 
                    : currentTimeframe === '90day' 
                    ? 'Set your focus for the next 90 days' 
                    : 'Plan your weekly actions to achieve your goals'}
                </p>
              </div>
            </div>

            <div className="flex space-x-4 mb-6">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setCurrentCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentCategory === category.id 
                      ? `${category.bgColor} ${category.textColor} border ${category.borderColor}` 
                      : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {renderGoalForm(currentTimeframe, currentCategory)}
          </div>
        </div>
      </div>
    );
  };

  const renderProgressSteps = () => {
    return (
      <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {currentStep > 1 ? <Check className="w-5 h-5" /> : 1}
          </div>
          <div className="hidden md:block">
            <p className={`font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-slate-700'}`}>Annual Vision</p>
            <p className="text-xs text-slate-500">Your big picture</p>
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {currentStep > 2 ? <Check className="w-5 h-5" /> : 2}
          </div>
          <div className="hidden md:block">
            <p className={`font-medium ${currentStep === 2 ? 'text-blue-600' : 'text-slate-700'}`}>90-Day Focus</p>
            <p className="text-xs text-slate-500">Your next quarter</p>
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {currentStep > 3 || showSummary ? <Check className="w-5 h-5" /> : 3}
          </div>
          <div className="hidden md:block">
            <p className={`font-medium ${currentStep === 3 ? 'text-blue-600' : 'text-slate-700'}`}>Weekly Actions</p>
            <p className="text-xs text-slate-500">Your weekly plan</p>
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              showSummary ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {showSummary ? <Check className="w-5 h-5" /> : 4}
          </div>
          <div className="hidden md:block">
            <p className={`font-medium ${showSummary ? 'text-blue-600' : 'text-slate-700'}`}>Summary</p>
            <p className="text-xs text-slate-500">Review your plan</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Goal Setting</h1>
        <p className="text-slate-600 mt-2">
          Define your goals from annual vision to weekly actions
        </p>
      </div>

      {/* Progress Steps */}
      {renderProgressSteps()}

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-slate-200">
        <button
          onClick={prevStep}
          disabled={currentStep === 1 && !showSummary}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
            currentStep === 1 && !showSummary
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        <button
          onClick={nextStep}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showSummary ? (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Goals</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GoalSetting;