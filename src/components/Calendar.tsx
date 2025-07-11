import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Clock, 
  Briefcase, 
  Heart, 
  Zap,
  LayoutGrid,
  CalendarDays,
  CalendarRange,
  CalendarClock
} from 'lucide-react';
import { useCalendarData, type Event, type ActionPoolItem } from '../hooks/useCalendarData';

const Calendar: React.FC = () => {
  const { 
    data, 
    isLoaded,
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

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'daily' | 'weekly' | '90day' | 'yearly'>('weekly');
  const [showAddActionForm, setShowAddActionForm] = useState(false);
  const [newAction, setNewAction] = useState<Partial<ActionPoolItem>>({
    title: '',
    duration: 60,
    category: 'business',
    frequency: 'weekly'
  });

  // Drag and drop state
  const [draggedAction, setDraggedAction] = useState<ActionPoolItem | null>(null);
  const [highlightedSlot, setHighlightedSlot] = useState<string | null>(null);
  const [highlightedWeekCategory, setHighlightedWeekCategory] = useState<string | null>(null);

  // Weekly view state
  const [slotActions, setSlotActions] = useState<Record<string, ActionPoolItem[]>>({});

  // 90-day view state
  const [weeklyActionItems, setWeeklyActionItems] = useState<Record<string, ActionPoolItem[]>>({});

  // Refresh action pool on mount
  useEffect(() => {
    refreshActionPool();
  }, [refreshActionPool]);

  // Helper function to get the week number (1-12) for a given date
  const getWeekNumber = (date: Date): number => {
    const startDate = new Date(currentDate);
    // Set to the first day of the current week (Sunday)
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;
    
    // Ensure week number is between 1 and 12
    const clampedWeekNumber = Math.max(1, Math.min(12, weekNumber));
    console.log(`Date: ${date.toDateString()}, Week Number: ${clampedWeekNumber}`);
    return clampedWeekNumber;
  };

  // Helper function to get the day index (0-6) for a given date
  const getDayIndex = (date: Date): number => {
    return date.getDay();
  };

  // Helper function to get the day of the week name
  const getDayName = (dayIndex: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  // Helper function to get the month name
  const getMonthName = (monthIndex: number): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
  };

  // Helper function to get the dates for the current week
  const getWeekDates = (): Date[] => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // Centralized function to handle action drops
  const handleActionDrop = (action: ActionPoolItem, targetType: 'weeklySlot' | '90DayCategory', targetIdentifier: any) => {
    // Ensure the action has a unique ID
    console.log("handleActionDrop called with:", { action, targetType, targetIdentifier });
    
    // Create a deep copy of the action with a unique ID
    const actionWithId: ActionPoolItem = {
      ...action,
      id: action.id || `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      category: action.category
    };
    
    console.log("Action with ID:", actionWithId);

    if (targetType === 'weeklySlot') {
      const { dayIndex, slot } = targetIdentifier;
      
      // Update weekly view
      const slotKey = `day-${dayIndex}-${slot}`;
      setSlotActions(prev => {
        const existingActions = prev[slotKey] || [];
        // Check if action already exists in this slot
        if (existingActions.some(a => a.id === actionWithId.id)) {
          return prev;
        }
        return {
          ...prev,
          [slotKey]: [...existingActions, actionWithId]
        };
      });
      
      // Calculate week number and category for 90-day view
      const weekNumber = getWeekNumber(getWeekDates()[dayIndex]);
      const category = slot.toLowerCase() as 'business' | 'body' | 'balance';
      const weekCategoryKey = `week-${weekNumber}-${category}`;
      
      // Update 90-day view
      setWeeklyActionItems(prev => {
        const existingActions = prev[weekCategoryKey] || [];
        // Check if action already exists in this week/category
        if (existingActions.some(a => a.id === actionWithId.id)) {
          return prev;
        }
        return {
          ...prev,
          [weekCategoryKey]: [...existingActions, actionWithId]
        };
      });
    } else if (targetType === '90DayCategory') {
      const { weekNumber, category } = targetIdentifier;
      
      console.log("Dropping in 90-day view:", { weekNumber, category });
      
      // Update 90-day view
      const weekCategoryKey = `week-${weekNumber}-${category}`;
      setWeeklyActionItems(prev => {
        const existingActions = prev[weekCategoryKey] || [];
        // Check if action already exists in this week/category
        if (existingActions.some(a => a.id === actionWithId.id)) {
          return prev;
        }
        return {
          ...prev,
          [weekCategoryKey]: [...existingActions, actionWithId]
        };
      });
      
      // Calculate a suitable day index and slot for weekly view
      // For simplicity, we'll use the first day of the week and the corresponding slot
      // Find a day that falls within this week number
      const weekDates = getWeekDates();
      let dayIndex = -1;
      
      // Find the first day that belongs to this week number
      for (let i = 0; i < weekDates.length; i++) {
        if (getWeekNumber(weekDates[i]) === weekNumber) {
          dayIndex = i;
          break;
        }
      }
      
      // If no matching day found, use Monday (index 1) as fallback
      if (dayIndex === -1) {
        dayIndex = 1;
      }
      
      // Map category to slot
      let slot: string;
      if (category === 'business') {
        slot = 'Morning';
      } else if (category === 'body') {
        slot = 'Afternoon';
      } else {
        slot = 'Evening';
      }
      
      console.log("Calculated weekly slot:", { dayIndex, slot });
      
      const slotKey = `day-${dayIndex}-${slot}`;
      
      // Update weekly view
      setSlotActions(prev => {
        const existingActions = prev[slotKey] || [];
        // Check if action already exists in this slot
        if (existingActions.some(a => a.id === actionWithId.id)) {
          return prev;
        }
        return {
          ...prev,
          [slotKey]: [...existingActions, actionWithId]
        };
      });
    }
  };

  // Centralized function to remove actions
  const removeAction = (actionId: string) => {
    // Remove from weekly view
    console.log("Removing action:", actionId);
    setSlotActions(prev => {
      const newSlotActions: Record<string, ActionPoolItem[]> = {};
      let found = false;
      
      Object.entries(prev).forEach(([key, actions]) => {
        const filteredActions = actions.filter(a => a.id !== actionId);
        if (filteredActions.length !== actions.length) {
          found = true;
        }
        newSlotActions[key] = filteredActions;
      });
      
      return found ? newSlotActions : prev;
    });
    
    // Remove from 90-day view
    setWeeklyActionItems(prev => {
      const newWeeklyActionItems: Record<string, ActionPoolItem[]> = {};
      let found = false;
      
      Object.entries(prev).forEach(([key, actions]) => {
        const filteredActions = actions.filter(a => a.id !== actionId);
        if (filteredActions.length !== actions.length) {
          found = true;
        }
        newWeeklyActionItems[key] = filteredActions;
      });
      
      return found ? newWeeklyActionItems : prev;
    });
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Form handlers
  const handleAddAction = () => {
    if (!newAction.title || !newAction.duration) return;
    
    addActionToPool({
      title: newAction.title,
      duration: newAction.duration,
      category: newAction.category || 'business',
      frequency: newAction.frequency || 'weekly'
    });
    
    setNewAction({
      title: '',
      duration: 60,
      category: 'business',
      frequency: 'weekly'
    });
    
    setShowAddActionForm(false);
  };

  // Render the daily view
  const renderDailyView = () => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-slate-900">Daily View Coming Soon</h3>
          <p className="text-slate-600">This view is under development. Please use the Weekly or 90-Day view for now.</p>
        </div>
      </div>
    );
  };

  // Render the weekly view
  const renderWeeklyView = () => {
    const weekDates = getWeekDates();
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];
    
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-8 gap-4">
          {/* Time slots column */}
          <div className="col-span-1">
            <div className="h-12"></div> {/* Empty space for alignment with day headers */}
            {timeSlots.map((slot) => (
              <div key={slot} className="h-32 flex items-center justify-center">
                <div className="text-sm font-medium text-slate-700">{slot}</div>
              </div>
            ))}
          </div>
          
          {/* Days columns */}
          {weekDates.map((date, dayIndex) => (
            <div key={dayIndex} className="col-span-1">
              {/* Day header */}
              <div className="h-12 text-center">
                <div className={`font-medium ${date.getDate() === new Date().getDate() ? 'text-purple-600' : 'text-slate-900'}`}>
                  {getDayName(date.getDay()).substring(0, 3)}
                </div>
                <div className={`text-sm ${date.getDate() === new Date().getDate() ? 'text-purple-600 font-bold' : 'text-slate-500'}`}>
                  {date.getDate()}
                </div>
              </div>
              
              {/* Time slots */}
              {timeSlots.map((slot) => {
                const slotKey = `day-${dayIndex}-${slot}`;
                const slotActionItems = slotActions[slotKey] || [];
                
                return (
                  <div 
                    key={slotKey}
                    className={`h-32 border border-slate-200 rounded-lg p-2 overflow-y-auto time-slot ${
                      highlightedSlot === slotKey ? 'bg-purple-50 border-purple-300' : 'hover:bg-slate-50'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setHighlightedSlot(slotKey);
                    }}
                    onDragLeave={() => setHighlightedSlot(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setHighlightedSlot(null);
                      
                      if (draggedAction) {
                        handleActionDrop(draggedAction, 'weeklySlot', { dayIndex, slot });
                        setDraggedAction(null);
                      }
                    }}
                  >
                    {slotActionItems.length === 0 ? (
                      <div className="text-center text-sm text-slate-400 h-full flex items-center justify-center">
                        Drop actions here
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {slotActionItems.map((action, index) => (
                          <div 
                            key={`${action.id}-${index}`}
                            className={`p-2 rounded-lg text-sm relative ${
                              action.category === 'business' ? 'bg-purple-100 text-purple-800' :
                              action.category === 'body' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}
                            draggable={true}
                            onDragStart={(e) => {
                              e.stopPropagation();
                              setDraggedAction(action);
                            }}
                            onDragEnd={() => setDraggedAction(null)}
                          >
                            <div className="flex items-start">
                              <div className="flex-1 pr-6">{action.title}</div>
                              <button 
                                className="absolute top-1 right-1 text-slate-400 hover:text-red-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAction(action.id);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-xs opacity-75 mt-1">
                              {action.duration} min • {action.frequency}
                            </div>
                          </div>
                        ))}
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
    const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
    const categories = ['business', 'body', 'balance'];
    
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-900">90-Day Action Plan</h3>
          <p className="text-slate-600">Drag actions to weeks and categories to plan your quarter</p>
        </div>
        
        <div className="grid grid-cols-[auto_repeat(12,1fr)] gap-2">
          {/* Header row with week numbers */}
          <div className="col-span-1"></div> {/* Empty cell for category labels */}
          {weeks.map(week => (
            <div key={week} className="col-span-1 text-center">
              <div className="font-medium text-slate-900">Week {week}</div>
            </div>
          ))}
          
          {/* Category rows */}
          {categories.map((category) => (
            <React.Fragment key={`category-${category}`}>
              {/* Category label */}
              <div className="col-span-1 flex items-center">
                <div className={`p-2 rounded-lg ${
                  category === 'business' ? 'bg-purple-100 text-purple-800' :
                  category === 'body' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {category === 'business' ? <Briefcase className="w-5 h-5" /> :
                   category === 'body' ? <Heart className="w-5 h-5" /> :
                   <Zap className="w-5 h-5" />}
                </div>
              </div>
              
              {/* Week cells */}
              {weeks.map(week => {
                const weekCategoryKey = `week-${week}-${category.toLowerCase()}`;
                const weekActions = weeklyActionItems[weekCategoryKey] || [];
                
                return (
                  <div 
                    key={weekCategoryKey}
                    className={`col-span-1 border border-slate-200 rounded-lg p-2 min-h-24 time-slot ${
                      highlightedWeekCategory === weekCategoryKey ? 'bg-purple-50 border-purple-300' : 'hover:bg-slate-50'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setHighlightedWeekCategory(weekCategoryKey);
                      e.stopPropagation();
                    }}
                    onDragLeave={() => setHighlightedWeekCategory(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setHighlightedWeekCategory(null);
                      
                      if (draggedAction) {
                        handleActionDrop(draggedAction, '90DayCategory', { weekNumber: week, category: category.toLowerCase() });
                        setDraggedAction(null);
                        e.stopPropagation();
                      }
                    }}
                  >
                    {weekActions.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 h-full flex items-center justify-center">
                        Drop actions here
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {weekActions.map((action, index) => (
                          <div 
                            key={`${action.id}-${index}`}
                            className={`p-1 rounded text-xs relative ${
                              action.category === 'business' ? 'bg-purple-100 text-purple-800' :
                              action.category === 'body' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}
                            draggable={true}
                            onDragStart={(e) => {
                              e.stopPropagation();
                              setDraggedAction(action);
                            }}
                            onDragEnd={() => setDraggedAction(null)}
                          >
                            <div className="flex items-start">
                              <div className="flex-1 pr-5 truncate">{action.title}</div>
                              <button 
                                className="absolute top-0 right-0 text-slate-400 hover:text-red-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAction(action.id);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Render the yearly view
  const renderYearlyView = () => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-slate-900">Yearly View Coming Soon</h3>
          <p className="text-slate-600">This view is under development. Please use the Weekly or 90-Day view for now.</p>
        </div>
      </div>
    );
  };

  // Render the action pool
  const renderActionPool = () => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
          <button
            onClick={() => setShowAddActionForm(!showAddActionForm)}
            className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
          >
            {showAddActionForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
        
        {showAddActionForm && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
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
                  placeholder="Enter action title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newAction.duration}
                    onChange={(e) => setNewAction(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="15"
                    step="15"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newAction.category}
                    onChange={(e) => setNewAction(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="business">Business</option>
                    <option value="body">Body</option>
                    <option value="balance">Balance</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Frequency
                </label>
                <select
                  value={newAction.frequency}
                  onChange={(e) => setNewAction(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="3x-week">3x per Week</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleAddAction}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Action
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.actionPool.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No actions in your pool</p>
              <button
                onClick={() => setShowAddActionForm(true)}
                className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Add your first action
              </button>
            </div>
          ) : (
            data.actionPool.map((action) => (
              <div 
                key={action.id}
                className={`p-3 rounded-lg border border-slate-200 hover:shadow-sm transition-all cursor-move ${
                  action.category === 'business' ? 'bg-purple-50' :
                  action.category === 'body' ? 'bg-green-50' : 'bg-blue-50'
                }`}
                draggable={true}
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDraggedAction(action);
                  console.log("Dragging from action pool:", action);
                }}
                onDragEnd={() => setDraggedAction(null)}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg mr-3 ${
                    action.category === 'business' ? 'bg-purple-100 text-purple-800' :
                    action.category === 'body' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {action.category === 'business' ? <Briefcase className="w-4 h-4" /> :
                     action.category === 'body' ? <Heart className="w-4 h-4" /> :
                     <Zap className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{action.title}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      {action.duration} min • {action.frequency}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="space-y-8">
      {/* Header with title and description */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600 mt-2">
            Schedule your actions and track your progress
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={goToPreviousWeek}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Today
          </button>
          
          <button
            onClick={goToNextWeek}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="text-lg font-semibold text-slate-900 ml-4">
            {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
          </div>
        </div>
      </div>

      {/* View selector */}
      <div className="flex items-center space-x-4 border-b border-slate-200 pb-4 overflow-x-auto">
        <button
          onClick={() => setCurrentView('daily')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'daily' ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarClock className="w-5 h-5" />
          <span>Daily</span>
        </button>
        
        <button
          onClick={() => setCurrentView('weekly')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'weekly' ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span>Weekly</span>
        </button>
        
        <button
          onClick={() => setCurrentView('90day')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            currentView === '90day' ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarRange className="w-5 h-5" />
          <span>90-Day</span>
        </button>
        
        <button
          onClick={() => setCurrentView('yearly')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'yearly' ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span>Yearly</span>
        </button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Calendar view */}
        <div className="lg:col-span-2">
          {currentView === 'daily' && renderDailyView()}
          {currentView === 'weekly' && renderWeeklyView()}
          {currentView === '90day' && render90DayView()}
          {currentView === 'yearly' && renderYearlyView()}
        </div>
        
        {/* Action pool */}
        <div className="lg:col-span-1">
          {renderActionPool()}
        </div>
      </div>
    </div>
  );
};

export default Calendar;