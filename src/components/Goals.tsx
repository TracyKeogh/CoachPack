import React, { useState, useEffect } from 'react';
import { 
  Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar as CalendarIcon, 
  Plus, Minus, Link, TrendingUp, Clock, Repeat, CheckSquare, 
  Flag, CheckCircle2, Circle, Star, Award, Zap, BarChart3, Heart
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { useWheelData } from '../hooks/useWheelData';
import { useValuesData } from '../hooks/useValuesData';
import { 
  GOAL_CATEGORIES, getTwelveWeeksFromNow, getMilestoneDueDates, 
  DAYS_OF_WEEK, ActionItem, Milestone 
} from '../types/goals';

const Goals: React.FC = () => {
  const { data: wheelData } = useWheelData();
  const { data: valuesData } = useValuesData();
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
  const [categoryGoals, setCategoryGoals] = useState({
    business: '',
    body: '',
    balance: ''
  });
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [valueAlignments, setValueAlignments] = useState<Record<string, string[]>>({
    business: [],
    body: [],
    balance: []
  });

  // Initialize from wheel data
  useEffect(() => {
    if (wheelData && wheelData.length > 0 && !hasInitialized) {
      initializeFromWheelData(wheelData);
      setHasInitialized(true);
    }
  }, [wheelData, hasInitialized, initializeFromWheelData]);

  // Load existing goals from data
  useEffect(() => {
    if (data.categoryGoals) {
      setCategoryGoals({
        business: data.categoryGoals.business?.goal || '',
        body: data.categoryGoals.body?.goal || '',
        balance: data.categoryGoals.balance?.goal || ''
      });
    }
  }, [data.categoryGoals]);

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

  // Handle goal input changes
  const handleGoalChange = (category: string, value: string) => {
    setCategoryGoals(prev => ({
      ...prev,
      [category]: value
    }));

    // Update the goal setting data
    const categoryGoal = {
      category: category as any,
      goal: value,
      actions: data.categoryGoals[category]?.actions || [],
      milestones: data.categoryGoals[category]?.milestones || [],
      focus: data.categoryGoals[category]?.focus || '',
      wheelAreas: getCategoryWheelData(category).map(area => area.area),
      targetScore: data.categoryGoals[category]?.targetScore || 8,
      deadline: data.categoryGoals[category]?.deadline || getTwelveWeeksFromNow()
    };

    updateCategoryGoal(category, categoryGoal);
  };

  // Handle value selection
  const toggleValueSelection = (valueId: string) => {
    setSelectedValues(prev => 
      prev.includes(valueId) 
        ? prev.filter(id => id !== valueId)
        : [...prev, valueId]
    );
  };

  // Handle value alignment to categories
  const toggleValueAlignment = (valueId: string, category: string) => {
    setValueAlignments(prev => ({
      ...prev,
      [category]: prev[category].includes(valueId)
        ? prev[category].filter(id => id !== valueId)
        : [...prev[category], valueId]
    }));
  };

  // Get user's core values
  const getUserValues = () => {
    if (!valuesData || !valuesData.rankedCoreValues) return [];
    return valuesData.rankedCoreValues.slice(0, 6); // Top 6 values
  };

  const userValues = getUserValues();

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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Goals Complete!</h2>
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

          {/* Goals Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(categoryGoals).map(([category, goal]) => {
              const categoryInfo = GOAL_CATEGORIES[category as keyof typeof GOAL_CATEGORIES];
              if (!goal) return null;
              
              return (
                <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{categoryInfo.name}</h3>
                  <p className="text-slate-700 mb-4">{goal}</p>
                  
                  {/* Aligned Values */}
                  {valueAlignments[category].length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-600">Aligned Values:</h4>
                      <div className="flex flex-wrap gap-1">
                        {valueAlignments[category].map(valueId => {
                          const value = userValues.find(v => v.id === valueId);
                          return value ? (
                            <span key={valueId} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                              {value.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
          <p className="text-slate-600 mt-2">
            Set meaningful goals aligned with your values across three key life areas
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

      {/* Tips Section */}
      {showTips && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 animate-fadeIn">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Goal Setting Tips
          </h3>
          <ul className="space-y-2 text-sm text-indigo-800">
            <li className="flex items-start">
              <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
              <span>Make goals <strong>specific and measurable</strong> - instead of "get fit", try "run 3 miles without stopping"</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
              <span>Align goals with your <strong>core values</strong> to ensure authentic motivation</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
              <span>Focus on <strong>12-week timeframes</strong> - long enough for meaningful progress, short enough to maintain focus</span>
            </li>
          </ul>
        </div>
      )}

      {/* Annual Vision Section */}
      {data.currentStep === 'annual' && (
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
                Annual Vision Statement
              </label>
              <textarea
                value={data.annualSnapshot.snapshot}
                onChange={(e) => updateAnnualSnapshot({
                  ...data.annualSnapshot,
                  snapshot: e.target.value
                })}
                placeholder="I feel energized and healthy. My career is thriving with meaningful work that aligns with my values. My relationships are deep and fulfilling. I have a strong sense of purpose and am making a positive impact..."
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
      )}

      {/* Goal Setting Section */}
      {data.currentStep === 'quarter' && (
        <div className="space-y-8">
          {/* Three Goal Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(GOAL_CATEGORIES).map(([categoryKey, categoryInfo]) => {
              const wheelAreas = getCategoryWheelData(categoryKey);
              
              return (
                <div key={categoryKey} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{categoryInfo.name}</h3>
                      <p className="text-sm text-slate-600">{categoryInfo.description}</p>
                    </div>
                  </div>

                  {/* Connected Wheel Areas */}
                  {wheelAreas.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Connected Life Areas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {wheelAreas.map((area, index) => (
                          <div key={index} className="flex items-center px-3 py-1 bg-slate-100 rounded-full text-sm">
                            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: area.color}}></div>
                            <span className="font-medium text-slate-700">{area.area}</span>
                            <span className="text-slate-500 ml-1">({area.score}/10)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Goal Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      12-Week Goal
                    </label>
                    <textarea
                      value={categoryGoals[categoryKey as keyof typeof categoryGoals]}
                      onChange={(e) => handleGoalChange(categoryKey, e.target.value)}
                      placeholder={categoryInfo.examples[0]}
                      className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Aligned Values Display */}
                  {valueAlignments[categoryKey].length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Aligned Values:</h4>
                      <div className="flex flex-wrap gap-1">
                        {valueAlignments[categoryKey].map(valueId => {
                          const value = userValues.find(v => v.id === valueId);
                          return value ? (
                            <span key={valueId} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                              {value.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Values Alignment Section */}
          {userValues.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100 animate-fadeIn">
              <h3 className="text-lg font-semibold text-red-900 mb-4">
                Align Your Goals with Your Values
              </h3>
              <p className="text-red-700 mb-6 text-sm">
                Connect your core values to your goals for authentic motivation. Click on values below, then assign them to goal categories.
              </p>

              {/* Values Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-red-800 mb-3">Your Core Values:</h4>
                <div className="flex flex-wrap gap-2">
                  {userValues.map((value) => (
                    <button
                      key={value.id}
                      onClick={() => toggleValueSelection(value.id)}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedValues.includes(value.id)
                          ? 'border-red-500 bg-red-100 text-red-800'
                          : 'border-red-200 bg-white text-red-700 hover:border-red-300'
                      }`}
                    >
                      {value.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Alignment */}
              {selectedValues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-3">
                    Assign selected values to goal categories:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(GOAL_CATEGORIES).map(([categoryKey, categoryInfo]) => (
                      <div key={categoryKey} className="bg-white rounded-lg p-4 border border-red-200">
                        <h5 className="font-medium text-slate-900 mb-3">{categoryInfo.name}</h5>
                        <div className="space-y-2">
                          {selectedValues.map(valueId => {
                            const value = userValues.find(v => v.id === valueId);
                            const isAligned = valueAlignments[categoryKey].includes(valueId);
                            
                            return value ? (
                              <button
                                key={valueId}
                                onClick={() => toggleValueAlignment(valueId, categoryKey)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                  isAligned
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{value.name}</span>
                                  {isAligned && <Check className="w-4 h-4" />}
                                </div>
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Values Message */}
          {userValues.length === 0 && (
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900">Values Alignment Available</h3>
                  <p className="text-yellow-700 text-sm">
                    Complete your Values Clarification to unlock powerful goal alignment features.
                  </p>
                  <button
                    onClick={() => window.location.href = '/values'}
                    className="mt-2 text-yellow-800 hover:text-yellow-900 font-medium text-sm underline"
                  >
                    Go to Values Clarification →
                  </button>
                </div>
              </div>
            </div>
          )}
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

        <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {data.currentStep === 'annual' ? 'Annual Vision' : 'Goal Setting'}
        </div>

        <button
          onClick={goToNextArea}
          disabled={!canProceed()}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>
            {data.currentStep === 'annual' ? 'Set Goals' : 'Complete'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Goals;