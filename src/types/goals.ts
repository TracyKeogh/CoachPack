export interface AnnualSnapshot {
  snapshot: string;
  mantra?: string;
}

export interface ActionItem {
  text: string;
  frequency: 'weekly' | 'daily' | 'multiple';
  specificDays?: string[]; // For multiple days option
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date string
  completed: boolean;
  completedDate?: string; // ISO date string when completed
}

export interface CategoryGoal {
  category: 'business' | 'body' | 'balance';
  goal: string;
  actions: ActionItem[];
  milestones: Milestone[];
  focus?: string;
  wheelAreas: string[]; // Connected wheel of life areas
  targetScore?: number; // Target score for connected areas
  deadline: string; // ISO date string
}

export interface GoalSettingData {
  currentStep: 'annual' | 'quarter';
  currentCategoryIndex: number;
  categories: ('business' | 'body' | 'balance')[];
  annualSnapshot: AnnualSnapshot;
  categoryGoals: Record<string, CategoryGoal>;
  lastUpdated: string;
}

// Helper function to get date 12 weeks from now
export const getTwelveWeeksFromNow = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + (12 * 7)); // 12 weeks = 84 days
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

// Helper function to get the Monday of the current week
export const getCurrentWeekMonday = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToSubtract);
  return monday.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

// Helper function to get quarter start and end dates
export const getQuarterDates = (date: Date = new Date()): { start: string; end: string } => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based month
  
  // Determine which quarter we're in
  const quarter = Math.floor(month / 3);
  
  // Calculate start and end months for the quarter
  const startMonth = quarter * 3;
  const endMonth = startMonth + 2;
  
  // Create start date (first day of first month in quarter)
  const startDate = new Date(year, startMonth, 1);
  
  // Create end date (last day of last month in quarter)
  const endDate = new Date(year, endMonth + 1, 0); // Day 0 of next month = last day of current month
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

// Helper function to get milestone due dates (evenly spaced)
export const getMilestoneDueDates = (startDate: string, endDate: string, count: number): string[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const interval = Math.floor(totalDays / (count + 1)); // +1 to space them evenly
  
  const dates = [];
  for (let i = 1; i <= count; i++) {
    const milestoneDate = new Date(start);
    milestoneDate.setDate(start.getDate() + (interval * i));
    dates.push(milestoneDate.toISOString().split('T')[0]);
  }
  
  return dates;
};

export const defaultGoalSettingData: GoalSettingData = {
  currentStep: 'annual',
  currentCategoryIndex: 0,
  categories: ['business', 'body', 'balance'],
  annualSnapshot: {
    snapshot: '',
    mantra: ''
  },
  categoryGoals: {},
  lastUpdated: new Date().toISOString()
};

// Category definitions with their related wheel areas
export const GOAL_CATEGORIES = {
  business: {
    name: 'Business & Career',
    description: 'Professional growth, financial success, and career advancement',
    icon: '💼',
    color: 'purple',
    wheelAreas: ['Career', 'Finances', 'Personal Growth'],
    examples: ['Get promoted to senior role', 'Increase income by 30%', 'Launch side business'],
    milestoneExamples: ['Complete leadership training', 'Apply for 5 positions', 'Launch MVP']
  },
  body: {
    name: 'Health & Body',
    description: 'Physical fitness, nutrition, energy, and overall wellness',
    icon: '💪',
    color: 'green',
    wheelAreas: ['Health', 'Fun & Recreation'],
    examples: ['Lose 20 pounds', 'Run a marathon', 'Improve sleep quality'],
    milestoneExamples: ['Lose first 5 pounds', 'Complete 10K run', 'Establish sleep routine']
  },
  balance: {
    name: 'Life Balance',
    description: 'Relationships, family time, personal fulfillment, and life harmony',
    icon: '⚖️',
    color: 'blue',
    wheelAreas: ['Family', 'Romance', 'Environment', 'Fun & Recreation'],
    examples: ['Strengthen family relationships', 'Create better work-life balance', 'Develop new hobbies'],
    milestoneExamples: ['Plan monthly family activities', 'Set work boundaries', 'Try 3 new hobbies']
  }
} as const;

// Days of the week for multiple days selection
export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
  { value: 'sunday', label: 'Sunday', short: 'Sun' }
] as const;