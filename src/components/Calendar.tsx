import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Eye, Target, Heart, Briefcase, User, X } from 'lucide-react';
import { useCalendarData, Event, ActionPoolItem } from '../hooks/useCalendarData';

interface CalendarProps {}

const Calendar: React.FC<CalendarProps> = () => {
  const { data: calendarData, addEvent, updateEvent, removeEvent } = useCalendarData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'weekly' | '90day'>('weekly');
  const [slotActions, setSlotActions] = useState<Record<string, ActionPoolItem[]>>({});
  const [weeklyActions, setWeeklyActions] = useState<Record<string, string[]>>({}); // week-{weekNumber}-{category} -> [action titles]
  const [weeklyActionItems, setWeeklyActionItems] = useState<Record<string, ActionPoolItem[]>>({}); // week-{weekNumber}-{category} -> [action objects]
  const [draggedAction, setDraggedAction] = useState<ActionPoolItem | null>(null);
  const [showAddActionModal, setShowAddActionModal] = useState(false);

  // Sample action pool data
  const actionPool: ActionPoolItem[] = [
    { id: '1', title: 'Morning Workout', duration: 60, frequency: 'daily', category: 'body' },
    { id: '2', title: 'Team Meeting', duration: 90, frequency: 'weekly', category: 'business' },
    { id: '3', title: 'Meal Prep', duration: 120, frequency: 'weekly', category: 'body' },
    { id: '4', title: 'Reading Time', duration: 45, frequency: '3x-week', category: 'personal' },
    { id: '5', title: 'Family Dinner', duration: 90, frequency: 'daily', category: 'balance' },
    { id: '6', title: 'Project Work', duration: 180, frequency: '3x-week', category: 'business' },
    { id: '7', title: 'Meditation', duration: 20, frequency: 'daily', category: 'balance' }
  ];

  // Sync weekly actions with 90-day view
  useEffect(() => {
    if (Object.keys(slotActions).length > 0) {
      const newWeeklyActions: Record<string, string[]> = {};
      const newWeeklyActionItems: Record<string, ActionPoolItem[]> = {};
      
      Object.entries(slotActions).forEach(([slotKey, actions]) => {
        // Extract day index and time slot from the key (e.g., "day-0-Morning")
        const [_, dayIndexStr, timeSlot] = slotKey.split('-');
        const dayIndex = parseInt(dayIndexStr);
        
        // Calculate week number (0-indexed)
        const weekNumber = Math.floor(dayIndex / 7);
        
        // Map time slot to category
        const category = timeSlot.toLowerCase();
        
        // Create a key for the week and category (e.g., "week-0-morning")
        const weekCategoryKey = `week-${weekNumber}-${category}`;
        
        // Initialize arrays if they don't exist
        newWeeklyActions[weekCategoryKey] = newWeeklyActions[weekCategoryKey] || [];
        newWeeklyActionItems[weekCategoryKey] = newWeeklyActionItems[weekCategoryKey] || [];
        
        // Add actions to both arrays
        actions.forEach(action => {
          newWeeklyActions[weekCategoryKey].push(action.title);
          newWeeklyActionItems[weekCategoryKey].push(action);
        });
      });
      
      setWeeklyActions(newWeeklyActions);
      setWeeklyActionItems(newWeeklyActionItems);
    }
  }, [slotActions]);

  // Sync 90-day view actions with weekly view
  useEffect(() => {
    if (Object.keys(weeklyActionItems).length > 0) {
      const newSlotActions: Record<string, ActionPoolItem[]> = {};
      
      Object.entries(weeklyActionItems).forEach(([weekCategoryKey, actions]) => {
        // Extract week number and category from the key (e.g., "week-0-morning")
        const [_, weekNumberStr, category] = weekCategoryKey.split('-');
        const weekNumber = parseInt(weekNumberStr);
        
        // Map category to time slot
        const timeSlot = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
        
        // For simplicity, add actions to the first day of the week
        const dayIndex = weekNumber * 7;
        const slotKey = `day-${dayIndex}-${timeSlot}`;
        
        // Initialize array if it doesn't exist
        newSlotActions[slotKey] = newSlotActions[slotKey] || [];
        
        // Add actions
        actions.forEach(action => {
          newSlotActions[slotKey].push(action);
        });
      });
      
      setSlotActions(newSlotActions);
    }
  }, [weeklyActionItems]);

  // Generate dates for the current week
  const getWeekDates = useCallback(() => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }, [currentDate]);

  // Format date for display
  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'Today';
    }
    
    const day = date.getDate();
    return `${day.getDate()} ${day.toLocaleString('default', { month: 'short' })}`;
  };

  // Generate a unique key for a day and time slot
  const generateSlotKey = (dayIndex: number, slot: string) => {
    return `day-${dayIndex}-${slot}`;
  };

  // Generate a unique key for a week and category
  const generateWeekCategoryKey = (weekIndex: number, category: string) => {
    return `week-${weekIndex}-${category}`;
  };

  // Remove an action from a slot in the weekly view
  const removeActionFromSlot = (slotKey: string, actionId: string) => {
    setSlotActions(prev => {
      const newSlotActions = {...prev};
      if (newSlotActions[slotKey]) {
        newSlotActions[slotKey] = newSlotActions[slotKey].filter(a => a.id !== actionId);
      }
      
      // Also remove from 90-day view
      const [_, dayIndexStr, timeSlot] = slotKey.split('-');
      const dayIndex = parseInt(dayIndexStr);
      const weekNumber = Math.floor(dayIndex / 7);
      const category = timeSlot.toLowerCase();
      const weekCategoryKey = `week-${weekNumber}-${category}`;
      
      // Update weeklyActions and weeklyActionItems
      setWeeklyActions(prev => {
        const newWeeklyActions = {...prev};
        if (newWeeklyActions[weekCategoryKey]) {
          const actionToRemove = newSlotActions[slotKey]?.find(a => a.id === actionId);
          if (actionToRemove) {
            newWeeklyActions[weekCategoryKey] = newWeeklyActions[weekCategoryKey].filter(
              title => title !== actionToRemove.title
            );
          }
        }
        return newWeeklyActions;
      });
      
      setWeeklyActionItems(prev => {
        const newWeeklyActionItems = {...prev};
        if (newWeeklyActionItems[weekCategoryKey]) {
          newWeeklyActionItems[weekCategoryKey] = newWeeklyActionItems[weekCategoryKey].filter(
            a => a.id !== actionId
          );
        }
        return newWeeklyActionItems;
      });
      
      return newSlotActions;
    });
  };

  // Remove an action from a week/category in the 90-day view
  const removeActionFromWeekCategory = (weekCategoryKey: string, actionId: string) => {
    setWeeklyActionItems(prev => {
      const newWeeklyActionItems = {...prev};
      if (newWeeklyActionItems[weekCategoryKey]) {
        newWeeklyActionItems[weekCategoryKey] = newWeeklyActionItems[weekCategoryKey].filter(a => a.id !== actionId);
      }
      
      // Also remove from weekly view
      const [_, weekNumberStr, category] = weekCategoryKey.split('-');
      const weekNumber = parseInt(weekNumberStr);
      const timeSlot = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize
      const dayIndex = weekNumber * 7; // First day of the week
      const slotKey = `day-${dayIndex}-${timeSlot}`;
      
      // Update slotActions
      setSlotActions(prev => {
        const newSlotActions = {...prev};
        if (newSlotActions[slotKey]) {
          newSlotActions[slotKey] = newSlotActions[slotKey].filter(a => a.id !== actionId);
        }
        return newSlotActions;
      });
      
      return newWeeklyActionItems;
    });
    
    setWeeklyActions(prev => {
      const newWeeklyActions = { ...prev };
      // Since we don't have a direct mapping from actionId to title,
      // we'll rely on the weeklyActionItems update above to handle this
      return newWeeklyActions;
    });
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'body': return 'bg-green-100 text-green-800 border-green-200';
      case 'balance': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'personal': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return <Briefcase className="w-4 h-4" />;
      case 'body': return <Heart className="w-4 h-4" />;
      case 'balance': return <Target className="w-4 h-4" />;
      case 'personal': return <User className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  // Render weekly view
  const renderWeeklyView = () => {
    const weekDates = getWeekDates();
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];

    return (
      <div className="flex space-x-6">
        {/* Action Pool Sidebar */}
        <div className="w-80 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
            <button 
              onClick={() => setShowAddActionModal(true)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex-1 space-y-2">
              {actionPool.map(action => (
                <div
                  key={action.id}
                  className={`p-3 rounded-lg border cursor-move ${getCategoryColor(action.category)}`}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggedAction(action);
                  }}
                  onDragEnd={() => setDraggedAction(null)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {getCategoryIcon(action.category)}
                    <span className="font-medium text-sm">{action.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs opacity-75">
                    <Clock className="w-3 h-3" />
                    <span>{action.duration}m • {action.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Weekly Planning</h2>
                <p className="text-slate-600">
                  {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {
                    weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setDate(currentDate.getDate() - 7);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  This Week
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setDate(currentDate.getDate() + 7);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-8 gap-4">
              {/* Time slots header */}
              <div className="space-y-4">
                <div className="h-12"></div>
                {timeSlots.map(slot => (
                  <div key={slot} className="h-32 flex items-center">
                    <span className="text-sm font-medium text-slate-600">{slot}</span>
                  </div>
                ))}
              </div>

              {/* Days */}
              {weekDates.map((day, dayIndex) => {
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div key={dayIndex} className="space-y-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-600">
                        {day.toLocaleDateString('en-US', { weekday: 'long' })}
                      </div>
                      <div className={`text-lg font-bold mt-1 ${
                        isToday ? 'text-blue-600' : 'text-slate-900'
                      }`}>
                        {day.getDate()}
                      </div>
                    </div>
                    
                    {timeSlots.map(slot => {
                      const slotKey = generateSlotKey(dayIndex, slot);
                      
                      return (
                        <div
                          key={`${dayIndex}-${slot}`}
                          className={`time-slot min-h-24 p-2 border border-slate-200 rounded-lg ${
                            isToday ? 'bg-purple-50' : 'bg-white'
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.add('drop-highlight');
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
                              const slotKey = generateSlotKey(dayIndex, slot);
                              // Create a new action with a unique ID
                              const newAction: ActionPoolItem = {
                                ...draggedAction,
                                id: `${draggedAction.id}-${Date.now()}`
                              };
                              
                              setSlotActions(prev => ({
                                ...prev,
                                [slotKey]: [...(prev[slotKey] || []), newAction]
                              }));
                              setDraggedAction(null);
                            }
                          }}
                        >
                          {slotActions[slotKey] && slotActions[slotKey].length > 0 ? (
                            <div className="space-y-1">
                              {slotActions[slotKey].map((action, index) => (
                                <div 
                                  key={`${action.id}-${index}`}
                                  className={`p-2 rounded text-xs ${getCategoryColor(action.category)} relative group`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{action.title}</span>
                                    <button
                                      onClick={() => removeActionFromSlot(slotKey, action.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-opacity absolute right-1 top-1"
                                    >
                                      <X className="w-3 h-3 text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-slate-400 text-xs text-center">
                              Drop actions here
                            </div> 
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render 90-day view
  const render90DayView = () => {
    const weeks = Array.from({ length: 12 }, (_, i) => i);
    const categories = ['business', 'body', 'balance'];
    
    return (
      <div className="flex space-x-6">
        {/* Action Pool Sidebar */}
        <div className="w-80 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
            <button 
              onClick={() => setShowAddActionModal(true)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex-1 space-y-2">
              {actionPool.map(action => (
                <div
                  key={action.id}
                  className={`p-3 rounded-lg border cursor-move ${getCategoryColor(action.category)}`}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggedAction(action);
                  }}
                  onDragEnd={() => setDraggedAction(null)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {getCategoryIcon(action.category)}
                    <span className="font-medium text-sm">{action.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs opacity-75">
                    <Clock className="w-3 h-3" />
                    <span>{action.duration}m • {action.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 90-Day Calendar */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">90-Day Action Focus</h2>
                <p className="text-slate-600">12 Week Year Action Focus</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-4 gap-4">
              {weeks.map((weekIndex) => (
                <div key={weekIndex} className="border border-slate-200 rounded-lg p-4">
                  <div className="text-center mb-3">
                    <div className="text-sm font-medium text-slate-600">Week</div>
                    <div className="text-xl font-bold text-slate-900">{weekIndex + 1}</div>
                  </div>
                  
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const weekCategoryKey = generateWeekCategoryKey(weekIndex, category);
                      
                      return (
                        <div
                          key={`${weekIndex}-${category}`}
                          className="min-h-24 p-2 border border-slate-200 rounded-lg bg-white"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.add('drop-highlight');
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
                              const weekCategoryKey = generateWeekCategoryKey(weekIndex, category);
                              // Create a new action with a unique ID
                              const newAction: ActionPoolItem = {
                                ...draggedAction,
                                id: `${draggedAction.id}-${Date.now()}`
                              };
                              
                              // Update weeklyActionItems
                              setWeeklyActionItems(prev => {
                                const newItems = { ...prev };
                                if (!newItems[weekCategoryKey]) {
                                  newItems[weekCategoryKey] = [];
                                }
                                newItems[weekCategoryKey] = [...(newItems[weekCategoryKey] || []), newAction];
                                return newItems;
                              });
                              
                              // Update weeklyActions for backward compatibility
                              setWeeklyActions(prev => {
                                const newActions = { ...prev };
                                if (!newActions[weekCategoryKey]) {
                                  newActions[weekCategoryKey] = [];
                                }
                                newActions[weekCategoryKey] = [...(newActions[weekCategoryKey] || []), newAction.title];
                                return newActions;
                              });
                              
                              // Also update the weekly view
                              const timeSlot = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize
                              const dayIndex = weekIndex * 7; // First day of the week
                              const slotKey = `day-${dayIndex}-${timeSlot}`;
                              
                              setSlotActions(prev => {
                                const newSlotActions = {...prev};
                                if (!newSlotActions[slotKey]) {
                                  newSlotActions[slotKey] = [];
                                }
                                newSlotActions[slotKey] = [...(newSlotActions[slotKey] || []), newAction];
                                return newSlotActions;
                              });
                              
                              setDraggedAction(null);
                            }
                          }}
                        >
                          {weeklyActionItems[weekCategoryKey] && weeklyActionItems[weekCategoryKey].length > 0 ? (
                            <div className="space-y-1">
                              {weeklyActionItems[weekCategoryKey].map((action, index) => (
                                <div 
                                  key={`${action.id}-${index}`}
                                  className={`p-2 rounded text-xs ${getCategoryColor(action.category)} relative group`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{action.title}</span>
                                    <button
                                      onClick={() => removeActionFromWeekCategory(weekCategoryKey, action.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-opacity absolute right-1 top-1"
                                    >
                                      <X className="w-3 h-3 text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-slate-400 text-xs text-center">
                              Drop actions here
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <style jsx>{`
        .drop-highlight {
          background-color: rgba(124, 58, 237, 0.1);
          border-color: rgba(124, 58, 237, 0.5);
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2); 
          pointer-events: none;
        }
        
        .time-slot {
          position: relative;
          z-index: 1; 
        }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600">Transform your vision into daily action</p>
        </div>
        <button
          onClick={() => setShowAddActionModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Action</span>
        </button>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 flex space-x-1 max-w-md">
        {(['weekly', '90day'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === view
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {view === '90day' ? '90-Day' : 'Weekly'}
          </button>
        ))}
      </div>

      {/* Calendar Content */}
      <div>
        {currentView === 'weekly' && renderWeeklyView()}
        {currentView === '90day' && render90DayView()}
      </div>
    </div>
  );
};

export default Calendar;