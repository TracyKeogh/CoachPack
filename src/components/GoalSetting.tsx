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
  Clock
} from 'react-feather';
import MilestonesSection from './MilestonesSection';

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
  // ... rest of the component implementation ...
};

export default GoalSetting;