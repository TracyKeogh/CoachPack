import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Eye, 
  List, 
  Grid3X3, 
  Calendar as CalendarIconFull,
  Target,
  Heart,
  Briefcase,
  Scale,
  Check,
  X,
  Edit,
  Trash2,
  Save,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { useWheelData } from '../hooks/useWheelData';
import { useValuesData } from '../hooks/useValuesData';
import { useVisionBoardData } from '../hooks/useVisionBoardData';

// Types for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: 'business' | 'body' | 'balance' | 'personal';
  isCompleted: boolean;
  isMilestone: boolean;
  goalId?: string;
  description?: string;
}

// Types for action items
interface ActionItem {
  id: string;
  title: string;
  category: 'business' | 'body' | 'balance' | 'personal';
  duration: number; // in minutes
  frequency: 'daily' | 'weekly' | '3x-week';
  isCompleted: boolean;
  goalId?: string;
}

const Calendar: React.FC = () => {
  // State for current view and date
  const [currentView, setCurrentView] = useState<'daily' | 'weekly' | '90-day' | 'yearly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showVisionOverlay, setShowVisionOverlay] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [actionPool, setActionPool] = useState<ActionItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    category: 'business',
    isCompleted: false,
    isMilestone: false
  });

  // Get data from other components
  const { data: goalsData } = useGoalSettingData();
  const { data: wheelData } = useWheelData();
  const { data: valuesData } = useValuesData();
  const { visionItems } = useVisionBoardData();

  // Initialize events and action pool from goals data
  useEffect(() => {
    // This would normally fetch from an API or parse from goals data
    // For now, we'll use sample data
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Meeting',
        start: new Date(2025, 6, 7, 9, 0), // July 7, 2025, 9:00 AM
        end: new Date(2025, 6, 7, 10, 30), // July 7, 2025, 10:30 AM
        category: 'business',
        isCompleted: false,
        isMilestone: false
      },
      {
        id: '2',
        title: 'Morning Workout',
        start: new Date(2025, 6, 8, 7, 0), // July 8, 2025, 7:00 AM
        end: new Date(2025, 6, 8, 8, 0), // July 8, 2025, 8:00 AM
        category: 'body',
        isCompleted: true,
        isMilestone: false
      },
      {
        id: '3',
        title: 'Launch MVP',
        start: new Date(2025, 6, 15, 0, 0), // July 15, 2025
        end: new Date(2025, 6, 15, 23, 59), // July 15, 2025
        category: 'business',
        isCompleted: false,
        isMilestone: true,
        description: 'Launch minimum viable product to first 10 customers'
      },
      {
        id: '4',
        title: 'Family Dinner',
        start: new Date(2025, 6, 9, 18, 0), // July 9, 2025, 6:00 PM
        end: new Date(2025, 6, 9, 20, 0), // July 9, 2025, 8:00 PM
        category: 'balance',
        isCompleted: false,
        isMilestone: false
      },
      {
        id: '5',
        title: 'Reading Time',
        start: new Date(2025, 6, 9, 21, 0), // July 9, 2025, 9:00 PM
        end: new Date(2025, 6, 9, 21, 45), // July 9, 2025, 9:45 PM
        category: 'personal',
        isCompleted: false,
        isMilestone: false
      }
    ];

    const sampleActions: ActionItem[] = [
      {
        id: 'a1',
        title: 'Morning Workout',
        category: 'body',
        duration: 60, // 60 minutes
        frequency: 'daily',
        isCompleted: false
      },
      {
        id: 'a2',
        title: 'Team Meeting',
        category: 'business',
        duration: 90, // 90 minutes
        frequency: 'weekly',
        isCompleted: false
      },
      {
        id: 'a3',
        title: 'Meal Prep',
        category: 'body',
        duration: 120, // 120 minutes
        frequency: 'weekly',
        isCompleted: false
      },
      {
        id: 'a4',
        title: 'Reading Time',
        category: 'personal',
        duration: 45, // 45 minutes
        frequency: '3x-week',
        isCompleted: false
      },
      {
        id: 'a5',
        title: 'Family Dinner',
        category: 'balance',
        duration: 90, // 90 minutes
        frequency: 'daily',
        isCompleted: false
      },
      {
        id: 'a6',
        title: 'Project Work',
        category: 'business',
        duration: 180, // 180 minutes
        frequency: '3x-week',
        isCompleted: false
      },
      {
        id: 'a7',
        title: 'Meditation',
        category: 'personal',
        duration: 20, // 20 minutes
        frequency: 'daily',
        isCompleted: false
      }
    ];

    setEvents(sampleEvents);
    setActionPool(sampleActions);
  }, []);

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'daily') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (currentView === 'weekly') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (currentView === '90-day') {
      newDate.setDate(newDate.getDate() - 90);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'daily') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (currentView === 'weekly') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (currentView === '90-day') {
      newDate.setDate(newDate.getDate() + 90);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format date for display
  const formatDate = (date: Date, format: 'short' | 'long' = 'long') => {
    if (format === 'short') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'body':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'balance':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'personal':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business':
        return <Briefcase className="w-4 h-4" />;
      case 'body':
        return <Heart className="w-4 h-4" />;
      case 'balance':
        return <Scale className="w-4 h-4" />;
      case 'personal':
        return <Target className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Format duration for display
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  // Get week dates
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // Handle event completion toggle
  const toggleEventCompletion = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, isCompleted: !event.isCompleted } : event
    ));
  };

  // Handle adding new event
  const handleAddEvent = () => {
    setIsAddingEvent(true);
    setNewEvent({
      title: '',
      category: 'business',
      isCompleted: false,
      isMilestone: false,
      start: new Date(currentDate),
      end: new Date(currentDate)
    });
  };

  // Handle saving new event
  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title || '',
      start: newEvent.start,
      end: newEvent.end,
      category: newEvent.category as 'business' | 'body' | 'balance' | 'personal',
      isCompleted: newEvent.isCompleted || false,
      isMilestone: newEvent.isMilestone || false,
      description: newEvent.description
    };

    setEvents(prev => [...prev, event]);
    setIsAddingEvent(false);
    setNewEvent({
      title: '',
      category: 'business',
      isCompleted: false,
      isMilestone: false
    });
  };

  // Render daily view
  const renderDailyView = () => {
    const hours = [];
    for (let i = 6; i < 22; i++) { // 6 AM to 10 PM
      hours.push(i);
    }

    const todayEvents = getEventsForDate(currentDate);

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Daily Focus</h2>
          <p className="text-slate-600">{formatDate(currentDate)}</p>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddEvent}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {hours.map(hour => {
            const startTime = new Date(currentDate);
            startTime.setHours(hour, 0, 0, 0);
            
            const endTime = new Date(currentDate);
            endTime.setHours(hour, 59, 59, 999);
            
            const hourEvents = todayEvents.filter(event => {
              const eventStart = new Date(event.start);
              return eventStart.getHours() === hour;
            });

            return (
              <div key={hour} className="flex border-b border-slate-200 last:border-b-0">
                <div className="w-24 p-4 bg-slate-50 border-r border-slate-200 flex flex-col items-center justify-center">
                  <div className="font-semibold text-slate-700">
                    {hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}:00
                  </div>
                  <div className="text-xs text-slate-500">
                    {hour < 12 ? 'AM' : 'PM'}
                  </div>
                </div>
                
                <div className="flex-1 min-h-24 p-2">
                  {hourEvents.length > 0 ? (
                    <div className="space-y-2">
                      {hourEvents.map(event => (
                        <div 
                          key={event.id}
                          className={`p-3 rounded-lg border ${getCategoryColor(event.category)} ${
                            event.isCompleted ? 'opacity-60' : ''
                          }`}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEventCompletion(event.id);
                                }}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  event.isCompleted 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-slate-400'
                                }`}
                              >
                                {event.isCompleted && <Check className="w-3 h-3" />}
                              </button>
                              <span className={`font-medium ${event.isCompleted ? 'line-through text-slate-500' : ''}`}>
                                {event.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">
                                {formatTime(event.start)} - {formatTime(event.end)}
                              </span>
                              <div className="flex items-center justify-center w-6 h-6 rounded-full">
                                {getCategoryIcon(event.category)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Reflection */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Reflection</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What went well today?
              </label>
              <textarea
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                placeholder="List your wins and accomplishments..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What could be improved?
              </label>
              <textarea
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                placeholder="What would you do differently?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Top priority for tomorrow
              </label>
              <input
                type="text"
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's your #1 focus?"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render weekly view
  const renderWeeklyView = () => {
    const weekDates = getWeekDates();
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    
    const formattedDateRange = `${formatDate(weekStart, 'short')} - ${formatDate(weekEnd, 'short')}`;
    
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Weekly Planning</h2>
          <p className="text-slate-600">12 Week Year Action Focus</p>
          <p className="text-lg font-semibold text-slate-700 mt-2">{formattedDateRange}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-8 gap-8">
          {/* Action Pool Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
                <button className="text-slate-400 hover:text-slate-600">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {actionPool.map(action => (
                  <div 
                    key={action.id}
                    className={`p-3 rounded-lg border ${getCategoryColor(action.category)} cursor-move`}
                    draggable
                  >
                    <div className="font-medium text-slate-900 mb-1">{action.title}</div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(action.duration)}</span>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full ${
                        action.frequency === 'daily' ? 'bg-green-100 text-green-800' :
                        action.frequency === 'weekly' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {action.frequency === 'daily' ? 'daily' : 
                         action.frequency === 'weekly' ? 'weekly' : 
                         '3x-week'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-7 gap-3">
              {/* Day Headers */}
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                <div key={day} className="text-center">
                  <div className="font-semibold text-slate-900">{day}</div>
                  <div className={`text-2xl font-bold ${
                    new Date().toDateString() === weekDates[index].toDateString() 
                      ? 'text-blue-600' 
                      : 'text-slate-700'
                  }`}>
                    {weekDates[index].getDate()}
                  </div>
                </div>
              ))}

              {/* Time Slots for Each Day */}
              {weekDates.map(date => (
                <div key={date.toISOString()} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  {timeSlots.map(slot => {
                    const slotEvents = getEventsForDate(date).filter(event => {
                      const hour = new Date(event.start).getHours();
                      if (slot === 'Morning') return hour >= 5 && hour < 12;
                      if (slot === 'Afternoon') return hour >= 12 && hour < 17;
                      return hour >= 17 && hour < 23;
                    });

                    return (
                      <div key={slot} className="p-2 border-b border-slate-100 last:border-b-0">
                        <div className="text-xs font-medium text-slate-500 mb-1">{slot}</div>
                        
                        {slotEvents.length > 0 ? (
                          <div className="space-y-1">
                            {slotEvents.map(event => (
                              <div 
                                key={event.id}
                                className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)} ${
                                  event.isCompleted ? 'opacity-60' : ''
                                }`}
                              >
                                <div className="flex items-center space-x-1">
                                  <div 
                                    className={`w-2 h-2 rounded-full ${
                                      event.isCompleted ? 'bg-green-500' : `bg-${event.category}-500`
                                    }`}
                                  />
                                  <span className={event.isCompleted ? 'line-through' : ''}>
                                    {event.title}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-8 border border-dashed border-slate-200 rounded flex items-center justify-center text-xs text-slate-400">
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
        </div>
      </div>
    );
  };

  // Render 90-day view
  const render90DayView = () => {
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 90);
    
    // Generate weeks for the 90-day period
    const weeks = [];
    let currentWeekStart = new Date(startDate);
    
    while (currentWeekStart < endDate) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        start: new Date(currentWeekStart),
        end: new Date(weekEnd)
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">90-Day Focus</h2>
          <p className="text-slate-600">
            {formatDate(startDate, 'short')} - {formatDate(endDate, 'short')}
          </p>
        </div>

        {/* Milestone Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Milestones</h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200 ml-6" />
            
            <div className="space-y-8">
              {events
                .filter(event => event.isMilestone)
                .sort((a, b) => a.start.getTime() - b.start.getTime())
                .map(milestone => {
                  const daysFromStart = Math.floor((milestone.start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  const progress = Math.min(100, Math.max(0, (daysFromStart / 90) * 100));
                  
                  return (
                    <div key={milestone.id} className="flex items-start ml-12 relative">
                      {/* Milestone Dot */}
                      <div 
                        className={`absolute left-0 w-3 h-3 rounded-full border-4 -ml-7 ${
                          getCategoryColor(milestone.category).replace('bg-', 'border-').replace('text-', 'bg-')
                        }`}
                        style={{ left: '-1.5rem' }}
                      />
                      
                      {/* Progress Indicator */}
                      <div className="absolute left-0 top-0 -ml-24 text-xs text-slate-500">
                        Day {daysFromStart}
                      </div>
                      
                      {/* Milestone Content */}
                      <div className={`p-4 rounded-lg border ${getCategoryColor(milestone.category)}`}>
                        <div className="font-semibold">{milestone.title}</div>
                        <div className="text-sm mt-1">{formatDate(milestone.start, 'short')}</div>
                        {milestone.description && (
                          <div className="text-sm mt-2">{milestone.description}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Weekly Planning for 90 Days */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900">Weekly Planning</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeks.slice(0, 12).map((week, index) => (
              <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 p-3 border-b border-slate-200">
                  <div className="font-semibold text-slate-900">Week {index + 1}</div>
                  <div className="text-sm text-slate-600">
                    {formatDate(week.start, 'short')} - {formatDate(week.end, 'short')}
                  </div>
                </div>
                
                <div className="p-3 space-y-2">
                  {['business', 'body', 'balance'].map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        category === 'business' ? 'bg-purple-500' :
                        category === 'body' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="text-sm text-slate-700 capitalize">{category} Focus</div>
                    </div>
                  ))}
                  
                  <div className="border-t border-slate-100 pt-2 mt-2">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700">
                      Plan Week
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render yearly view - EXACT MATCH to the Big A## Calendar
  const renderYearlyView = () => {
    const year = currentDate.getFullYear();
    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];
    
    // Generate days of the month (1-31)
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-blue-600 mb-4">THE BIG A## CALENDAR {year}</h2>
        </div>

        <div className="bg-white rounded-lg border-2 border-blue-500 overflow-hidden">
          <div className="grid grid-cols-32">
            {/* Header row with day numbers */}
            <div className="col-span-1"></div> {/* Empty cell for month labels */}
            {days.map(day => (
              <div key={`header-${day}`} className="text-center py-2 text-blue-600 font-semibold border-b border-blue-200">
                {day}
              </div>
            ))}

            {/* Month rows */}
            {months.map((month, monthIndex) => (
              <React.Fragment key={month}>
                {/* Month label */}
                <div className="bg-blue-600 text-white font-bold text-2xl flex items-center justify-center py-4 border-b border-blue-300">
                  {month}
                </div>

                {/* Days cells */}
                {days.map(day => {
                  // Check if this is a valid date (e.g., no Feb 30)
                  const date = new Date(year, monthIndex, day);
                  const isValidDate = date.getMonth() === monthIndex;
                  
                  // Check if there are any events on this date
                  const hasEvents = events.some(event => {
                    const eventDate = new Date(event.start);
                    return eventDate.getDate() === day && 
                           eventDate.getMonth() === monthIndex &&
                           eventDate.getFullYear() === year;
                  });
                  
                  // Check if there are any milestones on this date
                  const hasMilestones = events.some(event => {
                    const eventDate = new Date(event.start);
                    return eventDate.getDate() === day && 
                           eventDate.getMonth() === monthIndex &&
                           eventDate.getFullYear() === year &&
                           event.isMilestone;
                  });

                  return (
                    <div 
                      key={`${month}-${day}`}
                      className={`min-h-12 border border-blue-100 ${
                        !isValidDate ? 'bg-slate-50' : 
                        hasEvents ? 'bg-blue-50' : 
                        'bg-white'
                      }`}
                    >
                      {isValidDate && hasEvents && (
                        <div className="w-full h-full flex items-center justify-center">
                          {hasMilestones && (
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Annual Goals Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Annual Goals</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['business', 'body', 'balance'].map(category => (
              <div key={category} className={`p-4 rounded-lg ${
                category === 'business' ? 'bg-purple-50 border border-purple-200' :
                category === 'body' ? 'bg-green-50 border border-green-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  {getCategoryIcon(category)}
                  <h4 className="font-semibold text-slate-900 capitalize">{category}</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-slate-700">
                    {category === 'business' ? 'Grow my business to $10k/month revenue' :
                     category === 'body' ? 'Improve energy and physical health' :
                     'Create better work-life harmony'}
                  </div>
                  
                  <div className="w-full bg-white rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        category === 'business' ? 'bg-purple-500' :
                        category === 'body' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render vision overlay
  const renderVisionOverlay = () => {
    if (!showVisionOverlay) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Your Vision</h3>
            <button
              onClick={() => setShowVisionOverlay(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Vision Statement */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-900 mb-3">Vision Statement</h4>
              <p className="text-purple-800 text-lg italic">
                "I feel energized and healthy. My career is thriving with new opportunities and growth. 
                My relationships are deep and fulfilling, and I'm living with purpose and joy every day."
              </p>
            </div>

            {/* Core Values */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Core Values</h4>
              <div className="flex flex-wrap gap-2">
                {['Growth', 'Health', 'Connection', 'Freedom', 'Excellence', 'Balance'].map(value => (
                  <div key={value} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {value}
                  </div>
                ))}
              </div>
            </div>

            {/* Vision Board Images */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Vision Board</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {visionItems.slice(0, 4).map(item => (
                  <div key={item.id} className="relative group overflow-hidden rounded-lg h-24">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-200">
                      <p className="text-white text-center p-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wheel of Life */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Life Areas Focus</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {wheelData?.slice(0, 4).map(area => (
                  <div key={area.area} className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: area.color }}
                      />
                      <span className="font-medium text-slate-900">{area.area}</span>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="text-sm text-slate-600">Current: {area.score}</div>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <div className="text-sm text-green-600">Target: 8</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render event details modal
  const renderEventDetailsModal = () => {
    if (!selectedEvent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">Event Details</h3>
            <button
              onClick={() => setSelectedEvent(null)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <div className="font-semibold text-lg text-slate-900">{selectedEvent.title}</div>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>
                <div className="text-slate-900">{formatDate(selectedEvent.start, 'short')}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Time
                </label>
                <div className="text-slate-900">
                  {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getCategoryColor(selectedEvent.category)}`}>
                {getCategoryIcon(selectedEvent.category)}
                <span className="capitalize">{selectedEvent.category}</span>
              </div>
            </div>

            {selectedEvent.description && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <div className="text-slate-900">{selectedEvent.description}</div>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => toggleEventCompletion(selectedEvent.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedEvent.isCompleted
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{selectedEvent.isCompleted ? 'Completed' : 'Mark Complete'}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render add event modal
  const renderAddEventModal = () => {
    if (!isAddingEvent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">Add New Event</h3>
            <button
              onClick={() => setIsAddingEvent(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter event title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newEvent.start ? new Date(newEvent.start).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setNewEvent(prev => ({ 
                      ...prev, 
                      start: date,
                      end: prev.end || date
                    }));
                  }}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={newEvent.end ? new Date(newEvent.end).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setNewEvent(prev => ({ ...prev, end: date }));
                  }}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newEvent.start ? 
                    `${String(newEvent.start.getHours()).padStart(2, '0')}:${String(newEvent.start.getMinutes()).padStart(2, '0')}` : 
                    ''
                  }
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const date = new Date(newEvent.start || currentDate);
                    date.setHours(hours, minutes);
                    setNewEvent(prev => ({ ...prev, start: date }));
                  }}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={newEvent.end ? 
                    `${String(newEvent.end.getHours()).padStart(2, '0')}:${String(newEvent.end.getMinutes()).padStart(2, '0')}` : 
                    ''
                  }
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const date = new Date(newEvent.end || currentDate);
                    date.setHours(hours, minutes);
                    setNewEvent(prev => ({ ...prev, end: date }));
                  }}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['business', 'body', 'balance', 'personal'].map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setNewEvent(prev => ({ ...prev, category: category as any }))}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      newEvent.category === category
                        ? `${getCategoryColor(category)} border-2`
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      {getCategoryIcon(category)}
                      <span className="text-xs capitalize">{category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isMilestone"
                checked={newEvent.isMilestone || false}
                onChange={(e) => setNewEvent(prev => ({ ...prev, isMilestone: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isMilestone" className="text-sm text-slate-700">
                This is a milestone
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Add details about this event..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsAddingEvent(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSaveEvent}
                disabled={!newEvent.title || !newEvent.start || !newEvent.end}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600 mt-2">
            Schedule time for what matters most to you
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowVisionOverlay(true)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Show Vision</span>
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Today
          </button>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={goToPrevious}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={goToNext}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex items-center justify-center space-x-2 bg-white rounded-full p-1 shadow-sm border border-slate-200 max-w-md mx-auto">
        <button
          onClick={() => setCurrentView('daily')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
            currentView === 'daily'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Daily</span>
        </button>
        
        <button
          onClick={() => setCurrentView('weekly')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
            currentView === 'weekly'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Weekly</span>
        </button>
        
        <button
          onClick={() => setCurrentView('90-day')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
            currentView === '90-day'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarIconFull className="w-4 h-4" />
          <span>90-Day</span>
        </button>
        
        <button
          onClick={() => setCurrentView('yearly')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
            currentView === 'yearly'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          <span>Yearly</span>
        </button>
      </div>

      {/* Calendar Content */}
      <div>
        {currentView === 'daily' && renderDailyView()}
        {currentView === 'weekly' && renderWeeklyView()}
        {currentView === '90-day' && render90DayView()}
        {currentView === 'yearly' && renderYearlyView()}
      </div>

      {/* Modals */}
      {renderVisionOverlay()}
      {renderEventDetailsModal()}
      {renderAddEventModal()}
    </div>
  );
};

export default Calendar;