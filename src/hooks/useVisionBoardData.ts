import { useState, useEffect, useCallback } from 'react';

export interface VisionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  quadrant: 'business' | 'body' | 'balance' | 'feelings';
  position?: { x: number; y: number };
  meaning?: string;
  feeling?: string;
  isFlipped?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface TextElement {
  id: string;
  text: string;
  position: { x: number; y: number };
  className: string;
}

export interface VisionBoardData {
  visionItems: VisionItem[];
  textElements: TextElement[];
  uploadedImages: string[];
  lastUpdated: string;
  isCollageEditMode: boolean;
}

const STORAGE_KEY = 'coach-pack-vision-board';

const defaultVisionItems: VisionItem[] = [
  {
    id: '1',
    title: 'Dream Office Space',
    description: 'A inspiring workspace that fuels creativity',
    imageUrl: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
    quadrant: 'business',
    position: { x: 50, y: 80 },
    meaning: '',
    feeling: '',
    isFlipped: false,
    size: 'medium'
  },
  {
    id: '2',
    title: 'Mountain Adventure',
    description: 'Conquering peaks and pushing physical limits',
    imageUrl: 'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
    quadrant: 'body',
    position: { x: 150, y: 80 },
    meaning: '',
    feeling: '',
    isFlipped: false,
    size: 'medium'
  },
  {
    id: '3',
    title: 'Family Time',
    description: 'Quality moments with loved ones',
    imageUrl: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
    quadrant: 'balance',
    position: { x: 250, y: 80 },
    meaning: '',
    feeling: '',
    isFlipped: false,
    size: 'medium'
  },
  {
    id: '4',
    title: 'Inner Peace',
    description: 'Finding calm and contentment within',
    imageUrl: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
    quadrant: 'feelings',
    position: { x: 350, y: 80 },
    meaning: '',
    feeling: '',
    isFlipped: false,
    size: 'medium'
  }
];

const defaultTextElements: TextElement[] = [
  { id: 'title-1', text: 'My Vision Board', position: { x: 50, y: 20 }, className: 'text-2xl font-bold' },
  { id: 'subtitle-1', text: '2025 Goals', position: { x: 200, y: 20 }, className: 'text-lg' }
];

