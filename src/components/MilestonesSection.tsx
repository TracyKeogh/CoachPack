import React, { useState } from 'react';
import { Trophy, Edit3, X, Check, Clock, Plus, Lightbulb, Target } from 'lucide-react';
import { Milestone } from '../types/goals';

interface MilestonesSectionProps {
  milestones: Milestone[];
  onAddMilestone: () => void;
  onEditMilestone: (milestoneId: string, title: string, dueDate: string) => void;
  onToggleMilestoneCompletion: (milestoneId: string) => void;
  onRemoveMilestone: (milestoneId: string) => void;
}

const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  milestones,
  onAddMilestone,
  onEditMilestone,
  onToggleMilestoneCompletion,
  onRemoveMilestone
}) => {
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionFrequency, setNewActionFrequency] = useState('weekly');

  const startEditingMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone.id);
    setNewMilestoneTitle(milestone.title);
    setNewMilestoneDueDate(milestone.dueDate);
  };

  const saveMilestone = (milestoneId: string) => {
    onEditMilestone(milestoneId, newMilestoneTitle, newMilestoneDueDate);
    setEditingMilestone(null);
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
  };

  const cancelEditMilestone = () => {
    setEditingMilestone(null);
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
  };

  const startEditingAction = (action: any) => {
    setEditingAction(action.id);
    setNewActionTitle(action.title);
    setNewActionFrequency(action.frequency);
  };

  return (
    <div className="mt-6 border-t border-slate-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-medium text-slate-800">Milestones</h3>
        </div>
        <button 
          onClick={onAddMilestone}
          className="flex items-center space-x-1 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Milestone</span>
        </button>
      </div>
      
      <div className="space-y-3 mt-4">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="flex items-start group bg-amber-50 p-4 rounded-lg border border-amber-200">
            {editingMilestone === milestone.id ? (
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full p-2 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                  placeholder="Milestone title"
                />
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <label className="block text-xs text-amber-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newMilestoneDueDate}
                      onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                      className="w-full p-2 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <div className="flex space-x-1 self-end">
                    <button
                      onClick={() => saveMilestone(milestone.id)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={cancelEditMilestone}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onToggleMilestoneCompletion(milestone.id)}
                  className={`w-6 h-6 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${
                    milestone.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-amber-400 bg-white'
                  }`}
                >
                  {milestone.completed && <Check className="w-4 h-4" />}
                </button>
                <div className="flex-1">
                  <div className={`font-medium text-lg ${milestone.completed ? 'text-slate-500 line-through' : 'text-amber-800'}`}>
                    {milestone.title}
                  </div>
                  {milestone.description && (
                    <p className={`mt-1 text-sm ${milestone.completed ? 'text-slate-400' : 'text-amber-700'}`}>
                      {milestone.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-amber-600">
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditingMilestone(milestone)}
                    className="p-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveMilestone(milestone.id)}
                    className="p-1 text-amber-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        
      
      {/* Action Items Section */}
      <div className="mt-8 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-medium text-slate-800">Action Items</h3>
          </div>
          <button
            onClick={() => {
              const newAction = {
                id: Date.now().toString(),
                title: 'New action item',
                frequency: 'weekly',
                completed: false
              };
              onUpdateActionItems([...actionItems, newAction]);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Action</span>
          </button>
        </div>
        
        <div className="space-y-3 mt-4">
          {actionItems.length === 0 ? (
            <div className="text-center py-8 text-blue-700 bg-blue-50 rounded-lg border border-dashed border-blue-300">
              <Target className="w-10 h-10 mx-auto mb-3 text-blue-400 opacity-50" />
              <p className="text-lg font-medium mb-2">No action items yet</p>
              <p className="text-sm mb-4">Actions are the regular tasks that move you toward your goal</p>
              <button
                onClick={() => {
                  const newAction = {
                    id: Date.now().toString(),
                    title: 'New action item',
                    frequency: 'weekly',
                    completed: false
                  };
                  onUpdateActionItems([...actionItems, newAction]);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Your First Action
              </button>
            </div>
          ) : (
            actionItems.map((action) => (
              <div key={action.id} className="flex items-start group bg-blue-50 p-4 rounded-lg border border-blue-200">
                {editingAction === action.id ? (
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={newActionTitle}
                      onChange={(e) => setNewActionTitle(e.target.value)}
                      className="w-full p-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Action title"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <label className="block text-xs text-blue-700 mb-1">Frequency</label>
                        <select
                          value={newActionFrequency}
                          onChange={(e) => setNewActionFrequency(e.target.value)}
                          className="w-full p-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="3x-week">3x per Week</option>
                        </select>
                      </div>
                      <div className="flex space-x-1 self-end">
                        <button
                          onClick={() => {
                            const updatedActions = actionItems.map(a => 
                              a.id === action.id 
                                ? { ...a, title: newActionTitle, frequency: newActionFrequency } 
                                : a
                            );
                            onUpdateActionItems(updatedActions);
                            setEditingAction(null);
                          }}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingAction(null)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        const updatedActions = actionItems.map(a => 
                          a.id === action.id ? { ...a, completed: !a.completed } : a
                        );
                        onUpdateActionItems(updatedActions);
                      }}
                      className={`w-6 h-6 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${
                        action.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-blue-400 bg-white'
                      }`}
                    >
                      {action.completed && <Check className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      <div className={`font-medium text-lg ${action.completed ? 'text-slate-500 line-through' : 'text-blue-800'}`}>
                        {action.title}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {action.frequency === 'daily' ? 'Daily' : 
                           action.frequency === 'weekly' ? 'Weekly' : 
                           '3x per Week'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditingAction(action)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const updatedActions = actionItems.filter(a => a.id !== action.id);
                          onUpdateActionItems(updatedActions);
                        }}
                        className="p-1 text-blue-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
        {milestones.length === 0 && (
          <div className="text-center py-8 text-amber-700 bg-amber-50 rounded-lg border border-dashed border-amber-300">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-amber-400 opacity-50" />
            <p className="text-lg font-medium mb-2">No milestones yet</p>
            <p className="text-sm mb-4">Milestones help you track progress toward your goals</p>
            <button
              onClick={onAddMilestone}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              Add Your First Milestone
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestonesSection;