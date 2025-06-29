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
  const stepNames = { annual: 'Annual Vision', quarter: '12-Week Goals' };
  const stepIcons = { annual: Sparkles, quarter: Calendar };

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
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatShortDate = (dateString: string) => {
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

  // Calculate days remaining
  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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
    
    // Calculate suggested due date based on existing milestones
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

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'multiple': return '🗓️';
      default: return '📋';
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

  const getMilestoneStatus = (milestone: Milestone) => {
    if (milestone.completed) return 'completed';
    
    const today = new Date();
    const dueDate = new Date(milestone.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 7) return 'due-soon';
    return 'on-track';
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'due-soon': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
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
          <p className="text-slate-600 mb-8">You've successfully set up your annual vision and 12-week goals across all three life areas.</p>
          
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
                    
                    <div className="space-y-4 text-sm">
                      <div>
                        <div className="text-slate-500 mb-1">12-Week Goal</div>
                        <div className="font-medium text-slate-900">{goal?.goal || 'Not set'}</div>
                      </div>

                      {goal?.deadline && (
                        <div>
                          <div className="text-slate-500 mb-1">Deadline</div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700">{formatDate(goal.deadline)}</span>
                            <span className="text-xs text-slate-500">
                              ({getWeeksRemaining(goal.deadline)} weeks remaining)
                            </span>
                          </div>
                        </div>
                      )}

                      {goal?.milestones && goal.milestones.length > 0 && (
                        <div>
                          <div className="text-slate-500 mb-2">Milestones</div>
                          <div className="space-y-2">
                            {goal.milestones.map((milestone) => {
                              const status = getMilestoneStatus(milestone);
                              return (
                                <div key={milestone.id} className="flex items-center space-x-2">
                                  {milestone.completed ? (
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Circle className="w-3 h-3 text-slate-400" />
                                  )}
                                  <span className={`text-xs truncate flex-1 ${
                                    milestone.completed ? 'line-through text-slate-500' : 'text-slate-700'
                                  }`}>
                                    {milestone.title}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {formatShortDate(milestone.dueDate)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <div className="text-slate-500 mb-1">Key Actions</div>
                        <div className="space-y-2">
                          {goal?.actions?.map((action, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span className="text-slate-700 truncate flex-1">{action.text}</span>
                              <span className="text-slate-500 ml-2 flex items-center space-x-1">
                                <span>{getFrequencyIcon(action.frequency)}</span>
                                <span>{getFrequencyDescription(action)}</span>
                              </span>
                            </div>
                          )) || <div className="text-slate-500">No actions set</div>}
                        </div>
                      </div>

                      {goal?.wheelAreas && goal.wheelAreas.length > 0 && (
                        <div>
                          <div className="text-slate-500 mb-1">Connected Areas</div>
                          <div className="flex flex-wrap gap-1">
                            {goal.wheelAreas.map(area => (
                              <span key={area} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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

  const StepIcon = stepIcons[data.currentStep];
  const categoryInfo = currentCategory ? GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Goal Setting Flow</h1>
          <p className="text-slate-600 mt-2">
            Set your annual vision, then break it down into 12-week goals with milestones and actions
          </p>
          {lastSaved && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Your Progress</h3>
          <span className="text-sm text-slate-600">{progress.completed}/{progress.total} steps</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-slate-600">{progress.percentage}% complete</div>
      </div>

      {/* Current Step */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        {/* Step Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              categoryInfo ? `bg-${categoryInfo.color}-100` : 'bg-purple-100'
            }`}>
              <StepIcon className={`w-6 h-6 ${
                categoryInfo ? `text-${categoryInfo.color}-600` : 'text-purple-600'
              }`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{stepNames[data.currentStep]}</h2>
              {categoryInfo && (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  <span className="text-slate-600">{categoryInfo.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            {data.currentStep !== 'annual' && (
              <>
                <div className="text-sm text-slate-500">Category {data.currentCategoryIndex + 1} of {data.categories.length}</div>
                <div className="text-sm text-slate-500">Step 2 of 2</div>
              </>
            )}
            {data.currentStep === 'annual' && (
              <div className="text-sm text-slate-500">Step 1 of 2</div>
            )}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Annual Snapshot */}
          {data.currentStep === 'annual' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  Imagine it's 12 months from now...
                </h3>
                <p className="text-purple-700">
                  You've fully achieved your goals across all areas of your life. What does your life look like?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Your Annual Life Snapshot
                </label>
                <textarea
                  value={data.annualSnapshot.snapshot}
                  onChange={(e) => updateAnnualSnapshot({
                    ...data.annualSnapshot,
                    snapshot: e.target.value
                  })}
                  placeholder="I feel energized and healthy in my body. My career is thriving and I'm making meaningful impact. My relationships are deep and fulfilling. I have financial security and freedom..."
                  className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Personal Mantra <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={data.annualSnapshot.mantra || ''}
                  onChange={(e) => updateAnnualSnapshot({
                    ...data.annualSnapshot,
                    mantra: e.target.value
                  })}
                  placeholder="Living with purpose and joy."
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Category Goal */}
          {data.currentStep === 'quarter' && categoryInfo && (
            <div className="space-y-6">
              <div className={`bg-gradient-to-r from-${categoryInfo.color}-50 to-${categoryInfo.color}-100 rounded-xl p-6 border border-${categoryInfo.color}-200`}>
                <h3 className={`text-lg font-semibold text-${categoryInfo.color}-900 mb-2`}>
                  {categoryInfo.name} Goal
                </h3>
                <p className={`text-${categoryInfo.color}-700 mb-3`}>
                  {categoryInfo.description}
                </p>
                <div className="text-sm text-slate-600">
                  <strong>Examples:</strong> {categoryInfo.examples.join(', ')}
                </div>
              </div>

              {/* Wheel of Life Connection */}
              {wheelData && (
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Link className="w-5 h-5 text-slate-600" />
                    <h4 className="font-semibold text-slate-900">Connected Wheel of Life Areas</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getCategoryWheelData(currentCategory).map((area, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: area.color }}
                          />
                          <span className="font-medium text-slate-900">{area.area}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500">Current:</span>
                          <span className="font-semibold text-slate-900">{area.score}/10</span>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
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
                  Goal Deadline
                </label>
                <div className="flex items-center space-x-4">
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
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {data.categoryGoals[currentCategory]?.deadline 
                        ? `${getWeeksRemaining(data.categoryGoals[currentCategory].deadline)} weeks remaining`
                        : '12 weeks from today'
                      }
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Default is set to 12 weeks from today. Adjust as needed for your goal timeline.
                </p>
              </div>

              {/* Milestones Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Milestones (2-4 key checkpoints)
                  </label>
                  <button
                    onClick={addMilestone}
                    className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Add Milestone</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(data.categoryGoals[currentCategory]?.milestones || []).map((milestone, index) => {
                    const status = getMilestoneStatus(milestone);
                    const statusColor = getMilestoneStatusColor(status);
                    
                    return (
                      <div key={milestone.id} className={`border rounded-lg p-4 space-y-3 ${statusColor}`}>
                        {/* Milestone Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleMilestoneCompletion(milestone.id)}
                              className="flex-shrink-0"
                            >
                              {milestone.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                              )}
                            </button>
                            <span className="text-sm font-medium">Milestone {index + 1}</span>
                          </div>
                          <button
                            onClick={() => removeMilestone(milestone.id)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Milestone Title */}
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                          placeholder={categoryInfo.milestoneExamples[index] || "Enter milestone title"}
                          className={`w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            milestone.completed ? 'line-through text-slate-500' : ''
                          }`}
                        />

                        {/* Due Date and Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <label className="text-sm text-slate-600">Due Date:</label>
                            <input
                              type="date"
                              value={milestone.dueDate}
                              onChange={(e) => updateMilestone(milestone.id, { dueDate: e.target.value })}
                              className="p-2 border border-slate-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            {milestone.completed ? (
                              <span className="text-green-600 font-medium">
                                ✓ Completed {milestone.completedDate && formatShortDate(milestone.completedDate)}
                              </span>
                            ) : (
                              <span className={`font-medium ${
                                status === 'overdue' ? 'text-red-600' :
                                status === 'due-soon' ? 'text-orange-600' :
                                'text-blue-600'
                              }`}>
                                {status === 'overdue' ? '⚠️ Overdue' :
                                 status === 'due-soon' ? '⏰ Due Soon' :
                                 `📅 ${getDaysRemaining(milestone.dueDate)} days left`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Optional Description */}
                        <textarea
                          value={milestone.description || ''}
                          onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                          placeholder="Optional: Add details about this milestone..."
                          className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          rows={2}
                        />
                      </div>
                    );
                  })}
                  
                  {(data.categoryGoals[currentCategory]?.milestones || []).length === 0 && (
                    <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                      <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="mb-2">Add milestones to track your progress</p>
                      <p className="text-xs">Break your 12-week goal into smaller, measurable checkpoints</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Key Actions with Frequency (2-4 actions)
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
                    <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                      {/* Action Text */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={action.text}
                          onChange={(e) => updateAction(index, { text: e.target.value })}
                          placeholder="Weekly meal prep sessions"
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
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Repeat className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-700">How often will you do this?</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'daily', label: 'Daily', icon: '📅', desc: 'Every day' },
                            { value: 'weekly', label: 'Weekly', icon: '📆', desc: 'Once per week' },
                            { value: 'multiple', label: 'Multiple Days', icon: '🗓️', desc: 'Specific days' }
                          ].map((freq) => (
                            <button
                              key={freq.value}
                              onClick={() => updateAction(index, { frequency: freq.value as any, specificDays: [] })}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                action.frequency === freq.value
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-lg">{freq.icon}</span>
                                <span className="font-medium text-sm">{freq.label}</span>
                              </div>
                              <div className="text-xs opacity-75">{freq.desc}</div>
                            </button>
                          ))}
                        </div>

                        {/* Specific Days Selection */}
                        {action.frequency === 'multiple' && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-sm font-medium text-slate-700 mb-2">Select specific days:</div>
                            <div className="grid grid-cols-7 gap-2">
                              {DAYS_OF_WEEK.map((day) => (
                                <button
                                  key={day.value}
                                  onClick={() => toggleSpecificDay(index, day.value)}
                                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                                    action.specificDays?.includes(day.value)
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {day.short}
                                </button>
                              ))}
                            </div>
                            {action.specificDays && action.specificDays.length > 0 && (
                              <div className="mt-2 text-xs text-slate-600">
                                Selected: {action.specificDays.map(day => 
                                  DAYS_OF_WEEK.find(d => d.value === day)?.label
                                ).join(', ')}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Frequency Summary */}
                        <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-2">
                          <span>{getFrequencyIcon(action.frequency)}</span>
                          <span><strong>Frequency:</strong> {getFrequencyDescription(action)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(data.categoryGoals[currentCategory]?.actions || []).length === 0 && (
                    <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                      <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="mb-2">Add your first action to get started</p>
                      <p className="text-xs">Each action will include frequency settings for calendar scheduling</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Focus or Feeling <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={data.categoryGoals[currentCategory]?.focus || ''}
                  onChange={(e) => updateCategoryGoal(currentCategory, {
                    category: currentCategory as any,
                    goal: data.categoryGoals[currentCategory]?.goal || '',
                    actions: data.categoryGoals[currentCategory]?.actions || [],
                    milestones: data.categoryGoals[currentCategory]?.milestones || [],
                    focus: e.target.value,
                    wheelAreas: getCategoryWheelData(currentCategory).map(area => area.area),
                    targetScore: data.categoryGoals[currentCategory]?.targetScore || 8,
                    deadline: data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow()
                  })}
                  placeholder="Feeling strong and confident"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
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
            {data.currentStep === 'annual' ? 'Annual Vision' : `${categoryInfo?.name} • ${stepNames[data.currentStep]}`}
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