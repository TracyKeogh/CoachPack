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
    }
  }
}