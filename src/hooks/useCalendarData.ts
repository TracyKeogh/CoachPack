import { useState, useEffect, useCallback } from 'react';
// Import the storage key directly
import { STORAGE_KEY as GOALS_STORAGE_KEY } from './useGoalSettingData';
import { ActionItem, Milestone, GoalSettingData } from '../types/goals';

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: 'business' | 'body' | 'balance' | 'personal';
  frequency?: 'daily' | 'weekly' | '3x-week';
  completed?: boolean;
  relatedGoal?: string;
}

export interface ActionPoolItem {
  id: string;
  title: string;
  duration: number; // in minutes
  category: 'business' | 'body' | 'balance' | 'personal';
  frequency: 'daily' | 'weekly' | '3x-week';
  completed?: boolean;
  relatedGoal?: string;
}

export interface CalendarData {
  events: Event[];
  actionPool: ActionPoolItem[];
  lastUpdated: string;
}

const STORAGE_KEY = 'coach-pack-calendar';

const defaultCalendarData: CalendarData = {
  events: [],
  actionPool: [],
  lastUpdated: new Date().toISOString()
};

export const useCalendarData = () => {
  const [data, setData] = useState<CalendarData>(defaultCalendarData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data on mount
  useEffect(() => {
    try {
      // First try to load calendar data
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        
        // Convert string dates to Date objects
        if (parsedData.events) {
          parsedData.events = parsedData.events.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          }));
        }
        
        setData(parsedData);
        setLastSaved(new Date(parsedData.lastUpdated));
      } else {
        // If no calendar data, initialize with empty data
        setData(defaultCalendarData);
      }
      
      // Then load goals data to populate action pool
      loadGoalsIntoActionPool();
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      setData(defaultCalendarData);
    }
    setIsLoaded(true);
  }, []);

  // Load goals data into action pool
  const loadGoalsIntoActionPool = useCallback(() => {
    try {
      console.log("Loading goals into action pool");
      // Use the correct storage key for goal setting data
      const storedGoalsData = localStorage.getItem(GOALS_STORAGE_KEY);
      console.log("Raw stored goals data:", storedGoalsData);
      
      // Initialize with some default actions if no goals data found
      const actionPool: ActionPoolItem[] = [
        {
          id: 'exercise',
          title: 'Exercise for 30 minutes',
          duration: 30, // 30 minutes
          category: 'body',
          frequency: '3x-week',
          completed: false
        },
        {
          id: 'newsletter',
          title: 'Write weekly newsletter',
          duration: 60, // 60 minutes
          category: 'business',
          frequency: 'weekly',
          completed: false
        },
        {
          id: 'meal-prep',
          title: 'Meal prep on Sundays',
          duration: 120, // 120 minutes
          category: 'body', 
          frequency: 'weekly',
          completed: false
        },
        {
          id: 'hobby-time',
          title: 'Dedicate 30 minutes to a hobby',
          duration: 45, // 45 minutes
          category: 'balance', 
          frequency: '3x-week',
          completed: false
        },
        {
          id: 'family-time',
          title: 'Schedule quality time with loved ones',
          duration: 90, // 90 minutes
          category: 'balance',
          frequency: 'weekly',
          completed: false
        },
        {
          id: 'client-outreach',
          title: 'Reach out to 3 potential clients',
          duration: 60, // 60 minutes
          category: 'business',
          frequency: 'weekly',
          completed: false
        },
        {
          id: 'mindfulness',
          title: 'Practice mindfulness meditation',
          duration: 20, // 20 minutes
          category: 'balance',
          frequency: 'daily',
          completed: false
        },
        {
          id: 'no-screens',
          title: 'No screens 1 hour before bed',
          duration: 60, // 60 minutes
          category: 'body',
          frequency: 'daily',
          completed: false
        },
        {
          id: 'metrics-review',
          title: 'Review metrics and adjust strategy',
          duration: 45, // 45 minutes
          category: 'business',
          frequency: 'weekly',
          completed: false
        }
      ];
      
      // Add goals data if available
      if (storedGoalsData) {
        console.log("Found goals data in localStorage:", storedGoalsData);
        const parsedGoalsData: GoalSettingData = JSON.parse(storedGoalsData) || {};
        
        // Extract actions from goals if they exist
        console.log("Parsed goals data:", parsedGoalsData);
        
        // Check for the format in GoalSetting.tsx
        if (parsedGoalsData.categoryGoals) {
          try {
            console.log("Found categoryGoals:", parsedGoalsData.categoryGoals);
            Object.entries(parsedGoalsData.categoryGoals).forEach(([category, goalData]) => {
              console.log(`Processing category: ${category}`, goalData);
              
              if (!goalData) {
                console.log(`No goal data for category: ${category}`);
                return;
              }
              
              // Map goal category to calendar category
              const calendarCategory = 
                category.toLowerCase() === 'business' ? 'business' : 
                category.toLowerCase() === 'body' ? 'body' : 
                category.toLowerCase() === 'balance' ? 'balance' : 'personal';
              
              // Get actions from the goal data
              let actions = [];
              
              // Try different possible formats
              if (Array.isArray(goalData.actionItems)) {
                console.log(`Found actionItems array for ${category}:`, goalData.actionItems);
                actions = goalData.actionItems;
              } else if (Array.isArray(goalData) && goalData.length > 0) {
                // Handle case where goalData is an array of goals
                console.log(`Found array of goals for ${category}:`, goalData);
                // Take the first goal's action items
                const firstGoal = goalData[0];
                if (firstGoal && Array.isArray(firstGoal.actionItems)) {
                  console.log(`Using actionItems from first goal:`, firstGoal.actionItems);
                  actions = firstGoal.actionItems;
                } else if (firstGoal && Array.isArray(firstGoal.actions)) {
                  console.log(`Using actions from first goal:`, firstGoal.actions);
                  actions = firstGoal.actions;
                }
              } else if (Array.isArray(goalData.actions)) {
                console.log(`Found actions array for ${category}:`, goalData.actions);
                actions = goalData.actions;
              } else if (typeof goalData === 'object' && goalData !== null) {
                // Try to find any array property that might contain actions
                for (const key in goalData) {
                  if (Array.isArray(goalData[key]) && key.toLowerCase().includes('action')) {
                    console.log(`Found possible actions in ${key}:`, goalData[key]);
                    actions = goalData[key];
                    break;
                  }
                }
              }
              
              if (actions && actions.length > 0) {
                console.log(`Processing ${actions.length} actions for ${category}`);
                actions.forEach((action, index) => {
                  console.log(`Processing action ${index}:`, action);
                  
                  // Handle different action formats
                  let actionTitle = '';
                  let actionFrequency: 'daily' | 'weekly' | '3x-week' = 'weekly';
                  
                  if (typeof action === 'string') {
                    console.log(`Action is string: ${action}`);
                    actionTitle = action;
                  } else if (action && typeof action === 'object' && action.title) {
                    console.log(`Action has title: ${action.title}`);
                    actionTitle = action.title;
                  } else if (action && typeof action === 'object') {
                    // New format with title property
                    if (action.title) {
                      console.log(`Action has title: ${action.title}`);
                      actionTitle = action.title;
                    } 
                    // Old format with text property
                    else if (action.text) {
                      console.log(`Action has text: ${action.text}`);
                      actionTitle = action.text;
                    }
                    
                    // Get frequency if available
                    if (action.frequency) {
                      console.log(`Action has frequency: ${action.frequency}`);
                      actionFrequency = action.frequency as 'daily' | 'weekly' | '3x-week';
                    }
                  }
                  
                  if (actionTitle) {
                    console.log(`Adding action to pool: ${actionTitle}`);
                    // Create action pool item
                    actionPool.push({
                      id: `${category}-action-${index}`,
                      title: actionTitle || `Action ${index + 1}`,
                      duration: 60, // Default 60 minutes
                      category: calendarCategory as 'business' | 'body' | 'balance' | 'personal',
                      frequency: actionFrequency,
                      relatedGoal: goalData.title || goalData.goal || (typeof goalData === 'string' ? goalData : 'Goal')
                    });
                  }
                });
              } else {
                console.log(`No actions found for category: ${category}`);
              }
            });
          } catch (err) {
            console.error("Error processing goals data:", err);
          }
        } else {
          console.log("No categoryGoals found in parsed data:", parsedGoalsData);
        }
      }
      
      // Update action pool
      setData(prev => ({
        ...prev,
        actionPool: actionPool.length > 0 ? actionPool : prev.actionPool
      }));
      
      console.log("Final action pool:", actionPool);
    } catch (error) {
      console.error('Failed to load goals into action pool:', error);
    }
  }, []);

  // Auto-save function
  const saveData = useCallback(() => {
    if (!isLoaded) return;

    try {
      const dataToSave: CalendarData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save calendar data:', error);
    }
  }, [data, isLoaded]);

  // Auto-save whenever data changes
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(saveData, 1000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [data, saveData, isLoaded]);

  // Event management functions
  const addEvent = useCallback((event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString()
    };
    
    setData(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  }, []);

  const updateEvent = useCallback((eventId: string, updates: Partial<Event>) => {
    setData(prev => ({
      ...prev,
      events: prev.events.map(event => 
        event.id === eventId ? { ...event, ...updates } : event
      )
    }));
  }, []);

  const removeEvent = useCallback((eventId: string) => {
    setData(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== eventId)
    }));
  }, []);

  // Action pool management
  const addActionToPool = useCallback((action: Omit<ActionPoolItem, 'id'>) => {
    const newAction: ActionPoolItem = {
      ...action,
      id: Date.now().toString()
    };
    
    setData(prev => ({
      ...prev,
      actionPool: [...prev.actionPool, newAction]
    }));
  }, []);

  const updateActionInPool = useCallback((actionId: string, updates: Partial<ActionPoolItem>) => {
    setData(prev => ({
      ...prev,
      actionPool: prev.actionPool.map(action => 
        action.id === actionId ? { ...action, ...updates } : action
      )
    }));
  }, []);

  const removeActionFromPool = useCallback((actionId: string) => {
    setData(prev => ({
      ...prev,
      actionPool: prev.actionPool.filter(action => action.id !== actionId)
    }));
  }, []);

  // Convert action to event
  const scheduleActionFromPool = useCallback((actionId: string, start: Date) => {
    const action = data.actionPool.find(a => a.id === actionId);
    if (!action) return;
    
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + action.duration);
    
    const newEvent: Event = {
      id: Date.now().toString(),
      title: action.title,
      start,
      end,
      category: action.category,
      frequency: action.frequency,
      relatedGoal: action.relatedGoal
    };
    
    setData(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  }, [data.actionPool]);

  // Utility functions
  const getEventsForDay = useCallback((date: Date): Event[] => {
    return data.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  }, [data.events]);

  const getEventsForWeek = useCallback((startDate: Date): Event[] => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    return data.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= startDate && eventDate < endDate;
    });
  }, [data.events]);

  // Refresh action pool from goals
  const refreshActionPool = useCallback(() => {
    loadGoalsIntoActionPool();
  }, [loadGoalsIntoActionPool]);

  return {
    data,
    isLoaded,
    lastSaved,
    addEvent,
    updateEvent,
    removeEvent,
    addActionToPool,
    updateActionInPool,
    removeActionFromPool,
    scheduleActionFromPool,
    getEventsForDay,
    getEventsForWeek,
    refreshActionPool,
    saveData
  };
};