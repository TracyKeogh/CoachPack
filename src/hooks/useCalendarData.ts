import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEY as GOALS_STORAGE_KEY } from './useGoalSettingData';
import { ActionItem, Milestone } from '../types/goals';

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
      const goalsData = localStorage.getItem(GOALS_STORAGE_KEY);
      if (!goalsData) return;
      
      const parsedGoalsData = JSON.parse(goalsData);
      const actionPool: ActionPoolItem[] = [];
      
      // Extract actions from goals
      if (parsedGoalsData.categoryGoals) {
        Object.entries(parsedGoalsData.categoryGoals).forEach(([category, goalData]: [string, any]) => {
          if (goalData && goalData.actions) {
            goalData.actions.forEach((action: any, index: number) => {
              // Map goal category to calendar category
              const calendarCategory = 
                category === 'business' ? 'business' : 
                category === 'body' ? 'body' : 
                category === 'balance' ? 'balance' : 'personal';
              
              // Create action pool item
              actionPool.push({
                id: `${category}-action-${index}`,
                title: action.text || '',
                duration: 60, // Default 60 minutes
                category: calendarCategory as 'business' | 'body' | 'balance' | 'personal',
                frequency: action.frequency || 'weekly',
                relatedGoal: goalData.goal
              });
            });
          }
        });
      }
      
      // Update action pool
      setData(prev => ({
        ...prev,
        actionPool
      }));
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