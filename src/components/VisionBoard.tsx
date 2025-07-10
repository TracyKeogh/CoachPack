import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

const VisionBoard: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Vision Board</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-teal-600" />
        </div>
        <p className="text-center text-slate-600">
          Create a visual representation of your goals and aspirations.
        </p>
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            This component is currently being updated. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );
}

export default VisionBoard;

  const renderGoalForm = (timeframe: GoalTimeframe, category: string) => {
    const goal = goals[timeframe].find(g => g.category === category);
    if (!goal) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            {CATEGORIES.find(c => c.id === category)?.icon}
            <h3 className="text-xl font-semibold text-slate-800">{CATEGORIES.find(c => c.id === category)?.name}</h3>
          </div>
          
          {editingGoal && editingGoal.id === goal.id ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {timeframe === 'annual' ? 'Annual Goal' : timeframe === '90day' ? '90-Day Focus' : 'Weekly Actions Title'}
                </label>
                <textarea
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Why is this important?</label>
                <textarea
                  placeholder="Describe why this goal matters to you..."
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Connecting your goal to your deeper motivation increases your likelihood of success
                </p>
              </div>
              
              {timeframe === 'annual' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mantra (optional)</label>
                  <input
                    type="text"
                    value={newMantra}
                    onChange={(e) => setNewMantra(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="A short phrase to remember this goal"
                  />
                </div>
              )}
              
              {/* Values Selection (only when editing) */}
              {editingGoal && editingGoal.id === goal.id && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Which values does this goal support?
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                    {getAvailableValues().map(value => (
                      <button
                        key={value}
                        onClick={() => toggleValue(value)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedValues.includes(value)
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-blue-600 mt-2">
                    {selectedValues.length} values selected
                  </div>
                  <p className="text-xs text-slate-500">
                    Select the values that this goal helps you express or honor
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelEditGoal}
                  className="px-3 py-1 text-slate-600 hover:text-slate-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveGoal}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {timeframe === 'annual' ? 'Annual Goal' : timeframe === '90day' ? '90-Day Focus' : 'Weekly Actions Title'}
                </label>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-700 text-lg font-medium">{goal.text}</p>
                    
                    {timeframe === 'annual' && goal.mantra && (
                      <p className="text-slate-500 italic mt-2">"{goal.mantra}"</p>
                    )}
                    
                    {timeframe === 'annual' && (
                      <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-1">Why is this important?</h4>
                        <p className="text-sm text-slate-600">
                          {goal.whyImportant || "Click edit to add why this goal matters to you..."}
                        </p>
                      </div>
                    )}
                    
                    {/* Connected Values */}
                    {goal.values && goal.values.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Connected Values</h4>
                        <div className="flex flex-wrap gap-1">
                          {goal.values.map((value, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs border border-blue-300">
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => startEditingGoal(timeframe, goal.id)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ml-2"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {timeframe !== 'annual' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-700">Action Items</label>
                    <button
                      onClick={() => addAction(timeframe, goal.id)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {goal.actions.map((action, index) => (
                      <div key={index} className="flex items-start group">
                        {editingAction && 
                         editingAction.goalId === goal.id && 
                         editingAction.index === index ? (
                          <div className="flex-1 flex items-center space-x-2">
                            <input
                              type="text"
                              value={newActionText}
                              onChange={(e) => setNewActionText(e.target.value)}
                              className="flex-1 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={saveAction}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditAction}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm text-slate-700">{action}</div>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditingAction(timeframe, goal.id, index)}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => removeAction(timeframe, goal.id, index)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    
                    {goal.actions.length === 0 && (
                      <div className="text-center py-4 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                        <p>No action items yet</p>
                        <button
                          onClick={() => addAction(timeframe, goal.id)}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          + Add your first action
                        </button>
                      </div>
                    )}
                    
                    {goal.whyImportant && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-slate-700">Why it matters:</span> <span className="text-slate-600">{goal.whyImportant}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Values Display */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Connected Values
                </label>
                {goal.values && goal.values.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {goal.values.map(value => (
                      <div 
                        key={value}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm border border-blue-300"
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                    <p>No values connected to this goal yet</p>
                    <button
                      onClick={() => startEditingGoal(timeframe, goal.id)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Connect values to this goal
                    </button>
                  </div>
                )}
              </div>
              
              {/* Milestones and Deadline (only for 90-day) */}
              {timeframe === '90day' && (
                <>
                  <div className="mt-6 border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <label className="text-sm font-medium text-slate-700">Milestones</label>
                      </div>
                      <button
                        onClick={() => addMilestone(timeframe, goal.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {goal.milestones?.map((milestone) => (
                        <div key={milestone.id} className="flex items-start group bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {editingMilestone && 
                           editingMilestone.goalId === goal.id && 
                           editingMilestone.milestoneId === milestone.id ? (
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
                                onClick={() => toggleMilestoneCompletion(timeframe, goal.id, milestone.id)}
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
                                  onClick={() => startEditingMilestone(timeframe, goal.id, milestone.id)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => removeMilestone(timeframe, goal.id, milestone.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      
                      {(!goal.milestones || goal.milestones.length === 0) && (
                        <div className="text-center py-4 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                          <p>No milestones yet</p>
                          <button
                            onClick={() => addMilestone(timeframe, goal.id)}
                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            + Add your first milestone
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <label className="text-sm font-medium text-slate-700">Deadline</label>
                    </div>
                    <input
                      type="date"
                      value={goal.deadline || getTwelveWeeksFromNow()}
                      onChange={(e) => updateDeadline(timeframe, goal.id, e.target.value)}
                      className="p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Target completion date for this 90-day goal
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (showSummary) {
      return (
        <div className="space-y-8">
          {/* Annual Goals Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Annual Goals</h2>
              </div>
              <button
                onClick={() => {
                  setCurrentTimeframe('annual');
                  setCurrentStep(1);
                  setShowSummary(false);
                }}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Edit
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIES.map(category => {
                const goal = goals.annual.find(g => g.category === category.id);
                if (!goal) return null;
                
                return (
                  <div key={category.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {category.icon}
                        <h3 className="font-semibold text-slate-800">{category.name}</h3>
                      </div>
                      <p className="text-slate-700 font-medium mb-2">{goal.text}</p>
                      {goal.mantra && (
                        <p className="text-slate-500 italic text-sm">"{goal.mantra}"</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 90-Day Focus Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Flag className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">90-Day Focus</h2>
              </div>
              <button
                onClick={() => {
                  setCurrentTimeframe('90day');
                  setCurrentStep(2);
                  setShowSummary(false);
                }}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Edit
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIES.map(category => {
                const goal = goals['90day'].find(g => g.category === category.id);
                if (!goal) return null;
                
                return (
                  <div key={category.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {category.icon}
                        <h3 className="font-semibold text-slate-800">{category.name}</h3>
                      </div>
                      <p className="text-slate-700 font-medium mb-3">{goal.text}</p>
                      
                      <div className="space-y-2">
                        {goal.actions?.map((action, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm text-slate-700">{action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Show milestones for 90-day goals in summary */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                          <Trophy className="w-3 h-3 text-amber-500 mr-1" /> Milestones
                        </h4>
                        <div className="space-y-2">
                          {goal.milestones.map(milestone => (
                            <div key={milestone.id} className="flex items-center space-x-2 text-xs">
                              <div className={`w-3 h-3 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                              <span className={milestone.completed ? 'line-through text-slate-500' : 'text-slate-700'}>
                                {milestone.title} ({new Date(milestone.dueDate).toLocaleDateString()})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Actions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Weekly Actions</h2>
              </div>
              <button
                onClick={() => {
                  setCurrentTimeframe('weekly');
                  setCurrentStep(3);
                  setShowSummary(false);
                }}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Edit
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIES.map(category => {
                const goal = goals.weekly.find(g => g.category === category.id);
                if (!goal) return null;
                
                return (
                  <div key={category.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {category.icon}
                        <h3 className="font-semibold text-slate-800">{category.name}</h3>
                      </div>
                      <p className="text-slate-700 font-medium mb-3">{goal.text}</p>
                      
                      <div className="space-y-2">
                        {goal.actions?.map((action, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm text-slate-700">{action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            {getTimeframeIcon(currentTimeframe)}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{getTimeframeTitle(currentTimeframe)}</h2>
              <p className="text-slate-600">
                {currentTimeframe === 'annual' 
                  ? 'Define your vision for the year ahead' 
                  : currentTimeframe === '90day' 
                  ? 'Set your focus for the next 90 days' 
                  : 'Plan your weekly actions to achieve your goals'}
              </p>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setCurrentCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentCategory === category.id 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {renderGoalForm(currentTimeframe, currentCategory)}
        </div>
      </div>
    );
  };

  const renderProgressSteps = () => {
    return (
      <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {currentStep > 1 ? <Check className="w-5 h-5" /> : 1}
          </div>
          <div className="hidden md:block">
            <p className={`font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-slate-700'}`}>Annual Goals</p>
            <p className="text-xs text-slate-500">Your vision for the year</p>
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {currentStep > 2 ? <Check className="w-5 h-5" /> : 2}
          </div>
          <div className="hidden md:block">
            <p className={`font-medium ${currentStep === 2 ? 'text-blue-600' : 'text-slate-700'}`}>90-Day Focus</p>
            <p className="text-xs text-slate-500">Your next quarter</p>
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {currentStep > 3 || showSummary ? <Check className="w-5 h-5" /> : 3}
          </div>
          <div className="hidden md:block">
            <p className={`font-medium ${currentStep === 3 ? 'text-blue-600' : 'text-slate-700'}`}>Weekly Actions</p>
            <p className="text-xs text-slate-500">Your weekly plan</p>
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              showSummary ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {showSummary ? <Check className="w-5 h-5" /> : 4}
          </div>
          <div className="hidden md:block">
            <p className={`font-medium ${showSummary ? 'text-blue-600' : 'text-slate-700'}`}>Summary</p>
            <p className="text-xs text-slate-500">Review your plan</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Goal Setting</h1>
        <p className="text-slate-600 mt-2">
          Define your goals from annual vision to weekly actions
        </p>
      </div>

      {/* Progress Steps */}
      {renderProgressSteps()}

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-slate-200">
        <button
          onClick={prevStep}
          disabled={currentStep === 1 && !showSummary}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
            currentStep === 1 && !showSummary
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        <button
          onClick={nextStep}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showSummary ? (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Goals</span>
            </>
          ) : (
            <>
              <span>Save & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GoalSetting;