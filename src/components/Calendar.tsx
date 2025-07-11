import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Eye, Target, Heart, Briefcase, User, X } from 'lucide-react';
import { useCalendarData, Event, ActionPoolItem } from '../hooks/useCalendarData';

const Calendar: React.FC = () => {
  const {
    data,
    isLoaded,
    lastSaved,
    addEvent,
    updateEvent,
    removeEvent,
    addActionToPool,
    updateActionInPool,
    removeActionFromPool,
    scheduleActionFromPool,
    refreshActionPool,
    saveData
  } = useCalendarData();

  const [view, setView] = useState<'weekly' | '90day'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedAction, setDraggedAction] = useState<ActionPoolItem | null>(null);
  const [slotActions, setSlotActions] = useState<Record<string, ActionPoolItem[]>>({});
  const [weeklyActions, setWeeklyActions] = useState<Record<string, string[]>>({});
  const [weeklyActionItems, setWeeklyActionItems] = useState<Record<string, ActionPoolItem[]>>({});
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [newAction, setNewAction] = useState<Partial<ActionPoolItem>>({
    title: '',
    duration: 30,
    category: 'business',
    frequency: 'weekly'
  });

  // Action pool (from hook)
  const actionPool = data.actionPool;

  // Refresh action pool on mount
  useEffect(() => {
    if (isLoaded) {
      refreshActionPool();
    }
  }, [isLoaded, refreshActionPool]);

  // Sync weekly view actions to 90-day view
  useEffect(() => {
    console.log("Syncing weekly view to 90-day view");
    const newWeeklyActions: Record<string, string[]> = {};
    const newWeeklyActionItems: Record<string, ActionPoolItem[]> = {};

    // Map day indices to week numbers
    const dayToWeekMap: Record<number, number> = {
      0: 1, // Sunday -> Week 1
      1: 1, // Monday -> Week 1
      2: 1, // Tuesday -> Week 1
      3: 1, // Wednesday -> Week 1
      4: 1, // Thursday -> Week 1
      5: 1, // Friday -> Week 1
      6: 1, // Saturday -> Week 1
      7: 2, // Next Sunday -> Week 2
      // ... and so on
    };

    // For each day-slot combination in slotActions
    Object.entries(slotActions).forEach(([key, actions]) => {
      // Parse the key to get day index and slot
      const [dayIndex, slot] = key.split('-');
      const weekNumber = dayToWeekMap[parseInt(dayIndex)] || 1;

      // Create a key for the week and category
      actions.forEach(action => {
        const weekCategoryKey = `week-${weekNumber}-${action.category}`;
        
        // Add action title to weeklyActions
        if (!newWeeklyActions[weekCategoryKey]) {
          newWeeklyActions[weekCategoryKey] = [];
        }
        if (!newWeeklyActions[weekCategoryKey].includes(action.title)) {
          newWeeklyActions[weekCategoryKey] = [...newWeeklyActions[weekCategoryKey], action.title];
        }
        
        // Add full action object to weeklyActionItems
        if (!newWeeklyActionItems[weekCategoryKey]) {
          newWeeklyActionItems[weekCategoryKey] = [];
        }
        
        // Check if action already exists to prevent duplicates
        const actionExists = newWeeklyActionItems[weekCategoryKey].some(
          existingAction => existingAction.id === action.id
        );
        
        if (!actionExists) {
          newWeeklyActionItems[weekCategoryKey] = [...newWeeklyActionItems[weekCategoryKey], action];
        }
      });
    });

    console.log("Updated weeklyActions:", newWeeklyActions);
    console.log("Updated weeklyActionItems:", newWeeklyActionItems);
    
    setWeeklyActions(newWeeklyActions);
    setWeeklyActionItems(newWeeklyActionItems);
  }, [slotActions]);

  // Sync 90-day view actions to weekly view
  useEffect(() => {
    console.log("Syncing 90-day view to weekly view");
    const newSlotActions: Record<string, ActionPoolItem[]> = { ...slotActions };

    // Map week numbers to day indices
    const weekToDayMap: Record<number, number[]> = {
      1: [0, 1, 2, 3, 4, 5, 6], // Week 1 -> Sunday to Saturday
      2: [7, 8, 9, 10, 11, 12, 13], // Week 2 -> Next Sunday to Saturday
      // ... and so on
    };

    // For each week-category combination in weeklyActionItems
    Object.entries(weeklyActionItems).forEach(([key, actions]) => {
      // Parse the key to get week number and category
      const match = key.match(/week-(\d+)-(.+)/);
      if (match) {
        const weekNumber = parseInt(match[1]);
        const category = match[2];
        const dayIndices = weekToDayMap[weekNumber] || [];

        // Distribute actions across days in the week
        actions.forEach(action => {
          // Choose a day index based on action frequency
          let dayIndex: number;
          if (action.frequency === 'daily') {
            // For daily actions, add to multiple days
            dayIndices.forEach(day => {
              const slotKey = `${day}-${getSlotForAction(action)}`;
              if (!newSlotActions[slotKey]) {
                newSlotActions[slotKey] = [];
              }
              
              // Check if action already exists to prevent duplicates
              const actionExists = newSlotActions[slotKey].some(
                existingAction => existingAction.id === action.id
              );
              
              if (!actionExists) {
                newSlotActions[slotKey] = [...newSlotActions[slotKey], action];
              }
            });
          } else {
            // For weekly or other actions, add to one day
            dayIndex = dayIndices[0]; // Default to first day of week
            const slotKey = `${dayIndex}-${getSlotForAction(action)}`;
            
            if (!newSlotActions[slotKey]) {
              newSlotActions[slotKey] = [];
            }
            
            // Check if action already exists to prevent duplicates
            const actionExists = newSlotActions[slotKey].some(
              existingAction => existingAction.id === action.id
            );
            
            if (!actionExists) {
              newSlotActions[slotKey] = [...newSlotActions[slotKey], action];
            }
          }
        });
      }
    });

    // Only update if there are changes to prevent infinite loop
    if (Object.keys(newSlotActions).length !== Object.keys(slotActions).length) {
      console.log("Updated slotActions:", newSlotActions);
      setSlotActions(newSlotActions);
    }
  }, [weeklyActionItems]);

  // Helper function to determine which slot an action belongs to based on its nature
  const getSlotForAction = (action: ActionPoolItem): string => {
    // Map action categories or other properties to appropriate time slots
    if (action.title.toLowerCase().includes('morning') || 
        action.title.toLowerCase().includes('workout')) {
      return 'morning';
    } else if (action.title.toLowerCase().includes('evening') || 
               action.title.toLowerCase().includes('dinner')) {
      return 'evening';
    } else {
      return 'afternoon'; // Default to afternoon
    }
  };

  // Generate a unique key for a day-slot combination
  const generateSlotKey = (dayIndex: number, slot: string): string => {
    return `${dayIndex}-${slot}`;
  };

  // Get the week number for a date
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Get the current week's dates
  const getWeekDates = (date: Date): Date[] => {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const diff = date.getDate() - day;
    const weekDates = [];
    
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(date);
      newDate.setDate(diff + i);
      weekDates.push(newDate);
    }
    
    return weekDates;
  };

  // Get the current quarter's weeks
  const getQuarterWeeks = (date: Date): { weekNumber: number; startDate: Date; endDate: Date }[] => {
    const weeks = [];
    const currentWeek = getWeekNumber(date);
    const startWeek = currentWeek - 6; // 6 weeks before
    const endWeek = currentWeek + 6; // 6 weeks after
    
    for (let i = startWeek; i <= endWeek; i++) {
      const weekStartDate = new Date(date);
      weekStartDate.setDate(date.getDate() - date.getDay() + (i - currentWeek) * 7);
      
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      
      weeks.push({
        weekNumber: i,
        startDate: weekStartDate,
        endDate: weekEndDate
      });
    }
    
    return weeks;
  };

  // Format date as Month Day
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Navigate to previous week/quarter
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'weekly') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 90);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next week/quarter
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'weekly') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 90);
    }
    setCurrentDate(newDate);
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'business':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'body':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'balance':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'personal':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-800';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business':
        return <Briefcase className="w-4 h-4 text-purple-600" />;
      case 'body':
        return <Heart className="w-4 h-4 text-green-600" />;
      case 'balance':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'personal':
        return <User className="w-4 h-4 text-orange-600" />;
      default:
        return <Eye className="w-4 h-4 text-slate-600" />;
    }
  };

  // Get frequency text
  const getFrequencyText = (frequency: string): string => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case '3x-week':
        return '3x/Week';
      default:
        return frequency;
    }
  };

  // Handle adding a new action to the pool
  const handleAddAction = () => {
    if (newAction.title && newAction.duration && newAction.category && newAction.frequency) {
      addActionToPool({
        id: `action-${Date.now()}`,
        title: newAction.title,
        duration: newAction.duration,
        category: newAction.category as 'business' | 'body' | 'balance' | 'personal',
        frequency: newAction.frequency as 'daily' | 'weekly' | '3x-week'
      });
      
      setNewAction({
        title: '',
        duration: 30,
        category: 'business',
        frequency: 'weekly'
      });
      
      setShowAddActionModal(false);
    }
  };

  // Remove an action from a slot
  const removeActionFromSlot = (slotKey: string, actionId: string) => {
    // Remove from weekly view
    setSlotActions(prev => {
      const newSlotActions = { ...prev };
      if (newSlotActions[slotKey]) {
        newSlotActions[slotKey] = newSlotActions[slotKey].filter(action => action.id !== actionId);
        if (newSlotActions[slotKey].length === 0) {
          delete newSlotActions[slotKey];
        }
      }
      return newSlotActions;
    });

    // Remove from 90-day view
    // First, find which week-category key contains this action
    Object.entries(weeklyActionItems).forEach(([key, actions]) => {
      const actionExists = actions.some(action => action.id === actionId);
      if (actionExists) {
        setWeeklyActionItems(prev => {
          const newItems = { ...prev };
          newItems[key] = newItems[key].filter(action => action.id !== actionId);
          if (newItems[key].length === 0) {
            delete newItems[key];
          }
          return newItems;
        });

        setWeeklyActions(prev => {
          const newActions = { ...prev };
          const action = actions.find(a => a.id === actionId);
          if (action) {
            newActions[key] = newActions[key].filter(title => title !== action.title);
            if (newActions[key].length === 0) {
              delete newActions[key];
            }
          }
          return newActions;
        });
      }
    });
  };

  // Remove an action from 90-day view
  const removeActionFrom90DayView = (weekCategoryKey: string, actionId: string) => {
    // Remove from 90-day view
    setWeeklyActionItems(prev => {
      const newItems = { ...prev };
      if (newItems[weekCategoryKey]) {
        const actionToRemove = newItems[weekCategoryKey].find(action => action.id === actionId);
        newItems[weekCategoryKey] = newItems[weekCategoryKey].filter(action => action.id !== actionId);
        
        if (newItems[weekCategoryKey].length === 0) {
          delete newItems[weekCategoryKey];
        }
        
        // Also remove from weeklyActions
        if (actionToRemove) {
          setWeeklyActions(prev => {
            const newActions = { ...prev };
            if (newActions[weekCategoryKey]) {
              newActions[weekCategoryKey] = newActions[weekCategoryKey].filter(
                title => title !== actionToRemove.title
              );
              if (newActions[weekCategoryKey].length === 0) {
                delete newActions[weekCategoryKey];
              }
            }
            return newActions;
          });
        }
        
        // Also remove from slotActions
        setSlotActions(prev => {
          const newSlotActions = { ...prev };
          Object.keys(newSlotActions).forEach(slotKey => {
            newSlotActions[slotKey] = newSlotActions[slotKey].filter(
              action => action.id !== actionId
            );
            if (newSlotActions[slotKey].length === 0) {
              delete newSlotActions[slotKey];
            }
          });
          return newSlotActions;
        });
      }
      return newItems;
    });
  };

  // Render the weekly view
  const renderWeeklyView = () => {
    const weekDates = getWeekDates(currentDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Weekly Planning
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevious}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-slate-700">
              {formatDate(weekDates[0])} - {formatDate(weekDates[6])}, {weekDates[0].getFullYear()}
            </span>
            <button
              onClick={goToNext}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-4">
          {/* Time slots column */}
          <div className="space-y-4">
            <div className="h-12"></div> {/* Empty space for header alignment */}
            {timeSlots.map(slot => (
              <div key={slot} className="h-32 flex items-center">
                <span className="font-medium text-slate-700">{slot}</span>
              </div>
            ))}
          </div>

          {/* Days columns */}
          {weekDates.map((date, dayIndex) => (
            <div key={dayIndex} className="space-y-4">
              {/* Day header */}
              <div className="text-center">
                <div className="font-medium text-slate-900">{dayNames[dayIndex]}</div>
                <div className={`text-2xl font-bold ${date.getDate() === new Date().getDate() ? 'text-purple-600' : 'text-slate-700'}`}>
                  {date.getDate()}
                </div>
              </div>

              {/* Time slots */}
              {timeSlots.map(slot => {
                const slotKey = generateSlotKey(dayIndex, slot.toLowerCase());
                const actionsForSlot = slotActions[slotKey] || [];
                
                return (
                  <div 
                    key={`${dayIndex}-${slot}`}
                    className="h-32 bg-white rounded-lg border border-slate-200 p-2 overflow-y-auto relative time-slot"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedAction) {
                        e.currentTarget.classList.add('drop-highlight');
                      }
                    }}
                    onDragLeave={(e) => {
                      e.stopPropagation();
                      e.currentTarget.classList.remove('drop-highlight');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove('drop-highlight');
                      if (draggedAction) {
                        const uniqueId = `${draggedAction.id}-${Date.now()}`;
                        setSlotActions(prev => ({
                          ...prev,
                          [slotKey]: [...(prev[slotKey] || []), { ...draggedAction, id: uniqueId }]
                        }));
                        setDraggedAction(null);
                      }
                    }}
                  >
                    {actionsForSlot.length > 0 ? (
                      <div className="space-y-2">
                        {actionsForSlot.map((action, index) => (
                          <div 
                            key={`${action.id}-${index}`}
                            className={`p-2 rounded ${getCategoryColor(action.category)} relative group`}
                            style={{ zIndex: 10 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getCategoryIcon(action.category)}
                                <span className="text-sm font-medium">{action.title}</span>
                              </div>
                              <button 
                                onClick={() => removeActionFromSlot(slotKey, action.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded-full"
                                style={{ zIndex: 20 }}
                              >
                                <X className="w-3 h-3 text-slate-500 hover:text-red-500" />
                              </button>
                            </div>
                            <div className="flex items-center space-x-2 text-xs opacity-75 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{action.duration}m</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        Drop actions here
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the 90-day view
  const render90DayView = () => {
    const weeks = getQuarterWeeks(currentDate);
    const categories = ['business', 'body', 'balance', 'personal'];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            90-Day Planning
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevious}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-slate-700">
              {formatDate(weeks[0].startDate)} - {formatDate(weeks[weeks.length - 1].endDate)}, {weeks[0].startDate.getFullYear()}
            </span>
            <button
              onClick={goToNext}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Categories column */}
          <div className="space-y-4">
            <div className="h-12"></div> {/* Empty space for header alignment */}
            {categories.map(category => (
              <div key={category} className="h-24 flex items-center">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(category)}
                  <span className="font-medium text-slate-700 capitalize">{category}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Weeks columns */}
          {weeks.slice(0, 4).map((week, weekIndex) => (
            <div key={weekIndex} className="space-y-4">
              {/* Week header */}
              <div className="text-center">
                <div className="font-medium text-slate-900">Week {week.weekNumber}</div>
                <div className="text-sm text-slate-500">
                  {formatDate(week.startDate)} - {formatDate(week.endDate)}
                </div>
              </div>

              {/* Category slots */}
              {categories.map(category => {
                const weekCategoryKey = `week-${week.weekNumber}-${category}`;
                const actionsForWeekCategory = weeklyActionItems[weekCategoryKey] || [];
                
                return (
                  <div 
                    key={`${weekIndex}-${category}`}
                    className="h-24 bg-white rounded-lg border border-slate-200 p-2 overflow-y-auto relative time-slot"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedAction) {
                        e.currentTarget.classList.add('drop-highlight');
                      }
                    }}
                    onDragLeave={(e) => {
                      e.stopPropagation();
                      e.currentTarget.classList.remove('drop-highlight');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove('drop-highlight');
                      if (draggedAction) {
                        const uniqueId = `${draggedAction.id}-${Date.now()}`;
                        const newAction = { ...draggedAction, id: uniqueId };
                        
                        setWeeklyActionItems(prev => {
                          const existingActions = prev[weekCategoryKey] || [];
                          return {
                            ...prev,
                            [weekCategoryKey]: [...existingActions, newAction]
                          };
                        });
                        
                        setWeeklyActions(prev => {
                          const existingTitles = prev[weekCategoryKey] || [];
                          return {
                            ...prev,
                            [weekCategoryKey]: [...existingTitles, newAction.title]
                          };
                        });
                        
                        setDraggedAction(null);
                      }
                    }}
                  >
                    {actionsForWeekCategory.length > 0 ? (
                      <div className="space-y-2">
                        {actionsForWeekCategory.map((action, index) => (
                          <div 
                            key={`${action.id}-${index}`}
                            className={`p-2 rounded ${getCategoryColor(action.category)} relative group`}
                            style={{ zIndex: 10 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getCategoryIcon(action.category)}
                                <span className="text-sm font-medium">{action.title}</span>
                              </div>
                              <button 
                                onClick={() => removeActionFrom90DayView(weekCategoryKey, action.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded-full"
                                style={{ zIndex: 20 }}
                              >
                                <X className="w-3 h-3 text-slate-500 hover:text-red-500" />
                              </button>
                            </div>
                            <div className="flex items-center space-x-2 text-xs opacity-75 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{action.duration}m • {getFrequencyText(action.frequency)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        Drop actions here
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the action pool sidebar
  const renderActionPool = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
          <button
            onClick={() => setShowAddActionModal(true)}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {actionPool.map(action => (
            <div
              key={action.id}
              className={`p-3 rounded-lg border cursor-move ${getCategoryColor(action.category)}`}
              draggable
              onDragStart={() => setDraggedAction(action)}
              onDragEnd={() => setDraggedAction(null)}
            >
              <div className="flex items-center space-x-2 mb-1">
                {getCategoryIcon(action.category)}
                <span className="font-medium text-sm">{action.title}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs opacity-75">
                <Clock className="w-3 h-3" />
                <span>{action.duration}m • {getFrequencyText(action.frequency)}</span>
              </div>
            </div>
          ))}

          {actionPool.length === 0 && (
            <div className="text-center py-6 text-slate-500">
              <p className="mb-2">No actions in your pool</p>
              <button
                onClick={() => setShowAddActionModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Add Your First Action
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the add action modal
  const renderAddActionModal = () => {
    if (!showAddActionModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Add New Action</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Action Title
              </label>
              <input
                type="text"
                value={newAction.title}
                onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Morning Workout"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={newAction.duration}
                onChange={(e) => setNewAction(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="5"
                step="5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={newAction.category}
                onChange={(e) => setNewAction(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="business">Business</option>
                <option value="body">Body</option>
                <option value="balance">Balance</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Frequency
              </label>
              <select
                value={newAction.frequency}
                onChange={(e) => setNewAction(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="3x-week">3x per Week</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAddActionModal(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddAction}
              disabled={!newAction.title || !newAction.duration}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Action
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600 mt-2">
            Schedule your actions and track your progress
          </p>
          {lastSaved && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-white rounded-lg shadow-sm border border-slate-200 p-1">
            <button
              onClick={() => setView('weekly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'weekly' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setView('90day')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === '90day' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              90-Day
            </button>
          </div>
          <button 
            onClick={saveData}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Action Pool Sidebar */}
        <div className="lg:col-span-1">
          {renderActionPool()}
        </div>

        {/* Calendar View */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {view === 'weekly' ? renderWeeklyView() : render90DayView()}
        </div>
      </div>

      {/* Add Action Modal */}
      {renderAddActionModal()}

      {/* CSS for drop highlight */}
      <style jsx>{`
        .drop-highlight {
          background-color: rgba(124, 58, 237, 0.1);
          border-color: rgba(124, 58, 237, 0.5);
          pointer-events: none;
        }
        
        .time-slot {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default Calendar;