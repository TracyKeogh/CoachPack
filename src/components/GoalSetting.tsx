import React, { useState } from 'react';
import { 
  ArrowRight,
} from 'lucide-react';
import { Plus, Target, Edit3, X, Check, Flag, Calendar, Pencil, ArrowLeft, Save, Heart, Lightbulb, Sparkles, CalendarIcon } from 'lucide-react';
import MilestonesSection from './MilestonesSection';
import { getTwelveWeeksFromNow } from '../types/goals';
import { useValuesData } from '../hooks/useValuesData';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  milestones: Milestone[];
  actionItems: ActionItem[];
  connectedValues: string[];
  targetDate: string;
  progress: number;
}

interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
}

interface ActionItem {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | '3x-week';
  completed: boolean;
}

const GoalSetting: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'annual' | 'category'>('annual');
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [categories] = useState(['business', 'body', 'balance']);
  const [annualSnapshot, setAnnualSnapshot] = useState({
    vision: '',
    priorities: '',
    growth: ''
  });
  const [categoryGoals, setCategoryGoals] = useState<Record<string, Goal[]>>({
    business: [],
    body: [],
    balance: []
  });
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({});
  const { valuesData } = useValuesData();

  const currentCategory = categories[currentCategoryIndex];

  const handleAnnualSnapshotChange = (field: string, value: string) => {
    setAnnualSnapshot(prev => ({ ...prev, [field]: value }));
  };

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.description) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        category: currentCategory,
        milestones: [],
        actionItems: [],
        connectedValues: newGoal.connectedValues || [],
        targetDate: newGoal.targetDate || getTwelveWeeksFromNow(),
        progress: 0
      };

      setCategoryGoals(prev => ({
        ...prev,
        [currentCategory]: [...prev[currentCategory], goal]
      }));

      setNewGoal({});
      setEditingGoal(null);
    }
  };

  const handleEditGoal = (goalId: string, updates: Partial<Goal>) => {
    setCategoryGoals(prev => ({
      ...prev,
      [currentCategory]: prev[currentCategory].map(goal =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    }));
  };

  const handleDeleteGoal = (goalId: string) => {
    setCategoryGoals(prev => ({
      ...prev,
      [currentCategory]: prev[currentCategory].filter(goal => goal.id !== goalId)
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'blue';
      case 'body': return 'green';
      case 'balance': return 'purple';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return Target;
      case 'body': return Heart;
      case 'balance': return Sparkles;
      default: return Target;
    }
  };

  const nextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    }
  };

  const prevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  if (currentStep === 'annual') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Annual Vision</h1>
          <p className="text-gray-600">Set the foundation for your year ahead</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What does success look like this year?
            </label>
            <textarea
              value={annualSnapshot.vision}
              onChange={(e) => handleAnnualSnapshotChange('vision', e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Describe your vision for the year..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are your top 3 priorities?
            </label>
            <textarea
              value={annualSnapshot.priorities}
              onChange={(e) => handleAnnualSnapshotChange('priorities', e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="List your key priorities..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How do you want to grow personally?
            </label>
            <textarea
              value={annualSnapshot.growth}
              onChange={(e) => handleAnnualSnapshotChange('growth', e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Describe your personal growth goals..."
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep('category')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Goals
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 capitalize">
            {currentCategory} Goals
          </h1>
          <p className="text-gray-600 mt-1">
            Step {currentCategoryIndex + 1} of {categories.length}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentStep('annual')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back to Annual Vision
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={prevCategory}
              disabled={currentCategoryIndex === 0}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-600">
              {currentCategoryIndex + 1} / {categories.length}
            </span>
            
            <button
              onClick={nextCategory}
              disabled={currentCategoryIndex === categories.length - 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              {React.createElement(getCategoryIcon(currentCategory), {
                className: `w-6 h-6 text-${getCategoryColor(currentCategory)}-600`
              })}
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                Add {currentCategory} Goal
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your goal..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newGoal.description || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Describe your goal in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newGoal.targetDate || getTwelveWeeksFromNow()}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {valuesData?.ranked_core_values && valuesData.ranked_core_values.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connected Values
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {valuesData.ranked_core_values.map((value: string) => (
                      <button
                        key={value}
                        onClick={() => {
                          const currentValues = newGoal.connectedValues || [];
                          const isSelected = currentValues.includes(value);
                          setNewGoal(prev => ({
                            ...prev,
                            connectedValues: isSelected
                              ? currentValues.filter(v => v !== value)
                              : [...currentValues, value]
                          }));
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          (newGoal.connectedValues || []).includes(value)
                            ? `bg-${getCategoryColor(currentCategory)}-100 text-${getCategoryColor(currentCategory)}-800 border-${getCategoryColor(currentCategory)}-300`
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        } border`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleAddGoal}
                disabled={!newGoal.title || !newGoal.description}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  newGoal.title && newGoal.description
                    ? `bg-${getCategoryColor(currentCategory)}-600 text-white hover:bg-${getCategoryColor(currentCategory)}-700`
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Goal
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {currentCategory} Goals ({categoryGoals[currentCategory].length})
            </h3>

            {categoryGoals[currentCategory].length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No goals added yet</p>
                <p className="text-sm">Add your first {currentCategory} goal to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryGoals[currentCategory].map((goal) => (
                  <div
                    key={goal.id}
                    className={`border-l-4 border-${getCategoryColor(currentCategory)}-500 bg-${getCategoryColor(currentCategory)}-50 p-4 rounded-r-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        
                        {goal.connectedValues.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {goal.connectedValues.map((value) => (
                              <span
                                key={value}
                                className={`px-2 py-1 text-xs rounded-full bg-${getCategoryColor(currentCategory)}-100 text-${getCategoryColor(currentCategory)}-800`}
                              >
                                {value}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Flag className="w-4 h-4" />
                            {goal.milestones.length} milestones
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setEditingGoal(editingGoal === goal.id ? null : goal.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingGoal === goal.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <MilestonesSection
                          goalId={goal.id}
                          milestones={goal.milestones}
                          onUpdateMilestones={(milestones) => 
                            handleEditGoal(goal.id, { milestones })
                          }
                          actionItems={goal.actionItems}
                          onUpdateActionItems={(actionItems) => 
                            handleEditGoal(goal.id, { actionItems })
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSetting;