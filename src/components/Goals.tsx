import React, { useState, useEffect } from 'react';
import { 
  Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar as CalendarIcon, 
  Plus, Minus, Link, TrendingUp, Clock, Repeat, CheckSquare, 
  Flag, CheckCircle2, Circle, Star, Award, Zap, BarChart3, X, Edit3, Save
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
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editingAction, setEditingAction] = useState<{ action: ActionItem; index: number } | null>(null);
  const [currentEditingCategory, setCurrentEditingCategory] = useState<string>('');

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

  // Handle adding/removing milestones
  const addMilestone = (category: string) => {
    setCurrentEditingCategory(category);
    setEditingMilestone({
      id: Date.now().toString(),
      title: '',
      description: '',
      dueDate: getTwelveWeeksFromNow(),
      completed: false
    });
    setShowMilestoneModal(true);
  };

  const editMilestone = (category: string, milestone: Milestone) => {
    setCurrentEditingCategory(category);
    setEditingMilestone(milestone);
    setShowMilestoneModal(true);
  };

  const saveMilestone = () => {
    if (!editingMilestone || !currentEditingCategory) return;

    const currentGoal = data.categoryGoals[currentEditingCategory] || { 
      category: currentEditingCategory as any, 
      goal: '', 
      actions: [], 
      milestones: [],
      focus: '',
      wheelAreas: [],
      targetScore: 8,
      deadline: getTwelveWeeksFromNow()
    };

    const existingIndex = currentGoal.milestones.findIndex(m => m.id === editingMilestone.id);
    let newMilestones;

    if (existingIndex >= 0) {
      // Update existing milestone
      newMilestones = [...currentGoal.milestones];
      newMilestones[existingIndex] = editingMilestone;
    } else {
      // Add new milestone
      newMilestones = [...currentGoal.milestones, editingMilestone];
    }

    updateCategoryGoal(currentEditingCategory, {
      ...currentGoal,
      milestones: newMilestones
    });

    setShowMilestoneModal(false);
    setEditingMilestone(null);
    setCurrentEditingCategory('');
  };

  const removeMilestone = (category: string, milestoneId: string) => {
    const currentGoal = data.categoryGoals[category];
    if (currentGoal) {
      updateCategoryGoal(category, {
        ...currentGoal,
        milestones: currentGoal.milestones.filter(m => m.id !== milestoneId)
      });
    }
  };

  const toggleMilestoneCompletion = (category: string, milestoneId: string) => {
    const currentGoal = data.categoryGoals[category];
    if (currentGoal) {
      const milestone = currentGoal.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        const updatedMilestone = {
          ...milestone,
          completed: !milestone.completed,
          completedDate: !milestone.completed ? new Date().toISOString().split('T')[0] : undefined
        };
        
        const newMilestones = currentGoal.milestones.map(m => 
          m.id === milestoneId ? updatedMilestone : m
        );

        updateCategoryGoal(category, {
          ...currentGoal,
          milestones: newMilestones
        });
      }
    }
  };

  // Handle adding/removing actions
  const addAction = (category: string) => {
    setCurrentEditingCategory(category);
    setEditingAction({
      action: {
        text: '',
        frequency: 'weekly',
        specificDays: []
      },
      index: -1
    });
    setShowActionModal(true);
  };

  const editAction = (category: string, action: ActionItem, index: number) => {
    setCurrentEditingCategory(category);
    setEditingAction({ action, index });
    setShowActionModal(true);
  };

  const saveAction = () => {
    if (!editingAction || !currentEditingCategory) return;

    const currentGoal = data.categoryGoals[currentEditingCategory] || { 
      category: currentEditingCategory as any, 
      goal: '', 
      actions: [], 
      milestones: [],
      focus: '',
      wheelAreas: [],
      targetScore: 8,
      deadline: getTwelveWeeksFromNow()
    };

    let newActions;
    if (editingAction.index >= 0) {
      // Update existing action
      newActions = [...currentGoal.actions];
      newActions[editingAction.index] = editingAction.action;
    } else {
      // Add new action
      newActions = [...currentGoal.actions, editingAction.action];
    }

    updateCategoryGoal(currentEditingCategory, {
      ...currentGoal,
      actions: newActions
    });

    setShowActionModal(false);
    setEditingAction(null);
    setCurrentEditingCategory('');
  };

  const removeAction = (category: string, index: number) => {
    const currentGoal = data.categoryGoals[category];
    if (currentGoal) {
      updateCategoryGoal(category, {
        ...currentGoal,
        actions: currentGoal.actions.filter((_, i) => i !== index)
      });
    }
  };

  const toggleSpecificDay = (day: string) => {
    if (!editingAction) return;
    
    const currentDays = editingAction.action.specificDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    setEditingAction({
      ...editingAction,
      action: { ...editingAction.action, specificDays: newDays }
    });
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">12-Week Goals</h1>
          <p className="text-slate-600 mt-2">Transform your annual vision into actionable quarterly goals</p>
          {lastSaved && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Saved at {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>{showTips ? "Hide Tips" : "Show Tips"}</span>
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
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 animate-fadeIn">
          <h3 className="text-sm font-medium text-indigo-900 mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Quick Tips
          </h3>
          <ul className="space-y-1 text-sm text-indigo-800">
            <li className="flex items-start">
              <span className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
              <span>Make goals <strong>specific and measurable</strong></span>
            </li>
            <li className="flex items-start">
              <span className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
              <span>Break down into <strong>small, actionable steps</strong></span>
            </li>
          </ul>
        </div>
      )}

      {/* Annual Vision Section */}
      {data.currentStep === 'annual' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Annual Vision</h2>
              <p className="text-slate-600">Imagine it's one year from now and you're living your ideal life...</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vision Statement
                </label>
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
          </div>

          {/* Three Category Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.categories.map((category) => {
              const categoryInfo = GOAL_CATEGORIES[category];
              const goal = data.categoryGoals[category];
              
              return (
                <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                      {categoryInfo.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{categoryInfo.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{categoryInfo.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Annual Goal Title
                    </label>
                    <input
                      type="text"
                      value={goal?.goal || ''}
                      onChange={(e) => updateCategoryGoal(category, {
                        category: category as any,
                        goal: e.target.value,
                        actions: goal?.actions || [],
                        milestones: goal?.milestones || [],
                        focus: goal?.focus || '',
                        wheelAreas: getCategoryWheelData(category).map(area => area.area),
                        targetScore: goal?.targetScore || 8,
                        deadline: goal?.deadline || getTwelveWeeksFromNow()
                      })}
                      placeholder={categoryInfo.examples[0]}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Connected Wheel Areas */}
                  {wheelData && (
                    <div className="mt-4">
                      <div className="text-xs text-slate-500 mb-2">Connected life areas:</div>
                      <div className="flex flex-wrap gap-1">
                        {getCategoryWheelData(category).map((area, index) => (
                          <div key={index} className="flex items-center px-2 py-1 bg-slate-100 rounded-full text-xs">
                            <div className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: area.color}}></div>
                            <span className="font-medium text-slate-700">{area.area}</span>
                            <span className="text-slate-500 ml-1">{area.score}/10</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Goal Section */}
      {data.currentStep === 'quarter' && (
        <div className="space-y-6">
          {data.categories.map((category, index) => {
            const categoryInfo = GOAL_CATEGORIES[category];
            const goal = data.categoryGoals[category];
            const isActive = index === data.currentCategoryIndex;
            
            if (!isActive) return null;

            return (
              <div key={category} className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-slate-100">
                    {categoryInfo.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{categoryInfo.name}</h2>
                    <p className="text-slate-600">{categoryInfo.description}</p>
                  </div>
                </div>

                {/* Connected Wheel Areas */}
                {wheelData && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {getCategoryWheelData(category).map((area, index) => (
                      <div key={index} className="flex items-center px-3 py-1 bg-slate-100 rounded-full text-sm">
                        <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: area.color}}></div>
                        <span className="font-medium text-slate-700">{area.area}</span>
                        <span className="text-slate-500 ml-1">{area.score}/10</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      12-Week Goal
                    </label>
                    <input
                      type="text"
                      value={goal?.goal || ''}
                      onChange={(e) => updateCategoryGoal(category, {
                        category: category as any,
                        goal: e.target.value,
                        actions: goal?.actions || [],
                        milestones: goal?.milestones || [],
                        focus: goal?.focus || '',
                        wheelAreas: getCategoryWheelData(category).map(area => area.area),
                        targetScore: goal?.targetScore || 8,
                        deadline: goal?.deadline || getTwelveWeeksFromNow()
                      })}
                      placeholder={categoryInfo.examples[0]}
                      className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                    />
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Target Completion Date
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="date"
                        value={goal?.deadline || getTwelveWeeksFromNow()}
                        onChange={(e) => updateCategoryGoal(category, {
                          category: category as any,
                          goal: goal?.goal || '',
                          actions: goal?.actions || [],
                          milestones: goal?.milestones || [],
                          focus: goal?.focus || '',
                          wheelAreas: getCategoryWheelData(category).map(area => area.area),
                          targetScore: goal?.targetScore || 8,
                          deadline: e.target.value
                        })}
                        className="p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{getWeeksRemaining(goal?.deadline || getTwelveWeeksFromNow())} weeks</span>
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-slate-700 flex items-center">
                        <Flag className="w-4 h-4 mr-2" />
                        Key Milestones (2-4 checkpoints)
                      </label>
                      <button
                        onClick={() => addMilestone(category)}
                        className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Milestone</span>
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(goal?.milestones || []).map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleMilestoneCompletion(category, milestone.id)}
                              className="flex-shrink-0"
                            >
                              {milestone.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                            <div>
                              <div className={`font-medium ${milestone.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                {milestone.title}
                              </div>
                              <div className="text-sm text-slate-500">
                                Due: {formatDate(milestone.dueDate)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => editMilestone(category, milestone)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeMilestone(category, milestone.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {(goal?.milestones || []).length === 0 && (
                        <button
                          onClick={() => addMilestone(category)}
                          className="w-full py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add your first milestone
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-slate-700 flex items-center">
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Weekly Actions
                      </label>
                      <button
                        onClick={() => addAction(category)}
                        className="flex items-center space-x-2 px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Action</span>
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(goal?.actions || []).map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{action.text}</div>
                              <div className="text-sm text-slate-500 flex items-center">
                                <Repeat className="w-3 h-3 mr-1" />
                                {getFrequencyDescription(action)}
                                {action.frequency === 'multiple' && action.specificDays && (
                                  <span className="ml-1">
                                    ({action.specificDays.map(d => d[0].toUpperCase()).join(', ')})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => editAction(category, action, index)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeAction(category, index)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {(goal?.actions || []).length === 0 && (
                        <button
                          onClick={() => addAction(category)}
                          className="w-full py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add your first action
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={goToPreviousArea}
          disabled={data.currentStep === 'annual'}
          className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
          {data.currentStep === 'annual' ? 'Annual Vision' : `${GOAL_CATEGORIES[data.categories[data.currentCategoryIndex]]?.name} (${data.currentCategoryIndex + 1}/${data.categories.length})`}
        </div>

        <button
          onClick={goToNextArea}
          disabled={!canProceed()}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          <span>{data.currentStep === 'quarter' && data.currentCategoryIndex === data.categories.length - 1 ? 'Complete' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Milestone Modal */}
      {showMilestoneModal && editingMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingMilestone.title ? 'Edit Milestone' : 'Add Milestone'}
              </h3>
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Milestone Title
                </label>
                <input
                  type="text"
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone({
                    ...editingMilestone,
                    title: e.target.value
                  })}
                  placeholder="e.g., Complete leadership training"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={editingMilestone.description || ''}
                  onChange={(e) => setEditingMilestone({
                    ...editingMilestone,
                    description: e.target.value
                  })}
                  placeholder="Additional details about this milestone"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editingMilestone.dueDate}
                  onChange={(e) => setEditingMilestone({
                    ...editingMilestone,
                    dueDate: e.target.value
                  })}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveMilestone}
                disabled={!editingMilestone.title.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Milestone</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && editingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingAction.index >= 0 ? 'Edit Action' : 'Add Action'}
              </h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Action Description
                </label>
                <input
                  type="text"
                  value={editingAction.action.text}
                  onChange={(e) => setEditingAction({
                    ...editingAction,
                    action: { ...editingAction.action, text: e.target.value }
                  })}
                  placeholder="e.g., Review and update resume"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Frequency
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'daily', label: 'Daily', description: 'Every day' },
                    { value: 'weekly', label: 'Weekly', description: 'Once per week' },
                    { value: 'multiple', label: 'Custom', description: 'Specific days of the week' }
                  ].map((freq) => (
                    <label key={freq.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="frequency"
                        value={freq.value}
                        checked={editingAction.action.frequency === freq.value}
                        onChange={(e) => setEditingAction({
                          ...editingAction,
                          action: { 
                            ...editingAction.action, 
                            frequency: e.target.value as any,
                            specificDays: e.target.value === 'multiple' ? [] : undefined
                          }
                        })}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-medium text-slate-900">{freq.label}</div>
                        <div className="text-sm text-slate-500">{freq.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {editingAction.action.frequency === 'multiple' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Days
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingAction.action.specificDays?.includes(day.value) || false}
                          onChange={() => toggleSpecificDay(day.value)}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-slate-700">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAction}
                disabled={!editingAction.action.text.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Action</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;