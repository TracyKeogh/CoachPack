import { useState, useEffect, useMemo } from 'react';
import { useWheelData } from './useWheelData';
import { useValuesData } from './useValuesData';
import { useVisionBoardData, VisionItem } from './useVisionBoardData';

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
  const { data: wheelData, isLoaded: wheelLoaded } = useWheelData();
  const { data: valuesData, isLoaded: valuesLoaded } = useValuesData();
  const { visionItems, isLoaded: visionLoaded } = useVisionBoardData();

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
    if (!journeyStartDate) return 1; // Default to day 1
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - journeyStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, 84); // Cap at 84 days (12 weeks)
  }, [journeyStartDate]);

  // Extract core values from values data
  const coreValues = useMemo(() => {
    if (!valuesLoaded || !valuesData) return ['Self-Discovery', 'Growth', 'Purpose'];
    
    // Try to get core values from different steps of values process
    if (valuesData.rankedCoreValues && valuesData.rankedCoreValues.length > 0) {
      return valuesData.rankedCoreValues.slice(0, 3).map(v => v.name);
    }
    if (valuesData.coreValues && valuesData.coreValues.length > 0) {
      return valuesData.coreValues.slice(0, 3).map(v => v.name);
    }
    if (valuesData.selectedValues && valuesData.selectedValues.length > 0) {
      return valuesData.selectedValues.slice(0, 3).map(v => v.name);
    }
    
    return ['Self-Discovery', 'Growth', 'Purpose']; // Fallback values
  }, [valuesLoaded, valuesData]);

  // Generate vision statement from user's data
  const visionStatement = useMemo(() => {
    if (!wheelLoaded || !wheelData || !Array.isArray(wheelData)) {
      return "Building an intentional life aligned with my values";
    }
    
    // Find the highest scoring areas to create a personalized vision statement
    const sortedAreas = [...wheelData].sort((a, b) => (b.score || 0) - (a.score || 0));
    const topAreas = sortedAreas.slice(0, 2);
    
    if (topAreas.length >= 2) {
      return `Excelling in ${topAreas[0].area.toLowerCase()} while growing in ${topAreas[1].area.toLowerCase()}`;
    } else if (topAreas.length === 1) {
      return `Building strength in ${topAreas[0].area.toLowerCase()} and beyond`;
    }
    
    return "Creating a balanced and fulfilling life";
  }, [wheelLoaded, wheelData]);

  // Generate current focus from lowest scoring areas
  const currentFocus = useMemo(() => {
    if (!wheelLoaded || !wheelData || !Array.isArray(wheelData)) {
      return "Taking the first steps toward intentional living";
    }
    
    // Find the lowest scoring areas for focus
    const sortedAreas = [...wheelData].sort((a, b) => (a.score || 0) - (b.score || 0));
    const lowestArea = sortedAreas[0];
    
    if (lowestArea) {
      return `Currently focusing on improving ${lowestArea.area.toLowerCase()}`;
    }
    
    return "Focusing on overall life balance and growth";
  }, [wheelLoaded, wheelData]);

  // Calculate progress percentages
  const baselineProgress = useMemo(() => {
    if (!wheelLoaded || !valuesLoaded) return 0;
    
    let completed = 0;
    let total = 2; // Wheel of Life + Values Clarity
    
    // Check if wheel of life has been completed (has data with scores)
    if (wheelData && Array.isArray(wheelData) && wheelData.length > 0) {
      const hasValidScores = wheelData.some(area => area.score && area.score > 0);
      if (hasValidScores) completed++;
    }
    
    // Check if values have been selected
    if (valuesData && (
      (valuesData.coreValues && valuesData.coreValues.length > 0) ||
      (valuesData.selectedValues && valuesData.selectedValues.length > 0)
    )) {
      completed++;
    }
    
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
    // For now, return a default value since goals data is not available
    // This can be updated when the goals system is properly implemented
    return 0;
  }, []);

  const overallProgress = useMemo(() => {
    return Math.round((baselineProgress + visionProgress + planProgress) / 3);
  }, [baselineProgress, visionProgress, planProgress]);

  // Transform vision board data
  const visionBoard = useMemo(() => {
    if (!visionLoaded || !visionItems || !Array.isArray(visionItems)) {
      // Return empty array if no vision data is loaded yet
      return [];
    }
    
    // Filter out any invalid items and map to dashboard format
    const validItems = visionItems.filter(item => item && item.imageUrl && item.title);
    
    return validItems.slice(0, 4).map(item => ({
      quadrant: item.quadrant ? (item.quadrant.charAt(0).toUpperCase() + item.quadrant.slice(1)) : 'Vision',
      title: item.title || 'Untitled',
      imageUrl: item.imageUrl
    }));
  }, [visionLoaded, visionItems]);

  // Transform life areas data
  const lifeAreas = useMemo(() => {
    if (!wheelLoaded || !wheelData || !Array.isArray(wheelData)) {
      // Return default structure if no data
      return [
        { area: 'Career', now: 5, vision: 8, gap: 3 },
        { area: 'Health', now: 6, vision: 9, gap: 3 },
        { area: 'Relationships', now: 7, vision: 9, gap: 2 },
        { area: 'Growth', now: 5, vision: 8, gap: 3 }
      ];
    }
    
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
          // Use current score for 'now', assume vision is 2-3 points higher
          transformedAreas[mappedArea].now = Math.max(transformedAreas[mappedArea].now, area.score);
          transformedAreas[mappedArea].vision = Math.min(10, area.score + 3);
        }
      }
    });
    
    // Convert to array format
    return Object.entries(transformedAreas).map(([area, data]) => ({
      area,
      now: data.now,
      vision: data.vision,
      gap: data.vision - data.now
    }));
  }, [wheelLoaded, wheelData]);

  // Generate next milestones based on real data
  const nextMilestones = useMemo(() => {
    if (!wheelLoaded || !wheelData || !Array.isArray(wheelData)) return [];
    
    // Find areas with biggest gaps (lowest scores) and create milestones
    const sortedByScore = [...wheelData]
      .filter(area => area.score && area.score > 0)
      .sort((a, b) => (a.score || 0) - (b.score || 0));
    
    const today = new Date();
    const milestones = [];
    
    // Create milestones for the 3 lowest scoring areas
    sortedByScore.slice(0, 3).forEach((area, index) => {
      const daysAway = 7 + (index * 14); // 1 week, 3 weeks, 5 weeks
      const date = new Date(today);
      date.setDate(date.getDate() + daysAway);
      
      milestones.push({
        title: `Improve ${area.area}`,
        date: date.toLocaleDateString(),
        daysAway
      });
    });
    
    return milestones;
  }, [wheelLoaded, wheelData]);

  return {
    name: 'Coach', // Simple name since no auth yet
    daysIntoJourney,
    totalDays: 84, // 12 weeks
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