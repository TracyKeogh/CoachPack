import React, { useState, useEffect } from 'react';
import { 
  Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar as CalendarIcon, 
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
      <div className="max-w-4xl mx-auto space-y-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.categories.map((category) => {
            const categoryInfo = GOAL_CATEGORIES[category];
            const goal = data.categoryGoals[category];
            
            if (!goal || !goal.goal) return null;
            
            const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
            const totalMilestones = goal.milestones?.length || 0;
            const weeksRemaining = getWeeksRemaining(goal.deadline);
            
            return (
              <div key={category} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">{categoryInfo.icon}</div>
                  <div>
                    <h3 className="font-bold text-slate-900">{categoryInfo.name}</h3>
                    <p className="text-sm text-slate-500">{weeksRemaining} weeks remaining</p>
                  </div>
                </div>
                
                <p className="text-slate-700 mb-4 font-medium">{goal.goal}</p>
                
                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Milestones</span>
                    <span className="font-medium">{completedMilestones}/{totalMilestones}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: totalMilestones > 0 ? `${(completedMilestones / totalMilestones) * 100}%` : '0%' }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Actions</span>
                    <span className="font-medium">{goal.actions?.length || 0} defined</span>
                  </div>
                </div>
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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">12-Week Goals</h1>
        <p className="text-slate-600 text-lg">Transform your vision into actionable quarterly goals</p>
        {lastSaved && (
          <p className="text-sm text-green-600 mt-2">
            ✓ Saved at {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {data.currentStep === 'annual' ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <span className="font-medium text-purple-600">Annual Vision</span>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-green-600">Vision</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                {data.currentCategoryIndex + 2}
              </div>
              <span className="font-medium text-purple-600">
                {categoryInfo?.name} ({data.currentCategoryIndex + 1}/{data.categories.length})
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        {/* Annual Snapshot */}
        {data.currentStep === 'annual' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Annual Vision</h2>
              <p className="text-slate-600">Imagine yourself one year from now...</p>
            </div>

            <div className="space-y-4">
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
                  className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Personal mantra (optional)
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
              <div className="flex flex-wrap justify-center gap-2">
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
            <div className="space-y-2">
              <label className="block text-lg font-medium text-slate-900">
                What's your 12-week goal?
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
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Target completion</label>
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
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {getWeeksRemaining(data.categoryGoals[currentCategory]?.deadline || getTwelveWeeksFromNow())}
                </div>
                <div className="text-sm text-slate-500">weeks</div>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">Key Milestones</h3>
                <button
                  onClick={addMilestone}
                  className="flex items-center space-x-1 px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {(data.categoryGoals[currentCategory]?.milestones || []).map((milestone, index) => (
                  <div key={milestone.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
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
                    
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                      placeholder={`Milestone ${index + 1}`}
                      className={`flex-1 p-2 border-0 bg-transparent focus:ring-0 ${
                        milestone.completed ? 'line-through text-slate-500' : ''
                      }`}
                    />
                    
                    <div className="text-sm text-slate-500">
                      {formatDate(milestone.dueDate)}
                    </div>
                    
                    <button
                      onClick={() => removeMilestone(milestone.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {(data.categoryGoals[currentCategory]?.milestones || []).length === 0 && (
                  <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                    <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Add milestones to track your progress</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">Weekly Actions</h3>
                <button
                  onClick={addAction}
                  className="flex items-center space-x-1 px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {(data.categoryGoals[currentCategory]?.actions || []).map((action, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={action.text}
                        onChange={(e) => updateAction(index, { text: e.target.value })}
                        placeholder="What action will you take weekly?"
                        className="flex-1 p-2 border border-slate-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeAction(index)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Frequency Selection */}
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-slate-600">Frequency:</span>
                      <div className="flex space-x-2">
                        {[
                          { value: 'daily', label: 'Daily' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'multiple', label: 'Custom' }
                        ].map((freq) => (
                          <button
                            key={freq.value}
                            onClick={() => updateAction(index, { frequency: freq.value as any, specificDays: [] })}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              action.frequency === freq.value
                                ? 'bg-purple-100 text-purple-700 font-medium'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {freq.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Specific Days Selection */}
                    {action.frequency === 'multiple' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">Days:</span>
                        <div className="flex space-x-1">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              key={day.value}
                              onClick={() => toggleSpecificDay(index, day.value)}
                              className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                                action.specificDays?.includes(day.value)
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {day.short.charAt(0)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {(data.categoryGoals[currentCategory]?.actions || []).length === 0 && (
                  <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Add weekly actions to achieve your goal</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-200">
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
    </div>
  );
};

export default Goals;