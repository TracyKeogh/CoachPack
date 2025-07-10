import React, { useState } from 'react';
import { getTwelveWeeksFromNow } from '../types/goals';
import { useValuesData } from '../hooks/useValuesData';
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
  Pencil,
  ArrowRight,
  ArrowLeft,
  Save,
  Clock,
  Trophy
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
    }
  };

  const resetToStep1 = () => {
    setCurrentStep(1);
    setCurrentTimeframe('annual');
    setShowSummary(false);
  };

  if (showSummary) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">Goal Summary</h1>
          </div>
          <p className="text-gray-600">Your complete goal framework</p>
        </div>

        <div className="grid gap-8">
          {(['annual', '90day', 'weekly'] as GoalTimeframe[]).map(timeframe => (
            <div key={timeframe} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                {getTimeframeIcon(timeframe)}
                <h2 className="text-2xl font-bold text-gray-900">
                  {getTimeframeTitle(timeframe)}
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {goals[timeframe].map(goal => {
                  const category = CATEGORIES.find(c => c.id === goal.category);
                  return (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {category?.icon}
                        <h3 className="font-semibold text-gray-900">{category?.name}</h3>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{goal.text}</p>
                      
                      {goal.mantra && (
                        <p className="text-sm text-blue-600 italic mb-3">"{goal.mantra}"</p>
                      )}
                      
                      {goal.whyImportant && (
                        <p className="text-sm text-gray-600 mb-3">{goal.whyImportant}</p>
                      )}
                      
                      {goal.values && goal.values.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Connected Values:</p>
                          <div className="flex flex-wrap gap-1">
                            {goal.values.map(value => (
                              <span key={value} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {goal.actions.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">Actions:</p>
                          <ul className="space-y-1">
                            {goal.actions.map((action, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {goal.milestones && goal.milestones.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">Milestones:</p>
                          <ul className="space-y-1">
                            {goal.milestones.map(milestone => (
                              <li key={milestone.id} className="text-sm flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <span className={milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                                  {milestone.title}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({new Date(milestone.dueDate).toLocaleDateString()})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {goal.deadline && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={resetToStep1}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit3 className="w-5 h-5" />
            Edit Goals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          {getTimeframeIcon(currentTimeframe)}
          <h1 className="text-3xl font-bold text-gray-900">
            {getTimeframeTitle(currentTimeframe)}
          </h1>
        </div>
        <p className="text-gray-600">
          {currentTimeframe === 'annual' && 'Define your big picture vision for the year'}
          {currentTimeframe === '90day' && 'Break down your annual goals into 90-day focus areas'}
          {currentTimeframe === 'weekly' && 'Create actionable weekly habits to achieve your goals'}
        </p>
      </div>

      {/* Goals */}
      <div className="space-y-6">
        {goals[currentTimeframe].map(goal => {
          const category = CATEGORIES.find(c => c.id === goal.category);
          const isEditing = editingGoal?.timeframe === currentTimeframe && editingGoal?.id === goal.id;
          
          return (
            <div key={goal.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category?.icon}
                  <h3 className="text-xl font-semibold text-gray-900">{category?.name}</h3>
                </div>
                <button
                  onClick={() => startEditingGoal(currentTimeframe, goal.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goal
                    </label>
                    <textarea
                      value={newGoalText}
                      onChange={(e) => setNewGoalText(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  {currentTimeframe === 'annual' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mantra
                        </label>
                        <input
                          type="text"
                          value={newMantra}
                          onChange={(e) => setNewMantra(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="A short phrase that captures the essence..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Why is this important?
                        </label>
                        <textarea
                          value={newWhyImportant}
                          onChange={(e) => setNewWhyImportant(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder="Explain the deeper meaning and motivation..."
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Connected Values
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableValues().map(value => (
                        <button
                          key={value}
                          onClick={() => toggleValue(value)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedValues.includes(value)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveGoal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditGoal}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700 text-lg">{goal.text}</p>
                  
                  {goal.mantra && (
                    <p className="text-blue-600 italic">"{goal.mantra}"</p>
                  )}
                  
                  {goal.whyImportant && (
                    <p className="text-gray-600">{goal.whyImportant}</p>
                  )}
                  
                  {goal.values && goal.values.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Connected Values:</p>
                      <div className="flex flex-wrap gap-2">
                        {goal.values.map(value => (
                          <span key={value} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions Section */}
              {(currentTimeframe === '90day' || currentTimeframe === 'weekly') && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Actions</h4>
                    <button
                      onClick={() => addAction(currentTimeframe, goal.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {goal.actions.map((action, index) => {
                      const isEditingAction = editingAction?.timeframe === currentTimeframe && 
                                            editingAction?.goalId === goal.id && 
                                            editingAction?.index === index;
                      
                      return (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-blue-500 mt-1">•</span>
                          {isEditingAction ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={newActionText}
                                onChange={(e) => setNewActionText(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                onClick={saveAction}
                                className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditAction}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1 text-gray-700">{action}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => startEditingAction(currentTimeframe, goal.id, index)}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => removeAction(currentTimeframe, goal.id, index)}
                                  className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Milestones Section - Only for 90-day goals */}
              {currentTimeframe === '90day' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Milestones</h4>
                    <button
                      onClick={() => addMilestone(currentTimeframe, goal.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {goal.milestones?.map(milestone => {
                      const isEditingMilestone = editingMilestone?.timeframe === currentTimeframe && 
                                               editingMilestone?.goalId === goal.id && 
                                               editingMilestone?.milestoneId === milestone.id;
                      
                      return (
                        <div key={milestone.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <button
                            onClick={() => toggleMilestoneCompletion(currentTimeframe, goal.id, milestone.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                              milestone.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {milestone.completed && <Check className="w-3 h-3" />}
                          </button>
                          
                          {isEditingMilestone ? (
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={newMilestoneTitle}
                                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <input
                                type="date"
                                value={newMilestoneDueDate}
                                onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={saveMilestone}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEditMilestone}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <p className={`font-medium ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {milestone.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => startEditingMilestone(currentTimeframe, goal.id, milestone.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => removeMilestone(currentTimeframe, goal.id, milestone.id)}
                                  className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Deadline Section - Only for 90-day goals */}
              {currentTimeframe === '90day' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Deadline:</label>
                    <input
                      type="date"
                      value={goal.deadline || ''}
                      onChange={(e) => updateDeadline(currentTimeframe, goal.id, e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
            currentStep === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        
        <button
          onClick={nextStep}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {currentStep === 3 ? 'View Summary' : 'Next'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default GoalSetting;