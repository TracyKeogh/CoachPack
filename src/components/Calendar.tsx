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

  // Get the first day of the current week (Sunday)
  const getFirstDayOfWeek = useCallback((date: Date): Date => {
    const day = date.getDay();
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
    if (viewMode === 'week') {
      setShowDayView(true);
    } else {
      setViewMode('week');
      setShowDayView(true);
    }
  };

  // Close day view
  const closeDayView = () => {
    setShowDayView(false);
    setSelectedDate(null);
  };

  // Generate milestone dates from goals data
  const getMilestoneDates = useCallback(() => {
    console.log("Getting milestone dates from goals data:", goalsData);

    let milestones: {
      date: Date;
      title: string;
      category: 'business' | 'body' | 'balance';
      completed: boolean;
    }[] = [];

    if (goalsData && typeof goalsData === 'object') {
      if (goalsData.categoryGoals) {
        console.log("Found categoryGoals structure");

        Object.entries(goalsData.categoryGoals).forEach(([category, goalData]) => {
          console.log(`Examining category: ${category}`, goalData);

          if (!goalData) return;

          if (Array.isArray(goalData.milestones)) {
            console.log(`Found milestones array in ${category}:`, goalData.milestones);

            goalData.milestones.forEach((milestone: any) => {
              if (milestone && (milestone.title || milestone.dueDate)) {
                console.log(`Adding milestone: ${milestone.title || 'Untitled'}`);
                milestones.push({
                  date: new Date(milestone.dueDate || new Date()),
                  title: milestone.title || 'Untitled Milestone',
                  category: category as 'business' | 'body' | 'balance',
                  completed: !!milestone.completed
                });
              }
            });
          }
        });
      }
    }

    if (milestones.length === 0) {
      console.log("No milestones found in standard structure, trying alternative approach");

      const categories = ['business', 'body', 'balance'];

      categories.forEach(category => {
        const categoryData = goalsData[category];
        if (categoryData) {
          console.log(`Found category data for ${category}:`, categoryData);

          if (Array.isArray(categoryData.milestones)) {
            console.log(`Found milestones in ${category}:`, categoryData.milestones);

            categoryData.milestones.forEach((milestone: any) => {
              milestones.push({
                date: new Date(milestone.dueDate || milestone.targetDate || new Date()),
                title: milestone.title || 'Untitled',
                category: category as 'business' | 'body' | 'balance',
                completed: !!milestone.completed
              });
            });
          }
        }
      });
    }

    if (milestones.length === 0) {
      console.log("No milestones found in any structure, adding test milestones");

      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);

      milestones.push({
        date: nextWeek,
        title: "Implement no-work weekends",
        category: 'balance',
        completed: false
      });

      milestones.push({
        date: twoWeeksLater,
        title: "Plan quarterly weekend getaway",
        category: 'balance',
        completed: false
      });
    }

    console.log("Final milestones extracted:", milestones);
    return milestones;
  }, [goalsData]);

  // 90-Day View Modal Component
  const generate90DayView = () => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 90);

    const milestones = getMilestoneDates();
    console.log("Milestones in 90-Day View:", milestones);

    const generateDates = () => {
      const dates = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
    };

    const dates = generateDates();

    const monthGroups: Record<string, Date[]> = {};
    dates.forEach(date => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(date);
    });

    return { monthGroups, milestones };
  };

  // Generate 90-day view data
  const { monthGroups, milestones } = generate90DayView();

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

    const [hours, minutes] = timeSlot.split(':').map(Number);
    const eventStart = new Date(day);
    eventStart.setHours(hours, minutes, 0, 0);

    console.log('Scheduling action:', draggedAction.title);
    console.log('Start time:', eventStart.toLocaleString());

    scheduleActionFromPool(actionId, eventStart);

    setDraggedAction(null);
    setHoveredTimeSlot(null);
  };

  // Handle drag start for events in day view
  const handleEventDragStart = (e: React.DragEvent, event: Event) => {
    e.dataTransfer.setData('text/plain', event.id);
    setDraggedEvent(event);
    console.log('Started dragging event:', event.title);
  };

  // Handle drag over for time slots in day view
  const handleDayViewDragOver = (e: React.DragEvent, timeSlot: string) => {
    e.preventDefault();
    setHoveredTimeSlot(`${selectedDate?.toISOString()}-${timeSlot}`);
  };

  // Handle drag leave for time slots in day view
  const handleDayViewDragLeave = () => {
    setHoveredTimeSlot(null);
  };

  // Handle drop for time slots in day view
  const handleDayViewDrop = (e: React.DragEvent, timeSlot: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');

    if (!eventId || !draggedEvent || !selectedDate) return;

    const [hours, minutes] = timeSlot.split(':').map(Number);
    const eventStart = new Date(selectedDate);
    eventStart.setHours(hours, minutes, 0, 0);

    const originalDuration = draggedEvent.end.getTime() - draggedEvent.start.getTime();
    const eventEnd = new Date(eventStart.getTime() + originalDuration);

    console.log('Moving event:', draggedEvent.title);
    console.log('New start time:', eventStart.toLocaleString());
    console.log('New end time:', eventEnd.toLocaleString());

    updateEvent(eventId, {
      start: eventStart,
      end: eventEnd
    });

    setDraggedEvent(null);
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

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              {timeSlots.map((timeSlot) => {
                const events = getEventsForTimeSlot(selectedDate, timeSlot);
                const isHalfHour = timeSlot.endsWith(':30');

                return (
                  <div 
                    key={timeSlot}
                    className={`flex items-start ${isHalfHour ? 'opacity-70' : ''}`}
                    onDragOver={(e) => handleDayViewDragOver(e, timeSlot)}
                    onDragLeave={handleDayViewDragLeave}
                    onDrop={(e) => handleDayViewDrop(e, timeSlot)}
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
                              className={`p-2 rounded-lg ${getCategoryColor(event.category)} flex items-start justify-between cursor-move`}
                              draggable
                              onDragStart={(e) => handleEventDragStart(e, event)}
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
                          Drop actions or events here
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
          <div className="flex items-center space-x-2 mt-1">
            {lastSaved && (
              <p className="text-sm text-green-600">
                ✓ Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={goToToday}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Today</span>
          </button>
        </div>
      </div>

      {/* PERSISTENT VIEW MODE NAVIGATION - Always Visible */}
      <div className="flex items-center justify-center">
        <div className="inline-flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('week')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'week'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode('90day')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              viewMode === '90day'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            90-Day
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'year'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
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

          <div className="grid grid-cols-7 gap-4">
            {daysOfWeek.map((day, dayIndex) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const dayEvents = getEventsForDay(day);

              return (
                <div key={dayIndex} className="space-y-3">
                  <div 
                    className={`text-center p-3 rounded-lg cursor-pointer hover:bg-blue-200 hover:ring-2 hover:ring-blue-500 transition-all ${
                      isToday ? 'bg-purple-100' : 'bg-slate-50'
                    }`}
                    onClick={() => {
                      console.log(`Clicked on day: ${day.toDateString()} - Opening day view`);
                      openDayView(day);
                    }}
                  >
                    <div className="font-medium text-slate-900">
                      {day.toLocaleString('default', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-bold ${isToday ? 'text-purple-600' : 'text-slate-700'}`}>
                      {day.getDate()}
                    </div>
                  </div>

                  <div 
                    className="min-h-48 p-3 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-300 transition-all"
                    onDragOver={(e) => handleDragOver(e, '9:00', day)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, '9:00', day)}
                  >
                    {dayEvents.length > 0 ? (
                      <div className="space-y-2">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id}
                            className={`p-2 rounded-lg ${getCategoryColor(event.category)} cursor-pointer hover:opacity-80 transition-opacity`}
                            onClick={() => {
                              console.log(`Clicked on event: ${event.title}`);
                              openDayView(day);
                            }}
                          >
                            <div className="font-medium text-xs">{event.title}</div>
                            <div className="text-xs opacity-75 flex items-center space-x-1 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatTime(new Date(event.start))}
                              </span>
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
      )}

      {/* Action Pool - Only show in week view */}
      {showActionPool && viewMode === 'week' && (
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

      {/* 90-Day View */}
      {viewMode === '90day' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">90-Day Milestone View</h3>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Milestones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              <div className="absolute top-0 right-0 text-xs text-slate-400">
                Found: {milestones.length} milestones (Debug)
              </div>

              {milestones.length > 0 ? (
                milestones
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 6)
                  .map((milestone, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        milestone.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          getCategoryColor(milestone.category).split(' ')[0]
                        }`}>
                          {milestone.category === 'business' ? (
                            <Target className="w-4 h-4 text-purple-600" />
                          ) : milestone.category === 'body' ? (
                            <Target className="w-4 h-4 text-green-600" />
                          ) : (
                            <Target className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{milestone.title}</div>
                          <div className="text-sm text-slate-500">
                            {milestone.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(milestone.category)}`}>
                              {milestone.category}
                            </span>
                          </div>
                        </div>
                        {milestone.completed && (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="col-span-3 text-center py-6 text-slate-500">
                  <Flag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p>No milestones found</p>
                  <p className="text-sm mt-1">Add milestones in the Goals section or check console for debugging info</p>
                </div>
              )}
            </div>
          </div>

          {Object.entries(monthGroups).map(([monthKey, dates]) => {
            const firstDate = dates[0];
            const monthName = firstDate.toLocaleString('default', { month: 'long' });
            const year = firstDate.getFullYear();

            return (
              <div key={monthKey} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="bg-slate-800 text-white p-4">
                  <h3 className="text-lg font-semibold">{monthName} {year}</h3>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-8 gap-2">
                    <div className="text-center text-xs font-medium text-slate-500 py-2">
                      Week
                    </div>
                    
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-semibold text-slate-600 py-2">
                        {day}
                      </div>
                    ))}

                    {(() => {
                      const weeks = [];
                      let currentWeek = [];
                      
                      const emptyDays = Array.from({ length: dates[0].getDay() }, () => null);
                      currentWeek = [...emptyDays];
                      
                      dates.forEach(date => {
                        currentWeek.push(date);
                        if (currentWeek.length === 7) {
                          weeks.push([...currentWeek]);
                          currentWeek = [];
                        }
                      });
                      
                      if (currentWeek.length > 0) {
                        while (currentWeek.length < 7) {
                          currentWeek.push(null);
                        }
                        weeks.push(currentWeek);
                      }
                      
                      return weeks.map((week, weekIndex) => {
                        const goalWeekNumber = weekIndex + 1;
                        const firstDateInWeek = week.find(date => date !== null);
                        
                        return [
                          <div 
                            key={`week-${weekIndex}`}
                            className="flex items-center justify-center min-h-24"
                          >
                            {firstDateInWeek && (
                              <button
                                onClick={() => {
                                  console.log(`Switching to goal week ${goalWeekNumber} view`);
                                  setCurrentDate(firstDateInWeek);
                                  setViewMode('week');
                                }}
                                className="px-2 py-1 text-sm font-medium text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                title={`Go to Week ${goalWeekNumber} of your 90-day goal period`}
                              >
                                {goalWeekNumber}
                              </button>
                            )}
                          </div>,
                          
                          ...week.map((date, dayIndex) => {
                            if (!date) {
                              return (
                                <div key={`empty-${weekIndex}-${dayIndex}`} className="min-h-24 p-2 bg-slate-50 rounded-lg"></div>
                              );
                            }
                            
                            const isToday = date.toDateString() === new Date().toDateString();
                            const dateEvents = getEventsForDay(date);
                            const dateMilestones = milestones.filter(
                              m => m.date.toDateString() === date.toDateString()
                            );

                            return (
                              <div 
                                key={`date-${weekIndex}-${dayIndex}`}
                                className={`min-h-24 p-2 rounded-lg border ${
                                  isToday 
                                    ? 'bg-purple-50 border-purple-200' 
                                    : 'bg-white border-slate-200'
                                } hover:shadow-md transition-all`}
                              >
                                <div className={`text-sm font-medium mb-1 ${
                                  isToday ? 'text-purple-600' : 'text-slate-700'
                                }`}>
                                  {date.getDate()}
                                </div>

                                {dateMilestones.length > 0 && (
                                  <div className="space-y-1">
                                    {dateMilestones.map((milestone, idx) => (
                                      <div 
                                        key={idx}
                                        className={`px-2 py-1 rounded text-xs ${getCategoryColor(milestone.category)} flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity`}
                                        onClick={() => {
                                          alert(`Milestone: ${milestone.title}\nCategory: ${milestone.category}\nDue: ${milestone.date.toLocaleDateString()}\nCompleted: ${milestone.completed ? 'Yes' : 'No'}`);
                                        }}
                                        title="Click to view milestone details"
                                      >
                                        <Flag className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{milestone.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {dateEvents.length > 0 && (
                                  <div className="mt-1 space-y-1">
                                    {dateEvents.slice(0, 2).map(event => (
                                      <div 
                                        key={event.id}
                                        className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
                                      >
                                        {event.title}
                                      </div>
                                    ))}
                                    {dateEvents.length > 2 && (
                                      <div className="text-xs text-slate-500 text-center">
                                        +{dateEvents.length - 2} more
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ];
                      }).flat();
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Year View */}
      {viewMode === 'year' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-blue-600">
                THE BIG ASS CALENDAR {currentDate.getFullYear()}
              </h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setFullYear(currentDate.getFullYear() - 1);
                  setCurrentDate(newDate);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setFullYear(currentDate.getFullYear() + 1);
                  setCurrentDate(newDate);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Think Big. Plan Bigger.</h3>
            <p className="text-slate-600">Your entire year laid out. Every month, every milestone, every opportunity to make it count.</p>
          </div>

          <div className="space-y-4">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const monthDate = new Date(currentDate.getFullYear(), monthIndex, 1);
              const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });
              const daysInMonth = new Date(currentDate.getFullYear(), monthIndex + 1, 0).getDate();
              const firstDayOfWeek = monthDate.getDay();
              
              return (
                <div key={monthIndex} className="bg-blue-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-blue-800 text-xl">
                      {monthName.toUpperCase()} {currentDate.getFullYear()}
                    </h3>
                    
                    {(() => {
                      const monthMilestones = milestones.filter(milestone => 
                        milestone.date.getFullYear() === currentDate.getFullYear() &&
                        milestone.date.getMonth() === monthIndex
                      );
                      
                      return monthMilestones.length > 0 && (
                        <span className="text-sm px-3 py-1 bg-orange-100 text-orange-600 rounded-full font-medium">
                          {monthMilestones.length} milestone{monthMilestones.length > 1 ? 's' : ''}
                        </span>
                      );
                    })()}
                  </div>
                  
                  {/* Calendar grid for this month - wider and more spaced */}
                  <div className="grid grid-cols-7 gap-3">
                    {/* Day headers */}
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <div key={day} className="text-center text-sm font-semibold text-blue-700 py-2 bg-blue-100 rounded-lg">
                        {day.slice(0, 3)}
                      </div>
                    ))}
                    
                    {/* Empty cells for days before the first of the month */}
                    {Array.from({ length: firstDayOfWeek }, (_, i) => (
                      <div key={`empty-${i}`} className="h-12 bg-slate-100 rounded-lg opacity-50"></div>
                    ))}
                    
                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                      const day = dayIndex + 1;
                      const date = new Date(currentDate.getFullYear(), monthIndex, day);
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      // Check for milestones on this day
                      const hasMilestone = milestones.some(milestone => 
                        milestone.date.getFullYear() === date.getFullYear() &&
                        milestone.date.getMonth() === date.getMonth() &&
                        milestone.date.getDate() === date.getDate()
                      );

                      // Check for events on this day
                      const dayEvents = getEventsForDay(date);
                      const hasEvents = dayEvents.length > 0;
                      
                      return (
                        <div 
                          key={day}
                          className={`h-12 text-center flex items-center justify-center text-sm font-medium rounded-lg cursor-pointer transition-all border-2 ${
                            isToday 
                              ? 'bg-purple-500 text-white font-bold border-purple-600 shadow-lg scale-105' 
                              : hasMilestone
                              ? 'bg-orange-400 text-white border-orange-500 hover:bg-orange-500'
                              : hasEvents
                              ? 'bg-green-300 text-green-800 border-green-400 hover:bg-green-400'
                              : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                          } hover:shadow-md hover:scale-102`}
                          onClick={() => {
                            setCurrentDate(date);
                            setViewMode('week');
                          }}
                          title={
                            isToday ? `Today - ${monthName} ${day}` :
                            hasMilestone ? `Has milestones - ${monthName} ${day}` : 
                            hasEvents ? `Has ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''} - ${monthName} ${day}` :
                            `Go to ${monthName} ${day}`
                          }
                        >
                          <span className="relative">
                            {day}
                            {/* Small indicator dots for content */}
                            {(hasMilestone || hasEvents) && (
                              <div className="absolute -top-1 -right-1 flex space-x-0.5">
                                {hasMilestone && (
                                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                )}
                                {hasEvents && (
                                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                )}
                              </div>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Month summary - space for future interactive features */}
                  <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-slate-600">
                          Total Days: <span className="font-semibold text-slate-900">{daysInMonth}</span>
                        </span>
                        {(() => {
                          const monthEvents = Array.from({ length: daysInMonth }, (_, i) => {
                            const date = new Date(currentDate.getFullYear(), monthIndex, i + 1);
                            return getEventsForDay(date);
                          }).flat();
                          
                          return monthEvents.length > 0 && (
                            <span className="text-green-600">
                              Events: <span className="font-semibold">{monthEvents.length}</span>
                            </span>
                          );
                        })()}
                        {(() => {
                          const monthMilestones = milestones.filter(milestone => 
                            milestone.date.getFullYear() === currentDate.getFullYear() &&
                            milestone.date.getMonth() === monthIndex
                          );
                          
                          return monthMilestones.length > 0 && (
                            <span className="text-orange-600">
                              Milestones: <span className="font-semibold">{monthMilestones.length}</span>
                            </span>
                          );
                        })()}
                      </div>
                      
                      {/* Interactive placeholder - ready for future features */}
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Future feature: Expand ${monthName} details`);
                          }}
                        >
                          Details
                        </button>
                        <button 
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(`Future feature: Quick add to ${monthName}`);
                          }}
                        >
                          Quick Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
              <div className="text-3xl font-bold text-purple-700">{milestones.length}</div>
              <div className="text-sm text-purple-600 font-medium">Total Milestones</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
              <div className="text-3xl font-bold text-blue-700">
                {Math.round((milestones.filter(m => m.completed).length / Math.max(milestones.length, 1)) * 100)}%
              </div>
              <div className="text-sm text-blue-600 font-medium">Completed</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
              <div className="text-3xl font-bold text-green-700">
                {Math.ceil((new Date(currentDate.getFullYear(), 11, 31).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-green-600 font-medium">Days Left</div>
            </div>
          </div>

          <div className="mt-8 text-center p-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white">
            <h3 className="text-2xl font-bold mb-2">This Is Your Year</h3>
            <p className="mb-4 opacity-90">Every square represents a day. Every milestone represents progress. Make them count.</p>
            <button
              onClick={() => setViewMode('90day')}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Planning Your Next 90 Days
            </button>
          </div>
        </div>
      )}

      {/* Day View Modal */}
      {showDayView && <DayViewModal />}
    </div>
  );
};

export default Calendar;