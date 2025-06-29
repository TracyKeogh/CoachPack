import { useState, useEffect, useCallback } from 'react';
import { allValues, type Value } from '../data/values';

export interface DiscoveryResponses {
  proudMoment: string;
  admiredPerson: string;
  themes: string[];
}

export interface ValueDefinition {
  meaning: string;
  behavior: string;
}

export interface ValuesData {
  currentStep: number;
  discoveryResponses: DiscoveryResponses;
  selectedValues: Value[];
  coreValues: Value[];
  supportingValues: Value[];
  rankedCoreValues: Value[];
  valueDefinitions: Record<string, ValueDefinition>;
  lastUpdated: string;
}

const STORAGE_KEY = 'coach-pack-values-clarity';

const defaultData: ValuesData = {
  currentStep: 1,
  discoveryResponses: {
    proudMoment: '',
    admiredPerson: '',
    themes: []
  },
  selectedValues: [],
  coreValues: [],
  supportingValues: [],
  rankedCoreValues: [],
  valueDefinitions: {},
  lastUpdated: new Date().toISOString()
};

export const useValuesData = () => {
  const [data, setData] = useState<ValuesData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData: ValuesData = JSON.parse(stored);
        setData(parsedData);
        setLastSaved(new Date(parsedData.lastUpdated));
      }
    } catch (error) {
      console.error('Failed to load values data:', error);
      setData(defaultData);
    }
    setIsLoaded(true);
  }, []);

  // Auto-save function
  const saveData = useCallback(() => {
    if (!isLoaded) return;

    try {
      const dataToSave: ValuesData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save values data:', error);
    }
  }, [data, isLoaded]);

  // Auto-save whenever data changes
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(saveData, 1000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [data, saveData, isLoaded]);

  // Update functions
  const updateCurrentStep = useCallback((step: number) => {
    setData(prev => ({ ...prev, currentStep: step }));
  }, []);

  const updateDiscoveryResponses = useCallback((updates: Partial<DiscoveryResponses>) => {
    setData(prev => ({
      ...prev,
      discoveryResponses: { ...prev.discoveryResponses, ...updates }
    }));
  }, []);

  const updateSelectedValues = useCallback((values: Value[]) => {
    setData(prev => ({ ...prev, selectedValues: values }));
  }, []);

  const updateCoreValues = useCallback((values: Value[]) => {
    setData(prev => ({ ...prev, coreValues: values }));
  }, []);

  const updateSupportingValues = useCallback((values: Value[]) => {
    setData(prev => ({ ...prev, supportingValues: values }));
  }, []);

  const updateRankedCoreValues = useCallback((values: Value[]) => {
    setData(prev => ({ ...prev, rankedCoreValues: values }));
  }, []);

  const updateValueDefinitions = useCallback((valueId: string, definition: Partial<ValueDefinition>) => {
    setData(prev => ({
      ...prev,
      valueDefinitions: {
        ...prev.valueDefinitions,
        [valueId]: {
          meaning: '',
          behavior: '',
          ...prev.valueDefinitions[valueId],
          ...definition
        }
      }
    }));
  }, []);

  // Utility functions
  const getCompletionStats = useCallback(() => {
    const stepsCompleted = data.currentStep - 1;
    const totalSteps = 5;
    const completionPercentage = Math.round((stepsCompleted / totalSteps) * 100);
    
    const definedValues = Object.keys(data.valueDefinitions).filter(
      valueId => data.valueDefinitions[valueId]?.meaning?.trim() && 
                 data.valueDefinitions[valueId]?.behavior?.trim()
    ).length;

    return {
      currentStep: data.currentStep,
      stepsCompleted,
      totalSteps,
      completionPercentage,
      selectedValuesCount: data.selectedValues.length,
      coreValuesCount: data.coreValues.length,
      supportingValuesCount: data.supportingValues.length,
      rankedValuesCount: data.rankedCoreValues.length,
      definedValuesCount: definedValues,
      isComplete: data.currentStep === 5 && definedValues >= 6
    };
  }, [data]);

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const importedData: ValuesData = JSON.parse(jsonString);
      
      // Validate data structure
      if (!importedData.discoveryResponses || !Array.isArray(importedData.selectedValues)) {
        throw new Error('Invalid data format');
      }
      
      setData(importedData);
      return true;
    } catch (error) {
      console.error('Failed to import values data:', error);
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    setData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    // Data
    data,
    isLoaded,
    lastSaved,
    
    // Update functions
    updateCurrentStep,
    updateDiscoveryResponses,
    updateSelectedValues,
    updateCoreValues,
    updateSupportingValues,
    updateRankedCoreValues,
    updateValueDefinitions,
    
    // Utility functions
    saveData,
    getCompletionStats,
    exportData,
    importData,
    clearAllData
  };
};