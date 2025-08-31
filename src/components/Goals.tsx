import React, { useState } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  Plus, 
  Target,
  Edit3,
  X,
  Check,
  Flag,
  Calendar as CalendarIcon,
  Pencil
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { GOAL_CATEGORIES, ActionItem, Milestone } from '../types/goals';

const Goals: React.FC = () => {
  const { 
    data: goalsData, 
    updateAnnualSnapshot, 
    updateCategoryGoal, 
    saveData,
    isLoaded 
  } = useGoalSettingData();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    annual: true,
    quarter: true,
    weekly: true
  });
  
  const [editingGoal, setEditingGoal] = useState<{section: string, category?: string} | null>(null);
  const [editingAction, setEditingAction] = useState<{category: string, index: number} | null>(null);
  const [newGoalText, setNewGoalText] = useState('');
  const [newMantra, setNewMantra] = useState('');
  const [newActionText, setNewActionText] = useState('');

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Your Goals...</h2>
          <p className="text-slate-600">Retrieving your saved progress...</p>
        </div>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const startEditingGoal = (section: string, category?: string) => {
    if (section === 'annual') {
      setNewGoalText(goalsData.annualSnapshot?.snapshot || '');
      setNewMantra(goalsData.annualSnapshot?.mantra || '');
    } else if (category) {
      const categoryGoal = goalsData.categoryGoals[category];
      setNewGoalText(categoryGoal?.goal || '');
      setNewMantra('');
    }
    setEditingGoal({ section, category });
  };

  const saveGoal = () => {
    if (!editingGoal) return;
    
    if (editingGoal.section === 'annual') {
      updateAnnualSnapshot({
        snapshot: newGoalText,
        mantra: newMantra
      });
    } else if (editingGoal.category) {
      const existingGoal = goalsData.categoryGoals[editingGoal.category] || {
        category: editingGoal.category as any,
        goal: '',
        actions: [],
        milestones: [],
        wheelAreas: GOAL_CATEGORIES[editingGoal.category]?.wheelAreas || [],
        deadline: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      updateCategoryGoal(editingGoal.category, {
        ...existingGoal,
        goal: newGoalText
      });
    }
    
    setEditingGoal(null);
    setNewGoalText('');
    setNewMantra('');
  };

  const cancelEditGoal = () => {
    setEditingGoal(null);
    setNewGoalText('');
    setNewMantra('');
  };

  const startEditingAction = (category: string, index: number) => {
    const categoryGoal = goalsData.categoryGoals[category];
    if (categoryGoal && categoryGoal.actions[index]) {
      setNewActionText(categoryGoal.actions[index].text);
      setEditingAction({ category, index });
    }
  };

  const saveAction = () => {
    if (!editingAction) return;
    
    const existingGoal = goalsData.categoryGoals[editingAction.category];
    if (existingGoal) {
      const newActions = [...existingGoal.actions];
      newActions[editingAction.index] = {
        ...newActions[editingAction.index],
        text: newActionText
      };
      
      updateCategoryGoal(editingAction.category, {
        ...existingGoal,
        actions: newActions
      });
    }
    
    setEditingAction(null);
    setNewActionText('');
  };

  const cancelEditAction = () => {
    setEditingAction(null);
    setNewActionText('');
  };

  const addAction = (category: string) => {
    const existingGoal = goalsData.categoryGoals[category] || {
      category: category as any,
      goal: '',
      actions: [],
      milestones: [],
      wheelAreas: GOAL_CATEGORIES[category]?.wheelAreas || [],
      deadline: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    const newAction: ActionItem = {
      text: 'New action item',
      frequency: 'weekly',
      specificDays: []
    };
    
    updateCategoryGoal(category, {
      ...existingGoal,
      actions: [...existingGoal.actions, newAction]
    });
  };

  const removeAction = (category: string, index: number) => {
    const existingGoal = goalsData.categoryGoals[category];
    if (existingGoal) {
      const newActions = [...existingGoal.actions];
      newActions.splice(index, 1);
      
      updateCategoryGoal(category, {
        ...existingGoal,
        actions: newActions
      });
    }
  };

  const renderGoalsByCategory = (section: string) => {
    if (section === 'annual') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Annual Vision</h3>
              </div>
              
              <button
                onClick={() => startEditingGoal('annual')}
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            
            {editingGoal && editingGoal.section === 'annual' ? (
              <div className="space-y-4">
                <textarea
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe your annual vision..."
                />
                
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Mantra (optional)</label>
                  <input
                    type="text"
                    value={newMantra}
                    onChange={(e) => setNewMantra(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="A short phrase to remember this vision"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={cancelEditGoal}
                    className="px-3 py-1 text-slate-600 hover:text-slate-800 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveGoal}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-slate-700 text-lg font-medium mb-2">
                  {goalsData.annualSnapshot?.snapshot || 'Click edit to add your annual vision'}
                </p>
                
                {goalsData.annualSnapshot?.mantra && (
                  <p className="text-slate-500 italic mb-4">"{goalsData.annualSnapshot.mantra}"</p>
                )}
              </>
            )}
          </div>
        </div>
      );
    }

    return Object.entries(GOAL_CATEGORIES).map(([categoryKey, categoryInfo]) => {
      const categoryGoal = goalsData.categoryGoals[categoryKey];
      
      return (
        <div key={`${section}-${categoryKey}`} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  {categoryInfo.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800">{categoryInfo.name}</h3>
              </div>
              
              <button
                onClick={() => startEditingGoal(section, categoryKey)}
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            
            {editingGoal && editingGoal.category === categoryKey ? (
              <div className="space-y-4">
                <textarea
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder={`Describe your ${categoryInfo.name.toLowerCase()} goal...`}
                />
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={cancelEditGoal}
                    className="px-3 py-1 text-slate-600 hover:text-slate-800 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveGoal}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-slate-700 text-lg font-medium mb-2">
                  {categoryGoal?.goal || `Click edit to add your ${categoryInfo.name.toLowerCase()} goal`}
                </p>
                
                {section !== 'annual' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-700">Action Items</h4>
                      <button
                        onClick={() => addAction(categoryKey)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {(categoryGoal?.actions || []).map((action, index) => (
                        <div key={index} className="flex items-start group">
                          {editingAction && 
                           editingAction.category === categoryKey && 
                           editingAction.index === index ? (
                            <div className="flex-1 flex items-center space-x-2">
                              <input
                                type="text"
                                value={newActionText}
                                onChange={(e) => setNewActionText(e.target.value)}
                                className="flex-1 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                onClick={saveAction}
                                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditAction}
                                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-2 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-sm text-slate-700">{action.text}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {action.frequency === 'daily' ? 'Daily' : 
                                   action.frequency === 'weekly' ? 'Weekly' : 
                                   action.frequency === 'multiple' && action.specificDays ? 
                                   `${action.specificDays.length} days/week` : 'Weekly'}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditingAction(categoryKey, index)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => removeAction(categoryKey, index)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      
                      {(!categoryGoal?.actions || categoryGoal.actions.length === 0) && (
                        <div className="text-center py-4 text-slate-500">
                          <button
                            onClick={() => addAction(categoryKey)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            + Add your first action item
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Goal Setting</h1>
        <p className="text-slate-600 mt-2">
          Define your goals from annual vision to weekly actions
        </p>
      </div>

      {/* Annual Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Annual Vision</h2>
          </div>
          <button
            onClick={() => toggleSection('annual')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            {expandedSections.annual ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {expandedSections.annual && (
          <div className="grid grid-cols-1 gap-6">
            {renderGoalsByCategory('annual')}
          </div>
        )}
      </div>

      {/* 90-Day Focus Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Flag className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">90-Day Focus</h2>
          </div>
          <button
            onClick={() => toggleSection('quarter')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            {expandedSections.quarter ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {expandedSections.quarter && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderGoalsByCategory('quarter')}
          </div>
        )}
      </div>

      {/* Weekly Actions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Weekly Actions</h2>
          </div>
          <button
            onClick={() => toggleSection('weekly')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            {expandedSections.weekly ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {expandedSections.weekly && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderGoalsByCategory('weekly')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;