// At the top of your Calendar.tsx file, make sure you have these imports:
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
  CheckCircle2
} from 'lucide-react';
import { useCalendarData, Event, ActionPoolItem } from '../hooks/useCalendarData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import NotesPanel from './NotesPanel';
import Header from './Header';

const Calendar: React.FC = () => {
  // Your existing hooks
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

  // Your existing state variables
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDayView, setShowDayView] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | '90day' | 'year'>('week');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showActionPool, setShowActionPool] = useState(true);
  
  // ADD THESE NEW STATE VARIABLES for drag & drop:
  const [draggedAction, setDraggedAction] = useState<ActionPoolItem | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState<string | null>(null);

  // Your existing helper functions (getFirstDayOfWeek, getDaysOfWeek, etc.)
  const getFirstDayOfWeek = useCallback((date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  }, []);

  const getDaysOfWeek = useCallback((firstDay: Date): Date[] => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDay);
      day.setDate(firstDay.getDate() + i);
      days.push(day);
    }
    return days;
  }, []);

  // ADD THESE NEW FUNCTIONS for drag & drop:

  // Auto-populate daily actions when component loads or week changes
  useEffect(() => {
    if (isLoaded && data.actionPool.length > 0) {
      autoPopulateDailyActions();
    }
  }, [currentDate, isLoaded, data.actionPool]);

  // Auto-populate daily actions function
  const autoPopulateDailyActions = () => {
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
          
          scheduleActionFromPool(action.id, startTime);
        }
      });
    });
  };

  // Enhanced drag start for actions
  const handleActionDragStart = (e: React.DragEvent, action: ActionPoolItem) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'action',
      id: action.id,
      data: action
    }));
    setDraggedAction(action);
  };

  // Enhanced drag start for events
  const handleEventDragStart = (e: React.DragEvent, event: Event) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'event',
      id: event.id,
      data: event
    }));
    setDraggedEvent(event);
  };

  // Handle drop into action frequency columns
  const handleColumnDrop = (e: React.DragEvent, frequency: 'daily' | 'weekly' | 'adhoc') => {
    e.preventDefault();
    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (dragData.type === 'event') {
      // Convert event back to action and update frequency
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
      
      // If moved to daily, auto-populate for the week
      if (frequency === 'daily') {
        setTimeout(() => autoPopulateDailyActions(), 100);
      }
    } else if (dragData.type === 'action') {
      // Update action frequency
      updateActionInPool(dragData.id, {
        frequency: frequency === 'adhoc' ? '3x-week' : frequency
      });
      
      // If changed to daily, auto-populate for the week
      if (frequency === 'daily') {
        setTimeout(() => autoPopulateDailyActions(), 100);
      }
    }
    
    setDraggedAction(null);
    setDraggedEvent(null);
    setHoveredColumn(null);
  };

  // Handle drop into calendar time slots
  const handleTimeSlotDrop = (e: React.DragEvent, timeSlot: string, day: Date) => {
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
    if (identifier.includes('column-')) {
      setHoveredColumn(identifier);
    } else {
      setHoveredTimeSlot(identifier);
    }
  };

  const handleDragLeave = () => {
    setHoveredColumn(null);
    setHoveredTimeSlot(null);
  };

  // Your existing functions (formatDate, formatTime, getCategoryColor, etc.)
  const formatTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  const getCategoryColor = (category: string) => {
    const colors = {
      business: 'bg-blue-100 text-blue-800',
      body: 'bg-green-100 text-green-800',
      balance: 'bg-purple-100 text-purple-800',
      personal: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      business: '💼',
      body: '💪',
      balance: '⚖️',
      personal: '🎯'
    };
    return icons[category as keyof typeof icons] || '📝';
  };

  // Your existing navigation functions
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

  const firstDayOfWeek = getFirstDayOfWeek(currentDate);
  const daysOfWeek = getDaysOfWeek(firstDayOfWeek);

  return (
    <>
      <Header />
      <div className="ml-16">
    <div className="max-w-7xl mx-auto p-6">
      {/* YOUR EXISTING CALENDAR HEADER AND NAVIGATION */}
      
      {/* Action Pool with Enhanced Drag & Drop */}
      {showActionPool && viewMode === 'week' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={autoPopulateDailyActions}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
              >
                Auto-populate Daily
              </button>
              <button
                onClick={refreshActionPool}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
              >
                Refresh from Goals
              </button>
            </div>
          </div>

          {/* Three Column Layout: Daily, Weekly, Ad Hoc */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Daily Actions Column */}
            <div
              className={`min-h-[300px] p-4 border-2 border-dashed rounded-lg transition-colors ${
                hoveredColumn === 'column-daily'
                  ? 'border-green-400 bg-green-50'
                  : 'border-green-200 bg-green-25'
              }`}
              onDragOver={(e) => handleDragOver(e, 'column-daily')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleColumnDrop(e, 'daily')}
            >
              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Daily ({data.actionPool.filter(action => action.frequency === 'daily').length})
              </h4>
              <div className="space-y-3">
                {data.actionPool
                  .filter(action => action.frequency === 'daily')
                  .map((action) => (
                    <div
                      key={action.id}
                      className="p-3 rounded-lg border border-slate-200 hover:shadow-md transition-all cursor-move bg-white"
                      draggable
                      onDragStart={(e) => handleActionDragStart(e, action)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm">
                            {getCategoryIcon(action.category)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 text-sm">{action.title}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(action.category)}`}>
                                {action.category}
                              </span>
                              <span className="text-xs text-slate-500">
                                {action.duration} min
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeActionFromPool(action.id)}
                          className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                {data.actionPool.filter(action => action.frequency === 'daily').length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-sm">
                    Drop actions here to make them daily
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Actions Column */}
            <div
              className={`min-h-[300px] p-4 border-2 border-dashed rounded-lg transition-colors ${
                hoveredColumn === 'column-weekly'
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-blue-200 bg-blue-25'
              }`}
              onDragOver={(e) => handleDragOver(e, 'column-weekly')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleColumnDrop(e, 'weekly')}
            >
              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Weekly ({data.actionPool.filter(action => action.frequency === 'weekly').length})
              </h4>
              <div className="space-y-3">
                {data.actionPool
                  .filter(action => action.frequency === 'weekly')
                  .map((action) => (
                    <div
                      key={action.id}
                      className="p-3 rounded-lg border border-slate-200 hover:shadow-md transition-all cursor-move bg-white"
                      draggable
                      onDragStart={(e) => handleActionDragStart(e, action)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm">
                            {getCategoryIcon(action.category)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 text-sm">{action.title}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(action.category)}`}>
                                {action.category}
                              </span>
                              <span className="text-xs text-slate-500">
                                {action.duration} min
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeActionFromPool(action.id)}
                          className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                {data.actionPool.filter(action => action.frequency === 'weekly').length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-sm">
                    Drop actions here to make them weekly
                  </div>
                )}
              </div>
            </div>

            {/* Ad Hoc Actions Column */}
            <div
              className={`min-h-[300px] p-4 border-2 border-dashed rounded-lg transition-colors ${
                hoveredColumn === 'column-adhoc'
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-purple-200 bg-purple-25'
              }`}
              onDragOver={(e) => handleDragOver(e, 'column-adhoc')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleColumnDrop(e, 'adhoc')}
            >
              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Ad Hoc ({data.actionPool.filter(action => action.frequency === '3x-week' || !action.frequency).length})
              </h4>
              <div className="space-y-3">
                {data.actionPool
                  .filter(action => action.frequency === '3x-week' || !action.frequency)
                  .map((action) => (
                    <div
                      key={action.id}
                      className="p-3 rounded-lg border border-slate-200 hover:shadow-md transition-all cursor-move bg-white"
                      draggable
                      onDragStart={(e) => handleActionDragStart(e, action)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm">
                            {getCategoryIcon(action.category)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 text-sm">{action.title}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(action.category)}`}>
                                {action.category}
                              </span>
                              <span className="text-xs text-slate-500">
                                {action.duration} min
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeActionFromPool(action.id)}
                          className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                {data.actionPool.filter(action => action.frequency === '3x-week' || !action.frequency).length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-sm">
                    Drop actions here for flexible scheduling
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Show message when no actions at all */}
          {data.actionPool.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-slate-400" />
              </div>
              <p className="mb-3">No actions in your pool</p>
              <button 
                onClick={refreshActionPool}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Refresh from Goals
              </button>
            </div>
          )}
        </div>
      )}

      {/* YOUR EXISTING CALENDAR GRID - just add drop handlers to day cells */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        {/* Your existing calendar header */}
        
        {/* Calendar Days Grid - enhance your existing day cells like this: */}
        <div className="grid grid-cols-7 gap-4 p-6">
          {daysOfWeek.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className={`min-h-[120px] p-2 border border-slate-200 rounded-lg transition-colors ${
                hoveredTimeSlot === `${day.toISOString()}-drop` ? 'bg-blue-100 border-blue-300' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, `${day.toISOString()}-drop`)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleTimeSlotDrop(e, '09:00', day)}
            >
              <div className="font-medium text-center mb-2">
                {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
              </div>
              
              {/* Events for this day */}
              {getEventsForDay(day).map((event) => (
                <div
                  key={event.id}
                  className="p-2 rounded-md text-xs cursor-move bg-blue-100 text-blue-800 mb-1"
                  draggable
                  onDragStart={(e) => handleEventDragStart(e, event)}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs opacity-75">
                    {formatTime(new Date(event.start))}
                  </div>
                </div>
              ))}
              
              {/* Drop zone indicator */}
              {hoveredTimeSlot === `${day.toISOString()}-drop` && (
                <div className="text-center text-blue-600 text-xs mt-2">
                  Drop here
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
      </div>
    </>
  );
};

export default Calendar;