export const useVisionBoardData = () => {
  const [visionItems, setVisionItems] = useState<VisionItem[]>(defaultVisionItems);
  const [textElements, setTextElements] = useState<TextElement[]>(defaultTextElements);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isCollageEditMode, setIsCollageEditMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: VisionBoardData = JSON.parse(stored);
        setVisionItems(data.visionItems || defaultVisionItems);
        setTextElements(data.textElements || defaultTextElements);
        setUploadedImages(data.uploadedImages || []);
        setIsCollageEditMode(data.isCollageEditMode || false);
        setLastSaved(new Date(data.lastUpdated));
      }
    } catch (error) {
      console.error('Failed to load vision board data:', error);
      // Use defaults if loading fails
      setVisionItems(defaultVisionItems);
      setTextElements(defaultTextElements);
    }
    setIsLoaded(true);
  }, []);

  // Auto-save function
  const saveData = useCallback(() => {
    if (!isLoaded) return;

    try {
      const data: VisionBoardData = {
        visionItems,
        textElements,
        uploadedImages,
        isCollageEditMode,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save vision board data:', error);
    }
  }, [visionItems, textElements, isCollageEditMode, isLoaded]);

  // Auto-save whenever data changes (with debouncing)
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(saveData, 1000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [visionItems, textElements, uploadedImages, isCollageEditMode, saveData, isLoaded]);

  // Vision Items operations - enhanced for Vision Board component
  const addVisionItem = useCallback((imageUrl: string, quadrant?: string) => {
    const newItem: VisionItem = {
      id: Date.now().toString(),
      title: 'New Vision Item',
      description: 'Click to edit description',
      imageUrl,
      quadrant: (quadrant as any) || 'business',
      position: { x: Math.random() * 300, y: Math.random() * 200 + 100 },
      meaning: '',
      feeling: '',
      isFlipped: false,
      size: 'medium'
    };
    
    setVisionItems(prev => [...prev, newItem]);
    return newItem.id;
  }, []);

  const updateVisionItem = useCallback((itemId: string, updates: Partial<VisionItem>) => {
    setVisionItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  }, []);

  const removeVisionItem = useCallback((itemId: string) => {
    setVisionItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Uploaded images operations
  const addUploadedImage = useCallback((imageUrl: string) => {
    setUploadedImages(prev => [...prev, imageUrl]);
  }, []);

  const removeUploadedImage = useCallback((imageUrl: string) => {
    setUploadedImages(prev => prev.filter(img => img !== imageUrl));
    // Also remove any vision items using this image
    setVisionItems(prev => prev.filter(item => item.imageUrl !== imageUrl));
  }, []);

  const moveVisionItem = useCallback((dragIndex: number, hoverIndex: number, sourceQuadrant: string, targetQuadrant: string) => {
    const getQuadrantItems = (quadrantId: string) => {
      return visionItems.filter(item => item.quadrant === quadrantId);
    };

    if (sourceQuadrant === targetQuadrant) {
      // Reordering within the same quadrant
      const quadrantItems = getQuadrantItems(sourceQuadrant);
      const draggedItem = quadrantItems[dragIndex];
      const newItems = [...visionItems];
      
      // Remove the dragged item
      const draggedItemIndex = newItems.findIndex(item => item.id === draggedItem.id);
      newItems.splice(draggedItemIndex, 1);
      
      // Find the new position
      const targetItems = newItems.filter(item => item.quadrant === targetQuadrant);
      const targetItem = targetItems[hoverIndex];
      const targetItemIndex = targetItem ? newItems.findIndex(item => item.id === targetItem.id) : newItems.length;
      
      // Insert at new position
      newItems.splice(targetItemIndex, 0, draggedItem);
      setVisionItems(newItems);
    } else {
      // Moving between quadrants
      const sourceItems = getQuadrantItems(sourceQuadrant);
      const draggedItem = { ...sourceItems[dragIndex], quadrant: targetQuadrant as any };
      
      setVisionItems(prev => prev.map(item => 
        item.id === draggedItem.id ? draggedItem : item
      ));
    }
  }, [visionItems]);

  const updateItemPosition = useCallback((itemId: string, position: { x: number; y: number }) => {
    setVisionItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, position } : item
    ));
  }, []);

  // Text Elements operations
  const addTextElement = useCallback(() => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: 'New Text',
      position: { x: Math.random() * 300 + 50, y: Math.random() * 100 + 150 },
      className: 'text-base'
    };
    setTextElements(prev => [...prev, newText]);
  }, []);

  const updateTextPosition = useCallback((textId: string, position: { x: number; y: number }) => {
    setTextElements(prev => prev.map(text => 
      text.id === textId ? { ...text, position } : text
    ));
  }, []);

  const updateTextContent = useCallback((textId: string, newText: string) => {
    setTextElements(prev => prev.map(text => 
      text.id === textId ? { ...text, text: newText } : text
    ));
  }, []);

  const removeTextElement = useCallback((textId: string) => {
    setTextElements(prev => prev.filter(text => text.id !== textId));
  }, []);

  // Utility functions
  const getQuadrantItems = useCallback((quadrantId: string) => {
    return visionItems.filter(item => item.quadrant === quadrantId);
  }, [visionItems]);

  const getCompletionStats = useCallback(() => {
    const totalItems = visionItems.length;
    const itemsWithCustomContent = visionItems.filter(item => 
      item.title !== 'New Vision Item' && item.description !== 'Click to edit description'
    ).length;
    
    const customTextElements = textElements.filter(text => 
      !text.text.includes('My Vision Board') && !text.text.includes('2025 Goals') && text.text !== 'New Text'
    ).length;

    return {
      totalItems,
      itemsWithCustomContent,
      customTextElements,
      completionPercentage: totalItems > 0 ? Math.round((itemsWithCustomContent / totalItems) * 100) : 0
    };
  }, [visionItems, textElements]);

  const exportData = useCallback(() => {
    const data: VisionBoardData = {
      visionItems,
      textElements,
      isCollageEditMode,
      lastUpdated: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }, [visionItems, textElements, isCollageEditMode]);

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const data: VisionBoardData = JSON.parse(jsonString);
      
      // Validate data structure
      if (!Array.isArray(data.visionItems) || !Array.isArray(data.textElements)) {
        throw new Error('Invalid data format');
      }
      
      setVisionItems(data.visionItems);
      setTextElements(data.textElements);
      setUploadedImages(data.uploadedImages || []);
      setIsCollageEditMode(data.isCollageEditMode || false);
      
      return true;
    } catch (error) {
      console.error('Failed to import vision board data:', error);
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    setVisionItems(defaultVisionItems);
    setTextElements(defaultTextElements);
    setUploadedImages([]);
    setIsCollageEditMode(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    // Data
    visionItems,
    textElements,
    uploadedImages,
    isCollageEditMode,
    isLoaded,
    lastSaved,
    
    // Vision Items operations
    addVisionItem,
    updateVisionItem,
    removeVisionItem,
    moveVisionItem,
    updateItemPosition,
    getQuadrantItems,
    
    // Uploaded images operations
    addUploadedImage,
    removeUploadedImage,
    
    // Text Elements operations
    addTextElement,
    updateTextPosition,
    updateTextContent,
    removeTextElement,
    
    // Edit mode
    setIsCollageEditMode,
    
    // Utility functions
    saveData,
    getCompletionStats,
    exportData,
    importData,
    clearAllData
  };
};