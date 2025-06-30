import React, { useState, useEffect } from 'react';
import { Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar, Plus, Minus, Link, TrendingUp, Clock, Repeat, CheckSquare, Flag, CheckCircle2, Circle, Star as StarIcon } from 'lucide-react';
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
  const [showTips, setShowTips] = useState(false);

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
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">🎉 Goals Complete!</h2>
          <p className="text-slate-600 mb-6">You've successfully set up your annual vision and 12-week goals.</p>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Annual Snapshot Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Your Annual Vision</h3>
              <div className="text-slate-700 italic mb-2 text-lg">"{data.annualSnapshot.snapshot}"</div>
              {data.annualSnapshot.mantra && (
                <div className="text-purple-600 font-medium mt-2">Mantra: "{data.annualSnapshot.mantra}"</div>
              )}
            </div>

            {/* Category Goals Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.categories.map((category) => {
                const categoryInfo = GOAL_CATEGORIES[category];
                const goal = data.categoryGoals[category];
                
                return (
                  <div key={category} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xl">{categoryInfo.icon}</span>
                      <h3 className="text-base font-semibold text-slate-900">{categoryInfo.name}</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">12-Week Goal</div>
                        <div className="font-medium text-slate-900">{goal?.goal || 'Not set'}</div>
                      </div>

                      {goal?.deadline && (
                        <div className="flex items-center text-xs text-slate-600">
                          <Clock className="w-3 h-3 mr-1 inline" />
                          {formatDate(goal.deadline)} • {getWeeksRemaining(goal.deadline)} weeks
                        </div>
                      )}
                      
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide mt-2">Key Actions</div>
                        {goal?.actions?.slice(0, 2).map((action, index) => (
                          <div key={index} className="text-xs text-slate-600 flex items-center mt-1">
                            <div className="w-1 h-1 bg-slate-400 rounded-full mr-2"></div>
                            <span className="truncate">{action.text}</span>
                          </div>
                        ))}
                        {goal?.actions?.length > 2 && (
                          <div className="text-xs text-purple-600 mt-1">+{goal.actions.length - 2} more actions</div>
                        )}
                        {(!goal?.actions || goal.actions.length === 0) && (
                          <div className="text-xs text-slate-500 mt-1">No actions set</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={() => window.location.href = '/calendar'}
              className="mx-auto mt-4 flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Your Actions</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = currentCategory ? GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">12-Week Goals</h1>
          <p className="text-slate-600 text-sm mt-1">
            Set your vision, then break it down into actionable steps
          </p>
          {lastSaved && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Saved at {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>{showTips ? "Hide Tips" : "Show Tips"}</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-slate-900">Your Progress</div>
          <div className="text-xs text-slate-600">{progress.completed}/{progress.total} steps</div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Tips Section (Collapsible) */}
      {showTips && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 animate-fadeIn">
          <h3 className="font-medium text-indigo-900 mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Tips for Effective Goal Setting
          </h3>
          <ul className="space-y-2 text-sm text-indigo-800">
            <li className="flex items-start">
              <span className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
              <span>Make your goals <strong>specific and measurable</strong> so you'll know when you've achieved them</span>
            </li>
            <li className="flex items-start">
              <span className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
              <span>Break down big goals into <strong>small, actionable steps</strong> you can take consistently</span>
            </li>
            <li className="flex items-start">
              <span className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
              <span>Connect your goals to your <strong>core values</strong> for deeper motivation</span>
            </li>
          </ul>
        </div>
      )}

      {/* Current Step */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        {/* Step Content */}
        <div className="space-y-6">
          {/* Annual Snapshot */}
          {data.currentStep === 'annual' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Your Annual Vision</h2>
                <p className="text-slate-600 text-sm">Imagine it's one year from now and you've achieved your goals...</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100 mb-4">
                <p className="text-sm text-purple-800 italic">
                  "I feel energized and healthy. My career is thriving with new opportunities. 
                  My relationships are deeper and more meaningful. I have financial security and freedom..."
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Describe your ideal life one year from now
                </label>
                <textarea
                  value={data.annualSnapshot.snapshot}
                  onChange={(e) => updateAnnualSnapshot({
                    ...data.annualSnapshot,
                    snapshot: e.target.value
                  })}
                  placeholder="I feel energized and healthy. My career is thriving. My relationships are deep and fulfilling..."
                  className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Personal Mantra <span className="text-xs text-slate-500">(optional)</span>
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
                <p className="text-xs text-slate-500 mt-1">A short phrase that captures the essence of your vision</p>
              </div>
            </div>
          )}

          {/* Category Goal */}
          {data.currentStep === 'quarter' && categoryInfo && (
            <div className="space-y-5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-100">
                  {categoryInfo.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{categoryInfo.name}</h2>
                  <p className="text-sm text-slate-600">{categoryInfo.description}</p>
                </div>
              </div>

              {/* Connected Wheel Areas */}
              {wheelData && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {getCategoryWheelData(currentCategory).map((area, index) => (
                    <div key={index} className="flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs">
                      <div className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: area.color}}></div>
                      <span className="font-medium text-slate-700">{area.area}</span>
                      <span className="text-slate-500 ml-1">{area.score}/10</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What's your 12-week goal for {categoryInfo.name.toLowerCase()}?
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
                <div className="mt-2 flex flex-wrap gap-2">
                  {categoryInfo.examples.slice(0, 3).map((example, i) => (
                    <button 
                      key={i}
                      onClick={() => updateCategoryGoal(currentCategory, {
                        category: currentCategory as any,
                        goal: example,
                        actions: data.categoryGoals[currentCategory]?.actions || [],
                        milestones: data.categoryGoals[currentCategory]?.milestones || [],
                        focus: data.categoryGoals[currentCategory]?.focus || '',
                        wheelAreas: getCategoryWheelData(currentCategory).map(area => area.area),
                        targetScore: data.categoryGoals[currentCategory]?.targetScore || 8,
                        deadline: data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow()
                      })}
                      className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline with visual calendar */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  When will you complete this goal?
                </label>
                <div className="flex items-center space-x-3">
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
                    className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{getWeeksRemaining(data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow())} weeks</span>
                  </div>
                </div>
              </div>

              {/* Milestones Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700 flex items-center">
                    <Flag className="w-4 h-4 mr-1" />
                    Milestones (2-4 checkpoints)
                  </label>
                  <button
                    onClick={addMilestone}
                    className="flex items-center space-x-1 px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Milestone</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(data.categoryGoals[currentCategory]?.milestones || []).map((milestone, index) => {
                    const status = getMilestoneStatus(milestone);
                    const statusColor = getMilestoneStatusColor(status);
                    
                    return (
                      <div key={milestone.id} className={`border rounded-lg p-3 ${statusColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleMilestoneCompletion(milestone.id)}
                              className="mr-2"
                            >
                              {milestone.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                              )}
                            </button>
                            <span className="text-sm font-medium">Milestone {index + 1}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs px-2 py-1 rounded-full bg-white">
                              {formatDate(milestone.dueDate)}
                            </div>
                            <button
                              onClick={() => removeMilestone(milestone.id)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                          placeholder={categoryInfo.milestoneExamples[index] || "Enter milestone title"}
                          className={`w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                            milestone.completed ? 'line-through text-slate-500' : ''
                          }`}
                        />
                      </div>
                    );
                  })}
                  
                  {(data.categoryGoals[currentCategory]?.milestones || []).length === 0 && (
                    <button
                      onClick={addMilestone}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors text-sm flex items-center justify-center"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Add your first milestone
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700 flex items-center">
                    <CheckSquare className="w-4 h-4 mr-1" />
                    What actions will you take?
                  </label>
                  <button
                    onClick={addAction}
                    className="flex items-center space-x-1 px-2 py-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-xs font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Action</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(data.categoryGoals[currentCategory]?.actions || []).map((action, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-all">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={action.text}
                          onChange={(e) => updateAction(index, { text: e.target.value })}
                          placeholder="What action will you take?"
                          className="flex-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => removeAction(index)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Frequency Selection - Visual Buttons */}
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="text-xs text-slate-500">How often?</div>
                        <div className="flex space-x-1">
                          {[
                            { value: 'daily', label: 'Daily', icon: '📅' },
                            { value: 'weekly', label: 'Weekly', icon: '📆' },
                            { value: 'multiple', label: 'Custom', icon: '🗓️' }
                          ].map((freq) => (
                            <button
                              key={freq.value}
                              onClick={() => updateAction(index, { frequency: freq.value as any, specificDays: [] })}
                              className={`px-2 py-1 rounded text-xs transition-all ${
                                action.frequency === freq.value
                                  ? 'bg-purple-100 text-purple-700 font-medium'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span className="mr-1">{freq.icon}</span>
                              {freq.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Specific Days Selection - Visual Calendar */}
                      {action.frequency === 'multiple' && (
                        <div className="mt-2 bg-slate-50 p-2 rounded-lg">
                          <div className="flex justify-between">
                            {DAYS_OF_WEEK.map((day) => (
                              <button
                                key={day.value}
                                onClick={() => toggleSpecificDay(index, day.value)}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                                  action.specificDays?.includes(day.value)
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {day.short.charAt(0)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-slate-600 flex items-center">
                        <Repeat className="w-3 h-3 mr-1 text-slate-400" />
                        {getFrequencyDescription(action)}
                      </div>
                    </div>
                  ))}
                  
                  {(data.categoryGoals[currentCategory]?.actions || []).length === 0 && (
                    <button
                      onClick={addAction}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors text-sm flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add your first action
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
          <button
            onClick={goToPreviousArea}
            disabled={data.currentStep === 'annual'}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {data.currentStep === 'annual' ? 'Step 1: Annual Vision' : `Step 2: ${categoryInfo?.name} (${data.currentCategoryIndex + 1}/${data.categories.length})`}
          </div>

          <button
            onClick={goToNextArea}
            disabled={!canProceed()}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <span>{data.currentStep === 'quarter' && data.currentCategoryIndex === data.categories.length - 1 ? 'Complete' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Learning Aid */}
      {data.currentStep === 'annual' && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-900 mb-3 flex items-center">
            <StarIcon className="w-4 h-4 text-yellow-500 mr-2" />
            Vision Examples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="font-medium text-blue-800 mb-1">Career & Finance</div>
              <p className="text-blue-700">
                "I've been promoted to senior position. I've increased my income by 20% and started investing regularly."
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="font-medium text-green-800 mb-1">Health & Wellbeing</div>
              <p className="text-green-700">
                "I exercise 4 times weekly and feel energetic. I've established healthy eating habits and sleep 7+ hours nightly."
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <div className="font-medium text-purple-800 mb-1">Relationships</div>
              <p className="text-purple-700">
                "I spend quality time with family weekly. I've deepened connections with 3 close friends through regular meetups."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Examples */}
      {data.currentStep === 'quarter' && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-900 mb-3 flex items-center">
            <CheckSquare className="w-4 h-4 text-green-500 mr-2" />
            Action Examples for {categoryInfo?.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {categoryInfo?.examples.slice(0, 2).map((example, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg">
                <div className="font-medium text-slate-800 mb-1">Goal: {example}</div>
                <ul className="space-y-1 text-slate-600">
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-slate-400 rounded-full mr-2"></div>
                    Weekly planning session (30 min)
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-slate-400 rounded-full mr-2"></div>
                    Daily practice (15 min)
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-slate-400 rounded-full mr-2"></div>
                    Monthly review and adjust
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;