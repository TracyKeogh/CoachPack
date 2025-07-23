import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus, 
  Clock, 
  ArrowLeft,
  X,
  Filter,
  MoreHorizontal,
  Trash2,
  Edit3,
  Flag,
  Target,
  CheckCircle2,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { useCalendarData, Event, ActionPoolItem } from '../hooks/useCalendarData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import NotesPanel from './NotesPanel';

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
    getEventsForDay,
    refreshActionPool,
    saveData
  } = useCalendarData();

  const { data: goalsData } = useGoalSettingData();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDayView, setShowDayView] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | '90day' | 'year'>('week');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [showActionPool, setShowActionPool] = useState(true);
  const [draggedAction, setDraggedAction] = useState<ActionPoolItem | null>(null);
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState<string | null>(null);
  const [hoveredActionSection, setHoveredActionSection] = useState<string | null>(null);

  // Get the first day of the current week (Sunday)
  const getFirstDayOfWeek = useCallback((date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  }, []);

  // Get all days of the current week
  const getDaysOfWeek = useCallback((firstDay: Date): Date[] => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDay);
      day.setDate(firstDay.getDate() + i);
      days.push(day);
    }
    return days;
  }, []);

  // Auto-populate daily actions for the week
  const autoPopulateDailyActions = useCallback(() => {
    const firstDay = getFirstDayOfWeek(currentDate);
    const daysOfWeek = getDaysOfWeek(firstDay);
    
    // Get daily actions from action pool
    const dailyActions = data.actionPool.filter(action => action.frequency === 'daily');
    
    // For each day of the week, check if daily actions are already scheduled
    daysOfWeek.forEach(day => {
      const existingEvents = getEventsForDay(day);
      const existingDailyActions = existingEvents.filter(event => event.frequency === 'daily');
      
      dailyActions.forEach(action => {
        // Check if this daily action is already scheduled for this day
        const alreadyScheduled = existingDailyActions.some(event => 
          event.title === action.title && event.relatedGoal === action.relatedGoal
        );
        
        if (!alreadyScheduled) {
          // Schedule daily action at 9 AM by default
          const startTime = new Date(day);
          startTime.setHours(9, 0, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + action.duration);
          
          const newEvent: Event = {
            id: `daily-${action.id}-${day.toISOString().split('T')[0]}`,
            title: action.title,
            start: startTime,
            end: endTime,
            category: action.category,
            frequency: 'daily',
            relatedGoal: action.relatedGoal
          };
          
          addEvent(newEvent);
        }
      });
    });
  }, [currentDate, data.actionPool, getFirstDayOfWeek, getDaysOfWeek, getEventsForDay, addEvent]);

  // Auto-populate daily actions when week changes or data loads
  useEffect(() => {
    if (isLoaded && data.actionPool.length > 0) {
      autoPopulateDailyActions();
    }
  }, [currentDate, isLoaded, autoPopulateDailyActions]);

  // Separate actions by frequency
  const dailyActions = data.actionPool.filter(action => action.frequency === 'daily');
  const weeklyActions = data.actionPool.filter(action => action.frequency === 'weekly');
  const adHocActions = data.actionPool.filter(action => !action.frequency || action.frequency === '3x-week');

  // Format date for display
  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Format time for display
  const formatTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors = {
      business: 'bg-blue-100 text-blue-800 border-blue-200',
      body: 'bg-green-100 text-green-800 border-green-200',
      balance: 'bg-purple-100 text-purple-800 border-purple-200',
      personal: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Drag and drop handlers for actions
  const handleActionDragStart = (e: React.DragEvent, action: ActionPoolItem) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'action',
      id: action.id,
      data: action
    }));
    setDraggedAction(action);
  };

  // Drag and drop handlers for events
  const handleEventDragStart = (e: React.DragEvent, event: Event) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'event',
      id: event.id,
      data: event
    }));
    setDraggedEvent(event);
  };

  // Handle drop into action sections
  const handleActionSectionDrop = (e: React.DragEvent, frequency: 'daily' | 'weekly' | 'adhoc') => {
    e.preventDefault();
    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (dragData.type === 'event') {
      // Convert event back to action
      const event = dragData.data as Event;
      const newAction: ActionPoolItem = {
        id: `converted-${Date.now()}`,
        title: event.title,
        duration: Math.round((new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60)),
        category: event.category,
        frequency: frequency === 'adhoc' ? '3x-week' : frequency,
        relatedGoal: event.relatedGoal
      };
      
      addActionToPool(newAction);
      removeEvent(event.id);
    } else if (dragData.type === 'action') {
      // Update action frequency
      updateActionInPool(dragData.id, {
        frequency: frequency === 'adhoc' ? '3x-week' : frequency
      });
    }
    
    setDraggedAction(null);
    setDraggedEvent(null);
    setHoveredActionSection(null);
  };

  // Handle drop into calendar time slots
  const handleCalendarDrop = (e: React.DragEvent, timeSlot: string, day: Date) => {
    e.preventDefault();
    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (dragData.type === 'action') {
      const action = dragData.data as ActionPoolItem;
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const eventStart = new Date(day);
      eventStart.setHours(hours, minutes, 0, 0);
      
      scheduleActionFromPool(action.id, eventStart);
    } else if (dragData.type === 'event') {
      const event = dragData.data as Event;
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const newStart = new Date(day);
      newStart.setHours(hours, minutes, 0, 0);
      
      const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
      const newEnd = new Date(newStart.getTime() + duration);
      
      updateEvent(event.id, {
        start: newStart,
        end: newEnd
      });
    }
    
    setDraggedAction(null);
    setDraggedEvent(null);
    setHoveredTimeSlot(null);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, identifier: string) => {
    e.preventDefault();
    if (identifier.includes('action-section')) {
      setHoveredActionSection(identifier);
    } else {
      setHoveredTimeSlot(identifier);
    }
  };

  const handleDragLeave = () => {
    setHoveredTimeSlot(null);
    setHoveredActionSection(null);
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const firstDayOfWeek = getFirstDayOfWeek(currentDate);
  const daysOfWeek = getDaysOfWeek(firstDayOfWeek);

  // Early return if data is not loaded
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Calendar...</h2>
          <p className="text-slate-600">Retrieving your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Weekly Calendar</h1>
          <p className="text-slate-600">Plan and organize your actions across the week</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={autoPopulateDailyActions}
            className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Auto-populate Daily
          </button>
          
          <button
            onClick={refreshActionPool}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh Actions
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Action Pool Sidebar */}
        <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Action Pool</h2>
            <button
              onClick={() => setShowActionPool(!showActionPool)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              {showActionPool ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

          {showActionPool && (
            <div className="space-y-6">
              {/* Daily Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-900 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-green-600" />
                    Daily Actions ({dailyActions.length})
                  </h3>
                </div>
                <div
                  className={`min-h-[120px] p-3 border-2 border-dashed rounded-lg transition-colors ${
                    hoveredActionSection === 'action-section-daily'
                      ? 'border-green-400 bg-green-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'action-section-daily')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleActionSectionDrop(e, 'daily')}
                >
                  <div className="space-y-2">
                    {dailyActions.map((action) => (
                      <div
                        key={action.id}
                        className={`p-3 bg-white rounded-lg border cursor-move hover:shadow-sm transition-shadow ${getCategoryColor(action.category)}`}
                        draggable
                        onDragStart={(e) => handleActionDragStart(e, action)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {action.duration} min • {action.category}
                            </div>
                          </div>
                          <button
                            onClick={() => removeActionFromPool(action.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {dailyActions.length === 0 && (
                      <div className="text-center text-slate-400 text-sm py-4">
                        Drag actions here to make them daily
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Weekly Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-900 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-blue-600" />
                    Weekly Actions ({weeklyActions.length})
                  </h3>
                </div>
                <div
                  className={`min-h-[120px] p-3 border-2 border-dashed rounded-lg transition-colors ${
                    hoveredActionSection === 'action-section-weekly'
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'action-section-weekly')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleActionSectionDrop(e, 'weekly')}
                >
                  <div className="space-y-2">
                    {weeklyActions.map((action) => (
                      <div
                        key={action.id}
                        className={`p-3 bg-white rounded-lg border cursor-move hover:shadow-sm transition-shadow ${getCategoryColor(action.category)}`}
                        draggable
                        onDragStart={(e) => handleActionDragStart(e, action)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {action.duration} min • {action.category}
                            </div>
                          </div>
                          <button
                            onClick={() => removeActionFromPool(action.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {weeklyActions.length === 0 && (
                      <div className="text-center text-slate-400 text-sm py-4">
                        Drag actions here to make them weekly
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ad Hoc Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-900 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-purple-600" />
                    Ad Hoc Actions ({adHocActions.length})
                  </h3>
                </div>
                <div
                  className={`min-h-[120px] p-3 border-2 border-dashed rounded-lg transition-colors ${
                    hoveredActionSection === 'action-section-adhoc'
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-purple-200 bg-purple-50'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'action-section-adhoc')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleActionSectionDrop(e, 'adhoc')}
                >
                  <div className="space-y-2">
                    {adHocActions.map((action) => (
                      <div
                        key={action.id}
                        className={`p-3 bg-white rounded-lg border cursor-move hover:shadow-sm transition-shadow ${getCategoryColor(action.category)}`}
                        draggable
                        onDragStart={(e) => handleActionDragStart(e, action)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {action.duration} min • {action.category}
                            </div>
                          </div>
                          <button
                            onClick={() => removeActionFromPool(action.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {adHocActions.length === 0 && (
                      <div className="text-center text-slate-400 text-sm py-4">
                        Drag actions here for flexible scheduling
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200">
          {/* Calendar Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-semibold text-slate-900">
                  {formatDate(firstDayOfWeek)} - {formatDate(new Date(firstDayOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000))}
                </h2>
                
                <button
                  onClick={goToNextWeek}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-8 gap-4">
              {/* Time column header */}
              <div className="text-center font-medium text-slate-600 py-3">
                Time
              </div>
              
              {/* Day headers */}
              {daysOfWeek.map((day, index) => (
                <div key={index} className="text-center py-3">
                  <div className="font-medium text-slate-900">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-slate-500 text-sm">
                    {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}

              {/* Time slots and calendar cells */}
              {timeSlots.map((timeSlot) => (
                <React.Fragment key={timeSlot}>
                  {/* Time label */}
                  <div className="text-right text-sm text-slate-500 py-2 pr-2 border-r border-slate-100">
                    {timeSlot}
                  </div>
                  
                  {/* Day cells */}
                  {daysOfWeek.map((day, dayIndex) => {
                    const events = getEventsForDay(day).filter(event => {
                      const eventHour = new Date(event.start).getHours();
                      const eventMinute = new Date(event.start).getMinutes();
                      const slotTime = `${eventHour.toString().padStart(2, '0')}:${eventMinute.toString().padStart(2, '0')}`;
                      return slotTime === timeSlot;
                    });
                    
                    const cellId = `${day.toISOString()}-${timeSlot}`;
                    const isHovered = hoveredTimeSlot === cellId;
                    
                    return (
                      <div
                        key={`${day.toISOString()}-${timeSlot}`}
                        className={`min-h-[60px] p-2 border border-slate-100 rounded-lg transition-colors ${
                          isHovered ? 'bg-blue-100 border-blue-300' : 'hover:bg-slate-50'
                        }`}
                        onDragOver={(e) => handleDragOver(e, cellId)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleCalendarDrop(e, timeSlot, day)}
                      >
                        {events.length > 0 ? (
                          <div className="space-y-1">
                            {events.map((event) => (
                              <div
                                key={event.id}
                                className={`p-2 rounded-md text-xs cursor-move ${getCategoryColor(event.category)}`}
                                draggable
                                onDragStart={(e) => handleEventDragStart(e, event)}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="text-xs opacity-75">
                                  {formatTime(new Date(event.start))}
                                </div>
                                {event.frequency === 'daily' && (
                                  <div className="flex items-center mt-1">
                                    <Target className="w-3 h-3 text-green-600" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-300 text-xs">
                            {isHovered && 'Drop here'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      {lastSaved && (
        <div className="mt-4 text-center text-sm text-slate-500">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default Calendar;