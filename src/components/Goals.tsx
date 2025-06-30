import React, { useState, useEffect } from 'react';
import { 
  Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar as CalendarIcon, 
  Plus, Minus, Link, TrendingUp, Clock, Repeat, CheckSquare, 
  Flag, CheckCircle2, Circle, Star, Award, Zap, BarChart3, Info,
  ChevronRight, ChevronLeft, Calendar, Trophy, Trash2
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
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);

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
    
    // Set the new milestone as active
    setActiveMilestoneId(newMilestone.id);
  };

  const removeMilestone = (milestoneId: string) => {
    const currentGoal = data.categoryGoals[currentCategory];
    if (currentGoal) {
      updateCategoryGoal(currentCategory, {
        ...currentGoal,
        milestones: currentGoal.milestones.filter(m => m.id !== milestoneId)
      });
      
      if (activeMilestoneId === milestoneId) {
        setActiveMilestoneId(null);
      }
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

  const getMilestoneIcon = (index: number) => {
    const icons = [Trophy, Star, Flag, Award, Zap];
    return icons[index % icons.length];
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
      <div className="space-y-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">🎉 Goals Complete!</h2>
          <p className="text-slate-600 mb-6">You've successfully set up your annual vision and 12-week goals.</p>
        </div>
          
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Annual Snapshot Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-100">
            <div className="flex items-center space-x-3 mb-4">
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

          {/* Interactive Goal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.categories.map((category, index) => {
              const categoryInfo = GOAL_CATEGORIES[category];
              const goal = data.categoryGoals[category];
              
              if (!goal || !goal.goal) return null;
              
              const completedMilestones = goal.milestones.filter(m => m.completed).length;
              const totalMilestones = goal.milestones.length;
              const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
              
              return (
                <div key={category} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300">
                  {/* Header with category color */}
                  <div className={`p-4 border-b ${
                    category === 'business' ? 'bg-purple-50 border-purple-100' :
                    category === 'body' ? 'bg-green-50 border-green-100' :
                    'bg-blue-50 border-blue-100'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white shadow-sm">
                        {categoryInfo.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{categoryInfo.name}</h3>
                        <div className="text-sm text-slate-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{formatDate(goal.deadline)} • {getWeeksRemaining(goal.deadline)}w</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Goal */}
                  <div className="p-4">
                    <h4 className="font-medium text-lg text-slate-800 mb-3">{goal.goal}</h4>
                    
                    {/* Milestone Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center text-slate-600">
                          <Flag className="w-3 h-3 mr-1" />
                          <span>Milestones</span>
                        </div>
                        <div className="font-medium">
                          {completedMilestones}/{totalMilestones}
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            category === 'business' ? 'bg-purple-500' :
                            category === 'body' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${milestoneProgress}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Milestone Preview */}
                    <div className="space-y-2 mb-4">
                      {goal.milestones.slice(0, 2).map((milestone, i) => {
                        const MilestoneIcon = getMilestoneIcon(i);
                        return (
                          <div 
                            key={milestone.id}
                            className={`flex items-center p-2 rounded-lg ${
                              milestone.completed 
                                ? 'bg-green-50 text-green-700' 
                                : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            <MilestoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                            <div className="flex-1 text-sm font-medium truncate">
                              {milestone.title || `Milestone ${i+1}`}
                            </div>
                            <div className="text-xs opacity-75">
                              {formatDate(milestone.dueDate)}
                            </div>
                          </div>
                        );
                      })}
                      {goal.milestones.length > 2 && (
                        <div className="text-center text-sm text-slate-500">
                          +{goal.milestones.length - 2} more milestones
                        </div>
                      )}
                    </div>
                    
                    {/* Action Count */}
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center">
                        <CheckSquare className="w-3 h-3 mr-1" />
                        <span>{goal.actions.length} weekly actions</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{getWeeksRemaining(goal.deadline)} weeks left</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Timeline Visualization */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Your 12-Week Journey</h3>
            
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
                      
                      <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-900">{categoryInfo.name}</h4>
                          <div className="text-sm text-slate-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{formatDate(goal.deadline)} • {getWeeksRemaining(goal.deadline)}w</span>
                          </div>
                        </div>
                        
                        <div className="text-base font-medium text-slate-800 mb-4 pb-4 border-b border-slate-100">
                          {goal.goal}
                        </div>
                        
                        {/* Milestones */}
                        {goal.milestones && goal.milestones.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center mb-3">
                              <Flag className="w-4 h-4 text-orange-500 mr-2" />
                              <h5 className="text-sm font-medium text-slate-700">Milestones</h5>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {goal.milestones.map((milestone, i) => (
                                <div 
                                  key={milestone.id}
                                  className={`px-3 py-2 rounded-lg text-xs flex items-center ${
                                    milestone.completed 
                                      ? 'bg-green-50 text-green-700 border border-green-200' 
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}
                                >
                                  {milestone.completed ? (
                                    <CheckCircle2 className="w-3 h-3 mr-2" />
                                  ) : (
                                    <Flag className="w-3 h-3 mr-2" />
                                  )}
                                  <span className={milestone.completed ? 'line-through opacity-75' : ''}>
                                    {milestone.title}
                                  </span>
                                  <span className="ml-2 text-[10px] opacity-75">
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
                            <div className="flex items-center mb-3">
                              <CheckSquare className="w-4 h-4 text-purple-500 mr-2" />
                              <h5 className="text-sm font-medium text-slate-700">Key Actions</h5>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {goal.actions.map((action, i) => (
                                <div key={i} className="flex items-center bg-slate-50 rounded-lg p-3 text-xs">
                                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-[10px] font-bold text-purple-700 mr-3">
                                    {i + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-slate-800">{action.text}</div>
                                    <div className="text-[10px] text-slate-500 flex items-center mt-1">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
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
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
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
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
            <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
            <p className="text-blue-100 mb-6">
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
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">12-Week Goals</h1>
          <p className="text-slate-600 text-sm mt-1">
            {lastSaved && `✓ Saved at ${lastSaved.toLocaleTimeString()}`}
          </p>
        </div>
        
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center space-x-1 px-3 py-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Info className="w-3 h-3" />
          <span>{showTips ? "Hide Tips" : "Tips"}</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-slate-900">Progress</div>
          <div className="text-sm text-slate-600">{progress.completed}/{progress.total}</div>
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
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <h3 className="text-sm font-medium text-indigo-900 mb-2 flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            Quick Tips
          </h3>
          <ul className="space-y-1 text-sm text-indigo-800">
            <li>• Make goals specific and measurable</li>
            <li>• Break down into small, actionable steps</li>
          </ul>
        </div>
      )}

      {/* Current Step */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
        {/* Step Content */}
        <div className="space-y-10">
          {/* Annual Snapshot */}
          {data.currentStep === 'annual' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Your Annual Vision</h2>
                <p className="text-slate-600">Imagine it's one year from now...</p>
              </div>

              <div>
                <textarea
                  value={data.annualSnapshot.snapshot}
                  onChange={(e) => updateAnnualSnapshot({
                    ...data.annualSnapshot,
                    snapshot: e.target.value
                  })}
                  placeholder="I feel energized and healthy. My career is thriving. My relationships are deep and fulfilling..."
                  className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Category Goal */}
          {data.currentStep === 'quarter' && categoryInfo && (
            <div className="space-y-10">
              {/* Category Header */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-100">
                  {categoryInfo.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{categoryInfo.name}</h2>
                  <p className="text-slate-600">{categoryInfo.description}</p>
                </div>
              </div>

              {/* Connected Wheel Areas */}
              {wheelData && (
                <div className="flex flex-wrap gap-2">
                  {getCategoryWheelData(currentCategory).map((area, index) => (
                    <div key={index} className="flex items-center px-3 py-1 bg-slate-100 rounded-full text-sm">
                      <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: area.color}}></div>
                      <span className="font-medium text-slate-700">{area.area}</span>
                      <span className="text-slate-500 ml-1">{area.score}/10</span>
                    </div>
                  ))}
                </div>
              )}

              <hr className="border-slate-200" />

              {/* Goal Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  What's your 12-week goal for {categoryInfo.name.toLowerCase()}?
                </label>
                <div className="relative">
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
                    placeholder="e.g., Get promoted to senior role"
                    className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="absolute top-2 right-3 text-xs text-slate-500">
                    {(data.categoryGoals[currentCategory]?.goal || '').length}/100
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Target Completion Date */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Target completion date
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCategoryGoal(currentCategory, {
                        category: currentCategory as any,
                        goal: data.categoryGoals[currentCategory]?.goal || '',
                        actions: data.categoryGoals[currentCategory]?.actions || [],
                        milestones: data.categoryGoals[currentCategory]?.milestones || [],
                        focus: data.categoryGoals[currentCategory]?.focus || '',
                        wheelAreas: getCategoryWheelData(currentCategory).map(area => area.area),
                        targetScore: data.categoryGoals[currentCategory]?.targetScore || 8,
                        deadline: getTwelveWeeksFromNow()
                      })}
                      className="px-2 py-1 text-xs border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition-colors"
                    >
                      12 weeks
                    </button>
                    <button
                      onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() + 84);
                        updateCategoryGoal(currentCategory, {
                          category: currentCategory as any,
                          goal: data.categoryGoals[currentCategory]?.goal || '',
                          actions: data.categoryGoals[currentCategory]?.actions || [],
                          milestones: data.categoryGoals[currentCategory]?.milestones || [],
                          focus: data.categoryGoals[currentCategory]?.focus || '',
                          wheelAreas: getCategoryWheelData(currentCategory).map(area => area.area),
                          targetScore: data.categoryGoals[currentCategory]?.targetScore || 8,
                          deadline: date.toISOString().split('T')[0]
                        });
                      }}
                      className="px-2 py-1 text-xs border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition-colors"
                    >
                      84 days
                    </button>
                  </div>
                </div>
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
                    className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="text-sm text-slate-600">
                    {getWeeksRemaining(data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow())} weeks • {getDaysRemaining(data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow())} days
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Interactive Milestones Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <Flag className="w-4 h-4 mr-2" />
                    Key Milestones (2–4 checkpoints)
                  </label>
                  <Info className="w-4 h-4 text-slate-400" title="Break your goal into 2-4 key milestones to track progress" />
                </div>
                
                {/* Milestone Timeline */}
                <div className="relative mb-6 pt-6 pb-2">
                  {/* Timeline line */}
                  <div className="absolute left-0 right-0 h-1 bg-slate-200 top-10"></div>
                  
                  {/* Milestone markers */}
                  <div className="flex justify-between relative">
                    {data.categoryGoals[currentCategory]?.milestones.length > 0 ? (
                      data.categoryGoals[currentCategory].milestones.map((milestone, index) => {
                        const MilestoneIcon = getMilestoneIcon(index);
                        const isActive = activeMilestoneId === milestone.id;
                        const status = getMilestoneStatus(milestone);
                        
                        return (
                          <div 
                            key={milestone.id} 
                            className="flex flex-col items-center cursor-pointer"
                            onClick={() => setActiveMilestoneId(isActive ? null : milestone.id)}
                          >
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                                isActive ? 'ring-4 ring-purple-200 scale-110' : ''
                              } ${
                                milestone.completed 
                                  ? 'bg-green-100 text-green-600 border-2 border-green-300' 
                                  : 'bg-white text-slate-600 border-2 border-slate-300'
                              }`}
                            >
                              <MilestoneIcon className="w-5 h-5" />
                            </div>
                            <div className="mt-2 text-xs font-medium text-center max-w-[80px] truncate">
                              {milestone.title || `Milestone ${index + 1}`}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {formatDate(milestone.dueDate)}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full flex justify-center">
                        <div className="text-center text-slate-500 py-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                            <Flag className="w-5 h-5 text-slate-400" />
                          </div>
                          <p className="text-sm">No milestones yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Active Milestone Edit */}
                {activeMilestoneId && data.categoryGoals[currentCategory]?.milestones.find(m => m.id === activeMilestoneId) && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200 animate-fadeIn">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-900">Edit Milestone</h4>
                      <button
                        onClick={() => setActiveMilestoneId(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {(() => {
                      const milestone = data.categoryGoals[currentCategory].milestones.find(m => m.id === activeMilestoneId)!;
                      return (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={milestone.title}
                              onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                              placeholder="Enter milestone title"
                              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={milestone.description}
                              onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                              placeholder="Describe this milestone"
                              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                              rows={2}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Due Date
                              </label>
                              <input
                                type="date"
                                value={milestone.dueDate}
                                onChange={(e) => updateMilestone(milestone.id, { dueDate: e.target.value })}
                                className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Status
                              </label>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => toggleMilestoneCompletion(milestone.id)}
                                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm ${
                                    milestone.completed
                                      ? 'bg-green-100 text-green-700 border border-green-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  {milestone.completed ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      <span>Completed</span>
                                    </>
                                  ) : (
                                    <>
                                      <Circle className="w-4 h-4 mr-1" />
                                      <span>Mark Complete</span>
                                    </>
                                  )}
                                </button>
                                
                                <button
                                  onClick={() => removeMilestone(milestone.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                  title="Delete milestone"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                <button
                  onClick={addMilestone}
                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </button>
              </div>

              <hr className="border-slate-200" />

              {/* Actions */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Weekly Actions
                  </label>
                  <Info className="w-4 h-4 text-slate-400" title="What specific actions will you take each week?" />
                </div>
                
                <div className="space-y-4">
                  {(data.categoryGoals[currentCategory]?.actions || []).map((action, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-all">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={action.text}
                          onChange={(e) => updateAction(index, { text: e.target.value })}
                          placeholder="What action will you take?"
                          className="flex-1 p-2 border-0 bg-transparent focus:ring-0"
                        />
                        <button
                          onClick={() => removeAction(index)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Frequency Selection */}
                      <div className="flex items-center space-x-4 ml-9">
                        <div className="flex space-x-2">
                          {[
                            { value: 'daily', label: 'Daily' },
                            { value: 'weekly', label: 'Weekly' },
                            { value: 'multiple', label: 'Custom' }
                          ].map((freq) => (
                            <button
                              key={freq.value}
                              onClick={() => updateAction(index, { frequency: freq.value as any, specificDays: [] })}
                              className={`px-3 py-1 rounded text-sm transition-all ${
                                action.frequency === freq.value
                                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {freq.label}
                            </button>
                          ))}
                        </div>
                        
                        <span className="text-sm text-slate-500">
                          {getFrequencyDescription(action)}
                        </span>
                      </div>

                      {/* Specific Days Selection */}
                      {action.frequency === 'multiple' && (
                        <div className="mt-3 ml-9 flex space-x-1">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              key={day.value}
                              onClick={() => toggleSpecificDay(index, day.value)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                                action.specificDays?.includes(day.value)
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {day.short.charAt(0)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={addAction}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Action
                  </button>
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
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {data.currentStep === 'annual' ? 'Vision' : `${categoryInfo?.name} (${data.currentCategoryIndex + 1}/${data.categories.length})`}
          </div>

          <button
            onClick={goToNextArea}
            disabled={!canProceed()}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>{data.currentStep === 'quarter' && data.currentCategoryIndex === data.categories.length - 1 ? 'Complete' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Goals;