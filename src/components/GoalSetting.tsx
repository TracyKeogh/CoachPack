import React, { useState, useEffect } from 'react';
import { ArrowRight, Target, Repeat, MapPin, Sparkles, TrendingUp, Dumbbell, Scale, CheckCircle, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GoalSetting = () => {
  const [currentFlow, setCurrentFlow] = useState('annual');
  const [selectedCategory, setSelectedCategory] = useState('business');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingField, setEditingField] = useState(null);
  
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

  const [annualVision, setAnnualVision] = useState({
    snapshot: '',
    targetDate: getOneYearFromNow()
  });

  const [currentSteps, setCurrentSteps] = useState({
    business: 0,
    body: 0,
    balance: 0
  });
  
  const [goalsData, setGoalsData] = useState({
    business: {
      goalText: '',
      measureText: '',
      targetDate: getNinetyDaysFromNow(),
      habits: [],
      milestones: []
    },
    body: {
      goalText: '',
      measureText: '',
      targetDate: getNinetyDaysFromNow(),
      habits: [],
      milestones: []
    },
    balance: {
      goalText: '',
      measureText: '',
      targetDate: getNinetyDaysFromNow(),
      habits: [],
      milestones: []
    }
  });

  const categories = [
    { id: 'business', title: 'Business', icon: TrendingUp, color: 'from-blue-500 to-purple-600' },
    { id: 'body', title: 'Body', icon: Dumbbell, color: 'from-green-500 to-teal-600' },
    { id: 'balance', title: 'Balance', icon: Scale, color: 'from-orange-500 to-pink-600' }
  ];

  const steps = ['Define', 'Habits', 'Milestones'];
  const currentCategory = categories.find(c => c.id === selectedCategory);
  const currentFormData = goalsData[selectedCategory];
  const currentStep = currentSteps[selectedCategory];

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Test Supabase connection
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          return;
        }

        setUser(user);
        
        if (user) {
          await loadGoalsData(user.id);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  const loadGoalsData = async (userId) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_goals_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading goals data:', error);
        return;
      }

      if (data) {
        setCurrentFlow(data.current_step || 'annual');
        setAnnualVision(data.annual_snapshot || { snapshot: '', targetDate: getOneYearFromNow() });
        
        if (data.category_goals) {
          setGoalsData(data.category_goals);
        }
      }
    } catch (error) {
      console.error('Error loading goals data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGoalsData = async () => {
    if (!user) {
      console.error('User not available');
      return false;
    }

    setIsLoading(true);
    try {
      const dataToSave = {
        user_id: user.id,
        current_step: currentFlow,
        annual_snapshot: annualVision,
        category_goals: goalsData,
        last_updated: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_goals_data')
        .upsert(dataToSave, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving goals data:', error);
        alert('Error saving data. Please try again.');
        return false;
      }

      console.log('Goals data saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving goals data:', error);
      alert('Error saving data. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnnualVision = (field, value) => {
    setAnnualVision(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateGoalData = (category, field, value) => {
    setGoalsData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const addHabit = (category) => {
    setGoalsData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        habits: [...prev[category].habits, '']
      }
    }));
  };

  const updateHabit = (category, index, value) => {
    setGoalsData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        habits: prev[category].habits.map((habit, i) => i === index ? value : habit)
      }
    }));
  };

  const removeHabit = (category, index) => {
    setGoalsData(prev => ({
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
    setGoalsData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        milestones: [...prev[category].milestones, newMilestone]
      }
    }));
  };

  const updateMilestone = (category, index, field, value) => {
    setGoalsData(prev => ({
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
    setGoalsData(prev => ({
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
                  value={annualVision.snapshot}
                  onChange={(e) => updateAnnualVision('snapshot', e.target.value)}
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
                  value={annualVision.targetDate}
                  onChange={(e) => updateAnnualVision('targetDate', e.target.value)}
                  className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-between pt-6">
                <div></div>
                <button
                  onClick={() => {
                    setCurrentFlow('category');
                    saveGoalsData();
                  }}
                  disabled={!annualVision.snapshot.trim()}
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
                  saveGoalsData();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Goals Summary</h1>
            <p className="text-lg text-slate-600">Review your complete goal-setting plan</p>
          </div>

          <div className="space-y-8">
            {/* Annual Vision */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Annual Vision</h2>
                <button
                  onClick={() => setEditingField(editingField === 'annual-vision' ? null : 'annual-vision')}
                  className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
              {editingField === 'annual-vision' ? (
                <div className="space-y-4">
                  <textarea
                    value={annualVision.snapshot}
                    onChange={(e) => setAnnualVision({ ...annualVision, snapshot: e.target.value })}
                    placeholder="Describe your annual vision..."
                    className="w-full h-24 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={annualVision.targetDate}
                      onChange={(e) => setAnnualVision({ ...annualVision, targetDate: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setEditingField(null)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Vision
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-slate-700 leading-relaxed">{annualVision.snapshot}</p>
                  <p className="text-slate-500 mt-4">Target Date: {annualVision.targetDate}</p>
                </div>
              )}
            </div>

            {/* Category Goals */}
            {categories.map((category) => {
              const data = goalsData[category.id];
              return (
                <div key={category.id} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <category.icon className="w-8 h-8 text-purple-600" />
                    <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">Goal</h3>
                        <button
                          onClick={() => setEditingField(editingField === `${category.id}-goal` ? null : `${category.id}-goal`)}
                          className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      {editingField === `${category.id}-goal` ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={data.goalText}
                            onChange={(e) => updateGoalData(category.id, 'goalText', e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => setEditingField(null)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-700">{data.goalText}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">Success Metrics</h3>
                        <button
                          onClick={() => setEditingField(editingField === `${category.id}-metrics` ? null : `${category.id}-metrics`)}
                          className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      {editingField === `${category.id}-metrics` ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={data.measureText}
                            onChange={(e) => updateGoalData(category.id, 'measureText', e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => setEditingField(null)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-700">{data.measureText}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">Target Date</h3>
                        <button
                          onClick={() => setEditingField(editingField === `${category.id}-date` ? null : `${category.id}-date`)}
                          className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      {editingField === `${category.id}-date` ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="date"
                            value={data.targetDate}
                            onChange={(e) => updateGoalData(category.id, 'targetDate', e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => setEditingField(null)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-700">{data.targetDate}</p>
                      )}
                    </div>

                    {data.habits.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900">Habits</h3>
                          <button
                            onClick={() => setEditingField(editingField === `${category.id}-habits` ? null : `${category.id}-habits`)}
                            className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                        {editingField === `${category.id}-habits` ? (
                          <div className="space-y-2">
                            {data.habits.map((habit, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={habit}
                                  onChange={(e) => updateHabit(category.id, index, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => removeHabit(category.id, index)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addHabit(category.id)}
                              className="w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                            >
                              + Add Habit
                            </button>
                            <button
                              onClick={() => setEditingField(null)}
                              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Done Editing Habits
                            </button>
                          </div>
                        ) : (
                          <ul className="space-y-1">
                            {data.habits.map((habit, index) => (
                              <li key={index} className="text-slate-700">• {habit}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {data.milestones.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900">Milestones</h3>
                          <button
                            onClick={() => setEditingField(editingField === `${category.id}-milestones` ? null : `${category.id}-milestones`)}
                            className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                        {editingField === `${category.id}-milestones` ? (
                          <div className="space-y-2">
                            {data.milestones.map((milestone, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={milestone.title}
                                  onChange={(e) => updateMilestone(category.id, index, 'title', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <input
                                  type="date"
                                  value={milestone.date}
                                  onChange={(e) => updateMilestone(category.id, index, 'date', e.target.value)}
                                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => removeMilestone(category.id, index)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addMilestone(category.id)}
                              className="w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                            >
                              + Add Milestone
                            </button>
                            <button
                              onClick={() => setEditingField(null)}
                              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Done Editing Milestones
                            </button>
                          </div>
                        ) : (
                          <ul className="space-y-2">
                            {data.milestones.map((milestone, index) => (
                              <li key={index} className="flex justify-between items-center text-slate-700">
                                <span>• {milestone.title}</span>
                                <span className="text-slate-500 text-sm">{milestone.date}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                saveGoalsData();
                alert('Your goals have been saved successfully!');
              }}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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