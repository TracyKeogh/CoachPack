```typescript
import { useState, useEffect, useMemo } from 'react';
import { useWheelData } from './useWheelData';
import { useValuesData } from './useValuesData';
import { useVisionBoardData } from './useVisionBoardData';
import { useGoalSettingData } from './useGoalSettingData';
import { GOAL_CATEGORIES } from '../types/goals';

export interface DashboardData {
  // User info
  name: string;
  daysIntoJourney: number;
  totalDays: number;
  
  // Core values
  coreValues: string[];
  visionStatement: string;
  currentFocus: string;
  
  // Vision board
  visionBoard: Array<{
    quadrant: string;
    title: string;
    imageUrl: string;
  }>;
  
  // Life areas with current and vision state
  lifeAreas: Array<{
    area: string;
    now: number;
    vision: number;
    gap: number;
  }>;
  
  // Progress tracking
  baselineProgress: number;
  visionProgress: number;
  planProgress: number;
  overallProgress: number;
  
  // Next milestones
  nextMilestones: Array<{
    title: string;
    date: string;
    daysAway: number;
  }>;
  
  // Journey start date
  journeyStartDate: Date | null;
}

export const useDashboardData = (): DashboardData => {
  const mockUser = { name: 'Test User' }; // Temporary mock user
  
  const { data: wheelData, isLoaded: wheelLoaded } = useWheelData();
  const { data: valuesData, isLoaded: valuesLoaded } = useValuesData();
  const { visionItems, textElements, isLoaded: visionLoaded } = useVisionBoardData(); // Get textElements too
  const { data: goalsData, isLoaded: goalsLoaded } = useGoalSettingData();

  const [journeyStartDate, setJourneyStartDate] = useState<Date | null>(null);

  // Calculate journey start date (first time user completed wheel of life)
  useEffect(() => {
    if (wheelLoaded && wheelData && Array.isArray(wheelData) && wheelData.length > 0) {
      // Check if we have stored journey start date, otherwise use current date
      const stored = localStorage.getItem('coach-pack-journey-start');
      if (stored) {
        setJourneyStartDate(new Date(stored));
      } else {
        const startDate = new Date();
        localStorage.setItem('coach-pack-journey-start', startDate.toISOString());
        setJourneyStartDate(startDate);
      }
    }
  }, [wheelLoaded, wheelData]);

  // Calculate days into journey
  const daysIntoJourney = useMemo(() => {
    if (!journeyStartDate) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - journeyStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, 84); // Cap at 84 days (12 weeks)
  }, [journeyStartDate]);

  // Calculate progress percentages
  const baselineProgress = useMemo(() => {
    if (!wheelLoaded || !valuesLoaded) return 0;
    
    let completed = 0;
    let total = 2; // Wheel of Life + Values Clarity
    
    // Check if wheel of life has been completed
    if (wheelData && Array.isArray(wheelData) && wheelData.length > 0) {
      const hasReflections = Object.keys(wheelData).length > 0; // Check if any area has a score
      if (hasReflections) completed++;
    }
    
    // Check if values have been selected
    if (valuesData && valuesData.coreValues && Array.isArray(valuesData.coreValues) && valuesData.coreValues.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  }, [wheelLoaded, valuesLoaded, wheelData, valuesData]);

  const visionProgress = useMemo(() => {
    if (!visionLoaded) return 0;
    
    if (!visionItems || !Array.isArray(visionItems) || visionItems.length === 0) return 0;
    
    // Calculate based on number of vision items and their completeness
    const totalPossible = 4; // 4 quadrants
    const completed = Math.min(visionItems.length, totalPossible);
    
    return Math.round((completed / totalPossible) * 100);
  }, [visionLoaded, visionItems]);

  const planProgress = useMemo(() => {
    if (!goalsLoaded) return 0;
    
    // Use the actual progress calculation from the goals data hook
    const progress = goalsData.getProgress ? goalsData.getProgress() : { percentage: 0 };
    return progress.percentage;
  }, [goalsLoaded, goalsData]);

  const overallProgress = useMemo(() => {
    return Math.round((baselineProgress + visionProgress + planProgress) / 3);
  }, [baselineProgress, visionProgress, planProgress]);

  // Transform vision board data
  const visionBoard = useMemo(() => {
    if (!visionLoaded || !visionItems || !Array.isArray(visionItems)) return [];
    
    // Combine vision items and text elements for display
    const combinedElements: Array<{
      quadrant?: string;
      title: string;
      imageUrl?: string;
      text?: string;
      type: 'image' | 'text';
    }> = [];

    visionItems.forEach(item => {
      combinedElements.push({
        quadrant: item.quadrant ? 
          (item.quadrant === 'feelings' ? 'Emotions' : 
           item.quadrant.charAt(0).toUpperCase() + item.quadrant.slice(1)) : 'Unknown',
        title: item.title || 'Untitled',
        imageUrl: item.imageUrl || '',
        type: 'image'
      });
    });

    textElements.filter(t => t.text !== 'New Text').forEach(textEl => { // Filter out default 'New Text'
      combinedElements.push({
        title: textEl.text,
        text: textEl.text,
        type: 'text'
      });
    });

    // Sort by position or just take the first few for display
    return combinedElements.sort((a, b) => {
      // Simple sort for display, could be more complex based on actual positions
      if (a.type === 'image' && b.type === 'image') {
        return (a.quadrant || '').localeCompare(b.quadrant || '');
      }
      return 0;
    }).slice(0, 4).map(el => ({ // Limit to 4 for dashboard display
      quadrant: el.quadrant || '',
      title: el.title,
      imageUrl: el.imageUrl || '',
      text: el.text || ''
    }));
  }, [visionLoaded, visionItems, textElements]);

  // Transform life areas data
  const lifeAreas = useMemo(() => {
    if (!wheelLoaded || !wheelData || !Array.isArray(wheelData)) return [];
    
    // Map wheel areas to dashboard format
    const areaMapping: Record<string, string> = {
      'Career': 'Career',
      'Finances': 'Money',
      'Health': 'Health',
      'Family': 'Relationships',
      'Romance': 'Relationships',
      'Personal Growth': 'Growth',
      'Fun & Recreation': 'Recreation',
      'Environment': 'Environment'
    };
    
    const transformedAreas: Record<string, { now: number; vision: number }> = {};
    
    wheelData.forEach(area => {
      if (area && area.area && typeof area.score === 'number') {
        const mappedArea = areaMapping[area.area];
        if (mappedArea) {
          if (!transformedAreas[mappedArea]) {
            transformedAreas[mappedArea] = { now: 0, vision: 0 };
          }
          // Use current score as "now" and add 2-3 points for vision
          transformedAreas[mappedArea].now = Math.max(transformedAreas[mappedArea].now, area.score);
          transformedAreas[mappedArea].vision = Math.min(10, area.score + Math.floor(Math.random() * 3) + 2);
        }
      }
    });
    
    // Add missing areas with default values
    const allAreas = ['Career', 'Health', 'Relationships', 'Growth', 'Recreation', 'Money', 'Environment', 'Contribution'];
    
    return allAreas.map(area => {
      const data = transformedAreas[area] || { now: 5, vision: 8 };
      return {
        area,
        now: data.now,
        vision: data.vision,
        gap: data.vision - data.now
      };
    });
  }, [wheelLoaded, wheelData]);

  // Generate next milestones from goals (placeholder for now)
  const nextMilestones = useMemo(() => {
    if (!goalsLoaded) return [];
    
    const milestones: Array<{
      title: string;
      date: string;
      daysAway: number;
      type: string;
      color: string;
    }> = [];
    
    // Extract milestones from category goals
    Object.entries(goalsData.categoryGoals).forEach(([categoryKey, categoryGoal]) => {
      if (categoryGoal && categoryGoal.milestones) {
        categoryGoal.milestones.forEach(milestone => {
          const dueDate = new Date(milestone.dueDate);
          const today = new Date();
          const daysAway = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysAway >= 0 && !milestone.completed) {
            const categoryInfo = GOAL_CATEGORIES[categoryKey];
            milestones.push({
              title: milestone.title,
              date: dueDate.toLocaleDateString(),
              daysAway,
              type: 'milestone',
              color: categoryInfo?.color || 'purple'
            });
          }
        });
      }
    });
    
    // Sort by days away and return top 3
    return milestones
      .sort((a, b) => a.daysAway - b.daysAway)
      .slice(0, 3);
  }, [goalsLoaded, goalsData]);

  // Generate vision statement and current focus
  const visionStatement = useMemo(() => {
    if (valuesData && valuesData.rankedCoreValues && Array.isArray(valuesData.rankedCoreValues) && valuesData.rankedCoreValues.length > 0) {
      const topValues = valuesData.rankedCoreValues.slice(0, 3).map(v => v.name || 'Unknown').join(', ');
      return `Building a life of ${topValues.toLowerCase()}`;
    } else if (valuesData && valuesData.coreValues && Array.isArray(valuesData.coreValues) && valuesData.coreValues.length > 0) {
      const values = valuesData.coreValues.slice(0, 3).map(v => v.name || 'Unknown').join(', ');
      return `Building a life of ${values.toLowerCase()}`;
    }
    return "Building a life of impact, growth, and deep connection";
  }, [valuesData]);

  const currentFocus = useMemo(() => {
    if (!goalsLoaded) return "Establishing daily habits that align with my values";
    
    // Use annual snapshot if available
    if (goalsData.annualSnapshot?.snapshot?.trim()) {
      return goalsData.annualSnapshot.snapshot;
    }
    
    // Otherwise, use the first available category goal
    const activeGoal = Object.values(goalsData.categoryGoals).find(goal => goal?.goal?.trim());
    if (activeGoal) {
      return `Focusing on: ${activeGoal.goal}`;
    }
    
    return "Establishing daily habits that align with my values";
  }, [goalsLoaded, goalsData]);

  return {
    name: mockUser.name,
    daysIntoJourney,
    totalDays: 84,
    coreValues: valuesData?.rankedCoreValues?.slice(0, 3).map(v => v.name || 'Unknown') || 
                valuesData?.coreValues?.slice(0, 3).map(v => v.name || 'Unknown') || 
                ['Excellence', 'Growth', 'Connection'],
    visionStatement,
    currentFocus,
    visionBoard,
    lifeAreas,
    baselineProgress,
    visionProgress,
    planProgress,
    overallProgress,
    nextMilestones,
    journeyStartDate
  };
};
```