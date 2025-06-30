import React, { useState, useEffect } from 'react';
import { 
  Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar as CalendarIcon, 
  Plus, Minus, Link, TrendingUp, Clock, Repeat, CheckSquare, 
  Flag, CheckCircle2, Circle, Star, Award, Zap, BarChart3,
  ChevronRight, ChevronDown, Edit3, Trash2, Calendar, Info
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
  const [showAnnualGoalModal, setShowAnnualGoalModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editingAction, setEditingAction] = useState<{index: number, action: ActionItem} | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

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
    
    setEditingAction({
      index: currentGoal.actions.length,
      action: newAction
    });
    setShowActionModal(true);
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

  const saveAction = () => {
    if (editingAction) {
      updateAction(editingAction.index, editingAction.action);
      setEditingAction(null);
      setShowActionModal(false);
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
    
    setEditingMilestone(newMilestone);
    setShowMilestoneModal(true);
  };

  const saveMilestone = () => {
    if (!editingMilestone) return;
    
    const currentGoal = data.categoryGoals[currentCategory];
    if (currentGoal) {
      // Check if this is a new milestone or editing an existing one
      const existingIndex = currentGoal.milestones.findIndex(m => m.id === editingMilestone.id);
      
      if (existingIndex >= 0) {
        // Update existing milestone
        updateMilestone(editingMilestone.id, editingMilestone);
      } else {
        // Add new milestone
        updateCategoryGoal(currentCategory, {
          ...currentGoal,
          milestones: [...currentGoal.milestones, editingMilestone]
        });
      }
    }
    
    setEditingMilestone(null);
    setShowMilestoneModal(false);
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

  const editMilestone = (milestone: Milestone) => {
    setEditingMilestone({...milestone});
    setShowMilestoneModal(true);
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

  const toggleGoalExpansion = (category: string) => {
    if (expandedGoal === category) {
      setExpandedGoal(null);
    } else {
      setExpandedGoal(category);
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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Completion Header */}
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">🎉 Goals Complete!</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            You've successfully set up your annual vision and 12-week goals. Time to make it happen!
          </p>
        </div>

        {/* Annual Vision Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-purple-900">Your Annual Vision</h2>
          </div>
          <blockquote className="text-lg text-purple-800 italic mb-4 leading-relaxed">
            "{data.annualSnapshot.snapshot}"
          </blockquote>
          {data.annualSnapshot.mantra && (
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-purple-700 font-medium">Mantra: "{data.annualSnapshot.mantra}"</span>
            </div>
          )}
        </div>

        {/* Goals Overview */}
        <div className="space-y-6">
          {data.categories.map((category) => {
            const categoryInfo = GOAL_CATEGORIES[category];
            const goal = data.categoryGoals[category];
            
            if (!goal || !goal.goal) return null;
            
            const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
            const totalMilestones = goal.milestones?.length || 0;
            const weeksRemaining = getWeeksRemaining(goal.deadline);
            const isExpanded = expandedGoal === category;
            
            return (
              <div key={category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300">
                {/* Goal Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleGoalExpansion(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                        {categoryInfo.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{goal.goal}</h3>
                        <div className="flex items-center space-x-3 text-sm text-slate-500">
                          <span>{categoryInfo.name}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {weeksRemaining} weeks remaining
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-slate-500">Milestones</div>
                        <div className="font-medium">{completedMilestones}/{totalMilestones}</div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} />
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: totalMilestones > 0 ? `${(completedMilestones / totalMilestones) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                
                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-6 animate-fadeIn">
                    {/* Milestones */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900 flex items-center">
                          <Flag className="w-4 h-4 mr-2 text-orange-500" />
                          Milestones
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addMilestone();
                          }}
                          className="flex items-center space-x-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </div>
                      
                      {goal.milestones.length > 0 ? (
                        <div className="space-y-2">
                          {goal.milestones.map((milestone) => (
                            <div 
                              key={milestone.id} 
                              className={`p-3 rounded-lg border flex items-center justify-between ${
                                milestone.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMilestoneCompletion(milestone.id);
                                  }}
                                >
                                  {milestone.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-slate-400" />
                                  )}
                                </button>
                                <span className={`font-medium ${milestone.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                  {milestone.title}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-slate-500">{formatDate(milestone.dueDate)}</span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      editMilestone(milestone);
                                    }}
                                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeMilestone(milestone.id);
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                          <p className="text-slate-500">No milestones yet</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addMilestone();
                            }}
                            className="mt-2 text-purple-600 font-medium hover:text-purple-700"
                          >
                            + Add your first milestone
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Weekly Actions */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900 flex items-center">
                          <CheckSquare className="w-4 h-4 mr-2 text-blue-500" />
                          Weekly Actions
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addAction();
                          }}
                          className="flex items-center space-x-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </div>
                      
                      {goal.actions.length > 0 ? (
                        <div className="space-y-2">
                          {goal.actions.map((action, index) => (
                            <div 
                              key={index} 
                              className="p-3 rounded-lg border border-slate-200 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">{action.text}</div>
                                  <div className="text-xs text-slate-500 flex items-center">
                                    <Repeat className="w-3 h-3 mr-1" />
                                    {getFrequencyDescription(action)}
                                    {action.frequency === 'multiple' && action.specificDays && action.specificDays.length > 0 && (
                                      <span className="ml-1">
                                        ({action.specificDays.map(d => d[0].toUpperCase()).join(', ')})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAction({index, action: {...action}});
                                    setShowActionModal(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeAction(index);
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                          <p className="text-slate-500">No actions yet</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addAction();
                            }}
                            className="mt-2 text-purple-600 font-medium hover:text-purple-700"
                          >
                            + Add your first action
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Take Action?</h3>
          <p className="text-blue-100 mb-6 text-lg">
            Your goals are set. Now schedule your actions and start making progress.
          </p>
          <button
            onClick={() => window.location.href = '/calendar'}
            className="inline-flex items-center space-x-2 px-8 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
          >
            <CalendarIcon className="w-5 h-5" />
            <span>Schedule Your Actions</span>
          </button>
        </div>
      </div>
    );
  }

  const categoryInfo = currentCategory ? GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Goal Setting</h1>
        <p className="text-slate-600 text-lg">From annual vision to weekly actions</p>
        {lastSaved && (
          <p className="text-sm text-green-600 mt-2">
            ✓ Saved at {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${data.currentStep === 'annual' ? 'text-purple-600' : 'text-green-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              data.currentStep === 'annual' ? 'bg-purple-600 text-white' : 'bg-green-100 text-green-600'
            }`}>
              {data.currentStep === 'annual' ? '1' : <Check className="w-5 h-5" />}
            </div>
            <span className="font-medium">Annual Vision</span>
          </div>
          
          <div className="w-8 h-0.5 bg-slate-200"></div>
          
          <div className={`flex items-center space-x-2 ${data.currentStep === 'quarter' ? 'text-purple-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              data.currentStep === 'quarter' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              2
            </div>
            <span className="font-medium">90-Day Goals</span>
          </div>
          
          <div className="w-8 h-0.5 bg-slate-200"></div>
          
          <div className="flex items-center space-x-2 text-slate-400">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
              3
            </div>
            <span className="font-medium">Weekly Actions</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        {/* Annual Snapshot */}
        {data.currentStep === 'annual' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Annual Vision</h2>
              <p className="text-slate-600">Imagine yourself one year from now...</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-slate-900 mb-3">
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
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-slate-900 mb-3">
                  Personal mantra <span className="text-sm font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={data.annualSnapshot.mantra || ''}
                  onChange={(e) => updateAnnualSnapshot({
                    ...data.annualSnapshot,
                    mantra: e.target.value
                  })}
                  placeholder="Living with purpose and joy"
                  className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Category Goal */}
        {data.currentStep === 'quarter' && categoryInfo && (
          <div className="space-y-8">
            {/* Category Header */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-slate-100 mx-auto mb-4">
                {categoryInfo.icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{categoryInfo.name}</h2>
              <p className="text-slate-600">{categoryInfo.description}</p>
            </div>

            {/* Connected Wheel Areas */}
            {wheelData && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {getCategoryWheelData(currentCategory).map((area, index) => (
                  <div key={index} className="flex items-center px-3 py-1 bg-slate-100 rounded-full text-sm">
                    <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: area.color}}></div>
                    <span className="font-medium text-slate-700">{area.area}</span>
                    <span className="text-slate-500 ml-1">{area.score}/10</span>
                  </div>
                ))}
              </div>
            )}

            {/* Goal Input */}
            <div className="space-y-3">
              <label className="block text-lg font-medium text-slate-900">
                What's your 90-day goal?
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
                className="w-full p-4 text-lg border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Deadline */}
            <div className="flex items-center space-x-6">
              <div className="flex-1">
                <label className="block text-lg font-medium text-slate-900 mb-3">
                  Target completion date
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
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {getWeeksRemaining(data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow())} weeks
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-slate-900">Key Milestones</h3>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-slate-400 cursor-help" />
                    <div className="absolute left-full ml-2 w-64 p-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Milestones are key checkpoints that mark significant progress toward your goal.
                    </div>
                  </div>
                </div>
                <button
                  onClick={addMilestone}
                  className="flex items-center space-x-1 px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Milestone</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {(data.categoryGoals[currentCategory]?.milestones || []).length > 0 ? (
                  <div className="space-y-3">
                    {data.categoryGoals[currentCategory]?.milestones.map((milestone, index) => (
                      <div 
                        key={milestone.id} 
                        className={`p-4 rounded-lg border ${
                          milestone.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
                        } hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleMilestoneCompletion(milestone.id)}
                              className="flex-shrink-0"
                            >
                              {milestone.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                            <div>
                              <h4 className={`font-medium ${milestone.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                {milestone.title}
                              </h4>
                              {milestone.description && (
                                <p className="text-sm text-slate-500 mt-1">{milestone.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 text-sm text-slate-500">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(milestone.dueDate)}</span>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => editMilestone(milestone)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeMilestone(milestone.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    onClick={addMilestone}
                    className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <Flag className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-600 mb-1">No milestones yet</p>
                    <p className="text-purple-600 font-medium">+ Add your first milestone</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-slate-900">Weekly Actions</h3>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-slate-400 cursor-help" />
                    <div className="absolute left-full ml-2 w-64 p-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Actions are the specific tasks you'll do regularly to achieve your milestones.
                    </div>
                  </div>
                </div>
                <button
                  onClick={addAction}
                  className="flex items-center space-x-1 px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Action</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {(data.categoryGoals[currentCategory]?.actions || []).length > 0 ? (
                  <div className="space-y-3">
                    {data.categoryGoals[currentCategory]?.actions.map((action, index) => (
                      <div 
                        key={index} 
                        className="p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">{action.text}</h4>
                              <div className="flex items-center text-xs text-slate-500 mt-1">
                                <Repeat className="w-3 h-3 mr-1" />
                                <span>{getFrequencyDescription(action)}</span>
                                {action.frequency === 'multiple' && action.specificDays && action.specificDays.length > 0 && (
                                  <span className="ml-1">
                                    ({action.specificDays.map(d => d[0].toUpperCase()).join(', ')})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setEditingAction({index, action: {...action}});
                                setShowActionModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeAction(index)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    onClick={addAction}
                    className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-600 mb-1">No actions yet</p>
                    <p className="text-purple-600 font-medium">+ Add your first action</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-200 mt-8">
          <button
            onClick={goToPreviousArea}
            disabled={data.currentStep === 'annual'}
            className="flex items-center space-x-2 px-6 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={goToNextArea}
            disabled={!canProceed()}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            <span>{data.currentStep === 'quarter' && data.currentCategoryIndex === data.categories.length - 1 ? 'Complete' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Milestone Modal */}
      {showMilestoneModal && editingMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingMilestone.id.includes(Date.now().toString().substring(0, 8)) ? 'Add Milestone' : 'Edit Milestone'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone({...editingMilestone, title: e.target.value})}
                  placeholder="e.g., Complete first draft"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={editingMilestone.description}
                  onChange={(e) => setEditingMilestone({...editingMilestone, description: e.target.value})}
                  placeholder="Add more details about this milestone..."
                  className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editingMilestone.dueDate}
                  onChange={(e) => setEditingMilestone({...editingMilestone, dueDate: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setEditingMilestone(null);
                    setShowMilestoneModal(false);
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveMilestone}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && editingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingAction.action.text ? 'Edit Action' : 'Add Action'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  What action will you take?
                </label>
                <input
                  type="text"
                  value={editingAction.action.text}
                  onChange={(e) => setEditingAction({
                    ...editingAction, 
                    action: {...editingAction.action, text: e.target.value}
                  })}
                  placeholder="e.g., Review progress with team"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Frequency
                </label>
                <div className="flex space-x-3">
                  {[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'multiple', label: 'Custom' }
                  ].map((freq) => (
                    <button
                      key={freq.value}
                      onClick={() => setEditingAction({
                        ...editingAction,
                        action: {
                          ...editingAction.action, 
                          frequency: freq.value as any,
                          specificDays: freq.value === 'multiple' ? editingAction.action.specificDays : []
                        }
                      })}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        editingAction.action.frequency === freq.value
                          ? 'bg-purple-100 text-purple-700 font-medium border border-purple-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Specific Days Selection */}
              {editingAction.action.frequency === 'multiple' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => {
                          const currentDays = editingAction.action.specificDays || [];
                          const newDays = currentDays.includes(day.value)
                            ? currentDays.filter(d => d !== day.value)
                            : [...currentDays, day.value];
                          
                          setEditingAction({
                            ...editingAction,
                            action: {...editingAction.action, specificDays: newDays}
                          });
                        }}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          editingAction.action.specificDays?.includes(day.value)
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setEditingAction(null);
                    setShowActionModal(false);
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAction}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;