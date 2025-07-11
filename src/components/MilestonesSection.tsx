import React, { useState } from 'react';
import { Trophy, Edit3, X, Check, Clock, Plus, Lightbulb, Target, Flag, Sparkles } from 'lucide-react';

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

interface MilestonesSectionProps {
  goalId: string;
  milestones: Milestone[];
  onUpdateMilestones: (milestones: Milestone[]) => void;
  actionItems: ActionItem[];
  onUpdateActionItems: (actionItems: ActionItem[]) => void;
}

const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  goalId,
  milestones,
  onUpdateMilestones,
  actionItems,
  onUpdateActionItems
}) => {
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneTargetDate, setNewMilestoneTargetDate] = useState('');
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionFrequency, setNewActionFrequency] = useState<'daily' | 'weekly' | '3x-week'>('weekly');

  const onAddMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: 'New milestone',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      completed: false
    };
    onUpdateMilestones([...milestones, newMilestone]);
  };

  const onEditMilestone = (milestoneId: string, title: string, targetDate: string) => {
    const updatedMilestones = milestones.map(milestone =>
      milestone.id === milestoneId
        ? { ...milestone, title, targetDate }
        : milestone
    );
    onUpdateMilestones(updatedMilestones);
  };

  const onToggleMilestoneCompletion = (milestoneId: string) => {
    const updatedMilestones = milestones.map(milestone =>
      milestone.id === milestoneId
        ? { ...milestone, completed: !milestone.completed }
        : milestone
    );
    onUpdateMilestones(updatedMilestones);
  };

  const onRemoveMilestone = (milestoneId: string) => {
    const filteredMilestones = milestones.filter(milestone => milestone.id !== milestoneId);
    onUpdateMilestones(filteredMilestones);
  };

  const startEditingMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone.id);
    setNewMilestoneTitle(milestone.title);
    setNewMilestoneTargetDate(milestone.targetDate);
  };

  const saveMilestone = (milestoneId: string) => {
    onEditMilestone(milestoneId, newMilestoneTitle, newMilestoneTargetDate);
    setEditingMilestone(null);
    setNewMilestoneTitle('');
    setNewMilestoneTargetDate('');
  };

  const cancelEditMilestone = () => {
    setEditingMilestone(null);
    setNewMilestoneTitle('');
    setNewMilestoneTargetDate('');
  };

  const startEditingAction = (action: ActionItem) => {
    setEditingAction(action.id);
    setNewActionTitle(action.title);
    setNewActionFrequency(action.frequency);
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Milestones Section */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Flag className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Milestones</h3>
              <p className="text-sm text-slate-600">Key checkpoints that mark your progress</p>
            </div>
          </div>
          <button 
            onClick={onAddMilestone}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-amber-700 bg-amber-50 rounded-lg border border-dashed border-amber-300">
              <Flag className="w-10 h-10 mx-auto mb-3 text-amber-400 opacity-50" />
              <p className="text-lg font-medium mb-2">No milestones yet</p>
              <p className="text-sm mb-4">Milestones help you track progress toward your goals</p>
              <button
                onClick={onAddMilestone}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Add Your First Milestone
              </button>
            </div>
          ) : (
            milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-start group bg-amber-50 p-4 rounded-lg border border-amber-200">
                {editingMilestone === milestone.id ? (
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      className="w-full p-3 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                      placeholder="Milestone title"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <label className="block text-xs text-amber-700 mb-1 font-medium">Target Date</label>
                        <input
                          type="date"
                          value={newMilestoneTargetDate}
                          onChange={(e) => setNewMilestoneTargetDate(e.target.value)}
                          className="w-full p-3 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
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
                          : 'border-amber-400 bg-white hover:border-amber-500'
                      }`}
                    >
                      {milestone.completed && <Check className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      <div className={`font-medium text-lg ${milestone.completed ? 'text-slate-500 line-through' : 'text-amber-800'}`}>
                        {milestone.title}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-600">
                          Target: {new Date(milestone.targetDate).toLocaleDateString()}
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
            ))
          )}
        </div>
      </div>

      {/* Action Items Section */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Action Items</h3>
              <p className="text-sm text-slate-600">Regular tasks that drive daily progress</p>
            </div>
          </div>
          <button
            onClick={() => {
              const newAction: ActionItem = {
                id: Date.now().toString(),
                title: 'New action item',
                frequency: 'weekly',
                completed: false
              };
              onUpdateActionItems([...actionItems, newAction]);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Action</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {actionItems.length === 0 ? (
            <div className="text-center py-8 text-blue-700 bg-blue-50 rounded-lg border border-dashed border-blue-300">
              <Target className="w-10 h-10 mx-auto mb-3 text-blue-400 opacity-50" />
              <p className="text-lg font-medium mb-2">No action items yet</p>
              <p className="text-sm mb-4">Actions are the regular tasks that move you toward your goal</p>
              <button
                onClick={() => {
                  const newAction: ActionItem = {
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
                      className="w-full p-3 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Action title"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <label className="block text-xs text-blue-700 mb-1 font-medium">Frequency</label>
                        <select
                          value={newActionFrequency}
                          onChange={(e) => setNewActionFrequency(e.target.value as 'daily' | 'weekly' | '3x-week')}
                          className="w-full p-3 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                          : 'border-blue-400 bg-white hover:border-blue-500'
                      }`}
                    >
                      {action.completed && <Check className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      <div className={`font-medium text-lg ${action.completed ? 'text-slate-500 line-through' : 'text-blue-800'}`}>
                        {action.title}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
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
    </div>
  );
};

export default MilestonesSection;