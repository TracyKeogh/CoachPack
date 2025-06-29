// Local storage utilities for persisting user data
export interface StoredWheelData {
  lifeAreas: Array<{
    area: string;
    score: number;
    color: string;
    lightColor: string;
    darkColor: string;
  }>;
  reflections: Record<number, {
    goingWell: string[];
    needsImprovement: string[];
    idealVision: string;
    targetRating: number;
  }>;
  lastUpdated: string;
  completionStatus: {
    wheelCompleted: boolean;
    reflectionsCompleted: number;
    totalReflections: number;
  };
}

const STORAGE_KEY = 'coach-pack-wheel-of-life';

export const saveWheelData = (data: StoredWheelData): void => {
  try {
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  } catch (error) {
    console.error('Failed to save wheel data:', error);
  }
};

export const loadWheelData = (): StoredWheelData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // Validate data structure
    if (!data.lifeAreas || !Array.isArray(data.lifeAreas)) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load wheel data:', error);
    return null;
  }
};

export const clearWheelData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear wheel data:', error);
  }
};

export const exportWheelData = (): string => {
  const data = loadWheelData();
  if (!data) return '';
  
  return JSON.stringify(data, null, 2);
};

export const importWheelData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    
    // Basic validation
    if (!data.lifeAreas || !Array.isArray(data.lifeAreas)) {
      throw new Error('Invalid data format');
    }
    
    saveWheelData(data);
    return true;
  } catch (error) {
    console.error('Failed to import wheel data:', error);
    return false;
  }
};