import React, { useState } from 'react';
import { Trophy, Calendar, Check, Edit3, X, Plus, Clock } from 'lucide-react';
import { Milestone } from '../types/goals';

interface MilestonesSectionProps {
  milestones: Milestone[];
  onAddMilestone: () => void;
  onEditMilestone: (milestoneId: string, title: string, dueDate: string) => void;
  onToggleMilestone: (milestoneId: string) => void;
  onRemoveMilestone: (milestoneId: string) => void;
}

const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  milestones,
  onAddMilestone,
  onEditMilestone,
  onToggleMilestone,
  onRemoveMilestone
}) => {
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');

  const handleStartEditing = (milestone: Milestone) => {
    setEditingMilestoneId(milestone.id);
    setNewMilestoneTitle(milestone.title);
    setNewMilestoneDueDate(milestone.dueDate);
  };

  const handleSaveEdit = () => {
    if (editingMilestoneId && newMilestoneTitle.trim()) {
      onEditMilestone(editingMilestoneId, newMilestoneTitle, newMilestoneDueDate);
      setEditingMilestoneId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMilestoneId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-amber-900">Milestones</h3>
        </div>
        <button
          onClick={onAddMilestone}
          className="flex items-center space-x-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Milestone</span>
        </button>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-8 text-amber-700 bg-amber-50 rounded-lg border border-dashed border-amber-300">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-amber-400 opacity-50" />
          <p className="font-medium mb-2">No milestones yet</p>
          <p className="text-sm text-amber-600 mb-4">Break down your goal into achievable milestones</p>
          <button
            onClick={onAddMilestone}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Create First Milestone
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div 
              key={milestone.id} 
              className={`group relative rounded-lg border ${
                milestone.completed 
                  ? 'bg-amber-50 border-amber-200 opacity-75' 
                  : 'bg-white border-amber-300'
              } p-4 transition-all hover:shadow-md`}
            >
              {editingMilestoneId === milestone.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    className="w-full p-2 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Milestone title"
                    autoFocus
                  />
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 flex-1">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <input
                        type="date"
                        value={newMilestoneDueDate}
                        onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                        className="p-2 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={handleSaveEdit}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        title="Save changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start">
                    <button
                      onClick={() => onToggleMilestone(milestone.id)}
                      className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center mt-1 ${
                        milestone.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-amber-400 bg-white'
                      }`}
                    >
                      {milestone.completed && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <div className={`font-medium text-amber-900 ${milestone.completed ? 'line-through text-amber-600' : ''}`}>
                        {milestone.title}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-amber-700">
                          Due: {formatDate(milestone.dueDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEditing(milestone)}
                        className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
                        title="Edit milestone"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveMilestone(milestone.id)}
                        className="p-1.5 text-amber-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove milestone"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MilestonesSection;