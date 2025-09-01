import React, { useState, useEffect } from 'react';
import { ArrowRight, Target, Repeat, MapPin, Sparkles, TrendingUp, Dumbbell, Scale, CheckCircle, Calendar } from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { GOAL_CATEGORIES } from '../types/goals';
import Header from './Header';
import Navigation from './Navigation';

const GoalSetting = () => {
  const {
    data: goalsData,
    isLoaded,
    updateAnnualSnapshot,
    updateCategoryGoal,
    getCurrentCategory,
    goToNextArea,
    goToPreviousArea,
    saveData
  } = useGoalSettingData();

  const [currentFlow, setCurrentFlow] = useState('annual');
  const [selectedCategory, setSelectedCategory] = useState('business');
  
  const getOneYearFromNow = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  const getNinetyDaysFromNow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date.toISOString().split('T')[0];
  };

  const [currentSteps, setCurrentSteps] = useState({
    business: 0,
    body: 0,
    balance: 0
  });
  
  const [categoryData, setCategoryData] = useState({
    business: { goalText: '', measureText: '', targetDate: getNinetyDaysFromNow(), habits: [], milestones: [] },
    body: { goalText: '', measureText: '', targetDate: getNinetyDaysFromNow(), habits: [], milestones: [] },
    balance: { goalText: '', measureText: '', targetDate: getNinetyDaysFromNow(), habits: [], milestones: [] }
  });

  const categories = [
    { id: 'business', title: 'Business', icon: TrendingUp, color: 'from-blue-500 to-purple-600' },
    { id: 'body', title: 'Body', icon: Dumbbell, color: 'from-green-500 to-teal-600' },
    { id: 'balance', title: 'Balance', icon: Scale, color: 'from-orange-500 to-pink-600' }
  ];

  const steps = ['Define', 'Habits', 'Milestones'];
  const currentCategory = categories.find(c => c.id === selectedCategory);
  const currentFormData = categoryData[selectedCategory];
  const currentStep = currentSteps[selectedCategory];

  // Load data from the hook when it's available
  useEffect(() => {
    if (isLoaded && goalsData) {
      setCurrentFlow(goalsData.currentStep);
      
      // Sync category data with goals data
      const newCategoryData = { ...categoryData };
      Object.keys(newCategoryData).forEach(category => {
        const goalData = goalsData.categoryGoals[category];
        if (goalData) {
          newCategoryData[category] = {
            goalText: goalData.goal || '',
            measureText: goalData.focus || '',
            targetDate: goalData.deadline || getNinetyDaysFromNow(),
            habits: goalData.actions?.map(action => action.text) || [],
            milestones: goalData.milestones || []
          };
        }
      });
      setCategoryData(newCategoryData);
    }
  }, [isLoaded, goalsData]);

  const updateGoalData = (category, field, value) => {
    setCategoryData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const addHabit = (category) => {
    setCategoryData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        habits: [...prev[category].habits, '']
      }
    }));
  };

  const updateHabit = (category, index, value) => {
    setCategoryData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        habits: prev[category].habits.map((habit, i) => i === index ? value : habit)
      }
    }));
  };

  const removeHabit = (category, index) => {
    setCategoryData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        habits: prev[category].habits.filter((_, i) => i !== index)
      }
    }));
  };

  const addMilestone = (category) => {
    const newMilestone = {
      id: Date.now().toString(),
      title: '',
      date: '',
      completed: false
    };
    setCategoryData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        milestones: [...prev[category].milestones, newMilestone]
      }
    }));
  };

  const updateMilestone = (category, index, field, value) => {
    setCategoryData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        milestones: prev[category].milestones.map((milestone, i) => 
          i === index ? { ...milestone, [field]: value } : milestone
        )
      }
    }));
  };

  const removeMilestone = (category, index) => {
    setCategoryData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        milestones: prev[category].milestones.filter((_, i) => i !== index)
      }
    }));
  };

  const nextStep = (category) => {
    setCurrentSteps(prev => ({
      ...prev,
      [category]: Math.min(prev[category] + 1, steps.length - 1)
    }));
  };

  const prevStep = (category) => {
    setCurrentSteps(prev => ({
      ...prev,
      [category]: Math.max(prev[category] - 1, 0)
    }));
  };

  const nextCategory = () => {
    const currentIndex = categories.findIndex(c => c.id === selectedCategory);
    if (currentIndex < categories.length - 1) {
      setSelectedCategory(categories[currentIndex + 1].id);
    } else {
      // Move to review or completion
      setCurrentFlow('review');
    }
  };

  const prevCategory = () => {
    const currentIndex = categories.findIndex(c => c.id === selectedCategory);
    if (currentIndex > 0) {
      setSelectedCategory(categories[currentIndex - 1].id);
    } else {
      setCurrentFlow('annual');
    }
  };

  // Save current form data to the hook's data structure
  const syncFormDataToGoals = () => {
    // Update annual snapshot
    if (currentFlow === 'annual') {
      updateAnnualSnapshot({
        snapshot: goalsData.annualSnapshot?.snapshot || '',
        mantra: goalsData.annualSnapshot?.mantra || ''
      });
    }
    
    // Update category goals
    Object.keys(categoryData).forEach(category => {
      const formData = categoryData[category];
      const existingGoal = goalsData.categoryGoals[category] || {
        category: category as any,
        goal: '',
        actions: [],
        milestones: [],
        wheelAreas: GOAL_CATEGORIES[category]?.wheelAreas || [],
        deadline: getNinetyDaysFromNow()
      };
      
      updateCategoryGoal(category, {
        ...existingGoal,
        goal: formData.goalText,
        focus: formData.measureText,
        deadline: formData.targetDate,
        actions: formData.habits.map(habit => ({
          text: habit,
          frequency: 'weekly' as const,
          specificDays: []
        })),
        milestones: formData.milestones.map(milestone => ({
          id: milestone.id,
          title: milestone.title,
          description: '',
          dueDate: milestone.date,
          completed: milestone.completed,
          completedDate: milestone.completed ? new Date().toISOString() : undefined
        }))
      });
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Goal Setting...</h2>
          <p className="text-slate-600">Retrieving your saved progress...</p>
        </div>
      </div>
    );
  }

  if (currentFlow === 'annual') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Annual Vision Setting</h1>
            <p className="text-lg text-slate-600">Define your one-year vision to guide your quarterly goals</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="space-y-8">
              <div>
                <label className="block text-lg font-semibold text-slate-900 mb-4">
                  Your Annual Vision Snapshot
                </label>
                <textarea
                  value={goalsData.annualSnapshot?.snapshot || ''}
                  onChange={(e) => updateAnnualSnapshot({
                    ...goalsData.annualSnapshot,
                    snapshot: e.target.value
                  })}
                  placeholder="Describe where you want to be in one year. What does your ideal life look like? How do you feel? What have you accomplished?"
                  className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-slate-900 mb-4">
                  Target Date
                </label>
                <input
                  type="date"
                  value={getOneYearFromNow()}
                  onChange={() => {}} // Read-only for now
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  readOnly
                />
              </div>

              <div className="flex justify-between pt-6">
                <div></div>
                <button
                  onClick={() => {
                    setCurrentFlow('category');
                    saveData();
                  }}
                  disabled={!goalsData.annualSnapshot?.snapshot?.trim()}
                  className="flex items-center space-x-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Continue to Goals</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentFlow === 'category') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              {currentCategory.title} Goals
            </h1>
            <p className="text-lg text-slate-600">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </p>
          </div>

          {/* Category Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <category.icon className="w-5 h-5" />
                  <span>{category.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-slate-900 mb-4">
                    What is your main {currentCategory.title.toLowerCase()} goal for the next 90 days?
                  </label>
                  <textarea
                    value={currentFormData.goalText}
                    onChange={(e) => updateGoalData(selectedCategory, 'goalText', e.target.value)}
                    placeholder={`Describe your specific ${currentCategory.title.toLowerCase()} goal...`}
                    className="w-full h-24 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-slate-900 mb-4">
                    How will you measure success?
                  </label>
                  <textarea
                    value={currentFormData.measureText}
                    onChange={(e) => updateGoalData(selectedCategory, 'measureText', e.target.value)}
                    placeholder="What specific metrics or outcomes will show you've achieved this goal?"
                    className="w-full h-24 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-slate-900 mb-4">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={currentFormData.targetDate}
                    onChange={(e) => updateGoalData(selectedCategory, 'targetDate', e.target.value)}
                    className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Daily/Weekly Habits
                  </h3>
                  <p className="text-slate-600 mb-6">
                    What consistent actions will help you achieve your {currentCategory.title.toLowerCase()} goal?
                  </p>
                </div>

                <div className="space-y-4">
                  {currentFormData.habits.map((habit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={habit}
                        onChange={(e) => updateHabit(selectedCategory, index, e.target.value)}
                        placeholder="Enter a daily or weekly habit..."
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeHabit(selectedCategory, index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addHabit(selectedCategory)}
                    className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                  >
                    + Add Habit
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Key Milestones
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Break your goal into smaller milestones with specific deadlines.
                  </p>
                </div>

                <div className="space-y-4">
                  {currentFormData.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(selectedCategory, index, 'title', e.target.value)}
                          placeholder="Milestone title..."
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <div className="flex items-center space-x-3">
                          <input
                            type="date"
                            value={milestone.date}
                            onChange={(e) => updateMilestone(selectedCategory, index, 'date', e.target.value)}
                            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => removeMilestone(selectedCategory, index)}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addMilestone(selectedCategory)}
                    className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                  >
                    + Add Milestone
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-8 mt-8 border-t border-slate-200">
              <button
                onClick={() => {
                  syncFormDataToGoals();
                  if (currentStep === 0) {
                    prevCategory();
                  } else {
                    prevStep(selectedCategory);
                  }
                }}
                className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => {
                  syncFormDataToGoals();
                  saveData();
                  if (currentStep === steps.length - 1) {
                    nextCategory();
                  } else {
                    nextStep(selectedCategory);
                  }
                }}
                className="flex items-center space-x-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <span>{currentStep === steps.length - 1 ? 'Continue' : 'Next'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentFlow === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-3">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Goals Summary</h1>
            <p className="text-sm text-slate-600">Review your complete goal-setting plan</p>
          </div>

          <div className="space-y-3">
            {/* Annual Vision */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Annual Vision</h2>
              <p className="text-slate-700 text-xs leading-relaxed">{goalsData.annualSnapshot?.snapshot}</p>
              <p className="text-slate-500 mt-1 text-xs">Target Date: {getOneYearFromNow()}</p>
            </div>

            {/* Category Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {categories.map((category) => {
              const data = categoryData[category.id];
              return (
                <div key={category.id} className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <category.icon className="w-6 h-6 text-purple-600" />
                    <h2 className="text-base font-bold text-slate-900">{category.title}</h2>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-0.5 text-xs">Goal</h3>
                      <p className="text-slate-700 text-xs">{data.goalText}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-0.5 text-xs">Success Metrics</h3>
                      <p className="text-slate-700 text-xs">{data.measureText}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-0.5 text-xs">Target Date</h3>
                      <p className="text-slate-700 text-xs">{data.targetDate}</p>
                    </div>

                    {data.habits.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-0.5 text-xs">Habits</h3>
                        <ul className="space-y-0">
                          {data.habits.slice(0, 3).map((habit, index) => (
                            <li key={index} className="text-slate-700 text-xs">• {habit}</li>
                          ))}
                          {data.habits.length > 3 && (
                            <li className="text-slate-500 text-xs italic">... and {data.habits.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {data.milestones.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-0.5 text-xs">Milestones</h3>
                        <ul className="space-y-1">
                          {data.milestones.slice(0, 3).map((milestone, index) => (
                            <li key={index} className="flex justify-between items-center text-slate-700 text-xs">
                              <span className="truncate">• {milestone.title}</span>
                              <span className="text-slate-500 text-xs ml-1 flex-shrink-0">{milestone.date}</span>
                            </li>
                          ))}
                          {data.milestones.length > 3 && (
                            <li className="text-slate-500 text-xs italic">... and {data.milestones.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          </div>

          <div className="flex justify-center mt-3">
            <button
              onClick={() => {
                syncFormDataToGoals();
                saveData();
                alert('Your goals have been saved successfully!');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              Complete Goal Setting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GoalSetting;