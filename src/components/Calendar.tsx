import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Calendar as CalendarIcon,
  ArrowLeft,
  X,
  Filter,
  MoreHorizontal,
  Trash2,
  Edit3
} from 'lucide-react';
import { useCalendarData, Event, ActionPoolItem } from '../hooks/useCalendarData';
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

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDayView, setShowDayView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showActionPool, setShowActionPool] = useState(true);
  const [draggedAction, setDraggedAction] = useState<ActionPoolItem | null>(null);
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState<string | null>(null);

  // Get the first day of the current week (Sunday)
  const getFirstDayOfWeek = useCallback((date: Date): Date => {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = date.getDate() - day;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  }, []);

  // Get the days of the current week
  const getDaysOfWeek = useCallback((firstDay: Date): Date[] => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDay);
      day.setDate(firstDay.getDate() + i);
      days.push(day);
    }
    return days;
  }, []);

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

  // Get the first day of the current week
  const firstDayOfWeek = getFirstDayOfWeek(currentDate);
  
  // Get all days of the current week
  const daysOfWeek = getDaysOfWeek(firstDayOfWeek);

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Open day view for a specific day
  const openDayView = (date: Date) => {
    console.log('Opening day view for:', formatDate(date));
    setSelectedDate(date);
    setShowDayView(true);
  };

  // Close day view
  const closeDayView = () => {
    setShowDayView(false);
    setSelectedDate(null);
  };

  // Handle drag start for action pool items
  const handleDragStart = (e: React.DragEvent, action: ActionPoolItem) => {
    e.dataTransfer.setData('text/plain', action.id);
    setDraggedAction(action);
  };

  // Handle drag over for time slots
  const handleDragOver = (e: React.DragEvent, timeSlot: string, day: Date) => {
    e.preventDefault();
    setHoveredTimeSlot(`${day.toISOString()}-${timeSlot}`);
  };

  // Handle drag leave for time slots
  const handleDragLeave = () => {
    setHoveredTimeSlot(null);
  };

  // Handle drop for time slots
  const handleDrop = (e: React.DragEvent, timeSlot: string, day: Date) => {
    e.preventDefault();
    const actionId = e.dataTransfer.getData('text/plain');
    
    if (!actionId || !draggedAction) return;
    
    // Create a new Date object for the event start time
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const eventStart = new Date(day);
    eventStart.setHours(hours, minutes, 0, 0);
    
    console.log('Scheduling action:', draggedAction.title);
    console.log('Start time:', eventStart.toLocaleString());
    
    // Schedule the action
    scheduleActionFromPool(actionId, eventStart);
    
    // Reset state
    setDraggedAction(null);
    setHoveredTimeSlot(null);
  };

  // Generate time slots for day view
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  };

  // Get events for a specific time slot
  const getEventsForTimeSlot = (day: Date, timeSlot: string): Event[] => {
    if (!selectedDate) return [];
    
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotStart = new Date(day);
    slotStart.setHours(hours, minutes, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + 30);
    
    return data.events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      return (
        eventStart < slotEnd && eventEnd > slotStart &&
        eventStart.getDate() === day.getDate() &&
        eventStart.getMonth() === day.getMonth() &&
        eventStart.getFullYear() === day.getFullYear()
      );
    });
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'business':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'body':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'balance':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'business':
        return '💼';
      case 'body':
        return '💪';
      case 'balance':
        return '⚖️';
      default:
        return '📝';
    }
  };

  // Day View Modal Component
  const DayViewModal: React.FC = () => {
    if (!selectedDate) return null;
    
    const timeSlots = generateTimeSlots();
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <button
                onClick={closeDayView}
                className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Week</span>
              </button>
              
              <h2 className="text-xl font-bold">{formatDate(selectedDate)}</h2>
              
              <button
                onClick={closeDayView}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Time Slots */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              {timeSlots.map((timeSlot) => {
                const events = getEventsForTimeSlot(selectedDate, timeSlot);
                const isHalfHour = timeSlot.endsWith(':30');
                
                return (
                  <div 
                    key={timeSlot}
                    className={`flex items-start ${isHalfHour ? 'opacity-70' : ''}`}
                    onDragOver={(e) => handleDragOver(e, timeSlot, selectedDate)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, timeSlot, selectedDate)}
                  >
                    <div className="w-16 text-right pr-4 text-sm font-medium text-slate-500 pt-2">
                      {timeSlot}
                    </div>
                    
                    <div 
                      className={`flex-1 min-h-16 border border-slate-200 rounded-lg p-2 transition-all ${
                        hoveredTimeSlot === `${selectedDate.toISOString()}-${timeSlot}` 
                          ? 'bg-blue-100 ring-2 ring-blue-500' 
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      {events.length > 0 ? (
                        <div className="space-y-2">
                          {events.map((event) => (
                            <div 
                              key={event.id}
                              className={`p-2 rounded-lg ${getCategoryColor(event.category)} flex items-start justify-between`}
                            >
                              <div>
                                <div className="font-medium">{event.title}</div>
                                <div className="text-xs">
                                  {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button 
                                  onClick={() => removeEvent(event.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <button 
                                  className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Early return if data is not loaded yet
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600 mt-2">
            Schedule time for what matters most
          </p>
          {lastSaved && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button
            onClick={saveData}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Today</span>
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousWeek}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900">
              Week {firstDayOfWeek.getDate()} of {firstDayOfWeek.toLocaleString('default', { month: 'long' })} {firstDayOfWeek.getFullYear()}
            </h2>
            <button
              onClick={goToNextWeek}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setShowActionPool(!showActionPool)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showActionPool 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {showActionPool ? 'Hide Action Pool' : 'Show Action Pool'}
            </button>
          </div>
        </div>

        {/* Week Selector */}
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((weekNum) => {
            const isCurrentWeek = weekNum === Math.ceil((currentDate.getDate() + firstDayOfWeek.getDay()) / 7);
            
            return (
              <button
                key={weekNum}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  isCurrentWeek 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Week {weekNum}
              </button>
            );
          })}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-8 gap-4">
          {/* Time Column */}
          <div className="space-y-3">
            <div className="h-12 text-center"></div>
            <div className="p-3 rounded-lg border border-slate-200 text-center font-medium text-slate-900">
              Morning
            </div>
            <div className="p-3 rounded-lg border border-slate-200 text-center font-medium text-slate-900">
              Afternoon
            </div>
            <div className="p-3 rounded-lg border border-slate-200 text-center font-medium text-slate-900">
              Evening
            </div>
          </div>

          {/* Day Columns */}
          {daysOfWeek.map((day, dayIndex) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const dayEvents = getEventsForDay(day);
            
            return (
              <div key={dayIndex} className="space-y-3">
                {/* Day Header - FIXED: Added cursor-pointer and hover styles */}
                <div 
                  className={`h-12 text-center cursor-pointer !hover:bg-blue-200 !hover:ring-2 !hover:ring-blue-500 rounded-lg ${
                    isToday ? 'bg-purple-100' : ''
                  }`}
                  onClick={() => {
                    console.log(`Clicked on day header: ${day.toDateString()}`);
                    openDayView(day);
                  }}
                >
                  <div className="font-medium text-slate-900">
                    {day.toLocaleString('default', { weekday: 'short' })}
                  </div>
                  <div className={`text-sm ${isToday ? 'text-purple-600 font-bold' : 'text-slate-500'}`}>
                    {day.getDate()}
                  </div>
                </div>

                {/* Morning Slot - FIXED: Added cursor-pointer and hover styles */}
                <div 
                  className="p-3 rounded-lg border border-slate-200 hover:shadow-sm transition-all cursor-pointer !hover:bg-blue-200 !hover:ring-2 !hover:ring-blue-500"
                  onClick={() => {
                    console.log(`Clicked on morning slot: ${day.toDateString()}`);
                    openDayView(day);
                  }}
                  onDragOver={(e) => handleDragOver(e, '9:00', day)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, '9:00', day)}
                >
                  {dayEvents.filter(event => {
                    const eventHour = new Date(event.start).getHours();
                    return eventHour >= 6 && eventHour < 12;
                  }).length > 0 ? (
                    <div className="space-y-1">
                      {dayEvents
                        .filter(event => {
                          const eventHour = new Date(event.start).getHours();
                          return eventHour >= 6 && eventHour < 12;
                        })
                        .slice(0, 2)
                        .map(event => (
                          <div 
                            key={event.id}
                            className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                      {dayEvents.filter(event => {
                        const eventHour = new Date(event.start).getHours();
                        return eventHour >= 6 && eventHour < 12;
                      }).length > 2 && (
                        <div className="text-xs text-slate-500 text-center">
                          +{dayEvents.filter(event => {
                            const eventHour = new Date(event.start).getHours();
                            return eventHour >= 6 && eventHour < 12;
                          }).length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 text-sm">
                      Drop actions here
                    </div>
                  )}
                </div>

                {/* Afternoon Slot - FIXED: Added cursor-pointer and hover styles */}
                <div 
                  className="p-3 rounded-lg border border-slate-200 hover:shadow-sm transition-all cursor-pointer !hover:bg-blue-200 !hover:ring-2 !hover:ring-blue-500"
                  onClick={() => {
                    console.log(`Clicked on afternoon slot: ${day.toDateString()}`);
                    openDayView(day);
                  }}
                  onDragOver={(e) => handleDragOver(e, '14:00', day)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, '14:00', day)}
                >
                  {dayEvents.filter(event => {
                    const eventHour = new Date(event.start).getHours();
                    return eventHour >= 12 && eventHour < 18;
                  }).length > 0 ? (
                    <div className="space-y-1">
                      {dayEvents
                        .filter(event => {
                          const eventHour = new Date(event.start).getHours();
                          return eventHour >= 12 && eventHour < 18;
                        })
                        .slice(0, 2)
                        .map(event => (
                          <div 
                            key={event.id}
                            className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                      {dayEvents.filter(event => {
                        const eventHour = new Date(event.start).getHours();
                        return eventHour >= 12 && eventHour < 18;
                      }).length > 2 && (
                        <div className="text-xs text-slate-500 text-center">
                          +{dayEvents.filter(event => {
                            const eventHour = new Date(event.start).getHours();
                            return eventHour >= 12 && eventHour < 18;
                          }).length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 text-sm">
                      Drop actions here
                    </div>
                  )}
                </div>

                {/* Evening Slot - FIXED: Added cursor-pointer and hover styles */}
                <div 
                  className="p-3 rounded-lg border border-slate-200 hover:shadow-sm transition-all cursor-pointer !hover:bg-blue-200 !hover:ring-2 !hover:ring-blue-500"
                  onClick={() => {
                    console.log(`Clicked on evening slot: ${day.toDateString()}`);
                    openDayView(day);
                  }}
                  onDragOver={(e) => handleDragOver(e, '19:00', day)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, '19:00', day)}
                >
                  {dayEvents.filter(event => {
                    const eventHour = new Date(event.start).getHours();
                    return eventHour >= 18;
                  }).length > 0 ? (
                    <div className="space-y-1">
                      {dayEvents
                        .filter(event => {
                          const eventHour = new Date(event.start).getHours();
                          return eventHour >= 18;
                        })
                        .slice(0, 2)
                        .map(event => (
                          <div 
                            key={event.id}
                            className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                      {dayEvents.filter(event => {
                        const eventHour = new Date(event.start).getHours();
                        return eventHour >= 18;
                      }).length > 2 && (
                        <div className="text-xs text-slate-500 text-center">
                          +{dayEvents.filter(event => {
                            const eventHour = new Date(event.start).getHours();
                            return eventHour >= 18;
                          }).length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 text-sm">
                      Drop actions here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Pool */}
      {showActionPool && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
            <button
              onClick={refreshActionPool}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
            >
              Refresh from Goals
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.actionPool.map((action) => (
              <div
                key={action.id}
                className="p-3 rounded-lg border border-slate-200 hover:shadow-md transition-all cursor-move bg-white"
                draggable
                onDragStart={(e) => handleDragStart(e, action)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm">
                      {getCategoryIcon(action.category)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{action.title}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(action.category)}`}>
                          {action.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          {action.duration} min
                        </span>
                        <span className="text-xs text-slate-500">
                          {action.frequency === 'daily' ? 'Daily' : 
                           action.frequency === 'weekly' ? 'Weekly' : 
                           '3x Week'}
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
            
            {data.actionPool.length === 0 && (
              <div className="col-span-3 text-center py-8 text-slate-500">
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
        </div>
      )}

      {/* Notes Panel */}
      {showNotes && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <NotesPanel feature="calendar" />
        </div>
      )}

      {/* Day View Modal */}
      {showDayView && <DayViewModal />}
    </div>
  );
};

export default Calendar;