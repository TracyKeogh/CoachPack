import React, { useState, useEffect } from 'react';
import { ArrowRight, Target, Repeat, MapPin, Sparkles, TrendingUp, Dumbbell, Scale, CheckCircle, Calendar } from 'lucide-react';

const GoalSetting = () => {
  const [currentFlow, setCurrentFlow] = useState('annual');
  const [selectedCategory, setSelectedCategory] = useState('business');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [supabase, setSupabase] = useState(null);
  
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
      milestones: [],
      isComplete: false
    },
    body: {
      goalText: '',
      measureText: '',
      targetDate: getNinetyDaysFromNow(),
      habits: [],
      milestones: [],
      isComplete: false
    },
    balance: {
      goalText: '',
      measureText: '',
      targetDate: getNinetyDaysFromNow(),
      habits: [],
      milestones: [],
      isComplete: false
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
      // Try multiple ways to access Supabase client
      let supabaseClient = null;
      
      // Method 1: Check window object
      if (typeof window !== 'undefined') {
        supabaseClient = window.supabase || window.supabaseClient || window.__supabase;
      }
      
      // Method 2: Check global object
      if (!supabaseClient && typeof globalThis !== 'undefined') {
        supabaseClient = globalThis.supabase || globalThis.supabaseClient;
      }
      
      // Method 3: Try to import dynamically
      if (!supabaseClient) {
        try {
          const { supabase: importedSupabase } = await import('../lib/supabase');
          supabaseClient = importedSupabase;
        } catch (error) {
          console.log('Could not import supabase from ../lib/supabase');
        }
      }
      
      // Method 4: Try alternative import paths
      if (!supabaseClient) {
        try {
          const { supabase: importedSupabase } = await import('../utils/supabase-setup');
          supabaseClient = importedSupabase;
        } catch (error) {
          console.log('Could not import supabase from ../utils/supabase-setup');
        }
      }
      
      if (!supabaseClient) {
        console.log('Supabase client not found. Running in demo mode.');
        return;
      }

      setSupabase(supabaseClient);

      try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          return;
        }
        
        setUser(user);
        
        if (user) {
          await loadGoalsData(user.id, supabaseClient);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  const loadGoalsData = async (userId, supabaseClient) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseClient
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
    if (!user || !supabase) {
      console.log('User or Supabase not available, skipping save');
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

  const updateCurrentStep = (newStep) => {
    setCurrentSteps(prev => ({
      ...prev,
      [selectedCategory]: newStep
    }));
  };

  const updateField = (field, value) => {
    setGoalsData(prev => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        [field]: value
      }
    }));
  };

  const addItem = (type, data) => {
    if (typeof data === 'string') {
      if (!data.trim()) return;
      const newItem = { id: Date.now(), text: data.trim() };
      setGoalsData(prev => ({
        ...prev,
        [selectedCategory]: {
          ...prev[selectedCategory],
          [type]: [...prev[selectedCategory][type], newItem]
        }
      }));
    } else {
      const newItem = { id: Date.now(), ...data };
      setGoalsData(prev => ({
        ...prev,
        [selectedCategory]: {
          ...prev[selectedCategory],
          [type]: [...prev[selectedCategory][type], newItem]
        }
      }));
    }
  };

  const removeItem = (type, id) => {
    setGoalsData(prev => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        [type]: prev[selectedCategory][type].filter(item => item.id !== id)
      }
    }));
  };

  const handleAnnualComplete = async () => {
    if (!annualVision.snapshot.trim()) return;
    
    // Try to save if user is available, otherwise proceed without saving
    if (user) {
      const saved = await saveGoalsData();
      if (saved) {
        setCurrentFlow('90day');
      }
    } else {
      // Demo mode - proceed without saving
      setCurrentFlow('90day');
    }
  };

  const handleCategoryComplete = async () => {
    // Mark this specific category as complete
    const updatedGoalsData = {
      ...goalsData,
      [selectedCategory]: {
        ...goalsData[selectedCategory],
        isComplete: true
      }
    };
    
    setGoalsData(updatedGoalsData);

    // Save data if user is available
    if (user) {
      await saveGoalsData();
    }

    // Reset step for this category
    updateCurrentStep(0);
    
    // Find next incomplete category or go to summary
    const nextIncompleteCategory = categories.find(cat => 
      cat.id !== selectedCategory && !updatedGoalsData[cat.id].isComplete
    );
    
    if (nextIncompleteCategory) {
      setSelectedCategory(nextIncompleteCategory.id);
    } else {
      // All categories complete, go to summary
      setCurrentFlow('summary');
    }
  };

  // Check if a category is considered complete
  const isCategoryComplete = (categoryId) => {
    const data = goalsData[categoryId];
    return data.goalText.trim() && 
           data.habits.length > 0 && 
           data.milestones.length > 0;
  };

  // Check if all categories are complete
  const allCategoriesComplete = () => {
    return categories.every(cat => isCategoryComplete(cat.id));
  };

  if (currentFlow === 'annual') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-light text-white mb-4">Your Annual Vision</h1>
              <p className="text-purple-200 text-lg">Paint a picture of your life one year from now</p>
            </div>

            <div className="space-y-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <label className="block text-sm font-medium text-gray-700 mb-4 uppercase tracking-wider">
                  Life Snapshot - {new Date(annualVision.targetDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </label>
                <textarea
                  value={annualVision.snapshot}
                  onChange={(e) => setAnnualVision(prev => ({ ...prev, snapshot: e.target.value }))}
                  placeholder="Describe what your life looks like a year from now... How do you feel? What have you accomplished? What does a typical day look like?"
                  className="w-full h-48 bg-transparent border-none resize-none text-lg text-gray-800 placeholder-gray-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Target Date</label>
                <input
                  type="date"
                  value={annualVision.targetDate}
                  onChange={(e) => setAnnualVision(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="w-full bg-transparent border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-center mt-12">
              <button
                onClick={handleAnnualComplete}
                disabled={!annualVision.snapshot.trim() || isLoading}
                className={`px-12 py-4 rounded-xl font-medium text-lg transition-all flex items-center gap-3 ${
                  !annualVision.snapshot.trim() || isLoading
                    ? 'bg-white/20 text-white/40 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-xl'
                }`}
              >
                {isLoading ? 'Saving...' : 'Continue to 90-Day Goals'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentFlow === 'summary') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-3xl shadow-xl border p-12">
            <div className="text-center mb-12">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-light text-gray-900 mb-4">Goals Complete!</h1>
              <p className="text-gray-600 text-lg">Here's your complete goal-setting summary</p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Annual Vision</h2>
              <div className="bg-purple-50 rounded-2xl p-8 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">
                    Target: {new Date(annualVision.targetDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{annualVision.snapshot}</p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-gray-900">90-Day Goals</h2>
              
              {categories.map((category) => {
                const goalData = goalsData[category.id];
                const Icon = category.icon;
                
                return (
                  <div key={category.id} className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                        <p className="text-sm text-gray-600">
                          Target: {new Date(goalData.targetDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Goal</h4>
                        <p className="text-gray-700">{goalData.goalText}</p>
                        {goalData.measureText && (
                          <p className="text-sm text-gray-500 mt-1">Measured by: {goalData.measureText}</p>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Habits ({goalData.habits.length})</h4>
                        <ul className="space-y-1">
                          {goalData.habits.slice(0, 3).map((habit) => (
                            <li key={habit.id} className="text-gray-700 text-sm">• {habit.text}</li>
                          ))}
                          {goalData.habits.length > 3 && (
                            <li className="text-gray-500 text-sm">+{goalData.habits.length - 3} more</li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Milestones ({goalData.milestones.length})</h4>
                        <ul className="space-y-1">
                          {goalData.milestones.slice(0, 3).map((milestone) => (
                            <li key={milestone.id} className="text-gray-700 text-sm">• {milestone.text}</li>
                          ))}
                          {goalData.milestones.length > 3 && (
                            <li className="text-gray-500 text-sm">+{goalData.milestones.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-12">
              <button
                onClick={() => {
                  if (window.history && window.history.back) {
                    window.history.back();
                  }
                }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-12 py-4 rounded-xl font-medium text-lg hover:from-purple-600 hover:to-blue-600 shadow-xl transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white/30 backdrop-blur-sm border-b border-gray-200/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">90-Day Goals</h1>
              <p className="text-gray-600">Break down your annual vision into actionable goals</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Step {currentStep + 1} of 3</span>
              <Sparkles className="w-8 h-8 text-gray-900" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const isCompleted = goalsData[category.id].isComplete || isCategoryComplete(category.id);
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-6 rounded-2xl border-2 transition-all relative ${
                    selectedCategory === category.id
                      ? 'border-blue-300 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.title}</h3>
                </button>
              );
            })}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 pb-24">
        <div className="bg-white rounded-3xl shadow-xl border p-12">
          
          {currentStep === 0 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className={`w-20 h-20 bg-gradient-to-br ${currentCategory.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-light text-gray-900 mb-3">What do you want to achieve?</h2>
                <p className="text-gray-600">Define your {currentCategory.title.toLowerCase()} goal for the next 90 days</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <label className="block text-sm font-medium text-gray-600 mb-3 uppercase tracking-wider">Goal Statement</label>
                  <input
                    type="text"
                    value={currentFormData.goalText}
                    onChange={(e) => updateField('goalText', e.target.value)}
                    placeholder="I will..."
                    className="w-full bg-transparent border-none text-2xl font-light text-gray-800 placeholder-gray-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <label className="block text-sm font-medium text-gray-600 mb-3 uppercase tracking-wider">How will you measure it?</label>
                    <input
                      type="text"
                      value={currentFormData.measureText}
                      onChange={(e) => updateField('measureText', e.target.value)}
                      placeholder="pounds, dollars, miles"
                      className="w-full bg-transparent border-none text-xl text-gray-800 placeholder-gray-500 focus:outline-none"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <label className="block text-sm font-medium text-gray-600 mb-3 uppercase tracking-wider">Target Date</label>
                    <input
                      type="date"
                      value={currentFormData.targetDate}
                      onChange={(e) => updateField('targetDate', e.target.value)}
                      className="w-full bg-transparent border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <HabitsStep 
              formData={currentFormData}
              addItem={addItem}
              removeItem={removeItem}
              currentCategory={currentCategory}
            />
          )}

          {currentStep === 2 && (
            <MilestonesStep 
              formData={currentFormData}
              addItem={addItem}
              removeItem={removeItem}
              currentCategory={currentCategory}
            />
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between">
          <button
            onClick={() => updateCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              currentStep === 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Previous
          </button>
          
          <button
            onClick={() => {
              if (currentStep === 2) {
                handleCategoryComplete();
              } else {
                updateCurrentStep(Math.min(2, currentStep + 1));
              }
            }}
            disabled={!currentFormData.goalText.trim() || isLoading}
            className={`px-10 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              !currentFormData.goalText.trim() || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Saving...' : currentStep === 2 ? `Complete ${currentCategory.title} Goal` : 'Continue'}
            {currentStep !== 2 && !isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const HabitsStep = ({ formData, addItem, removeItem, currentCategory }) => {
  const [newHabit, setNewHabit] = useState('');

  const handleAdd = () => {
    addItem('habits', newHabit);
    setNewHabit('');
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className={`w-20 h-20 bg-gradient-to-br ${currentCategory.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Repeat className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-light text-gray-900 mb-3">How will you get there?</h2>
        <p className="text-gray-600">Daily actions that will make it happen</p>
      </div>

      <div className="space-y-4">
        {formData.habits.map((habit, index) => (
          <div key={habit.id} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 group">
            <div className={`w-8 h-8 bg-gradient-to-br ${currentCategory.color} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
              {index + 1}
            </div>
            <div className="flex-1 text-lg text-gray-800">{habit.text}</div>
            <button
              onClick={() => removeItem('habits', habit.id)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded-full bg-red-50 hover:bg-red-100 transition-all"
            >
              Remove
            </button>
          </div>
        ))}
        
        <div className="bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-300">
          <div className="flex gap-4">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Add a habit or routine..."
              className="flex-1 bg-transparent border-none text-lg text-gray-800 placeholder-gray-500 focus:outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={!newHabit.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MilestonesStep = ({ formData, addItem, removeItem, currentCategory }) => {
  const [newMilestone, setNewMilestone] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleAdd = () => {
    if (!newMilestone.trim()) return;
    const milestoneData = {
      text: newMilestone.trim(),
      date: newDate || 'No date set'
    };
    addItem('milestones', milestoneData);
    setNewMilestone('');
    setNewDate('');
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className={`w-20 h-20 bg-gradient-to-br ${currentCategory.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <MapPin className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-light text-gray-900 mb-3">Milestones</h2>
        <p className="text-gray-600">When will you know you're on track?</p>
      </div>

      <div className="space-y-4">
        {formData.milestones.map((milestone, index) => (
          <div key={milestone.id} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 group">
            <div className={`w-8 h-8 bg-gradient-to-br ${currentCategory.color} rounded-full flex items-center justify-center`}>
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-lg text-gray-800">{milestone.text}</div>
              <div className="text-sm text-gray-500">{milestone.date}</div>
            </div>
            <button
              onClick={() => removeItem('milestones', milestone.id)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded-full bg-red-50 hover:bg-red-100 transition-all"
            >
              Remove
            </button>
          </div>
        ))}
        
        <div className="bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-300">
          <div className="space-y-3">
            <input
              type="text"
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              placeholder="Add a milestone..."
              className="w-full bg-transparent border-none text-lg text-gray-800 placeholder-gray-500 focus:outline-none"
            />
            <div className="flex gap-3">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 bg-transparent border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAdd}
                disabled={!newMilestone.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSetting;