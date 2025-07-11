import React, { useState } from 'react';
import { 
  ArrowRight,
  Plus, 
  Target, 
  Edit3, 
  X, 
  Check, 
  Flag, 
  Calendar, 
  Pencil, 
  ArrowLeft, 
  Save, 
  Heart, 
  Lightbulb, 
  Sparkles, 
  CalendarIcon 
} from 'lucide-react';
import MilestonesSection from './MilestonesSection';
import { getTwelveWeeksFromNow } from '../types/goals';
import { useValuesData } from '../hooks/useValuesData';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  targetDate: string;
  milestones: Milestone[];
  actionItems: ActionItem[];
  progress: number;
}

interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  description?: string;
}

interface ActionItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
}

const GoalSetting: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { valuesData } = useValuesData();

  const categories = [
    { id: 'business', name: 'Business', icon: Target, color: 'bg-blue-500' },
    { id: 'health', name: 'Health', icon: Heart, color: 'bg-green-500' },
    { id: 'relationships', name: 'Relationships', icon: Heart, color: 'bg-pink-500' },
    { id: 'personal', name: 'Personal Growth', icon: Lightbulb, color: 'bg-purple-500' },
    { id: 'financial', name: 'Financial', icon: Target, color: 'bg-yellow-500' },
    { id: 'creative', name: 'Creative', icon: Sparkles, color: 'bg-indigo-500' }
  ];

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'business',
    priority: 'medium' as const,
    targetDate: getTwelveWeeksFromNow()
  });

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      milestones: [],
      actionItems: [],
      progress: 0
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      category: 'business',
      priority: 'medium',
      targetDate: getTwelveWeeksFromNow()
    });
    setShowAddGoal(false);
  };

  const handleUpdateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const handleAddMilestone = (goalId: string, milestone: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: Date.now().toString()
    };

    handleUpdateGoal(goalId, {
      milestones: [...(goals.find(g => g.id === goalId)?.milestones || []), newMilestone]
    });
  };

  const handleUpdateMilestone = (goalId: string, milestoneId: string, updates: Partial<Milestone>) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(milestone =>
      milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
    );

    handleUpdateGoal(goalId, { milestones: updatedMilestones });
  };

  const handleDeleteMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.filter(milestone => milestone.id !== milestoneId);
    handleUpdateGoal(goalId, { milestones: updatedMilestones });
  };

  const handleAddActionItem = (goalId: string, actionItem: Omit<ActionItem, 'id'>) => {
    const newActionItem: ActionItem = {
      ...actionItem,
      id: Date.now().toString()
    };

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    handleUpdateGoal(goalId, {
      actionItems: [...goal.actionItems, newActionItem]
    });
  };

  const handleUpdateActionItem = (goalId: string, actionItemId: string, updates: Partial<ActionItem>) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedActionItems = goal.actionItems.map(item =>
      item.id === actionItemId ? { ...item, ...updates } : item
    );

    handleUpdateGoal(goalId, { actionItems: updatedActionItems });
  };

  const handleDeleteActionItem = (goalId: string, actionItemId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedActionItems = goal.actionItems.filter(item => item.id !== actionItemId);
    handleUpdateGoal(goalId, { actionItems: updatedActionItems });
  };

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || Target;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || 'bg-gray-500';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Goal Setting</h1>
        <p className="text-gray-600">Transform your vision into actionable goals with clear milestones and deadlines.</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Goals
          </button>
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Goal Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddGoal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Goal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your goal title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as 'high' | 'medium' | 'low' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
              <input
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your goal and why it's important to you"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddGoal}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Create Goal
            </button>
            <button
              onClick={() => setShowAddGoal(false)}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-6">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first goal to begin your journey.</p>
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Goal
            </button>
          </div>
        ) : (
          filteredGoals.map(goal => {
            const CategoryIcon = getCategoryIcon(goal.category);
            const categoryColor = getCategoryColor(goal.category);
            
            return (
              <div key={goal.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${categoryColor}`}>
                        <CategoryIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{goal.title}</h3>
                        <p className="text-gray-600 mb-3">{goal.description}</p>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(goal.priority)}`}>
                            {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4" />
                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingGoal(editingGoal === goal.id ? null : goal.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Section */}
                  <MilestonesSection
                    goalId={goal.id}
                    milestones={goal.milestones}
                    onAddMilestone={handleAddMilestone}
                    onUpdateMilestone={handleUpdateMilestone}
                    onDeleteMilestone={handleDeleteMilestone}
                  />

                  {/* Action Items */}
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h4>
                    
                    <div className="space-y-2 mb-4">
                      {goal.actionItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <button
                            onClick={() => handleUpdateActionItem(goal.id, item.id, { completed: !item.completed })}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              item.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {item.completed && <Check className="w-3 h-3" />}
                          </button>
                          <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.title}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                          {item.dueDate && (
                            <span className="text-sm text-gray-600">
                              {new Date(item.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteActionItem(goal.id, item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Action Item Form */}
                    <div className="border-t pt-4">
                      <ActionItemForm
                        onAdd={(actionItem) => handleAddActionItem(goal.id, actionItem)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Action Item Form Component
interface ActionItemFormProps {
  onAdd: (actionItem: Omit<ActionItem, 'id'>) => void;
}

const ActionItemForm: React.FC<ActionItemFormProps> = ({ onAdd }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    priority: 'medium' as const,
    dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onAdd({
      title: formData.title,
      completed: false,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined
    });

    setFormData({ title: '', priority: 'medium', dueDate: '' });
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Action Item
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="What needs to be done?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
      </div>
      <div className="flex gap-3">
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default GoalSetting;