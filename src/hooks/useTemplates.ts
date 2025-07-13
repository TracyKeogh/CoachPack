import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GoalTemplate, sampleTemplates } from '../types/templates';

const TEMPLATES_STORAGE_KEY = 'coach-pack-community-templates';
const USER_TEMPLATES_STORAGE_KEY = 'coach-pack-user-shared-templates';
const USER_IMPORTED_TEMPLATES_KEY = 'coach-pack-user-imported-templates';

export const useTemplates = () => {
  const [communityTemplates, setCommunityTemplates] = useState<GoalTemplate[]>([]);
  const [userSharedTemplates, setUserSharedTemplates] = useState<string[]>([]);
  const [userImportedTemplates, setUserImportedTemplates] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    try {
      // Load community templates
      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (storedTemplates) {
        setCommunityTemplates(JSON.parse(storedTemplates));
      } else {
        // Initialize with sample templates if none exist
        setCommunityTemplates(sampleTemplates);
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(sampleTemplates));
      }

      // Load user shared templates
      const storedUserShared = localStorage.getItem(USER_TEMPLATES_STORAGE_KEY);
      if (storedUserShared) {
        setUserSharedTemplates(JSON.parse(storedUserShared));
      } else {
        setUserSharedTemplates([]);
        localStorage.setItem(USER_TEMPLATES_STORAGE_KEY, JSON.stringify([]));
      }

      // Load user imported templates
      const storedUserImported = localStorage.getItem(USER_IMPORTED_TEMPLATES_KEY);
      if (storedUserImported) {
        setUserImportedTemplates(JSON.parse(storedUserImported));
      } else {
        setUserImportedTemplates([]);
        localStorage.setItem(USER_IMPORTED_TEMPLATES_KEY, JSON.stringify([]));
      }

      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError('Failed to load templates. Please try refreshing the page.');
      setIsLoaded(true);
    }
  }, []);

  // Save templates to localStorage
  const saveTemplates = useCallback(() => {
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(communityTemplates));
    } catch (err) {
      console.error('Failed to save templates:', err);
      setError('Failed to save templates. Please try again.');
    }
  }, [communityTemplates]);

  // Save user shared templates to localStorage
  const saveUserSharedTemplates = useCallback(() => {
    try {
      localStorage.setItem(USER_TEMPLATES_STORAGE_KEY, JSON.stringify(userSharedTemplates));
    } catch (err) {
      console.error('Failed to save user shared templates:', err);
      setError('Failed to save your shared templates. Please try again.');
    }
  }, [userSharedTemplates]);

  // Save user imported templates to localStorage
  const saveUserImportedTemplates = useCallback(() => {
    try {
      localStorage.setItem(USER_IMPORTED_TEMPLATES_KEY, JSON.stringify(userImportedTemplates));
    } catch (err) {
      console.error('Failed to save user imported templates:', err);
      setError('Failed to save your imported templates. Please try again.');
    }
  }, [userImportedTemplates]);

  // Auto-save whenever data changes
  useEffect(() => {
    if (isLoaded) {
      saveTemplates();
    }
  }, [communityTemplates, isLoaded, saveTemplates]);

  useEffect(() => {
    if (isLoaded) {
      saveUserSharedTemplates();
    }
  }, [userSharedTemplates, isLoaded, saveUserSharedTemplates]);

  useEffect(() => {
    if (isLoaded) {
      saveUserImportedTemplates();
    }
  }, [userImportedTemplates, isLoaded, saveUserImportedTemplates]);

  // Share a goal as a template
  const shareTemplate = useCallback((template: Omit<GoalTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: GoalTemplate = {
      ...template,
      id: uuidv4(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCommunityTemplates(prev => [...prev, newTemplate]);
    setUserSharedTemplates(prev => [...prev, newTemplate.id]);
    return newTemplate.id;
  }, []);

  // Update an existing template
  const updateTemplate = useCallback((templateId: string, updates: Partial<GoalTemplate>) => {
    setCommunityTemplates(prev => 
      prev.map(template => 
        template.id === templateId 
          ? { 
              ...template, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            } 
          : template
      )
    );
  }, []);

  // Remove a template from community
  const removeTemplate = useCallback((templateId: string) => {
    setCommunityTemplates(prev => prev.filter(template => template.id !== templateId));
    setUserSharedTemplates(prev => prev.filter(id => id !== templateId));
  }, []);

  // Import a template (increment usage count)
  const importTemplate = useCallback((templateId: string) => {
    setCommunityTemplates(prev => 
      prev.map(template => 
        template.id === templateId 
          ? { 
              ...template, 
              usageCount: template.usageCount + 1,
              updatedAt: new Date().toISOString() 
            } 
          : template
      )
    );
    setUserImportedTemplates(prev => [...prev, templateId]);
    return communityTemplates.find(template => template.id === templateId);
  }, [communityTemplates]);

  // Check if user has shared at least one template
  const hasSharedTemplate = useCallback(() => {
    return userSharedTemplates.length > 0;
  }, [userSharedTemplates]);

  // Check if user has imported a specific template
  const hasImportedTemplate = useCallback((templateId: string) => {
    return userImportedTemplates.includes(templateId);
  }, [userImportedTemplates]);

  // Get templates by category
  const getTemplatesByCategory = useCallback((category: string) => {
    return communityTemplates.filter(template => template.category === category);
  }, [communityTemplates]);

  // Search templates
  const searchTemplates = useCallback((query: string) => {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    if (searchTerms.length === 0) return communityTemplates;
    
    return communityTemplates.filter(template => {
      const searchableText = `${template.title} ${template.description} ${template.tags.join(' ')}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });
  }, [communityTemplates]);

  // Sort templates
  const sortTemplates = useCallback((templates: GoalTemplate[], sortBy: 'popular' | 'recent' | 'usage') => {
    switch (sortBy) {
      case 'popular':
        return [...templates].sort((a, b) => b.usageCount - a.usageCount);
      case 'recent':
        return [...templates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'usage':
        return [...templates].sort((a, b) => {
          const aImported = userImportedTemplates.includes(a.id) ? 1 : 0;
          const bImported = userImportedTemplates.includes(b.id) ? 1 : 0;
          return bImported - aImported || b.usageCount - a.usageCount;
        });
      default:
        return templates;
    }
  }, [userImportedTemplates]);

  // Get user's shared templates
  const getUserSharedTemplates = useCallback(() => {
    return communityTemplates.filter(template => userSharedTemplates.includes(template.id));
  }, [communityTemplates, userSharedTemplates]);

  // Get user's imported templates
  const getUserImportedTemplates = useCallback(() => {
    return communityTemplates.filter(template => userImportedTemplates.includes(template.id));
  }, [communityTemplates, userImportedTemplates]);

  return {
    communityTemplates,
    isLoaded,
    error,
    shareTemplate,
    updateTemplate,
    removeTemplate,
    importTemplate,
    hasSharedTemplate,
    hasImportedTemplate,
    getTemplatesByCategory,
    searchTemplates,
    sortTemplates,
    getUserSharedTemplates,
    getUserImportedTemplates,
    userSharedCount: userSharedTemplates.length,
    userImportedCount: userImportedTemplates.length
  };
};