import React, { useState } from 'react';
import { getTwelveWeeksFromNow } from '../types/goals';
import { useValuesData } from '../hooks/useValuesData';
import {
  CalendarIcon,
  Check,
  Clock,
  Edit3,
  Flag,
  Pencil,
  Plus, 
  Save,
  Target,
  Trophy,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
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
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [editingMilestone, setEditingMilestone] = useState<{timeframe: GoalTimeframe, goalId: string, milestoneId: string} | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Helper function to get date X weeks from now
  function getTwelveWeeksFromNow(weeks = 12) {
    const date = new Date();
    date.setDate(date.getDate() + (weeks * 7));
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  const startEditingGoal = (timeframe: GoalTimeframe, id: string) => {
    const goal = goals[timeframe].find(g => g.id === id);
    if (goal) {
      // Set default deadline for annual goals if not already set
      if (timeframe === 'annual' && !goal.deadline) {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        const formattedDate = oneYearFromNow.toISOString().split('T')[0];
        
        setGoals(prev => ({
          ...prev,
          [timeframe]: prev[timeframe].map(g => 
            g.id === id ? { ...g, deadline: formattedDate } : g
          )
        }));
      }
      
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

  const startEditingMilestone = (timeframe: GoalTimeframe, goalId: string, milestoneId: string) => {
    const goal = goals[timeframe].find(g => g.id === goalId);
    const milestone = goal?.milestones?.find(m => m.id === milestoneId);
    
    if (milestone) {
      setNewMilestoneTitle(milestone.title);
      setNewMilestoneDueDate(milestone.dueDate);
      setEditingMilestone({timeframe, goalId, milestoneId});
    }
  };

  const saveMilestone = () => {
    if (!editingMilestone) return;
    
    setGoals(prev => ({
      ...prev,
      [editingMilestone.timeframe]: prev[editingMilestone.timeframe].map(goal => {
        if (goal.id === editingMilestone.goalId && goal.milestones) {
          return {
            ...goal,
            milestones: goal.milestones.map(milestone => 
              milestone.id === editingMilestone.milestoneId ? 
              { 
                ...milestone, 
                title: newMilestoneTitle,
                dueDate: newMilestoneDueDate
              } : milestone
            )
          };
        }
        return goal;
      })
    }));
    
    setEditingMilestone(null);
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
  };

  const cancelEditMilestone = () => {
    setEditingMilestone(null);
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
  };

  const toggleMilestoneCompletion = (timeframe: GoalTimeframe, goalId: string, milestoneId: string) => {
    setGoals(prev => ({
      ...prev,
      [timeframe]: prev[timeframe].map(goal => {
        if (goal.id === goalId && goal.milestones) {
          return {
            ...goal,
            milestones: goal.milestones.map(milestone => 
              milestone.id === milestoneId ? 
              { ...milestone, completed: !milestone.completed } : 
              milestone
            )
          };
        }
        return goal;
      })
    }));
  };

  const removeMilestone = (timeframe: GoalTimeframe, goalId: string, milestoneId: string) => {
    setGoals(prev => ({
      ...prev,
      [timeframe]: prev[timeframe].map(goal => {
        if (goal.id === goalId && goal.milestones) {
          return {
            ...goal,
            milestones: goal.milestones.filter(m => m.id !== milestoneId)
          };
        }
        return goal;
      })
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
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            {CATEGORIES.find(c => c.id === category)?.icon}
            <h3 className="text-xl font-semibold text-slate-800">{CATEGORIES.find(c => c.id === category)?.name}</h3>
          </div>
          
          {editingGoal && editingGoal.id === goal.id ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3">
                  {timeframe === 'annual' ? 'Annual Goal' : timeframe === '90day' ? '90-Day Focus' : 'Weekly Actions Title'}
                </label>
                <textarea
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-3">Why is this important?</label>
                <textarea
                  value={newWhyImportant}
                  onChange={(e) => setNewWhyImportant(e.target.value)}
                  placeholder="Describe why this goal matters to you..."
                  className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Connecting your goal to your deeper motivation increases your likelihood of success
                </p>
              </div>
              
              {timeframe === 'annual' && (
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-3">Mantra (optional)</label>
                  <input
                    type="text"
                    value={newMantra}
                    onChange={(e) => setNewMantra(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                    placeholder="A short phrase to remember this goal"
                  />
                </div>
              )}
              
              {/* Values Selection (only when editing) */}
              {editingGoal && editingGoal.id === goal.id && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-500 mb-3">
                    Which values does this goal support?
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3 max-h-40 overflow-y-auto p-4 border border-slate-200 rounded-xl bg-slate-50">
                    {getAvailableValues().length > 0 ? getAvailableValues().map(value => (
                      <button
                        key={value}
                        onClick={() => toggleValue(value)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedValues.includes(value)
                            ? 'bg-blue-100 text-blue-700 border border-blue-200 font-medium'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {value}
                      </button>
                    )) : (
                      <p className="text-slate-500 p-2">No values available. Complete the Values Clarity section first.</p>
                    )}
                  </div>
                  <div className="text-sm text-blue-600 mt-3">
                    {selectedValues.length} values selected
                  </div>
                  <p className="text-xs text-slate-500">
                    Select the values that this goal helps you express or honor
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelEditGoal}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveGoal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-500 mb-3">
                  {timeframe === 'annual' ? 'Annual Goal' : timeframe === '90day' ? '90-Day Focus' : 'Weekly Actions Title'}
                </label>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-800 text-xl font-medium">{goal.text}</p>
                    
                    {timeframe === 'annual' && goal.mantra && (
                      <p className="text-slate-500 italic mt-3">"{goal.mantra}"</p>
                    )}
                    
                    {timeframe === 'annual' && (
                      <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Why is this important?</h4>
                        <p className="text-slate-600">
                          {goal.whyImportant || "Click edit to add why this goal matters to you..."}
                        </p>
                      </div>
                    )}
                    
                    {/* Connected Values */}
                    {goal.values && goal.values.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-slate-500 mb-3">Connected Values</h4>
                        <div className="flex flex-wrap gap-2">
                          {goal.values.map((value, i) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200 font-medium">
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => startEditingGoal(timeframe, goal.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors ml-2"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {timeframe !== 'annual' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-500">Action Items</label>
                    <button
                      onClick={() => addAction(timeframe, goal.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
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
                              className="flex-1 p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={saveAction}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditAction}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-slate-700">{action}</div>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditingAction(timeframe, goal.id, index)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => removeAction(timeframe, goal.id, index)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    
                    {goal.actions.length === 0 && (
                      <div className="text-center py-8 text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="mb-2">No action items yet</p>
                        <button
                          onClick={() => addAction(timeframe, goal.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          + Add your first action
                        </button>
                      </div>
                    )}
                    
                    {goal.whyImportant && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-slate-700">Why it matters:</span> <span className="text-slate-600">{goal.whyImportant}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Values Display */}
              {!goal.values || goal.values.length === 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Connected Values
                  </label>
                  <div className="text-center py-4 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                    <p>No values connected to this goal yet</p>
                    <button
                      onClick={() => startEditingGoal(timeframe, goal.id)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Connect values to this goal
                    </button>
                  </div>
                </div>
              )}
              
              {/* Deadline (for annual goals) */}
              {timeframe === 'annual' && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <label className="text-sm font-medium text-slate-700">Deadline</label>
                  </div>
                  <input
                    type="date"
                    value={goal.deadline || getTwelveWeeksFromNow(52)} // 52 weeks = 1 year
                    onChange={(e) => updateDeadline(timeframe, goal.id, e.target.value)}
                    className="p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Target completion date for this annual goal
                  </p>
                </div>
              )}
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {goal.milestones?.map((milestone) => (
                        <div key={milestone.id} className="flex items-start group bg-slate-50 p-4 rounded-xl border border-slate-100">
                          {editingMilestone && 
                           editingMilestone.goalId === goal.id && 
                           editingMilestone.milestoneId === milestone.id ? (
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={newMilestoneTitle}
                                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                                className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Milestone title"
                              />
                              <div className="flex items-center space-x-2">
                                <input
                                  type="date"
                                  value={newMilestoneDueDate}
                                  onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                                  className="p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="flex space-x-1">
                                  <button
                                    onClick={saveMilestone}
                                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={cancelEditMilestone}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => toggleMilestoneCompletion(timeframe, goal.id, milestone.id)}
                                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mr-3 flex items-center justify-center ${
                                  milestone.completed 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {milestone.completed && <Check className="w-4 h-4" />}
                              </button>
                              <div className="flex-1">
                                <div className={`font-medium text-base ${milestone.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                  {milestone.title}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs text-slate-500">
                                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditingMilestone(timeframe, goal.id, milestone.id)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => removeMilestone(timeframe, goal.id, milestone.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      
                      {(!goal.milestones || goal.milestones.length === 0) && (
                        <div className="text-center py-8 text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                          <p className="mb-2">No milestones yet</p>
                          <button
                            onClick={() => addMilestone(timeframe, goal.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            + Add your first milestone
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-slate-500" />
                      <label className="text-sm font-medium text-slate-500">Deadline</label>
                    </div>
                    <input
                      type="date"
                      value={goal.deadline || getTwelveWeeksFromNow()}
                      onChange={(e) => updateDeadline(timeframe, goal.id, e.target.value)}
                      className="p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Target completion date for this 90-day goal
                    </p>
                  </div>
                </>
              )}
              
              {/* Deadline for Annual Goals */}
              {timeframe === 'annual' && (
                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-slate-500" />
                    <label className="text-sm font-medium text-slate-500">Deadline</label>
                  </div>
                  <input
                    type="date"
                    value={goal.deadline || (() => {
                      const oneYearFromNow = new Date();
                      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                      return oneYearFromNow.toISOString().split('T')[0];
                    })()}
                    onChange={(e) => updateDeadline(timeframe, goal.id, e.target.value)}
                    className="p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Target completion date for this annual goal
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (showSummary) {
      return (
        <div className="space-y-12">
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
                onClick={() => { 
                  setCurrentTimeframe('annual');
                  setCurrentStep(1);
                  setShowSummary(false);
                }}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Edit
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIES.map(category => { 
                const goal = goals.annual.find(g => g.category === category.id);
                if (!goal) return null;
                
                return (
                  <div key={category.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {category.icon} 
                        <h3 className="font-semibold text-slate-800">{category.name}</h3>
                      </div>
                      <p className="text-slate-700 font-medium mb-2">{goal.text}</p>
                      {goal.mantra && (
                        <p className="text-slate-500 italic text-sm">"{goal.mantra}"</p>
                      )}
                      {goal.deadline && (
                        <div className="mt-2 text-xs text-slate-500">
                          Target date: {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      )}
                      {goal.deadline && (
                        <div className="mt-2 flex items-center space-x-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
                  <div key={category.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {category.icon}
                        <h3 className="font-semibold text-slate-800">{category.name}</h3>
                      </div>
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
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <Trophy className="w-3 h-3 text-amber-500 mr-1" /> Milestones
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
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"> 
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
                  <div key={category.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {category.icon}
                        <h3 className="font-semibold text-slate-800">{category.name}</h3>
                      </div>
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
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
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

          <div className="flex space-x-4 mb-8">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setCurrentCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentCategory === category.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
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
    );
  };

  const renderProgressSteps = () => {
    return (
      <div className="flex items-center justify-between mb-10 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center space-x-4">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {currentStep > 1 ? <Check className="w-5 h-5" /> : 1}
          </div> 
          <div className="hidden md:block">
            <p className={`font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-slate-700'}`}>Annual Goals</p>
            <p className="text-xs text-slate-500">Your vision for the year</p>
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
    <div className="space-y-8">
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
      <div className="flex justify-between pt-8 border-t border-slate-200">
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
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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