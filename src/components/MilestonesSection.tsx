import React, { useState } from 'react';
import { Sparkles, Plus, Edit3, X, Check, Clock } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface MilestonesSectionProps {
  milestones: Milestone[];
  goalId: string;
  timeframe: string;
  onAddMilestone: () => void;
  onUpdateMilestone: (milestoneId: string, updates: Partial<Milestone>) => void;
  onRemoveMilestone: (milestoneId: string) => void;
}

const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  milestones,
  goalId,
  timeframe,
  onAddMilestone,
  onUpdateMilestone,
  onRemoveMilestone
}) => {
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');

  const startEditingMilestone = (milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      setNewMilestoneTitle(milestone.title);
      setNewMilestoneDueDate(milestone.dueDate);
      setEditingMilestone(milestoneId);
    }
  };

  const saveMilestone = () => {
    if (!editingMilestone) return;
    
    onUpdateMilestone(editingMilestone, {
      title: newMilestoneTitle,
      dueDate: newMilestoneDueDate
    });
    
    setEditingMilestone(null);
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
  };

  const cancelEditMilestone = () => {
    setEditingMilestone(null);
    setNewMilestoneTitle('');
    setNewMilestoneDueDate('');
  };

  const toggleMilestoneCompletion = (milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      onUpdateMilestone(milestoneId, { completed: !milestone.completed });
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <label className="text-sm font-medium text-slate-700">Milestones</label>
        <button
          onClick={onAddMilestone}
          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="flex items-start group bg-slate-50 p-3 rounded-lg border border-slate-200">
            {editingMilestone === milestone.id ? (
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Milestone title"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex space-x-1">
                    <button
                      onClick={saveMilestone}
                      className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditMilestone}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => toggleMilestoneCompletion(milestone.id)}
                  className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${
                    milestone.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {milestone.completed && <Check className="w-3 h-3" />}
                </button>
                <div className="flex-1">
                  <div className={`font-medium ${milestone.completed ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                    {milestone.title}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditingMilestone(milestone.id)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onRemoveMilestone(milestone.id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        
        {milestones.length === 0 && (
          <div className="text-center py-4 text-slate-500 border border-dashed border-slate-300 rounded-lg">
            <p>No milestones yet</p>
            <button
              onClick={onAddMilestone}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add your first milestone
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestonesSection;