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
      const supabaseClient = window.supabase || window.supabaseClient || globalThis.supabase;
      
      if (!supabaseClient) {
        console.error('Supabase client not found. Make sure Supabase is initialized.');
        return;
      }

      setSupabase(supabaseClient);

      try {
        const result = await supabaseClient.auth.getUser();
        const user = result.data.user;
        setUser(user);
        
        if (user) {
          await loadGoalsData(user.id, supabaseClient);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    };

    initializeApp();
  }, []);

  const loadGoalsData = async (userId, supabaseClient) => {
    setIsLoading(true);
    try {
      const result = await supabaseClient
        .from('user_goals_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // FIXED: Changed from .single() to .maybeSingle()

      if (result.error && result.error.code !== 'PGRST116') {
        console.error('Error loading goals data:', result.error);
        return;
      }

      if (result.data) {
        setCurrentFlow(result.data.current_step || 'annual');
        setAnnualVision(result.data.annual_snapshot || { snapshot: '', targetDate: getOneYearFromNow() });
        
        if (result.data.category_goals) {
          setGoalsData(result.data.category_goals);
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
      console.error('User or Supabase client not available');
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

      const result = await supabase
        .from('user_goals_data')
        .upsert(dataToSave, { onConflict: 'user_id' });

      if (result.error) {
        console.error('Error saving goals data:', result.error);
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

  const updateCurrentData = (field, value) => {
    setGoalsData(prev => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        [field]: value
      }
    }));
  };

  const addHabit = () => {
    const newHabit = {
      id: Date.now(),
      text: '',
      frequency: 'daily'
    };
    
    updateCurrentData('habits', [...currentFormData.habits, newHabit]);
  };

  const updateHabit = (habitId, field, value) => {
    const updatedHabits = currentFormData.habits.map(habit =>
      habit.id === habitId ? { ...habit, [field]: value } : habit
    );
    updateCurrentData('habits', updatedHabits);
  };

  const removeHabit = (habitId) => {
    const updatedHabits = currentFormData.habits.filter(habit => habit.id !== habitId);
    updateCurrentData('habits', updatedHabits);
  };

  const addMilestone = () => {
    const newMilestone = {
      id: Date.now(),
      text: '',
      targetDate: '',
      completed: false
    };
    
    updateCurrentData('milestones', [...currentFormData.milestones, newMilestone]);
  };

  const updateMilestone = (milestoneId, field, value) => {
    const updatedMilestones = currentFormData.milestones.map(milestone =>
      milestone.id === milestoneId ? { ...milestone, [field]: value } : milestone
    );
    updateCurrentData('milestones', updatedMilestones);
  };

  const removeMilestone = (milestoneId) => {
    const updatedMilestones = currentFormData.milestones.filter(milestone => milestone.id !== milestoneId);
    updateCurrentData('milestones', updatedMilestones);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentSteps(prev => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory] + 1
      }));
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentSteps(prev => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory] - 1
      }));
    }
  };

  const switchCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleFlowChange = (flow) => {
    setCurrentFlow(flow);
    if (flow === 'categories') {
      setSelectedCategory('business');
    }
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access your goals</h2>
          <p className="text-gray-600">You need to be authenticated to view and manage your goals.</p>
        </div>
      </div>
    );
  }

  const renderAnnualVision = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Annual Vision</h2>
          <p className="text-gray-600">Paint a picture of where you want to be in one year</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Date
            </label>
            <input
              type="date"
              value={annualVision.targetDate}
              onChange={(e) => setAnnualVision(prev => ({ ...prev, targetDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Vision Snapshot
            </label>
            <textarea
              value={annualVision.snapshot}
              onChange={(e) => setAnnualVision(prev => ({ ...prev, snapshot: e.target.value }))}
              placeholder="Describe in detail where you see yourself in one year. What does your ideal life look like? What have you achieved? How do you feel?"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => handleFlowChange('categories')}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            Continue to 90-Day Goals
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCategorySelection = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">90-Day Goal Categories</h2>
        <p className="text-gray-600">Choose a category to set your focused 90-day goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          const isCompleted = currentSteps[category.id] >= steps.length - 1;
          
          return (
            <button
              key={category.id}
              onClick={() => switchCategory(category.id)}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                isActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isCompleted && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
              
              <div className="text-sm text-gray-600">
                Step {currentSteps[category.id] + 1} of {steps.length}
              </div>
              
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${((currentSteps[category.id] + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </button>
          );
        })}
      </div>

      {renderGoalForm()}
    </div>
  );

  const renderGoalForm = () => {
    if (!currentCategory) return null;

    const Icon = currentCategory.icon;

    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 bg-gradient-to-br ${currentCategory.color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{currentCategory.title}</h3>
            <p className="text-gray-600">{steps[currentStep]} - Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full ${
                  index <= currentStep
                    ? `bg-gradient-to-r ${currentCategory.color}`
                    : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {renderStepContent()}

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={saveGoalsData}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Progress'}
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className={`px-6 py-3 bg-gradient-to-r ${currentCategory.color} text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-2`}
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={saveGoalsData}
                disabled={isLoading}
                className={`px-6 py-3 bg-gradient-to-r ${currentCategory.color} text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-2 disabled:opacity-50`}
              >
                {isLoading ? 'Saving...' : 'Complete Category'}
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Define
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What specific goal do you want to achieve in {currentCategory.title.toLowerCase()}?
              </label>
              <textarea
                value={currentFormData.goalText}
                onChange={(e) => updateCurrentData('goalText', e.target.value)}
                placeholder={`Describe your ${currentCategory.title.toLowerCase()} goal in detail...`}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How will you measure success?
              </label>
              <textarea
                value={currentFormData.measureText}
                onChange={(e) => updateCurrentData('measureText', e.target.value)}
                placeholder="What specific metrics or indicators will show you've achieved this goal?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={currentFormData.targetDate}
                onChange={(e) => updateCurrentData('targetDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 1: // Habits
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Daily Habits</h4>
                <button
                  onClick={addHabit}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Add Habit
                </button>
              </div>

              {currentFormData.habits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Repeat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No habits added yet. Click "Add Habit" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentFormData.habits.map((habit) => (
                    <div key={habit.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <input
                        type="text"
                        value={habit.text}
                        onChange={(e) => updateHabit(habit.id, 'text', e.target.value)}
                        placeholder="Describe this daily habit..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <select
                        value={habit.frequency}
                        onChange={(e) => updateHabit(habit.id, 'frequency', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <button
                        onClick={() => removeHabit(habit.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2: // Milestones
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Key Milestones</h4>
                <button
                  onClick={addMilestone}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Add Milestone
                </button>
              </div>

              {currentFormData.milestones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No milestones added yet. Click "Add Milestone" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentFormData.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <input
                        type="text"
                        value={milestone.text}
                        onChange={(e) => updateMilestone(milestone.id, 'text', e.target.value)}
                        placeholder="Describe this milestone..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        value={milestone.targetDate}
                        onChange={(e) => updateMilestone(milestone.id, 'targetDate', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeMilestone(milestone.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Goal Setting</h1>
          <div className="flex justify-center gap-8">
            <button
              onClick={() => handleFlowChange('annual')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                currentFlow === 'annual'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Annual Vision
            </button>
            <button
              onClick={() => handleFlowChange('categories')}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                currentFlow === 'categories'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              90-Day Goals
            </button>
          </div>
        </div>

        {currentFlow === 'annual' ? renderAnnualVision() : renderCategorySelection()}
      </div>
    </div>
  );
};

export default GoalSetting;