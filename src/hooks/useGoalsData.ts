import { useState, useEffect, useCallback } from 'react';
import { GoalsData, defaultGoalsData, YearlyGoal, TwelveWeekGoal, WeeklyGoal, WeeklyAction, getCurrentWeekMonday, getTwelveWeekEndDate, getQuarterDates } from '../types/goals';

const STORAGE_KEY = 'coach-pack-goals';

export const useGoalsData = () => {
  const [data, setData] = useState<GoalsData>(defaultGoalsData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData: GoalsData = JSON.parse(stored);
        setData(parsedData);
        setLastSaved(new Date(parsedData.lastUpdated));
      }
    } catch (error) {
      console.error('Failed to load goals data:', error);
      setData(defaultGoalsData);
    }
    setIsLoaded(true);
  }, []);

  // Auto-save function
  const saveData = useCallback(() => {
    if (!isLoaded) return;

    try {
      const dataToSave: GoalsData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save goals data:', error);
    }
  }, [data, isLoaded]);

  // Auto-save whenever data changes
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(saveData, 1000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [data, saveData, isLoaded]);

  // Yearly Goals functions
  const addYearlyGoal = useCallback((lifeArea: string, targetScore: number, currentScore: number, snapshot?: string) => {
    const newGoal: YearlyGoal = {
      id: Date.now().toString(),
      title: `Improve ${lifeArea}`,
      description: '',
      snapshot: snapshot || '',
      lifeArea,
      targetScore,
      currentScore,
      status: 'not-started',
      progress: 0,
      quarterlyMilestones: ['', '', '', ''], // 4 empty quarterly milestones
      createdAt: new Date().toISOString(),
      dueDate: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0] // End of next year
    };
    
    setData(prev => ({
      ...prev,
      yearlyGoals: [...prev.yearlyGoals, newGoal]
    }));
    
    return newGoal.id;
  }, []);

  const updateYearlyGoal = useCallback((goalId: string, updates: Partial<YearlyGoal>) => {
    setData(prev => ({
      ...prev,
      yearlyGoals: prev.yearlyGoals.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    }));
  }, []);

  const removeYearlyGoal = useCallback((goalId: string) => {
    setData(prev => ({
      ...prev,
      yearlyGoals: prev.yearlyGoals.filter(goal => goal.id !== goalId),
      twelveWeekGoals: prev.twelveWeekGoals.filter(goal => goal.yearlyGoalId !== goalId),
      weeklyGoals: prev.weeklyGoals.filter(goal => {
        const twelveWeekGoal = prev.twelveWeekGoals.find(twg => twg.id === goal.twelveWeekGoalId);
        return twelveWeekGoal?.yearlyGoalId !== goalId;
      })
    }));
  }, []);

  // 12-Week Goals functions
  const addTwelveWeekGoal = useCallback((yearlyGoalId: string, quarter?: 1 | 2 | 3 | 4) => {
    const currentYear = new Date().getFullYear();
    const goalQuarter = quarter || 1;
    const quarterDates = getQuarterDates(currentYear, goalQuarter);
    
    const newGoal: TwelveWeekGoal = {
      id: Date.now().toString(),
      title: `Q${goalQuarter} Goal`,
      description: '',
      yearlyGoalId,
      quarter: goalQuarter,
      status: 'not-started',
      progress: 0,
      actions: [],
      startDate: quarterDates.start,
      endDate: quarterDates.end,
      createdAt: new Date().toISOString()
    };
    
    setData(prev => ({
      ...prev,
      twelveWeekGoals: [...prev.twelveWeekGoals, newGoal]
    }));
    
    return newGoal.id;
  }, []);

  const updateTwelveWeekGoal = useCallback((goalId: string, updates: Partial<TwelveWeekGoal>) => {
    setData(prev => ({
      ...prev,
      twelveWeekGoals: prev.twelveWeekGoals.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    }));
  }, []);

  const removeTwelveWeekGoal = useCallback((goalId: string) => {
    setData(prev => ({
      ...prev,
      twelveWeekGoals: prev.twelveWeekGoals.filter(goal => goal.id !== goalId),
      weeklyGoals: prev.weeklyGoals.filter(goal => goal.twelveWeekGoalId !== goalId)
    }));
  }, []);

  // Weekly Actions functions
  const addWeeklyAction = useCallback((twelveWeekGoalId: string) => {
    const newAction: WeeklyAction = {
      id: Date.now().toString(),
      title: 'New Action',
      description: '',
      completed: false,
      dueDate: new Date().toISOString().split('T')[0]
    };
    
    setData(prev => ({
      ...prev,
      twelveWeekGoals: prev.twelveWeekGoals.map(goal => 
        goal.id === twelveWeekGoalId 
          ? { ...goal, actions: [...goal.actions, newAction] }
          : goal
      )
    }));
    
    return newAction.id;
  }, []);

  const updateWeeklyAction = useCallback((twelveWeekGoalId: string, actionId: string, updates: Partial<WeeklyAction>) => {
    setData(prev => ({
      ...prev,
      twelveWeekGoals: prev.twelveWeekGoals.map(goal => 
        goal.id === twelveWeekGoalId 
          ? {
              ...goal,
              actions: goal.actions.map(action => 
                action.id === actionId ? { ...action, ...updates } : action
              )
            }
          : goal
      )
    }));
  }, []);

  const removeWeeklyAction = useCallback((twelveWeekGoalId: string, actionId: string) => {
    setData(prev => ({
      ...prev,
      twelveWeekGoals: prev.twelveWeekGoals.map(goal => 
        goal.id === twelveWeekGoalId 
          ? { ...goal, actions: goal.actions.filter(action => action.id !== actionId) }
          : goal
      )
    }));
  }, []);

  // Weekly Goals functions
  const addWeeklyGoal = useCallback((twelveWeekGoalId: string) => {
    const newGoal: WeeklyGoal = {
      id: Date.now().toString(),
      title: 'New Weekly Goal',
      description: '',
      twelveWeekGoalId,
      status: 'not-started',
      priority: 'medium',
      weekStarting: getCurrentWeekMonday(),
      createdAt: new Date().toISOString()
    };
    
    setData(prev => ({
      ...prev,
      weeklyGoals: [...prev.weeklyGoals, newGoal]
    }));
    
    return newGoal.id;
  }, []);

  const updateWeeklyGoal = useCallback((goalId: string, updates: Partial<WeeklyGoal>) => {
    setData(prev => ({
      ...prev,
      weeklyGoals: prev.weeklyGoals.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    }));
  }, []);

  const removeWeeklyGoal = useCallback((goalId: string) => {
    setData(prev => ({
      ...prev,
      weeklyGoals: prev.weeklyGoals.filter(goal => goal.id !== goalId)
    }));
  }, []);

  // Utility functions
  const getTwelveWeekGoalsForYearly = useCallback((yearlyGoalId: string) => {
    return data.twelveWeekGoals.filter(goal => goal.yearlyGoalId === yearlyGoalId);
  }, [data.twelveWeekGoals]);

  const getWeeklyGoalsForTwelveWeek = useCallback((twelveWeekGoalId: string) => {
    return data.weeklyGoals.filter(goal => goal.twelveWeekGoalId === twelveWeekGoalId);
  }, [data.weeklyGoals]);

  const getCurrentWeekGoals = useCallback(() => {
    const currentWeek = getCurrentWeekMonday();
    return data.weeklyGoals.filter(goal => goal.weekStarting === currentWeek);
  }, [data.weeklyGoals]);

  const getCompletionStats = useCallback(() => {
    const totalYearlyGoals = data.yearlyGoals.length;
    const completedYearlyGoals = data.yearlyGoals.filter(goal => goal.status === 'completed').length;
    
    const totalTwelveWeekGoals = data.twelveWeekGoals.length;
    const completedTwelveWeekGoals = data.twelveWeekGoals.filter(goal => goal.status === 'completed').length;
    
    const totalWeeklyGoals = data.weeklyGoals.length;
    const completedWeeklyGoals = data.weeklyGoals.filter(goal => goal.status === 'completed').length;
    
    const currentWeekGoals = getCurrentWeekGoals();
    const completedCurrentWeekGoals = currentWeekGoals.filter(goal => goal.status === 'completed').length;
    
    const totalActions = data.twelveWeekGoals.reduce((sum, goal) => sum + goal.actions.length, 0);
    const completedActions = data.twelveWeekGoals.reduce((sum, goal) => 
      sum + goal.actions.filter(action => action.completed).length, 0
    );

    return {
      yearly: {
        total: totalYearlyGoals,
        completed: completedYearlyGoals,
        percentage: totalYearlyGoals > 0 ? Math.round((completedYearlyGoals / totalYearlyGoals) * 100) : 0
      },
      twelveWeek: {
        total: totalTwelveWeekGoals,
        completed: completedTwelveWeekGoals,
        percentage: totalTwelveWeekGoals > 0 ? Math.round((completedTwelveWeekGoals / totalTwelveWeekGoals) * 100) : 0
      },
      weekly: {
        total: totalWeeklyGoals,
        completed: completedWeeklyGoals,
        percentage: totalWeeklyGoals > 0 ? Math.round((completedWeeklyGoals / totalWeeklyGoals) * 100) : 0
      },
      currentWeek: {
        total: currentWeekGoals.length,
        completed: completedCurrentWeekGoals,
        percentage: currentWeekGoals.length > 0 ? Math.round((completedCurrentWeekGoals / currentWeekGoals.length) * 100) : 0
      },
      actions: {
        total: totalActions,
        completed: completedActions,
        percentage: totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0
      }
    };
  }, [data, getCurrentWeekGoals]);

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const importedData: GoalsData = JSON.parse(jsonString);
      
      // Validate data structure
      if (!Array.isArray(importedData.yearlyGoals) || !Array.isArray(importedData.twelveWeekGoals) || !Array.isArray(importedData.weeklyGoals)) {
        throw new Error('Invalid data format');
      }
      
      setData(importedData);
      return true;
    } catch (error) {
      console.error('Failed to import goals data:', error);
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    setData(defaultGoalsData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    // Data
    data,
    isLoaded,
    lastSaved,
    
    // Yearly Goals
    addYearlyGoal,
    updateYearlyGoal,
    removeYearlyGoal,
    
    // 12-Week Goals
    addTwelveWeekGoal,
    updateTwelveWeekGoal,
    removeTwelveWeekGoal,
    
    // Weekly Actions
    addWeeklyAction,
    updateWeeklyAction,
    removeWeeklyAction,
    
    // Weekly Goals
    addWeeklyGoal,
    updateWeeklyGoal,
    removeWeeklyGoal,
    
    // Utility functions
    getTwelveWeekGoalsForYearly,
    getWeeklyGoalsForTwelveWeek,
    getCurrentWeekGoals,
    getCompletionStats,
    saveData,
    exportData,
    importData,
    clearAllData
  };
};