import React, { useState, useEffect } from 'react';
import { 
  Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar as CalendarIcon, 
  Plus, Minus, Link, TrendingUp, Clock, Repeat, CheckSquare, 
  Flag, CheckCircle2, Circle, Star, Award, Zap, BarChart3, ChevronDown, ChevronRight,
  Edit3, X, Info, HelpCircle
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
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<{ categoryId: string; milestoneId?: string } | null>(null);
  const [editingAction, setEditingAction] = useState<{ categoryId: string; actionIndex?: number } | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', dueDate: '' });
  const [actionForm, setActionForm] = useState({ text: '', frequency: 'weekly' as ActionItem['frequency'], specificDays: [] as string[] });

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

  const toggleGoalExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedGoals(newExpanded);
  };

  const openMilestoneModal = (categoryId: string, milestone?: Milestone) => {
    setEditingMilestone({ categoryId, milestoneId: milestone?.id });
    if (milestone) {
      setMilestoneForm({
        title: milestone.title,
        description: milestone.description || '',
        dueDate: milestone.dueDate
      });
    } else {
      // Set default due date for new milestone
      const currentGoal = data.categoryGoals[categoryId];
      const existingMilestones = currentGoal?.milestones || [];
      const today = new Date().toISOString().split('T')[0];
      const goalDeadline = currentGoal?.deadline || getTwelveWeeksFromNow();
      const suggestedDates = getMilestoneDueDates(today, goalDeadline, existingMilestones.length + 1);
      
      setMilestoneForm({
        title: '',
        description: '',
        dueDate: suggestedDates[existingMilestones.length] || goalDeadline
      });
    }
    setShowMilestoneModal(true);
  };

  const saveMilestone = () => {
    if (!editingMilestone || !milestoneForm.title.trim()) return;

    const { categoryId, milestoneId } = editingMilestone;
    const currentGoal = data.categoryGoals[categoryId] || {
      category: categoryId as any,
      goal: '',
      actions: [],
      milestones: [],
      focus: '',
      wheelAreas: getCategoryWheelData(categoryId).map(area => area.area),
      targetScore: 8,
      deadline: getTwelveWeeksFromNow()
    };

    let updatedMilestones = [...currentGoal.milestones];

    if (milestoneId) {
      // Update existing milestone
      updatedMilestones = updatedMilestones.map(milestone =>
        milestone.id === milestoneId
          ? {
              ...milestone,
              title: milestoneForm.title,
              description: milestoneForm.description,
              dueDate: milestoneForm.dueDate
            }
          : milestone
      );
    } else {
      // Add new milestone
      const newMilestone: Milestone = {
        id: Date.now().toString(),
        title: milestoneForm.title,
        description: milestoneForm.description,
        dueDate: milestoneForm.dueDate,
        completed: false
      };
      updatedMilestones.push(newMilestone);
    }

    updateCategoryGoal(categoryId, {
      ...currentGoal,
      milestones: updatedMilestones
    });

    closeMilestoneModal();
  };

  const deleteMilestone = (categoryId: string, milestoneId: string) => {
    const currentGoal = data.categoryGoals[categoryId];
    if (!currentGoal) return;

    updateCategoryGoal(categoryId, {
      ...currentGoal,
      milestones: currentGoal.milestones.filter(m => m.id !== milestoneId)
    });
  };

  const toggleMilestoneCompletion = (categoryId: string, milestoneId: string) => {
    const currentGoal = data.categoryGoals[categoryId];
    if (!currentGoal) return;

    const updatedMilestones = currentGoal.milestones.map(milestone =>
      milestone.id === milestoneId
        ? {
            ...milestone,
            completed: !milestone.completed,
            completedDate: !milestone.completed ? new Date().toISOString().split('T')[0] : undefined
          }
        : milestone
    );

    updateCategoryGoal(categoryId, {
      ...currentGoal,
      milestones: updatedMilestones
    });
  };

  const closeMilestoneModal = () => {
    setShowMilestoneModal(false);
    setEditingMilestone(null);
    setMilestoneForm({ title: '', description: '', dueDate: '' });
  };

  const openActionModal = (categoryId: string, actionIndex?: number) => {
    setEditingAction({ categoryId, actionIndex });
    const currentGoal = data.categoryGoals[categoryId];
    
    if (actionIndex !== undefined && currentGoal?.actions[actionIndex]) {
      const action = currentGoal.actions[actionIndex];
      setActionForm({
        text: action.text,
        frequency: action.frequency,
        specificDays: action.specificDays || []
      });
    } else {
      setActionForm({
        text: '',
        frequency: 'weekly',
        specificDays: []
      });
    }
    setShowActionModal(true);
  };

  const saveAction = () => {
    if (!editingAction || !actionForm.text.trim()) return;

    const { categoryId, actionIndex } = editingAction;
    const currentGoal = data.categoryGoals[categoryId] || {
      category: categoryId as any,
      goal: '',
      actions: [],
      milestones: [],
      focus: '',
      wheelAreas: getCategoryWheelData(categoryId).map(area => area.area),
      targetScore: 8,
      deadline: getTwelveWeeksFromNow()
    };

    let updatedActions = [...currentGoal.actions];

    const newAction: ActionItem = {
      text: actionForm.text,
      frequency: actionForm.frequency,
      specificDays: actionForm.specificDays
    };

    if (actionIndex !== undefined) {
      // Update existing action
      updatedActions[actionIndex] = newAction;
    } else {
      // Add new action
      updatedActions.push(newAction);
    }

    updateCategoryGoal(categoryId, {
      ...currentGoal,
      actions: updatedActions
    });

    closeActionModal();
  };

  const deleteAction = (categoryId: string, actionIndex: number) => {
    const currentGoal = data.categoryGoals[categoryId];
    if (!currentGoal) return;

    updateCategoryGoal(categoryId, {
      ...currentGoal,
      actions: currentGoal.actions.filter((_, index) => index !== actionIndex)
    });
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setEditingAction(null);
    setActionForm({ text: '', frequency: 'weekly', specificDays: [] });
  };

  const toggleSpecificDay = (day: string) => {
    setActionForm(prev => ({
      ...prev,
      specificDays: prev.specificDays.includes(day)
        ? prev.specificDays.filter(d => d !== day)
        : [...prev.specificDays, day]
    }));
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
          <h1 className="text-3xl font-bold text-slate-900">Goal Setting</h1>
          <p className="text-slate-600 mt-2">
            Create your annual vision and break it down into actionable 12-week goals
          </p>
          {lastSaved && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <button 
          onClick={() => setShowTips(!showTips)}
          className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>{showTips ? "Hide Tips" : "Show Tips"}</span>
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Your Progress</h3>
          <span className="text-sm text-slate-500">{progress.completed}/{progress.total} steps</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Step 1: Annual Vision */}
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              data.annualSnapshot.snapshot ? 'bg-green-500 text-white' : 
              data.currentStep === 'annual' ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {data.annualSnapshot.snapshot ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">Annual Vision</span>
          </div>
          
          <div className="flex-1 h-0.5 bg-slate-200">
            <div 
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (progress.completed / progress.total) * 100)}%` }}
            />
          </div>
          
          {/* Step 2: Category Goals */}
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              data.currentStep === 'quarter' && progress.completed === progress.total ? 'bg-green-500 text-white' :
              data.currentStep === 'quarter' ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {data.currentStep === 'quarter' && progress.completed === progress.total ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="text-sm font-medium">12-Week Goals</span>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      {showTips && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 animate-fadeIn">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Goal Setting Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Target className="w-4 h-4 mt-0.5 text-indigo-600" />
                <span>Make goals <strong>specific and measurable</strong></span>
              </div>
              <div className="flex items-start space-x-2">
                <Flag className="w-4 h-4 mt-0.5 text-indigo-600" />
                <span>Break down into <strong>2-4 key milestones</strong></span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <CheckSquare className="w-4 h-4 mt-0.5 text-indigo-600" />
                <span>Create <strong>weekly actions</strong> for momentum</span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 mt-0.5 text-indigo-600" />
                <span>Set realistic <strong>12-week timeframes</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Annual Vision Section */}
      {data.currentStep === 'annual' && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Annual Vision</h2>
            <p className="text-slate-600">Imagine it's one year from now. Describe your ideal life in vivid detail.</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Annual Vision Statement
              </label>
              <textarea
                value={data.annualSnapshot.snapshot}
                onChange={(e) => updateAnnualSnapshot({
                  ...data.annualSnapshot,
                  snapshot: e.target.value
                })}
                placeholder="I feel energized and healthy. My career is thriving with meaningful work that challenges me. My relationships are deep and fulfilling. I have financial security and am making a positive impact..."
                className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={6}
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
                placeholder="Living with purpose and joy"
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* 12-Week Goals Section */}
      {data.currentStep === 'quarter' && (
        <div className="space-y-6">
          {data.categories.map((category, index) => {
            const categoryInfo = GOAL_CATEGORIES[category];
            const goal = data.categoryGoals[category];
            const isExpanded = expandedGoals.has(category);
            const wheelAreas = getCategoryWheelData(category);
            
            return (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 animate-fadeIn">
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
                        <h3 className="text-xl font-semibold text-slate-900">{categoryInfo.name}</h3>
                        <p className="text-slate-600 text-sm">{categoryInfo.description}</p>
                        {wheelAreas.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            {wheelAreas.map((area, i) => (
                              <div key={i} className="flex items-center space-x-1 px-2 py-1 bg-slate-100 rounded-full text-xs">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: area.color}}></div>
                                <span className="font-medium text-slate-700">{area.area}</span>
                                <span className="text-slate-500">{area.score}/10</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {goal?.goal && (
                        <div className="text-right">
                          <div className="text-sm text-green-600 font-medium">Goal Set</div>
                          <div className="text-xs text-slate-500">
                            {goal.milestones?.length || 0} milestones, {goal.actions?.length || 0} actions
                          </div>
                        </div>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Goal Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-slate-100">
                    <div className="space-y-6 pt-6">
                      {/* Goal Input */}
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
                            wheelAreas: wheelAreas.map(area => area.area),
                            targetScore: goal?.targetScore || 8,
                            deadline: goal?.deadline || getTwelveWeeksFromNow()
                          })}
                          placeholder={categoryInfo.examples[0]}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      {/* Deadline */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
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
                              wheelAreas: wheelAreas.map(area => area.area),
                              targetScore: goal?.targetScore || 8,
                              deadline: e.target.value
                            })}
                            className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <div className="text-sm text-slate-500">
                            {getWeeksRemaining(goal?.deadline || getTwelveWeeksFromNow())} weeks remaining
                          </div>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-semibold text-slate-900">Key Milestones</h4>
                            <Info className="w-4 h-4 text-slate-400" title="2-4 checkpoints to track progress" />
                          </div>
                          <button
                            onClick={() => openMilestoneModal(category)}
                            className="flex items-center space-x-2 px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Milestone</span>
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {goal?.milestones?.map((milestone) => (
                            <div key={milestone.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
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
                                  {milestone.description && (
                                    <div className="text-sm text-slate-600">{milestone.description}</div>
                                  )}
                                  <div className="text-xs text-slate-500 mt-1">
                                    Due: {formatDate(milestone.dueDate)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => openMilestoneModal(category, milestone)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteMilestone(category, milestone.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {(!goal?.milestones || goal.milestones.length === 0) && (
                            <div className="text-center py-8 text-slate-500">
                              <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>No milestones yet. Add your first milestone to track progress.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Weekly Actions */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-semibold text-slate-900">Weekly Actions</h4>
                            <Info className="w-4 h-4 text-slate-400" title="Regular actions to build momentum" />
                          </div>
                          <button
                            onClick={() => openActionModal(category)}
                            className="flex items-center space-x-2 px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Action</span>
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {goal?.actions?.map((action, actionIndex) => (
                            <div key={actionIndex} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                                  {actionIndex + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">{action.text}</div>
                                  <div className="text-sm text-slate-600 flex items-center mt-1">
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
                                  onClick={() => openActionModal(category, actionIndex)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteAction(category, actionIndex)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {(!goal?.actions || goal.actions.length === 0) && (
                            <div className="text-center py-8 text-slate-500">
                              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>No actions yet. Add weekly actions to build momentum.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
          className="flex items-center space-x-2 px-6 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-sm text-slate-500">
          {data.currentStep === 'annual' ? 'Annual Vision' : `${data.currentCategoryIndex + 1}/${data.categories.length} Categories`}
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

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingMilestone?.milestoneId ? 'Edit Milestone' : 'Add Milestone'}
              </h3>
              <button
                onClick={closeMilestoneModal}
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
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Complete leadership training"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about this milestone"
                  className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={closeMilestoneModal}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveMilestone}
                disabled={!milestoneForm.title.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingMilestone?.milestoneId ? 'Update' : 'Add'} Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingAction?.actionIndex !== undefined ? 'Edit Action' : 'Add Action'}
              </h3>
              <button
                onClick={closeActionModal}
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
                  value={actionForm.text}
                  onChange={(e) => setActionForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="e.g., Review industry trends for 30 minutes"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Frequency
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'multiple', label: 'Multiple days per week' }
                  ].map((freq) => (
                    <label key={freq.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="frequency"
                        value={freq.value}
                        checked={actionForm.frequency === freq.value}
                        onChange={(e) => setActionForm(prev => ({ 
                          ...prev, 
                          frequency: e.target.value as ActionItem['frequency'],
                          specificDays: e.target.value === 'multiple' ? prev.specificDays : []
                        }))}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-slate-700">{freq.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {actionForm.frequency === 'multiple' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Days
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleSpecificDay(day.value)}
                        className={`p-2 text-xs rounded-lg border transition-colors ${
                          actionForm.specificDays.includes(day.value)
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={closeActionModal}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAction}
                disabled={!actionForm.text.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingAction?.actionIndex !== undefined ? 'Update' : 'Add'} Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;