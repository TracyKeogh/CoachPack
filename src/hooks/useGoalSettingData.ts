import { useState, useEffect, useCallback } from 'react';
import { GoalSettingData, defaultGoalSettingData, AnnualSnapshot, CategoryGoal, getTwelveWeeksFromNow, ActionItem, Milestone } from '../types/goals';

export const STORAGE_KEY = 'coach-pack-goal-setting';

// Deep merge function to ensure all nested properties exist
const deepMerge = (target: any, source: any): any => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

// Migration function to convert old action format to new format
const migrateActions = (actions: any[]): ActionItem[] => {
  return actions.map(action => {
    if (typeof action === 'string') {
      // Old format: just a string
      return {
        text: action,
        frequency: 'weekly' as const,
        specificDays: []
      };
    } else if (action && typeof action === 'object') {
      // New format: already an ActionItem
      return {
        text: action.text || '',
        frequency: action.frequency || 'weekly',
        specificDays: action.specificDays || []
      };
    }
    // Fallback
    return {
      text: '',
      frequency: 'weekly' as const,
      specificDays: []
    };
  });
};

// Migration function to ensure milestones exist
const migrateMilestones = (milestones: any[]): Milestone[] => {
  if (!Array.isArray(milestones)) return [];
  
  return milestones.map(milestone => ({
    id: milestone.id || Date.now().toString(),
    title: milestone.title || '',
    description: milestone.description || '',
    dueDate: milestone.dueDate || getTwelveWeeksFromNow(),
    completed: milestone.completed || false,
    completedDate: milestone.completedDate
  }));
};

export const useGoalSettingData = () => {
  const [data, setData] = useState<GoalSettingData>(defaultGoalSettingData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        
        // Migrate old formats to new formats
        if (parsedData.categoryGoals) {
          Object.keys(parsedData.categoryGoals).forEach(category => {
            const goal = parsedData.categoryGoals[category];
            
            // Migrate actions
            if (goal.actions) {
              goal.actions = migrateActions(goal.actions);
            }
            
            // Migrate milestones (add if missing)
            if (!goal.milestones) {
              goal.milestones = [];
            } else {
              goal.milestones = migrateMilestones(goal.milestones);
            }
            
            // Ensure deadline exists
            if (!goal.deadline) {
              goal.deadline = getTwelveWeeksFromNow();
            }
          });
        }
        
        // Deep merge with default data to ensure all properties exist
        const mergedData: GoalSettingData = deepMerge(defaultGoalSettingData, parsedData);
        setData(mergedData);
        setLastSaved(new Date(mergedData.lastUpdated));
      }
    } catch (error) {
      console.error('Failed to load goal setting data:', error);
      setData(defaultGoalSettingData);
    }
    setIsLoaded(true);
  }, []);

  // Auto-save function
  const saveData = useCallback(() => {
    if (!isLoaded) return;

    try {
      const dataToSave: GoalSettingData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save goal setting data:', error);
    }
  }, [data, isLoaded]);

  // Auto-save whenever data changes
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(saveData, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [data, saveData, isLoaded]);

  // Initialize from Wheel of Life data
  const initializeFromWheelData = useCallback((wheelData: any[]) => {
    setData(prev => ({
      ...prev,
      currentStep: 'annual',
      currentCategoryIndex: 0
    }));
  }, []);

  // Navigation functions
  const goToNextArea = useCallback(() => {
    setData(prev => {
      if (prev.currentStep === 'annual') {
        // Move from annual to first category goal
        return { ...prev, currentStep: 'quarter', currentCategoryIndex: 0 };
      } else if (prev.currentStep === 'quarter') {
        const nextIndex = prev.currentCategoryIndex + 1;
        if (nextIndex >= prev.categories.length) {
          // Stay at last category
          return prev;
        }
        return { ...prev, currentCategoryIndex: nextIndex };
      }
      return prev;
    });
  }, []);

  const goToPreviousArea = useCallback(() => {
    setData(prev => {
      if (prev.currentStep === 'annual') {
        // Can't go back from annual
        return prev;
      } else if (prev.currentStep === 'quarter') {
        const prevIndex = prev.currentCategoryIndex - 1;
        if (prevIndex < 0) {
          // Go back to annual snapshot
          return { ...prev, currentStep: 'annual', currentCategoryIndex: 0 };
        }
        return { ...prev, currentCategoryIndex: prevIndex };
      }
      return prev;
    });
  }, []);

  // Data update functions
  const updateAnnualSnapshot = useCallback((snapshot: AnnualSnapshot) => {
    setData(prev => ({
      ...prev,
      annualSnapshot: snapshot
    }));
  }, []);

  const updateCategoryGoal = useCallback((category: string, goal: CategoryGoal) => {
    // Ensure deadline is set if not provided
    const goalWithDefaults = {
      ...goal,
      deadline: goal.deadline || getTwelveWeeksFromNow(),
      actions: goal.actions.map(action => ({
        text: action.text || '',
        frequency: action.frequency || 'weekly',
        specificDays: action.specificDays || []
      })),
      milestones: goal.milestones || []
    };
    
    setData(prev => ({
      ...prev,
      categoryGoals: {
        ...prev.categoryGoals,
        [category]: goalWithDefaults
      }
    }));
  }, []);

  // Utility functions
  const getCurrentCategory = useCallback(() => {
    if (data.currentStep === 'annual') return '';
    return data.categories[data.currentCategoryIndex] || '';
  }, [data.categories, data.currentCategoryIndex, data.currentStep]);

  const getProgress = useCallback(() => {
    let totalSteps = 1; // Annual snapshot
    totalSteps += data.categories.length; // Category goals
    
    let completedSteps = 0;

    // Count annual snapshot
    if (data.annualSnapshot?.snapshot?.trim()) completedSteps++;

    // Count completed category goals
    data.categories.forEach(category => {
      if (data.categoryGoals[category]?.goal) completedSteps++;
    });

    return {
      completed: completedSteps,
      total: totalSteps,
      percentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    };
  }, [data]);

  const canProceed = useCallback(() => {
    if (data.currentStep === 'annual') {
      return data.annualSnapshot?.snapshot?.trim() !== '';
    } else if (data.currentStep === 'quarter') {
      const currentCategory = getCurrentCategory();
      return data.categoryGoals[currentCategory]?.goal?.trim() !== '' && 
             data.categoryGoals[currentCategory]?.actions?.length > 0;
    }
    return false;
  }, [data, getCurrentCategory]);

  const isComplete = useCallback(() => {
    return data.currentStep === 'quarter' && 
           data.currentCategoryIndex >= data.categories.length - 1 &&
           canProceed();
  }, [data, canProceed]);

  return {
    data,
    isLoaded,
    lastSaved,
    initializeFromWheelData,
    goToNextArea,
    goToPreviousArea,
    updateAnnualSnapshot,
    updateCategoryGoal,
    getCurrentCategory,
    getProgress,
    canProceed,
    isComplete,
    saveData
  };
};