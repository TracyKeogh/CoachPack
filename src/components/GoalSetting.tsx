import React, { useState } from 'react';
import { Target, ChevronDown, ChevronUp, Plus, Edit3, X, Check, Flag, Calendar as CalendarIcon, Pencil, ArrowRight, ArrowLeft, Save, Clock, Trophy } from 'lucide-react';
import { useValuesData } from '../hooks/useValuesData';

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
  '90day': [],
  weekly: []
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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Goal Setting</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-orange-500" />
        </div>
        <p className="text-center text-slate-600">
          Define your goals from annual vision to weekly actions.
        </p>
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            This component is currently being updated. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoalSetting;