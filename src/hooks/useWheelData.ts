import { useState, useEffect, useCallback } from 'react';
import { saveWheelData, loadWheelData, StoredWheelData } from '../utils/storage';

interface LifeArea {
  area: string;
  score: number;
  color: string;
  lightColor: string;
  darkColor: string;
}

interface ReflectionData {
  goingWell: string[];
  needsImprovement: string[];
  idealVision: string;
  targetRating: number;
}

const initialData: LifeArea[] = [
  { 
    area: 'Career', 
    score: 7, 
    color: '#8B5CF6', 
    lightColor: '#EDE9FE', 
    darkColor: '#7C3AED' 
  },
  { 
    area: 'Finances', 
    score: 6, 
    color: '#10B981', 
    lightColor: '#D1FAE5', 
    darkColor: '#059669' 
  },
  { 
    area: 'Health', 
    score: 8, 
    color: '#F59E0B', 
    lightColor: '#FEF3C7', 
    darkColor: '#D97706' 
  },
  { 
    area: 'Family', 
    score: 9, 
    color: '#EF4444', 
    lightColor: '#FEE2E2', 
    darkColor: '#DC2626' 
  },
  { 
    area: 'Romance', 
    score: 5, 
    color: '#EC4899', 
    lightColor: '#FCE7F3', 
    darkColor: '#DB2777' 
  },
  { 
    area: 'Personal Growth', 
    score: 8, 
    color: '#06B6D4', 
    lightColor: '#CFFAFE', 
    darkColor: '#0891B2' 
  },
  { 
    area: 'Fun & Recreation', 
    score: 6, 
    color: '#84CC16', 
    lightColor: '#ECFCCB', 
    darkColor: '#65A30D' 
  },
  { 
    area: 'Environment', 
    score: 7, 
    color: '#F97316', 
    lightColor: '#FED7AA', 
    darkColor: '#EA580C' 
  },
];

export const useWheelData = () => {
  const [data, setData] = useState<LifeArea[]>(initialData);
  const [reflectionData, setReflectionData] = useState<Record<number, ReflectionData>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data on mount
  useEffect(() => {
    const stored = loadWheelData();
    if (stored) {
      setData(stored.lifeAreas);
      setReflectionData(stored.reflections || {});
      setLastSaved(new Date(stored.lastUpdated));
    }
    setIsLoaded(true);
  }, []);

  // Auto-save function
  const saveData = useCallback(() => {
    if (!isLoaded) return;

    const completedReflections = Object.values(reflectionData).filter(
      reflection => 
        reflection.goingWell.length > 0 || 
        reflection.needsImprovement.length > 0 || 
        reflection.idealVision.trim() !== ''
    ).length;

    const wheelData: StoredWheelData = {
      lifeAreas: data,
      reflections: reflectionData,
      lastUpdated: new Date().toISOString(),
      completionStatus: {
        wheelCompleted: data.every(area => area.score > 0),
        reflectionsCompleted: completedReflections,
        totalReflections: data.length
      }
    };

    saveWheelData(wheelData);
    setLastSaved(new Date());
  }, [data, reflectionData, isLoaded]);

  // Auto-save whenever data changes
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(saveData, 1000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [data, reflectionData, saveData, isLoaded]);

  const updateScore = useCallback((segmentIndex: number, newScore: number) => {
    setData(prev => 
      prev.map((item, index) => 
        index === segmentIndex 
          ? { ...item, score: Math.max(1, Math.min(10, newScore)) }
          : item
      )
    );
  }, []);

  const updateReflectionData = useCallback((areaIndex: number, field: keyof ReflectionData, value: any) => {
    setReflectionData(prev => ({
      ...prev,
      [areaIndex]: {
        goingWell: [],
        needsImprovement: [],
        idealVision: '',
        targetRating: 8,
        ...prev[areaIndex],
        [field]: value
      }
    }));
  }, []);

  const resetScores = useCallback(() => {
    setData(prev => prev.map(item => ({ ...item, score: 5 })));
  }, []);

  const resetAllData = useCallback(() => {
    setData(initialData);
    setReflectionData({});
  }, []);

  const getCompletionStats = useCallback(() => {
    const completedReflections = Object.values(reflectionData).filter(
      reflection => 
        reflection.goingWell.length > 0 || 
        reflection.needsImprovement.length > 0 || 
        reflection.idealVision.trim() !== ''
    ).length;

    const averageScore = data.length > 0 ? data.reduce((sum, item) => sum + item.score, 0) / data.length : 0;
    
    const areasNeedingAttention = data.filter(area => area.score <= 5).length;
    
    return {
      averageScore,
      completedReflections,
      totalAreas: data.length,
      areasNeedingAttention,
      wheelCompleted: data.every(area => area.score > 0),
      allReflectionsCompleted: completedReflections === data.length
    };
  }, [data, reflectionData]);

  return {
    data,
    reflectionData,
    isLoaded,
    lastSaved,
    updateScore,
    updateReflectionData,
    resetScores,
    resetAllData,
    saveData,
    getCompletionStats
  };
};