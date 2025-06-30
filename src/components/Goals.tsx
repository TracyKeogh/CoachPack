import React, { useState, useEffect } from 'react';
import { 
  Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar, 
  Plus, Minus, Link, TrendingUp, Clock, Repeat, CheckSquare, 
  Flag, CheckCircle2, Circle, Star, Award, Zap, BarChart3
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { useWheelData } from '../hooks/useWheelData';
import { 
  GOAL_CATEGORIES, getTwelveWeeksFromNow, getMilestoneDueDates, 
  DAYS_OF_WEEK, ActionItem, Milestone 
} from '../types/goals';

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
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'multiple':
        if (action.specificDays && action.specificDays.length > 0) {
          return `${action.specificDays.length} days/week`;
        }
        return 'Custom';
      default:
        return '';
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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Goal Setting...</h2>
        </div>
      </div>
    );
  }

  if (isComplete()) {
    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">🎉 Goals Complete!</h2>
          <p className="text-slate-600 mb-6">You've successfully set up your annual vision and 12-week goals.</p>
        </div>
          
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Annual Snapshot Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900">Annual Vision</h3>
            </div>
            <div className="text-purple-800 italic mb-2 text-base bg-white bg-opacity-50 p-4 rounded-lg border border-purple-100">
              "{data.annualSnapshot.snapshot}"
            </div>
            {data.annualSnapshot.mantra && (
              <div className="flex items-center mt-3">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                <div className="text-purple-700 font-medium">Mantra: "{data.annualSnapshot.mantra}"</div>
              </div>
            )}
          </div>

          {/* Timeline Visualization */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your 12-Week Journey</h3>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200 ml-6"></div>
              
              <div className="space-y-8">
                {data.categories.map((category, index) => {
                  const categoryInfo = GOAL_CATEGORIES[category];
                  const goal = data.categoryGoals[category];
                  
                  if (!goal || !goal.goal) return null;
                  
                  return (
                    <div key={category} className="relative pl-16">
                      {/* Timeline node */}
                      <div className="absolute left-0 w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xl">
                        {categoryInfo.icon}
                      </div>
                      
                      <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-900">{categoryInfo.name}</h4>
                          <div className="text-sm text-slate-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{formatDate(goal.deadline)} • {getWeeksRemaining(goal.deadline)}w</span>
                          </div>
                        </div>
                        
                        <div className="text-base font-medium text-slate-800 mb-3 pb-3 border-b border-slate-100">
                          {goal.goal}
                        </div>
                        
                        {/* Milestones */}
                        {goal.milestones && goal.milestones.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center mb-2">
                              <Flag className="w-3 h-3 text-orange-500 mr-1" />
                              <h5 className="text-sm font-medium text-slate-700">Milestones</h5>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {goal.milestones.map((milestone, i) => (
                                <div 
                                  key={milestone.id}
                                  className={`px-3 py-1.5 rounded-lg text-xs flex items-center ${
                                    milestone.completed 
                                      ? 'bg-green-50 text-green-700 border border-green-200' 
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}
                                >
                                  {milestone.completed ? (
                                    <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                  ) : (
                                    <Flag className="w-3 h-3 mr-1.5" />
                                  )}
                                  <span className={milestone.completed ? 'line-through opacity-75' : ''}>
                                    {milestone.title}
                                  </span>
                                  <span className="ml-1.5 text-[10px] opacity-75">
                                    {formatDate(milestone.dueDate)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Key actions */}
                        {goal.actions && goal.actions.length > 0 && (
                          <div>
                            <div className="flex items-center mb-2">
                              <CheckSquare className="w-3 h-3 text-purple-500 mr-1" />
                              <h5 className="text-sm font-medium text-slate-700">Key Actions</h5>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {goal.actions.map((action, i) => (
                                <div key={i} className="flex items-center bg-slate-50 rounded-lg p-2 text-xs">
                                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-[10px] font-bold text-purple-700 mr-2">
                                    {i + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-slate-800">{action.text}</div>
                                    <div className="text-[10px] text-slate-500 flex items-center mt-0.5">
                                      <Repeat className="w-2.5 h-2.5 mr-1" />
                                      {getFrequencyDescription(action)}
                                      {action.frequency === 'multiple' && action.specificDays && (
                                        <span className="ml-1">
                                          ({action.specificDays.map(d => d[0].toUpperCase()).join(', ')})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
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
          
          {/* Goal Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Total Goals</h3>
                  <div className="text-2xl font-bold text-blue-600">{data.categories.length}</div>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                Across business, health, and balance areas
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Flag className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Milestones</h3>
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.values(data.categoryGoals).reduce((sum, goal) => sum + (goal.milestones?.length || 0), 0)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                Checkpoints to track your progress
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Key Actions</h3>
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(data.categoryGoals).reduce((sum, goal) => sum + (goal.actions?.length || 0), 0)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                Daily and weekly habits for success
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
            <p className="text-blue-100 mb-4">
              Now that you've set your goals, it's time to schedule your actions and track your progress.
            </p>
            
            <button
              onClick={() => window.location.href = '/calendar'}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Schedule Your Actions</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = currentCategory ? GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES] : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">12-Week Goals</h1>
          <p className="text-slate-600 text-xs mt-1">
            {lastSaved && `✓ Saved at ${lastSaved.toLocaleTimeString()}`}
          </p>
        </div>
        
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center space-x-1 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>{showTips ? "Hide Tips" : "Show Tips"}</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-medium text-slate-900">Progress</div>
          <div className="text-xs text-slate-600">{progress.completed}/{progress.total}</div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Tips Section (Collapsible) */}
      {showTips && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100 animate-fadeIn">
          <h3 className="text-xs font-medium text-indigo-900 mb-1 flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            Quick Tips
          </h3>
          <ul className="space-y-1 text-xs text-indigo-800">
            <li className="flex items-start">
              <span className="w-3 h-3 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] mr-1 mt-0.5">1</span>
              <span>Make goals <strong>specific and measurable</strong></span>
            </li>
            <li className="flex items-start">
              <span className="w-3 h-3 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] mr-1 mt-0.5">2</span>
              <span>Break down into <strong>small, actionable steps</strong></span>
            </li>
          </ul>
        </div>
      )}

      {/* Current Step */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        {/* Step Content */}
        <div className="space-y-5">
          {/* Annual Snapshot */}
          {data.currentStep === 'annual' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Your Annual Vision</h2>
                <p className="text-slate-600 text-xs">Imagine it's one year from now...</p>
              </div>

              <div>
                <textarea
                  value={data.annualSnapshot.snapshot}
                  onChange={(e) => updateAnnualSnapshot({
                    ...data.annualSnapshot,
                    snapshot: e.target.value
                  })}
                  placeholder="I feel energized and healthy. My career is thriving. My relationships are deep and fulfilling..."
                  className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Personal Mantra <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={data.annualSnapshot.mantra || ''}
                  onChange={(e) => updateAnnualSnapshot({
                    ...data.annualSnapshot,
                    mantra: e.target.value
                  })}
                  placeholder="Living with purpose and joy"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* Category Goal */}
          {data.currentStep === 'quarter' && categoryInfo && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-slate-100">
                  {categoryInfo.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{categoryInfo.name}</h2>
                  <p className="text-xs text-slate-600">{categoryInfo.description}</p>
                </div>
              </div>

              {/* Connected Wheel Areas */}
              {wheelData && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {getCategoryWheelData(currentCategory).map((area, index) => (
                    <div key={index} className="flex items-center px-2 py-0.5 bg-slate-100 rounded-full text-[10px]">
                      <div className="w-1.5 h-1.5 rounded-full mr-1" style={{backgroundColor: area.color}}></div>
                      <span className="font-medium text-slate-700">{area.area}</span>
                      <span className="text-slate-500 ml-1">{area.score}/10</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
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
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Deadline with visual calendar */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Deadline
                </label>
                <div className="flex items-center space-x-2">
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
                    className="p-1 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs"
                  />
                  <div className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                    <Clock className="w-2.5 h-2.5 mr-0.5" />
                    <span>{getWeeksRemaining(data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow())}w</span>
                  </div>
                </div>
              </div>

              {/* Milestones Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-700 flex items-center">
                    <Flag className="w-3 h-3 mr-1" />
                    Milestones
                  </label>
                  <button
                    onClick={addMilestone}
                    className="flex items-center space-x-1 px-2 py-0.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {(data.categoryGoals[currentCategory]?.milestones || []).map((milestone, index) => {
                    const status = getMilestoneStatus(milestone);
                    
                    return (
                      <div key={milestone.id} className="flex items-center border rounded-lg p-2">
                        <button
                          onClick={() => toggleMilestoneCompletion(milestone.id)}
                          className="mr-2 flex-shrink-0"
                        >
                          {milestone.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                          placeholder={`Milestone ${index + 1}`}
                          className={`flex-1 p-1 border-0 bg-transparent focus:ring-0 text-xs ${
                            milestone.completed ? 'line-through text-slate-500' : ''
                          }`}
                        />
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <div className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {formatDate(milestone.dueDate)}
                          </div>
                          <button
                            onClick={() => removeMilestone(milestone.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {(data.categoryGoals[currentCategory]?.milestones || []).length === 0 && (
                    <button
                      onClick={addMilestone}
                      className="w-full py-2 border border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors text-xs flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add milestone
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-700 flex items-center">
                    <CheckSquare className="w-3 h-3 mr-1" />
                    Key Actions
                  </label>
                  <button
                    onClick={addAction}
                    className="flex items-center space-x-1 px-2 py-0.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {(data.categoryGoals[currentCategory]?.actions || []).map((action, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-2 hover:border-slate-300 transition-all">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center text-[10px] font-bold text-purple-700">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={action.text}
                          onChange={(e) => updateAction(index, { text: e.target.value })}
                          placeholder="What action will you take?"
                          className="flex-1 p-1 border-0 bg-transparent focus:ring-0 text-xs"
                        />
                        <button
                          onClick={() => removeAction(index)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Frequency Selection - Compact */}
                      <div className="mt-1 flex items-center space-x-1 ml-6">
                        <div className="flex space-x-1">
                          {[
                            { value: 'daily', label: 'Daily', icon: '📅' },
                            { value: 'weekly', label: 'Weekly', icon: '📆' },
                            { value: 'multiple', label: 'Custom', icon: '🗓️' }
                          ].map((freq) => (
                            <button
                              key={freq.value}
                              onClick={() => updateAction(index, { frequency: freq.value as any, specificDays: [] })}
                              className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                                action.frequency === freq.value
                                  ? 'bg-purple-100 text-purple-700 font-medium'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {freq.icon}
                            </button>
                          ))}
                        </div>
                        
                        <span className="text-[10px] text-slate-500">
                          {getFrequencyDescription(action)}
                        </span>
                      </div>

                      {/* Specific Days Selection - Compact Calendar */}
                      {action.frequency === 'multiple' && (
                        <div className="mt-1 ml-6 flex justify-start">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              key={day.value}
                              onClick={() => toggleSpecificDay(index, day.value)}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all mr-0.5 ${
                                action.specificDays?.includes(day.value)
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200'
                              }`}
                            >
                              {day.short.charAt(0)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {(data.categoryGoals[currentCategory]?.actions || []).length === 0 && (
                    <button
                      onClick={addAction}
                      className="w-full py-2 border border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors text-xs flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add action
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
          <button
            onClick={goToPreviousArea}
            disabled={data.currentStep === 'annual'}
            className="flex items-center space-x-1 px-3 py-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back</span>
          </button>

          <div className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {data.currentStep === 'annual' ? 'Vision' : `${categoryInfo?.name} (${data.currentCategoryIndex + 1}/${data.categories.length})`}
          </div>

          <button
            onClick={goToNextArea}
            disabled={!canProceed()}
            className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
          >
            <span>{data.currentStep === 'quarter' && data.currentCategoryIndex === data.categories.length - 1 ? 'Complete' : 'Next'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Visual Learning Aid - Compact */}
      {data.currentStep === 'quarter' && (
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
          <h3 className="text-xs font-medium text-slate-900 mb-2 flex items-center">
            <Star className="w-3 h-3 text-yellow-500 mr-1" />
            Examples for {categoryInfo?.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
            {categoryInfo?.examples.slice(0, 2).map((example, i) => (
              <div key={i} className="bg-slate-50 p-2 rounded-lg">
                <div className="font-medium text-slate-800 mb-1">{example}</div>
                <div className="text-slate-600 flex items-center">
                  <div className="w-1 h-1 bg-slate-400 rounded-full mr-1"></div>
                  <span className="truncate">Weekly planning (30 min)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;