import { useState, useEffect, useCallback } from 'react';
import { GoalSettingData, defaultGoalSettingData, AnnualSnapshot, CategoryGoal, getTwelveWeeksFromNow, ActionItem, Milestone } from '../types/goals';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// Export the storage key for reference
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
  if (!Array.isArray(actions)) return [];
  
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
  const { user } = useAuth();

  // Load data from Supabase on mount or when user changes
  useEffect(() => {
    const loadGoalsData = async () => {
      if (!user) {
        console.log("No user authenticated, using default goal setting data");
        setData(defaultGoalSettingData);
        setIsLoaded(true);
        return;
      }

      try {
        console.log("Loading goal setting data from Supabase for user:", user.id);
        
        const { data: goalsData, error } = await supabase
          .from('user_goals_data')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading goals data:', error);
          setData(defaultGoalSettingData);
          setIsLoaded(true);
          return;
        }

        if (goalsData) {
          console.log("Found stored goal setting data:", goalsData);
          
          // Parse and migrate the data
          let parsedData = defaultGoalSettingData;
          
          try {
            // Map Supabase columns to our data structure
            parsedData = {
              currentStep: goalsData.current_step || 'annual',
              currentCategoryIndex: goalsData.current_category_index || 0,
              categories: goalsData.categories || ['business', 'body', 'balance'],
              annualSnapshot: goalsData.annual_snapshot || { snapshot: '', mantra: '' },
              categoryGoals: goalsData.category_goals || {},
              lastUpdated: goalsData.last_updated || new Date().toISOString()
            };
            
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
            console.log("Merged goal setting data:", mergedData);
            setLastSaved(new Date(mergedData.lastUpdated));
          } catch (parseError) {
            console.error('Error parsing goals data:', parseError);
            setData(defaultGoalSettingData);
          }
        } else {
          console.log("No stored goal setting data found, using defaults");
          setData(defaultGoalSettingData);
        }
      } catch (error) {
        console.error('Failed to load goal setting data:', error);
        setData(defaultGoalSettingData);
      }
      
      setIsLoaded(true);
    };

    loadGoalsData();
  }, [user]);

  // Save data to Supabase
  const saveData = useCallback(async () => {
    if (!isLoaded || !user) {
      console.log("Cannot save: not loaded or no user");
      return;
    }

    try {
      console.log("Saving goal setting data to Supabase");
      
      const dataToSave = {
        user_id: user.id,
        current_step: data.currentStep,
        current_category_index: data.currentCategoryIndex,
        categories: data.categories,
        annual_snapshot: data.annualSnapshot,
        category_goals: data.categoryGoals,
        last_updated: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('user_goals_data')
        .upsert(dataToSave, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Failed to save goal setting data:', error);
        throw error;
      }
      
      console.log("Successfully saved goal setting data to Supabase");
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save goal setting data:', error);
    }
  }, [data, isLoaded, user]);

  // Auto-save whenever data changes
  useEffect(() => {
    if (isLoaded && user) {
      const timeoutId = setTimeout(saveData, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [data, saveData, isLoaded, user]);

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