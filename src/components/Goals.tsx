import React, { useState, useEffect } from 'react';
import { 
  Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar as CalendarIcon, 
  Plus, X, Clock, Flag, CheckCircle2, Circle, Star, Award, Zap, BarChart3,
  ChevronDown, ChevronRight, Edit3, Save, Info, TrendingUp, AlertCircle
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(true);
  const [goalCharCount, setGoalCharCount] = useState(0);

  // Initialize from wheel data
  useEffect(() => {
    if (wheelData && wheelData.length > 0 && !hasInitialized) {
      initializeFromWheelData(wheelData);
      setHasInitialized(true);
    }
  }, [wheelData, hasInitialized, initializeFromWheelData]);

  // Update character count when goal changes
  useEffect(() => {
    if (data.currentStep === 'quarter') {
      const currentCategory = getCurrentCategory();
      const goalText = data.categoryGoals[currentCategory]?.goal || '';
      setGoalCharCount(goalText.length);
    }
  }, [data.currentStep, data.categoryGoals, getCurrentCategory]);

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

  // Calculate days remaining
  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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
  const addAction = (category: string) => {
    const currentGoal = data.categoryGoals[category] || { 
      category: category as any, 
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
    
    updateCategoryGoal(category, {
      ...currentGoal,
      actions: [...currentGoal.actions, newAction]
    });
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

  const updateAction = (category: string, index: number, updates: Partial<ActionItem>) => {
    const currentGoal = data.categoryGoals[category];
    if (currentGoal) {
      const newActions = [...currentGoal.actions];
      newActions[index] = { ...newActions[index], ...updates };
      updateCategoryGoal(category, {
        ...currentGoal,
        actions: newActions
      });
    }
  };

  // Handle adding/removing milestones
  const addMilestone = (category: string) => {
    const currentGoal = data.categoryGoals[category] || { 
      category: category as any, 
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
    
    updateCategoryGoal(category, {
      ...currentGoal,
      milestones: [...currentGoal.milestones, newMilestone]
    });
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

  const updateMilestone = (category: string, milestoneId: string, updates: Partial<Milestone>) => {
    const currentGoal = data.categoryGoals[category];
    if (currentGoal) {
      const newMilestones = currentGoal.milestones.map(milestone => 
        milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
      );
      updateCategoryGoal(category, {
        ...currentGoal,
        milestones: newMilestones
      });
    }
  };

  const toggleMilestoneCompletion = (category: string, milestoneId: string) => {
    const currentGoal = data.categoryGoals[category];
    if (currentGoal) {
      const milestone = currentGoal.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        const updates: Partial<Milestone> = {
          completed: !milestone.completed,
          completedDate: !milestone.completed ? new Date().toISOString().split('T')[0] : undefined
        };
        updateMilestone(category, milestoneId, updates);
      }
    }
  };

  // Get milestone status
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

  // Get frequency description
  const getFrequencyDescription = (action: ActionItem) => {
    switch (action.frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return 'Once a week';
      case 'multiple':
        if (action.specificDays && action.specificDays.length > 0) {
          return `${action.specificDays.length} days/week`;
        }
        return 'Multiple days';
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
      <div className="space-y-8">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">🎯 Your Goals Are Set!</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            You've created a complete roadmap from your annual vision down to weekly actions. 
            Time to make it happen!
          </p>
        </div>
          
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Annual Vision */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Your Annual Vision</h3>
            </div>
            <div className="text-xl italic mb-4 bg-white/10 rounded-lg p-6">
              "{data.annualSnapshot.snapshot}"
            </div>
            {data.annualSnapshot.mantra && (
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-300 mr-2" />
                <span className="text-lg">Mantra: "{data.annualSnapshot.mantra}"</span>
              </div>
            )}
          </div>

          {/* Goals Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {data.categories.map((category) => {
              const categoryInfo = GOAL_CATEGORIES[category];
              const goal = data.categoryGoals[category];
              
              if (!goal || !goal.goal) return null;
              
              const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
              const totalMilestones = goal.milestones?.length || 0;
              const completedActions = goal.actions?.filter(a => a.text.trim()).length || 0;
              
              return (
                <div key={category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-3xl">{categoryInfo.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{categoryInfo.name}</h3>
                        <div className="flex items-center text-sm text-slate-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{getWeeksRemaining(goal.deadline)} weeks left</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-medium text-slate-800 bg-slate-50 rounded-lg p-4">
                      {goal.goal}
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="p-6 bg-slate-50">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{completedMilestones}/{totalMilestones}</div>
                        <div className="text-sm text-slate-600">Milestones</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{completedActions}</div>
                        <div className="text-sm text-slate-600">Actions</div>
                      </div>
                    </div>

                    {/* Milestones Preview */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-slate-900 flex items-center">
                          <Flag className="w-4 h-4 mr-2 text-orange-500" />
                          Key Milestones
                        </h4>
                        {goal.milestones.slice(0, 3).map((milestone) => (
                          <div key={milestone.id} className="flex items-center space-x-2 text-sm">
                            {milestone.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400" />
                            )}
                            <span className={milestone.completed ? 'line-through text-slate-500' : 'text-slate-700'}>
                              {milestone.title || `Milestone ${goal.milestones.indexOf(milestone) + 1}`}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {formatDate(milestone.dueDate)}
                            </span>
                          </div>
                        ))}
                        {goal.milestones.length > 3 && (
                          <div className="text-xs text-slate-500">
                            +{goal.milestones.length - 3} more milestones
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions Preview */}
                    {goal.actions && goal.actions.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="font-medium text-slate-900 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-blue-500" />
                          Weekly Actions
                        </h4>
                        {goal.actions.slice(0, 2).map((action, index) => (
                          <div key={index} className="text-sm text-slate-700 bg-white rounded p-2">
                            • {action.text || 'Action not defined'}
                          </div>
                        ))}
                        {goal.actions.length > 2 && (
                          <div className="text-xs text-slate-500">
                            +{goal.actions.length - 2} more actions
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Take Action?</h3>
            <p className="text-blue-100 mb-6 text-lg">
              Your goals are set. Now schedule your weekly actions and start making progress.
            </p>
            
            <button
              onClick={() => window.location.href = '/calendar'}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-lg shadow-lg"
            >
              <CalendarIcon className="w-6 h-6" />
              <span>Schedule Your Actions</span>
              <ArrowRight className="w-5 h-5" />
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
          <h1 className="text-3xl font-bold text-slate-900">Goal Setting</h1>
          <p className="text-slate-600 mt-2">
            Transform your annual vision into actionable 12-week goals
          </p>
          {lastSaved && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Saved at {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTips(!showTips)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showTips 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{showTips ? 'Hide Tips' : 'Show Tips'}</span>
          </button>
          
          <button 
            onClick={saveData}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Progress</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-slate-900">Overall Progress</div>
          <div className="text-sm text-slate-600">{progress.completed}/{progress.total} complete</div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Tips Section */}
      {showTips && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 rounded-full p-2 mt-1">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Goal Setting Tips</h3>
              <div className="text-blue-800 space-y-2 text-sm">
                {data.currentStep === 'annual' ? (
                  <>
                    <p>• Start with a clear vision of what you want your life to look like in one year</p>
                    <p>• Be specific about how you'll feel, what you'll have accomplished, and what will be different</p>
                    <p>• Your annual vision guides all your 12-week goals</p>
                  </>
                ) : (
                  <>
                    <p>• Break your 12-week goal into 2-4 milestone checkpoints</p>
                    <p>• Create weekly actions that directly support your milestones</p>
                    <p>• Be specific about frequency - when and how often will you take each action?</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Annual Vision Step */}
      {data.currentStep === 'annual' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Annual Vision</h2>
            <p className="text-slate-600">Imagine yourself one year from now...</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Describe your ideal life one year from today
              </label>
              <textarea
                value={data.annualSnapshot.snapshot}
                onChange={(e) => updateAnnualSnapshot({
                  ...data.annualSnapshot,
                  snapshot: e.target.value
                })}
                placeholder="I feel energized and healthy. My career is thriving with new opportunities. My relationships are deeper and more fulfilling. I have better work-life balance and pursue hobbies I'm passionate about..."
                className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Personal mantra or theme for the year <span className="text-slate-500">(optional)</span>
              </label>
              <input
                type="text"
                value={data.annualSnapshot.mantra || ''}
                onChange={(e) => updateAnnualSnapshot({
                  ...data.annualSnapshot,
                  mantra: e.target.value
                })}
                placeholder="Living with purpose and intention"
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Category Goals Step */}
      {data.currentStep === 'quarter' && (
        <div className="space-y-6">
          {/* Category Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.categories.map((category, index) => {
              const categoryInfo = GOAL_CATEGORIES[category];
              const isActive = index === data.currentCategoryIndex;
              const isCompleted = data.categoryGoals[category]?.goal?.trim();
              
              return (
                <div
                  key={category}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isActive 
                      ? 'border-purple-500 bg-purple-50' 
                      : isCompleted
                      ? 'border-green-300 bg-green-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{categoryInfo.icon}</div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{categoryInfo.name}</h3>
                      <p className="text-xs text-slate-600">{categoryInfo.description}</p>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Category Goal */}
          {currentCategory && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-purple-100">
                  {GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES].icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES].name}
                  </h2>
                  <p className="text-slate-600">
                    {GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES].description}
                  </p>
                </div>
              </div>

              {/* Connected Wheel Areas with Mini Rings */}
              {wheelData && (
                <div className="flex flex-wrap gap-3 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm font-medium text-slate-700 mr-2">Life Areas:</div>
                  {getCategoryWheelData(currentCategory).map((area, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                      {/* Mini ring visualization */}
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
                          <circle 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            fill="none" 
                            stroke={area.color} 
                            strokeWidth="3"
                            strokeDasharray={`${(area.score/10) * 62.83} 62.83`} 
                            transform="rotate(-90 12 12)"
                          />
                          <text 
                            x="12" 
                            y="12" 
                            textAnchor="middle" 
                            dominantBaseline="middle" 
                            fill={area.darkColor}
                            fontSize="8"
                            fontWeight="bold"
                          >
                            {area.score}
                          </text>
                        </svg>
                      </div>
                      <span className="font-medium text-slate-700">{area.area}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-8">
                {/* Main Goal */}
                <div className="border-b border-slate-200 pb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-lg font-medium text-slate-900">
                      What's your 12-week goal for {GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES].name.toLowerCase()}?
                    </label>
                    <div className="text-sm text-slate-500">
                      {goalCharCount}/100 characters
                    </div>
                  </div>
                  <input
                    type="text"
                    value={data.categoryGoals[currentCategory]?.goal || ''}
                    onChange={(e) => {
                      const newValue = e.target.value.slice(0, 100);
                      updateCategoryGoal(currentCategory, {
                        category: currentCategory as any,
                        goal: newValue,
                        actions: data.categoryGoals[currentCategory]?.actions || [],
                        milestones: data.categoryGoals[currentCategory]?.milestones || [],
                        focus: data.categoryGoals[currentCategory]?.focus || '',
                        wheelAreas: getCategoryWheelData(currentCategory).map(area => area.area),
                        targetScore: data.categoryGoals[currentCategory]?.targetScore || 8,
                        deadline: data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow()
                      });
                      setGoalCharCount(newValue.length);
                    }}
                    placeholder={`e.g., ${GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES].examples[0]}`}
                    className="w-full p-4 text-lg border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={100}
                  />
                  
                  {/* Example Goals */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES].examples.slice(0, 3).map((example, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const newValue = example.slice(0, 100);
                          updateCategoryGoal(currentCategory, {
                            category: currentCategory as any,
                            goal: newValue,
                            actions: data.categoryGoals[currentCategory]?.actions || [],
                            milestones: data.categoryGoals[currentCategory]?.milestones || [],
                            focus: data.categoryGoals[currentCategory]?.focus || '',
                            wheelAreas: getCategoryWheelData(currentCategory).map(area => area.area),
                            targetScore: data.categoryGoals[currentCategory]?.targetScore || 8,
                            deadline: data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow()
                          });
                          setGoalCharCount(newValue.length);
                        }}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deadline with visual countdown */}
                <div className="border-b border-slate-200 pb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-lg font-medium text-slate-900 flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2 text-purple-500" />
                      Target Completion Date
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const twelveWeeksDate = getTwelveWeeksFromNow();
                          updateCategoryGoal(currentCategory, {
                            ...data.categoryGoals[currentCategory],
                            deadline: twelveWeeksDate
                          });
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                      >
                        Set to 12 weeks
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow()}
                        onChange={(e) => updateCategoryGoal(currentCategory, {
                          ...data.categoryGoals[currentCategory],
                          deadline: e.target.value
                        })}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          {getWeeksRemaining(data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow())} weeks
                        </span>
                      </div>
                      
                      <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="font-medium">
                          {getDaysRemaining(data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow())} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div className="border-b border-slate-200 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Flag className="w-5 h-5 text-orange-500" />
                      <h3 className="text-lg font-medium text-slate-900">Key Milestones (2-4 checkpoints)</h3>
                      <button
                        className="ml-2 text-slate-400 hover:text-slate-600 group relative"
                      >
                        <Info className="w-4 h-4" />
                        <div className="absolute left-full ml-2 w-64 bg-slate-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Break your goal into 2-4 key checkpoints that mark significant progress toward your goal
                        </div>
                      </button>
                    </div>
                    <button
                      onClick={() => addMilestone(currentCategory)}
                      className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Milestone</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(data.categoryGoals[currentCategory]?.milestones || []).map((milestone, index) => {
                      const status = getMilestoneStatus(milestone);
                      
                      return (
                        <div 
                          key={milestone.id} 
                          className={`flex items-center space-x-3 p-4 rounded-lg border ${
                            milestone.completed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          } transition-all`}
                        >
                          <button
                            onClick={() => toggleMilestoneCompletion(currentCategory, milestone.id)}
                            className="flex-shrink-0"
                          >
                            {milestone.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <input
                              type="text"
                              value={milestone.title}
                              onChange={(e) => updateMilestone(currentCategory, milestone.id, { title: e.target.value })}
                              placeholder={`Milestone ${index + 1}: ${GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES].milestoneExamples[index % GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES].milestoneExamples.length]}`}
                              className={`w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                milestone.completed 
                                  ? 'line-through text-slate-500 bg-green-50 border-green-200' 
                                  : 'text-slate-700 bg-transparent border-transparent hover:border-slate-200'
                              }`}
                            />
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getMilestoneStatusColor(status)}`}>
                            {formatDate(milestone.dueDate)}
                          </div>
                          
                          <button
                            onClick={() => removeMilestone(currentCategory, milestone.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    
                    {(data.categoryGoals[currentCategory]?.milestones || []).length === 0 && (
                      <div className="space-y-3">
                        <button
                          onClick={() => addMilestone(currentCategory)}
                          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add your first milestone
                        </button>
                        
                        {/* Example milestone cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                          {GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES].milestoneExamples.slice(0, 2).map((example, i) => (
                            <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 flex items-start space-x-2">
                              <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <div>
                                <div className="font-medium">{example}</div>
                                <div className="text-xs mt-1">Example milestone</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Weekly Actions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-medium text-slate-900">Weekly Actions</h3>
                      <button
                        className="ml-2 text-slate-400 hover:text-slate-600 group relative"
                      >
                        <Info className="w-4 h-4" />
                        <div className="absolute left-full ml-2 w-64 bg-slate-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          These are the specific actions you'll take each week to achieve your milestones
                        </div>
                      </button>
                    </div>
                    <button
                      onClick={() => addAction(currentCategory)}
                      className="flex items-center space-x-2 px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Action</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {(data.categoryGoals[currentCategory]?.actions || []).map((action, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-all hover:shadow-sm">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700 mt-1">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-4">
                            <input
                              type="text"
                              value={action.text}
                              onChange={(e) => updateAction(currentCategory, index, { text: e.target.value })}
                              placeholder="What specific action will you take each week?"
                              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            
                            {/* Frequency Selection with Visual Icons */}
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-medium text-slate-700">Frequency:</span>
                              <div className="flex space-x-2">
                                {[
                                  { value: 'daily', label: 'Daily', icon: '📅' },
                                  { value: 'weekly', label: 'Weekly', icon: '📆' },
                                  { value: 'multiple', label: 'Custom', icon: '🗓️' }
                                ].map((freq) => (
                                  <button
                                    key={freq.value}
                                    onClick={() => updateAction(currentCategory, index, { frequency: freq.value as any, specificDays: [] })}
                                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                                      action.frequency === freq.value
                                        ? 'bg-purple-100 text-purple-700 font-medium border border-purple-200'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                  >
                                    <span className="mr-1">{freq.icon}</span>
                                    {freq.label}
                                  </button>
                                ))}
                              </div>
                              
                              <div className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
                                {getFrequencyDescription(action)}
                              </div>
                            </div>

                            {/* Specific Days Selection with Visual Calendar */}
                            {action.frequency === 'multiple' && (
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="text-sm font-medium text-slate-700 mb-2">Select days:</div>
                                <div className="flex flex-wrap gap-2">
                                  {DAYS_OF_WEEK.map((day) => (
                                    <button
                                      key={day.value}
                                      onClick={() => {
                                        const currentDays = action.specificDays || [];
                                        const newDays = currentDays.includes(day.value)
                                          ? currentDays.filter(d => d !== day.value)
                                          : [...currentDays, day.value];
                                        updateAction(currentCategory, index, { specificDays: newDays });
                                      }}
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all ${
                                        action.specificDays?.includes(day.value)
                                          ? 'bg-purple-600 text-white font-medium'
                                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      {day.short}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeAction(currentCategory, index)}
                            className="text-slate-400 hover:text-red-500 p-1 mt-1"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {(data.categoryGoals[currentCategory]?.actions || []).length === 0 && (
                      <div className="space-y-4">
                        <button
                          onClick={() => addAction(currentCategory)}
                          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-purple-600 hover:border-purple-300 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add your first weekly action
                        </button>
                        
                        {/* Suggested actions based on milestones */}
                        {data.categoryGoals[currentCategory]?.milestones && 
                         data.categoryGoals[currentCategory]?.milestones.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-medium text-slate-700 mb-2">Suggested actions based on your milestones:</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {data.categoryGoals[currentCategory]?.milestones.slice(0, 2).map((milestone, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    const newAction: ActionItem = {
                                      text: `Work on ${milestone.title || 'milestone ' + (i+1)}`,
                                      frequency: 'weekly',
                                      specificDays: []
                                    };
                                    updateCategoryGoal(currentCategory, {
                                      ...data.categoryGoals[currentCategory],
                                      actions: [...(data.categoryGoals[currentCategory]?.actions || []), newAction]
                                    });
                                  }}
                                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-purple-50 hover:border-purple-200 transition-colors text-left flex items-start space-x-2"
                                >
                                  <Plus className="w-4 h-4 text-purple-500 mt-0.5" />
                                  <span>Work on {milestone.title || `milestone ${i+1}`}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Motivational Tip */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 rounded-full p-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm text-purple-800">
            <span className="font-medium">Pro Tip:</span> Users who define clear milestones are 3x more likely to achieve their goals.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={goToPreviousArea}
          disabled={data.currentStep === 'annual'}
          className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
          {data.currentStep === 'annual' ? 'Annual Vision' : `${GOAL_CATEGORIES[currentCategory as keyof typeof GOAL_CATEGORIES]?.name} (${data.currentCategoryIndex + 1}/${data.categories.length})`}
        </div>

        <button
          onClick={goToNextArea}
          disabled={!canProceed()}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          <span>{data.currentStep === 'quarter' && data.currentCategoryIndex === data.categories.length - 1 ? 'Complete Goals' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Goals;