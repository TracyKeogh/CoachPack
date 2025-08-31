import { useState, useEffect, useMemo } from 'react';
import { useWheelData } from './useWheelData';
import { useValuesData } from './useValuesData';
import { useVisionBoardData } from './useVisionBoardData';
import { useGoalSettingData } from './useGoalSettingData';

export interface DashboardData {
  name: string;
  daysIntoJourney: number;
  totalDays: number;
  coreValues: string[];
  visionStatement: string;
  currentFocus: string;
  visionBoard: Array<{
    quadrant: string;
    title: string;
    imageUrl: string;
  }>;
  lifeAreas: Array<{
    area: string;
    now: number;
    vision: number;
    gap: number;
  }>;
  baselineProgress: number;
  visionProgress: number;
  planProgress: number;
  overallProgress: number;
  nextMilestones: Array<{
    title: string;
    date: string;
    daysAway: number;
  }>;
  journeyStartDate: Date | null;
}

export const useDashboardData = (): DashboardData => {
  const mockUser = { name: 'Test User' };
  
  const { data: wheelData, isLoaded: wheelLoaded } = useWheelData();
  const { data: valuesData, isLoaded: valuesLoaded } = useValuesData();
  const { visionItems, textElements, isLoaded: visionLoaded } = useVisionBoardData();
  const { data: goalsData, isLoaded: goalsLoaded } = useGoalSettingData();

  const [journeyStartDate, setJourneyStartDate] = useState<Date | null>(null);

  // Calculate journey start date
  useEffect(() => {
    if (wheelLoaded && wheelData && Array.isArray(wheelData) && wheelData.length > 0) {
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
    return Math.min(diffDays, 84);
  }, [journeyStartDate]);

  // Calculate progress percentages
  const baselineProgress = useMemo(() => {
    if (!wheelLoaded || !valuesLoaded) return 0;
    
    let completed = 0;
    let total = 2;
    
    if (wheelData && Array.isArray(wheelData) && wheelData.length > 0) {
      completed += 1;
    }
    
    if (valuesData && valuesData.coreValues && Array.isArray(valuesData.coreValues) && valuesData.coreValues.length > 0) {
      completed += 1;
    }
    
    return Math.round((completed / total) * 100);
  }, [wheelLoaded, wheelData, valuesLoaded, valuesData]);

  const visionProgress = useMemo(() => {
    if (!visionLoaded) return 0;
    
    let completed = 0;
    let total = 1;
    
    if (visionItems && visionItems.length > 0) {
      completed += 1;
    }
    
    return Math.round((completed / total) * 100);
  }, [visionLoaded, visionItems]);

  const planProgress = useMemo(() => {
    if (!goalsLoaded || !goalsData) return 0;
    
    try {
      return goalsData.getProgress ? goalsData.getProgress() : 0;
    } catch (error) {
      console.error('Error calculating plan progress:', error);
      return 0;
    }
  }, [goalsLoaded, goalsData]);

  const overallProgress = useMemo(() => {
    const weights = { baseline: 0.3, vision: 0.2, plan: 0.5 };
    return Math.round(
      baselineProgress * weights.baseline +
      visionProgress * weights.vision +
      planProgress * weights.plan
    );
  }, [baselineProgress, visionProgress, planProgress]);

  // Transform wheel data for dashboard
  const lifeAreas = useMemo(() => {
    const transformedAreas: Record<string, { now: number; vision: number }> = {};

    if (wheelData && Array.isArray(wheelData)) {
      wheelData.forEach(area => {
        if (area && area.name && typeof area.score === 'number') {
          const mappedArea = area.name === 'Career' ? 'Career' :
                           area.name === 'Health' ? 'Health' :
                           area.name === 'Relationships' ? 'Relationships' :
                           area.name === 'Personal Growth' ? 'Growth' :
                           area.name === 'Fun & Recreation' ? 'Recreation' :
                           area.name === 'Finances' ? 'Money' :
                           area.name === 'Physical Environment' ? 'Environment' :
                           area.name === 'Contribution' ? 'Contribution' :
                           area.name;
          
          if (mappedArea) {
            if (!transformedAreas[mappedArea]) {
              transformedAreas[mappedArea] = { now: 0, vision: 8 };
            }
            transformedAreas[mappedArea].now = Math.max(transformedAreas[mappedArea].now, area.score);
            transformedAreas[mappedArea].vision = Math.min(10, area.score + Math.floor(Math.random() * 3) + 2);
          }
        }
      });
    }
    
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

  // Generate next milestones from goals
  const nextMilestones = useMemo(() => {
    if (!goalsLoaded || !goalsData || !goalsData.categoryGoals) {
      return [
        { title: "Complete Wheel of Life", date: "Today", daysAway: 0 },
        { title: "Set Your Values", date: "This Week", daysAway: 7 },
        { title: "Create Vision Board", date: "Next Week", daysAway: 14 }
      ];
    }

    const milestones: Array<{ title: string; date: string; daysAway: number }> = [];
    const now = new Date();

    Object.values(goalsData.categoryGoals).forEach(categoryGoal => {
      if (categoryGoal.milestones && Array.isArray(categoryGoal.milestones)) {
        categoryGoal.milestones.forEach(milestone => {
          if (milestone.dueDate && !milestone.completed) {
            const dueDate = new Date(milestone.dueDate);
            const diffTime = dueDate.getTime() - now.getTime();
            const daysAway = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (daysAway >= 0) {
              milestones.push({
                title: milestone.title,
                date: dueDate.toLocaleDateString(),
                daysAway
              });
            }
          }
        });
      }
    });

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
    if (goalsData && goalsData.annualSnapshot && goalsData.annualSnapshot.snapshot) {
      return goalsData.annualSnapshot.snapshot.slice(0, 100) + (goalsData.annualSnapshot.snapshot.length > 100 ? '...' : '');
    }
    
    if (goalsData && goalsData.categoryGoals) {
      const activeGoals = Object.values(goalsData.categoryGoals);
      if (activeGoals.length > 0) {
        const firstGoal = activeGoals[0];
        if (firstGoal.goal) {
          return firstGoal.goal.slice(0, 100) + (firstGoal.goal.length > 100 ? '...' : '');
        }
      }
    }
    
    return "Establishing daily habits that align with my values";
  }, [goalsData]);

  // Transform vision board data
  const visionBoard = useMemo(() => {
    const boardItems: Array<{ quadrant: string; title: string; imageUrl: string }> = [];

    if (visionItems && Array.isArray(visionItems)) {
      visionItems.forEach(item => {
        if (item.imageUrl) {
          boardItems.push({
            quadrant: item.quadrant || 'Personal',
            title: item.title || 'Vision Item',
            imageUrl: item.imageUrl
          });
        }
      });
    }

    if (textElements && Array.isArray(textElements)) {
      textElements.forEach(text => {
        if (text.content) {
          boardItems.push({
            quadrant: 'Text',
            title: text.content.slice(0, 20) + (text.content.length > 20 ? '...' : ''),
            imageUrl: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
                <rect width="200" height="150" fill="${text.color || '#8B5CF6'}"/>
                <text x="100" y="75" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="14" font-family="Arial">${text.content.slice(0, 30)}</text>
              </svg>
            `)
          });
        }
      });
    }

    // Fill with default items if empty
    while (boardItems.length < 4) {
      boardItems.push({
        quadrant: 'Personal',
        title: 'Add Vision Item',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop'
      });
    }

    return boardItems.slice(0, 4);
  }, [visionItems, textElements]);

  // Core values for dashboard
  const coreValues = useMemo(() => {
    if (valuesData && valuesData.rankedCoreValues && Array.isArray(valuesData.rankedCoreValues) && valuesData.rankedCoreValues.length > 0) {
      return valuesData.rankedCoreValues.slice(0, 4).map(v => v.name || 'Unknown');
    } else if (valuesData && valuesData.coreValues && Array.isArray(valuesData.coreValues) && valuesData.coreValues.length > 0) {
      return valuesData.coreValues.slice(0, 4).map(v => v.name || 'Unknown');
    }
    return ['Growth', 'Connection', 'Impact', 'Balance'];
  }, [valuesData]);

  return {
    name: mockUser.name,
    daysIntoJourney,
    totalDays: 84,
    coreValues,
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