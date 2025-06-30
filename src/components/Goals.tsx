import React, { useState, useEffect } from 'react';
import { Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar, Plus, Minus, Link, TrendingUp, Clock, Repeat, CheckSquare, Flag, CheckCircle2, Circle } from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { useWheelData } from '../hooks/useWheelData';
import { GOAL_CATEGORIES, getTwelveWeeksFromNow, getMilestoneDueDates, DAYS_OF_WEEK, ActionItem, Milestone } from '../types/goals';

const Goals: React.FC = () => {
  const { data: wheelData } = useWheelData();
  const {
    data,
    isLoaded,
    lastSaved,
    initializeFromWheelData,
    goToNextArea,
    goToPreviousArea,
    updateAnnualSnapshot,
    updateCategoryGoal,
    getCurrentCategory,
    getProgress,
    canProceed,
    isComplete,
    saveData
  } = useGoalSettingData();

  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize from wheel data
  useEffect(() => {
    if (wheelData && wheelData.length > 0 && !hasInitialized) {
      initializeFromWheelData(wheelData);
      setHasInitialized(true);
    }
  }, [wheelData, hasInitialized, initializeFromWheelData]);

  const currentCategory = getCurrentCategory();
  const progress = getProgress();

  // Get wheel data for current category
  const getCategoryWheelData = (category: string) => {
    if (!wheelData || !GOAL_CATEGORIES[category as keyof typeof GOAL_CATEGORIES]) return [];
    
    const categoryInfo = GOAL_CATEGORIES[category as keyof typeof GOAL_CATEGORIES];
    return wheelData.filter(area => categoryInfo.wheelAreas.includes(area.area));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate weeks remaining
  const getWeeksRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.max(0, diffWeeks);
  };

  // Handle adding/removing actions for category goals
  const addAction = () => {
    const currentGoal = data.categoryGoals[currentCategory] || { 
      category: currentCategory as any, 
      goal: '', 
      actions: [], 
      milestones: [],
      focus: '',
      wheelAreas: [],
      targetScore: 8,
      deadline: getTwelveWeeksFromNow()
    };
    
    const newAction: ActionItem = {
      text: '',
      frequency: 'weekly',
      specificDays: []
    };
    
    updateCategoryGoal(currentCategory, {
      ...currentGoal,
      actions: [...currentGoal.actions, newAction]
    });
  };

  const removeAction = (index: number) => {
    const currentGoal = data.categoryGoals[currentCategory];
    if (currentGoal) {
      updateCategoryGoal(currentCategory, {
        ...currentGoal,
        actions: currentGoal.actions.filter((_, i) => i !== index)
      });
    }
  };

  const updateAction = (index: number, updates: Partial<ActionItem>) => {
    const currentGoal = data.categoryGoals[currentCategory];
    if (currentGoal) {
      const newActions = [...currentGoal.actions];
      newActions[index] = { ...newActions[index], ...updates };
      updateCategoryGoal(currentCategory, {
        ...currentGoal,
        actions: newActions
      });
    }
  };

  // Handle adding/removing milestones
  const addMilestone = () => {
    const currentGoal = data.categoryGoals[currentCategory] || { 
      category: currentCategory as any, 
      goal: '', 
      actions: [], 
      milestones: [],
      focus: '',
      wheelAreas: [],
      targetScore: 8,
      deadline: getTwelveWeeksFromNow()
    };
    
    const today = new Date().toISOString().split('T')[0];
    const goalDeadline = currentGoal.deadline;
    const existingMilestones = currentGoal.milestones.length;
    const suggestedDates = getMilestoneDueDates(today, goalDeadline, existingMilestones + 1);
    
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: '',
      description: '',
      dueDate: suggestedDates[existingMilestones] || goalDeadline,
      completed: false
    };
    
    updateCategoryGoal(currentCategory, {
      ...currentGoal,
      milestones: [...currentGoal.milestones, newMilestone]
    });
  };

  const removeMilestone = (milestoneId: string) => {
    const currentGoal = data.categoryGoals[currentCategory];
    if (currentGoal) {
      updateCategoryGoal(currentCategory, {
        ...currentGoal,
        milestones: currentGoal.milestones.filter(m => m.id !== milestoneId)
      });
    }
  };

  const updateMilestone = (milestoneId: string, updates: Partial<Milestone>) => {
    const currentGoal = data.categoryGoals[currentCategory];
    if (currentGoal) {
      const newMilestones = currentGoal.milestones.map(milestone => 
        milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
      );
      updateCategoryGoal(currentCategory, {
        ...currentGoal,
        milestones: newMilestones
      });
    }
  };

  const toggleMilestoneCompletion = (milestoneId: string) => {
    const currentGoal = data.categoryGoals[currentCategory];
    if (currentGoal) {
      const milestone = currentGoal.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        const updates: Partial<Milestone> = {
          completed: !milestone.completed,
          completedDate: !milestone.completed ? new Date().toISOString().split('T')[0] : undefined
        };
        updateMilestone(milestoneId, updates);
      }
    }
  };

  const toggleSpecificDay = (actionIndex: number, day: string) => {
    const currentGoal = data.categoryGoals[currentCategory];
    if (currentGoal) {
      const action = currentGoal.actions[actionIndex];
      const currentDays = action.specificDays || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
      
      updateAction(actionIndex, { specificDays: newDays });
    }
  };

  const getFrequencyDescription = (action: ActionItem) => {
    switch (action.frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return 'Once per week';
      case 'multiple':
        if (action.specificDays && action.specificDays.length > 0) {
          const dayLabels = action.specificDays.map(day => 
            DAYS_OF_WEEK.find(d => d.value === day)?.short || day
          );
          return `${dayLabels.join(', ')}`;
        }
        return 'Select days';
      default:
        return 'Set frequency';
    }
  };

  if (!isLoaded) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Goal Setting...</h2>
            <p className="text-slate-600">Preparing your personalized flow...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete()) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">🎉 Goals Complete!</h2>
          <p className="text-slate-600 mb-8">You've successfully set up your annual vision and 12-week goals.</p>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Annual Snapshot Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Annual Vision</h3>
              <div className="text-slate-700 italic mb-2">"{data.annualSnapshot.snapshot}"</div>
              {data.annualSnapshot.mantra && (
                <div className="text-purple-600 font-medium">Mantra: "{data.annualSnapshot.mantra}"</div>
              )}
            </div>

            {/* Category Goals Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.categories.map((category) => {
                const categoryInfo = GOAL_CATEGORIES[category];
                const goal = data.categoryGoals[category];
                
                return (
                  <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">{categoryInfo.icon}</span>
                      <h3 className="text-lg font-semibold text-slate-900">{categoryInfo.name}</h3>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-slate-500 mb-1">12-Week Goal</div>
                        <div className="font-medium text-slate-900">{goal?.goal || 'Not set'}</div>
                      </div>

                      {goal?.deadline && (
                        <div>
                          <div className="text-slate-500 mb-1">Deadline</div>
                          <div className="text-slate-700">{formatDate(goal.deadline)} ({getWeeksRemaining(goal.deadline)} weeks)</div>
                        </div>
                      )}
                      
                      <div>
                        <div className="text-slate-500 mb-1">Actions ({goal?.actions?.length || 0})</div>
                        {goal?.actions?.slice(0, 2).map((action, index) => (
                          <div key={index} className="text-xs text-slate-600 truncate">
                            • {action.text}
                          </div>
                        )) || <div className="text-slate-500">No actions set</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = currentCategory ? GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">12-Week Goal Setting</h1>
          <p className="text-slate-600 mt-2">
            Set your annual vision, then break it down into actionable 12-week goals
          </p>
          {lastSaved && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Progress</h3>
          <span className="text-sm text-slate-600">{progress.completed}/{progress.total} steps</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
        {/* Step Content */}
        <div className="space-y-6">
          {/* Annual Snapshot */}
          {data.currentStep === 'annual' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Annual Vision</h2>
                <p className="text-slate-600">Imagine it's 12 months from now and you've achieved your goals...</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Describe your ideal life one year from now
                </label>
                <textarea
                  value={data.annualSnapshot.snapshot}
                  onChange={(e) => updateAnnualSnapshot({
                    ...data.annualSnapshot,
                    snapshot: e.target.value
                  })}
                  placeholder="I feel energized and healthy. My career is thriving. My relationships are deep and fulfilling..."
                  className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Personal Mantra (optional)
                </label>
                <input
                  type="text"
                  value={data.annualSnapshot.mantra || ''}
                  onChange={(e) => updateAnnualSnapshot({
                    ...data.annualSnapshot,
                    mantra: e.target.value
                  })}
                  placeholder="Living with purpose and joy"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Category Goal */}
          {data.currentStep === 'quarter' && categoryInfo && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <span className="text-3xl">{categoryInfo.icon}</span>
                  <h2 className="text-2xl font-bold text-slate-900">{categoryInfo.name}</h2>
                </div>
                <p className="text-slate-600">{categoryInfo.description}</p>
              </div>

              {/* Connected Wheel Areas */}
              {wheelData && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-slate-900 mb-3">Connected Life Areas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getCategoryWheelData(currentCategory).map((area, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-slate-900">{area.area}</span>
                        <span className="text-sm text-slate-600">Current: {area.score}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  12-Week Goal
                </label>
                <input
                  type="text"
                  value={data.categoryGoals[currentCategory]?.goal || ''}
                  onChange={(e) => updateCategoryGoal(currentCategory, {
                    category: currentCategory as any,
                    goal: e.target.value,
                    actions: data.categoryGoals[currentCategory]?.actions || [],
                    milestones: data.categoryGoals[currentCategory]?.milestones || [],
                    focus: data.categoryGoals[currentCategory]?.focus || '',
                    wheelAreas: getCategoryWheelData(currentCategory).map(area => area.area),
                    targetScore: data.categoryGoals[currentCategory]?.targetScore || 8,
                    deadline: data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow()
                  })}
                  placeholder={categoryInfo.examples[0]}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Deadline
                </label>
                <input
                  type="date"
                  value={data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow()}
                  onChange={(e) => updateCategoryGoal(currentCategory, {
                    category: currentCategory as any,
                    goal: data.categoryGoals[currentCategory]?.goal || '',
                    actions: data.categoryGoals[currentCategory]?.actions || [],
                    milestones: data.categoryGoals[currentCategory]?.milestones || [],
                    focus: data.categoryGoals[currentCategory]?.focus || '',
                    wheelAreas: getCategoryWheelData(currentCategory).map(area => area.area),
                    targetScore: data.categoryGoals[currentCategory]?.targetScore || 8,
                    deadline: e.target.value
                  })}
                  className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {data.categoryGoals[currentCategory]?.deadline 
                    ? `${getWeeksRemaining(data.categoryGoals[currentCategory].deadline)} weeks remaining`
                    : '12 weeks from today'
                  }
                </p>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Key Actions (2-4 recommended)
                  </label>
                  <button
                    onClick={addAction}
                    className="flex items-center space-x-1 px-3 py-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Action</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(data.categoryGoals[currentCategory]?.actions || []).map((action, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={action.text}
                          onChange={(e) => updateAction(index, { text: e.target.value })}
                          placeholder="What action will you take?"
                          className="flex-1 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => removeAction(index)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Frequency Selection */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'daily', label: 'Daily' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'multiple', label: 'Multiple Days' }
                        ].map((freq) => (
                          <button
                            key={freq.value}
                            onClick={() => updateAction(index, { frequency: freq.value as any, specificDays: [] })}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              action.frequency === freq.value
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="font-medium text-sm">{freq.label}</div>
                          </button>
                        ))}
                      </div>

                      {/* Specific Days Selection */}
                      {action.frequency === 'multiple' && (
                        <div className="grid grid-cols-7 gap-2">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              key={day.value}
                              onClick={() => toggleSpecificDay(index, day.value)}
                              className={`p-2 rounded text-xs font-medium transition-all ${
                                action.specificDays?.includes(day.value)
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {day.short}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="text-sm text-slate-600">
                        <strong>Frequency:</strong> {getFrequencyDescription(action)}
                      </div>
                    </div>
                  ))}
                  
                  {(data.categoryGoals[currentCategory]?.actions || []).length === 0 && (
                    <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                      <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Add your first action to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-200 mt-8">
          <button
            onClick={goToPreviousArea}
            disabled={data.currentStep === 'annual'}
            className="flex items-center space-x-2 px-6 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-sm text-slate-500">
            {data.currentStep === 'annual' ? 'Annual Vision' : `${categoryInfo?.name} Goal`}
          </div>

          <button
            onClick={goToNextArea}
            disabled={!canProceed()}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Goals;