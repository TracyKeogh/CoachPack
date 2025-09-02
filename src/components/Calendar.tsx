import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Eye, 
  Grid, 
  List, 
  BarChart3,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  Filter,
  Search,
  Info,
  Zap,
  Layers
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { useValuesData } from '../hooks/useValuesData';
import { useVisionBoardData } from '../hooks/useVisionBoardData';
import Header from './Header';
import Navigation from './Navigation';

type CalendarView = 'daily' | 'weekly' | '90-day' | 'yearly';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: 'business' | 'body' | 'balance' | 'personal';
  completed: boolean;
  isMilestone: boolean;
  goalId?: string;
}

interface ActionItem {
  id: string;
  title: string;
  duration: number; // in minutes
  category: 'business' | 'body' | 'balance' | 'personal';
  frequency: 'daily' | 'weekly' | '3x-week';
  completed: boolean;
}

const Calendar: React.FC = () => {
  const [currentView, setCurrentView] = useState<CalendarView>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [actionPool, setActionPool] = useState<ActionItem[]>([]);
  const [showVisionOverlay, setShowVisionOverlay] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({});
  const [filter, setFilter] = useState<string>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  const { data: goalsData } = useGoalSettingData();
  const { data: valuesData } = useValuesData();
  const { visionItems } = useVisionBoardData();

  // Initialize with sample data
  useEffect(() => {
    // Sample events
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Meeting',
        start: new Date(new Date().setHours(9, 0, 0, 0)),
        end: new Date(new Date().setHours(10, 30, 0, 0)),
        category: 'business',
        completed: false,
        isMilestone: false
      },
      {
        id: '2',
        title: 'Gym Workout',
        start: new Date(new Date().setHours(17, 0, 0, 0)),
        end: new Date(new Date().setHours(18, 0, 0, 0)),
        category: 'body',
        completed: false,
        isMilestone: false
      },
      {
        id: '3',
        title: 'Family Dinner',
        start: new Date(new Date().setHours(19, 0, 0, 0)),
        end: new Date(new Date().setHours(20, 30, 0, 0)),
        category: 'balance',
        completed: false,
        isMilestone: false
      },
      {
        id: '4',
        title: 'Launch New Product',
        start: new Date(new Date().setDate(new Date().getDate() + 14)),
        end: new Date(new Date().setDate(new Date().getDate() + 14)),
        category: 'business',
        completed: false,
        isMilestone: true,
        goalId: '1'
      }
    ];

    // Sample action pool
    const sampleActionPool: ActionItem[] = [
      {
        id: 'a1',
        title: 'Morning Workout',
        duration: 60, // 60 minutes
        category: 'body',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a2',
        title: 'Team Meeting',
        duration: 90, // 90 minutes
        category: 'business',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a3',
        title: 'Meal Prep',
        duration: 120, // 120 minutes
        category: 'body',
        frequency: 'weekly',
        completed: false
      },
      {
        id: 'a4',
        title: 'Reading Time',
        duration: 45, // 45 minutes
        category: 'personal',
        frequency: '3x-week',
        completed: false
      },
      {
        id: 'a5',
        title: 'Family Dinner',
        duration: 90, // 90 minutes
        category: 'balance',
        frequency: 'daily',
        completed: false
      },
      {
        id: 'a6',
        title: 'Project Work',
        duration: 180, // 180 minutes
        category: 'business',
        frequency: '3x-week',
        completed: false
      },
      {
        id: 'a7',
        title: 'Meditation',
        duration: 20, // 20 minutes
        category: 'personal',
        frequency: 'daily',
        completed: false
      }
    ];

    setEvents(sampleEvents);
    setActionPool(sampleActionPool);
  }, []);

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          border: 'border-purple-300',
          light: 'bg-purple-50',
          dark: 'bg-purple-600'
        };
      case 'body':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          light: 'bg-green-50',
          dark: 'bg-green-600'
        };
      case 'balance':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-300',
          light: 'bg-blue-50',
          dark: 'bg-blue-600'
        };
      case 'personal':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-800',
          border: 'border-amber-300',
          light: 'bg-amber-50',
          dark: 'bg-amber-600'
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-800',
          border: 'border-slate-300',
          light: 'bg-slate-50',
          dark: 'bg-slate-600'
        };
    }
  };

  // Format time (e.g., "9:00 AM")
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Format date (e.g., "Jul 15, 2025")
  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get day of week (e.g., "Monday")
  const getDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Get short day of week (e.g., "Mon")
  const getShortDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Get month name (e.g., "July")
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      event.start.getDate() === date.getDate() &&
      event.start.getMonth() === date.getMonth() &&
      event.start.getFullYear() === date.getFullYear()
    );
  };

  // Get events for a specific hour
  const getEventsForHour = (date: Date, hour: number) => {
    return events.filter(event => 
      event.start.getDate() === date.getDate() &&
      event.start.getMonth() === date.getMonth() &&
      event.start.getFullYear() === date.getFullYear() &&
      event.start.getHours() === hour
    );
  };

  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'daily':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case '90-day':
        newDate.setDate(newDate.getDate() - 90);
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'daily':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case '90-day':
        newDate.setDate(newDate.getDate() + 90);
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Add new event
  const addEvent = (event: Partial<CalendarEvent>) => {
    if (event.title && event.start && event.end && event.category) {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: event.title,
        start: event.start,
        end: event.end,
        category: event.category as 'business' | 'body' | 'balance' | 'personal',
        completed: false,
        isMilestone: event.isMilestone || false,
        goalId: event.goalId
      };
      
      setEvents(prev => [...prev, newEvent]);
      setNewEvent({});
    }
  };

  // Update existing event
  const updateEvent = (eventId: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, ...updates } : event
      )
    );
  };

  // Delete event
  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  // Toggle event completion
  const toggleEventCompletion = (eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, completed: !event.completed } : event
      )
    );
  };

  // Get dates for current week
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // Get dates for 90-day view
  const get90DayDates = () => {
    const dates = [];
    const startDate = new Date(currentDate);
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // Get weeks for 90-day view
  const get90DayWeeks = () => {
    const weeks = [];
    const dates = get90DayDates();
    
    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7));
    }
    
    return weeks;
  };

  // Render Daily View
  const renderDailyView = () => {
    const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Daily Focus</h2>
              <p className="text-slate-600">{formatDate(currentDate)}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowVisionOverlay(!showVisionOverlay)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showVisionOverlay 
                    ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{showVisionOverlay ? 'Hide Vision' : 'Show Vision'}</span>
              </button>
              
              <button
                onClick={() => setNewEvent({ 
                  start: new Date(currentDate.setHours(9, 0, 0, 0)),
                  end: new Date(currentDate.setHours(10, 0, 0, 0)),
                  category: 'business'
                })}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
          
          {/* Vision Overlay */}
          {showVisionOverlay && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-start space-x-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Your Vision</h3>
                  <p className="text-purple-800 italic mb-4">
                    {goalsData.annualSnapshot?.snapshot || "I feel energized and healthy. My career is thriving with new opportunities and growth. My relationships are deep and fulfilling, and I'm living with purpose and joy every day."}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {valuesData.rankedCoreValues.slice(0, 3).map(value => (
                      <span key={value.id} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {value.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Today's Focus</h3>
                  <div className="space-y-2">
                    {Object.entries(goalsData.categoryGoals).map(([category, goal]) => {
                      if (!goal.goal) return null;
                      const colors = getCategoryColor(category);
                      return (
                        <div key={category} className={`p-2 ${colors.light} ${colors.border} border rounded-lg`}>
                          <p className={`text-sm font-medium ${colors.text}`}>{goal.goal}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-4 gap-2">
                {visionItems.slice(0, 4).map(item => (
                  <div key={item.id} className="relative h-16 rounded-lg overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <p className="text-white text-xs font-medium px-2 text-center">
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Time Blocks */}
          <div className="space-y-2">
            {hours.map(hour => {
              const hourEvents = getEventsForHour(currentDate, hour);
              const timeLabel = `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
              
              return (
                <div key={hour} className="flex items-start">
                  <div className="w-20 text-right pr-4 pt-2 text-sm text-slate-500 font-medium">
                    {timeLabel}
                  </div>
                  
                  <div className="flex-1 min-h-16 border-l-2 border-slate-200 pl-4">
                    {hourEvents.length > 0 ? (
                      <div className="space-y-2 py-2">
                        {hourEvents.map(event => {
                          const colors = getCategoryColor(event.category);
                          
                          return (
                            <div 
                              key={event.id} 
                              className={`${colors.bg} ${colors.border} border rounded-lg p-3 flex items-center justify-between group`}
                            >
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => toggleEventCompletion(event.id)}
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    event.completed 
                                      ? `${colors.dark} text-white` 
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {event.completed && <Check className="w-3 h-3" />}
                                </button>
                                
                                <div>
                                  <h4 className={`font-medium ${event.completed ? 'line-through text-slate-500' : colors.text}`}>
                                    {event.title}
                                  </h4>
                                  <p className="text-xs text-slate-500">
                                    {formatTime(event.start)} - {formatTime(event.end)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingEvent(event)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteEvent(event.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-16 flex items-center justify-center border border-dashed border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                        <p className="text-sm text-slate-400">Drop tasks here</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Daily Reflection */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Daily Reflection</h3>
            <textarea
              placeholder="What went well today? What could be improved? What did you learn?"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                Save Reflection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Weekly View
  const renderWeeklyView = () => {
    const weekDates = getWeekDates();
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Weekly Planning</h2>
              <p className="text-slate-600">
                {formatDate(weekStart)} - {formatDate(weekEnd)}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowVisionOverlay(!showVisionOverlay)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showVisionOverlay 
                    ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{showVisionOverlay ? 'Hide Vision' : 'Show Vision'}</span>
              </button>
              
              <button
                onClick={() => setNewEvent({ 
                  start: new Date(weekStart),
                  end: new Date(weekStart),
                  category: 'business'
                })}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>
          </div>
          
          {/* Vision Overlay */}
          {showVisionOverlay && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-purple-900">Weekly Focus</h3>
                <button
                  onClick={() => setShowVisionOverlay(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(goalsData.categoryGoals).map(([category, goal]) => {
                  if (!goal.goal) return null;
                  const colors = getCategoryColor(category);
                  return (
                    <div key={category} className={`p-3 ${colors.light} ${colors.border} border rounded-lg`}>
                      <h4 className={`font-medium ${colors.text} mb-2`}>{goal.goal}</h4>
                      <div className="space-y-1">
                        {goal.actions.slice(0, 2).map((action, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <p className="text-xs text-slate-600">{action.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
            {/* Action Pool */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
                  <button
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {actionPool.map(action => {
                    const colors = getCategoryColor(action.category);
                    
                    return (
                      <div 
                        key={action.id} 
                        className={`${colors.bg} ${colors.border} border rounded-lg p-3 cursor-move hover:shadow-sm transition-shadow`}
                        draggable
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${colors.text}`}>{action.title}</h4>
                          <span className="text-xs px-2 py-1 bg-white rounded-full text-slate-600 border border-slate-200">
                            {action.duration}m
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {action.frequency === 'daily' ? 'Daily' : 
                             action.frequency === 'weekly' ? 'Weekly' : 
                             '3x per Week'}
                          </span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full" style={{ 
                              backgroundColor: action.category === 'business' ? '#8B5CF6' : 
                                              action.category === 'body' ? '#10B981' : 
                                              action.category === 'balance' ? '#3B82F6' : 
                                              '#F59E0B'
                            }} />
                            <span className="text-xs text-slate-500 capitalize">{action.category}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Weekly Calendar */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDates.map((date, index) => (
                  <div key={index} className="text-center">
                    <div className={`font-semibold ${
                      date.toDateString() === new Date().toDateString() 
                        ? 'text-purple-600' 
                        : 'text-slate-700'
                    }`}>
                      {getShortDayOfWeek(date)}
                    </div>
                    <div className={`text-sm ${
                      date.toDateString() === new Date().toDateString()
                        ? 'bg-purple-600 text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto'
                        : 'text-slate-500'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Time Blocks */}
              <div className="space-y-6">
                {/* Morning Block */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Morning</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDates.map((date, dateIndex) => (
                      <div 
                        key={dateIndex} 
                        className="min-h-32 bg-slate-50 rounded-lg border border-slate-200 p-2"
                      >
                        {getEventsForDay(date)
                          .filter(event => event.start.getHours() < 12)
                          .map(event => {
                            const colors = getCategoryColor(event.category);
                            
                            return (
                              <div 
                                key={event.id} 
                                className={`${colors.bg} ${colors.border} border rounded-lg p-2 mb-1 text-xs`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`font-medium ${colors.text}`}>{event.title}</span>
                                  <button
                                    onClick={() => toggleEventCompletion(event.id)}
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                      event.completed 
                                        ? `${colors.dark} text-white` 
                                        : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {event.completed && <Check className="w-2 h-2" />}
                                  </button>
                                </div>
                                <div className="text-slate-500 mt-1">
                                  {formatTime(event.start)}
                                </div>
                              </div>
                            );
                          })}
                        
                        {getEventsForDay(date).filter(event => event.start.getHours() < 12).length === 0 && (
                          <div className="h-full flex items-center justify-center text-xs text-slate-400">
                            Drop actions here
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Afternoon Block */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Afternoon</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDates.map((date, dateIndex) => (
                      <div 
                        key={dateIndex} 
                        className="min-h-32 bg-slate-50 rounded-lg border border-slate-200 p-2"
                      >
                        {getEventsForDay(date)
                          .filter(event => event.start.getHours() >= 12 && event.start.getHours() < 17)
                          .map(event => {
                            const colors = getCategoryColor(event.category);
                            
                            return (
                              <div 
                                key={event.id} 
                                className={`${colors.bg} ${colors.border} border rounded-lg p-2 mb-1 text-xs`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`font-medium ${colors.text}`}>{event.title}</span>
                                  <button
                                    onClick={() => toggleEventCompletion(event.id)}
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                      event.completed 
                                        ? `${colors.dark} text-white` 
                                        : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {event.completed && <Check className="w-2 h-2" />}
                                  </button>
                                </div>
                                <div className="text-slate-500 mt-1">
                                  {formatTime(event.start)}
                                </div>
                              </div>
                            );
                          })}
                        
                        {getEventsForDay(date).filter(event => event.start.getHours() >= 12 && event.start.getHours() < 17).length === 0 && (
                          <div className="h-full flex items-center justify-center text-xs text-slate-400">
                            Drop actions here
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Evening Block */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Evening</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDates.map((date, dateIndex) => (
                      <div 
                        key={dateIndex} 
                        className="min-h-32 bg-slate-50 rounded-lg border border-slate-200 p-2"
                      >
                        {getEventsForDay(date)
                          .filter(event => event.start.getHours() >= 17)
                          .map(event => {
                            const colors = getCategoryColor(event.category);
                            
                            return (
                              <div 
                                key={event.id} 
                                className={`${colors.bg} ${colors.border} border rounded-lg p-2 mb-1 text-xs`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`font-medium ${colors.text}`}>{event.title}</span>
                                  <button
                                    onClick={() => toggleEventCompletion(event.id)}
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                      event.completed 
                                        ? `${colors.dark} text-white` 
                                        : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {event.completed && <Check className="w-2 h-2" />}
                                  </button>
                                </div>
                                <div className="text-slate-500 mt-1">
                                  {formatTime(event.start)}
                                </div>
                              </div>
                            );
                          })}
                        
                        {getEventsForDay(date).filter(event => event.start.getHours() >= 17).length === 0 && (
                          <div className="h-full flex items-center justify-center text-xs text-slate-400">
                            Drop actions here
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render 90-Day View
  const render90DayView = () => {
    const weeks = get90DayWeeks();
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">90-Day Planning</h2>
              <p className="text-slate-600">
                {formatDate(weeks[0][0])} - {formatDate(weeks[weeks.length - 1][6])}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowVisionOverlay(!showVisionOverlay)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showVisionOverlay 
                    ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{showVisionOverlay ? 'Hide Vision' : 'Show Vision'}</span>
              </button>
              
              <button
                onClick={() => setNewEvent({ 
                  start: new Date(weeks[0][0]),
                  end: new Date(weeks[0][0]),
                  category: 'business',
                  isMilestone: true
                })}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Milestone</span>
              </button>
            </div>
          </div>
          
          {/* Vision Overlay */}
          {showVisionOverlay && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-purple-900">Quarterly Focus</h3>
                <button
                  onClick={() => setShowVisionOverlay(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(goalsData.categoryGoals).map(([category, goal]) => {
                  if (!goal.goal) return null;
                  const colors = getCategoryColor(category);
                  return (
                    <div key={category} className={`p-3 ${colors.light} ${colors.border} border rounded-lg`}>
                      <h4 className={`font-medium ${colors.text} mb-2`}>{goal.goal}</h4>
                      <div className="space-y-1">
                        {goal.milestones.slice(0, 2).map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <p className="text-xs text-slate-600">{milestone.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Timeline */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Milestones & Key Dates</h3>
            <div className="relative">
              <div className="absolute left-0 right-0 h-1 bg-slate-200 top-4"></div>
              <div className="flex justify-between relative">
                {[0, 1, 2].map(month => {
                  const date = new Date(currentDate);
                  date.setMonth(date.getMonth() + month);
                  
                  return (
                    <div key={month} className="text-center z-10">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                        {month + 1}
                      </div>
                      <div className="text-sm font-medium text-slate-700">
                        {getMonthName(date)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 space-y-3">
                {events
                  .filter(event => event.isMilestone)
                  .map(event => {
                    const colors = getCategoryColor(event.category);
                    const daysPassed = Math.floor((event.start.getTime() - weeks[0][0].getTime()) / (1000 * 60 * 60 * 24));
                    const position = Math.min(100, Math.max(0, (daysPassed / 90) * 100));
                    
                    return (
                      <div 
                        key={event.id} 
                        className="relative"
                        style={{ marginLeft: `${position}%` }}
                      >
                        <div className={`absolute left-0 w-px h-3 ${colors.dark} top-0 transform -translate-y-full`}></div>
                        <div className={`${colors.bg} ${colors.border} border rounded-lg p-3 max-w-xs`}>
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${colors.text}`}>{event.title}</h4>
                            <span className="text-xs text-slate-500">{formatDate(event.start)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          
          {/* Weekly Planning */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Weekly Planning</h3>
            <div className="space-y-6">
              {weeks.slice(0, 4).map((week, weekIndex) => (
                <div key={weekIndex} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-3">
                    Week {weekIndex + 1}: {formatDate(week[0])} - {formatDate(week[6])}
                  </h4>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {week.map((date, dateIndex) => (
                      <div 
                        key={dateIndex} 
                        className="min-h-20 bg-white rounded-lg border border-slate-200 p-2 text-center"
                      >
                        <div className="text-xs font-medium text-slate-700 mb-1">
                          {date.getDate()}
                        </div>
                        
                        {getEventsForDay(date).length > 0 ? (
                          <div className="space-y-1">
                            {getEventsForDay(date).slice(0, 2).map(event => {
                              const colors = getCategoryColor(event.category);
                              
                              return (
                                <div 
                                  key={event.id} 
                                  className={`${colors.bg} text-xs p-1 rounded ${colors.text}`}
                                >
                                  {event.title}
                                </div>
                              );
                            })}
                            
                            {getEventsForDay(date).length > 2 && (
                              <div className="text-xs text-slate-500">
                                +{getEventsForDay(date).length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-8 flex items-center justify-center text-xs text-slate-400">
                            -
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Yearly View
  const renderYearlyView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-blue-600 text-center w-full">THE BIG A## CALENDAR {year}</h2>
            </div>
          </div>
          
          {/* Yearly Calendar Grid */}
          <div className="border-2 border-blue-600 rounded-lg overflow-hidden">
            <div className="grid grid-cols-31 border-b border-blue-600">
              {/* Month headers */}
              {Array.from({ length: 31 }, (_, i) => (
                <div key={i} className="h-8 flex items-center justify-center text-xs font-semibold text-blue-600 border-r border-blue-200">
                  {i + 1}
                </div>
              ))}
            </div>
            
            {months.map(month => {
              const daysInMonth = getDaysInMonth(year, month);
              const firstDay = getFirstDayOfMonth(year, month);
              
              return (
                <div key={month} className="grid grid-cols-31 border-b border-blue-600">
                  {/* Month label */}
                  <div className="col-span-1 border-r border-blue-600 bg-blue-50 flex items-center">
                    <div className="w-12 text-blue-600 font-bold text-xl pl-2">
                      {new Date(year, month).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Days */}
                  <div className="col-span-30 grid grid-cols-30">
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const isValidDay = day <= daysInMonth;
                      const date = new Date(year, month, day);
                      const hasEvents = isValidDay && getEventsForDay(date).length > 0;
                      const hasMilestone = isValidDay && getEventsForDay(date).some(e => e.isMilestone);
                      
                      return (
                        <div 
                          key={i} 
                          className={`h-8 border-r border-blue-200 flex items-center justify-center ${
                            isValidDay ? 'bg-blue-50' : 'bg-slate-100'
                          }`}
                        >
                          {isValidDay && (
                            <div className={`w-full h-full flex items-center justify-center ${
                              hasMilestone ? 'bg-yellow-100' : 
                              hasEvents ? 'bg-green-100' : ''
                            }`}>
                              {day}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center justify-end space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border border-blue-200"></div>
              <span className="text-slate-700">Milestone</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-blue-200"></div>
              <span className="text-slate-700">Event</span>
            </div>
          </div>
          
          {/* Annual Goals Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(goalsData.categoryGoals).map(([category, goal]) => {
              if (!goal.goal) return null;
              const colors = getCategoryColor(category);
              
              return (
                <div key={category} className={`p-4 ${colors.light} ${colors.border} border rounded-lg`}>
                  <h3 className={`text-lg font-semibold ${colors.text} mb-3 capitalize`}>{category} Goal</h3>
                  <p className="text-slate-700 mb-3">{goal.goal}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-700 text-sm">Key Milestones:</h4>
                    <div className="space-y-1">
                      {goal.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <p className="text-sm text-slate-600">{milestone.title}</p>
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
  };

  return (
    <>
      <Header />
      <Navigation 
        currentView="calendar" 
        onNavigate={(view) => window.location.href = `/${view}`}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'} p-6`}>
        <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600 mt-2">
            Schedule your time based on your vision, values, and goals
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-white rounded-lg shadow-sm border border-slate-200">
            <button
              onClick={() => setCurrentView('daily')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                currentView === 'daily' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setCurrentView('weekly')}
              className={`px-4 py-2 text-sm font-medium ${
                currentView === 'weekly' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setCurrentView('90-day')}
              className={`px-4 py-2 text-sm font-medium ${
                currentView === '90-day' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              90-Day
            </button>
            <button
              onClick={() => setCurrentView('yearly')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                currentView === 'yearly' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Yearly
            </button>
          </div>
          
          <div className="flex items-center space-x-1 bg-white rounded-lg shadow-sm border border-slate-200">
            <button
              onClick={goToPrevious}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-l-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Today
            </button>
            <button
              onClick={goToNext}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-r-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      {currentView === 'daily' && renderDailyView()}
      {currentView === 'weekly' && renderWeeklyView()}
      {currentView === '90-day' && render90DayView()}
      {currentView === 'yearly' && renderYearlyView()}
      
      {/* Event Editing Modal */}
      {(editingEvent || Object.keys(newEvent).length > 0) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editingEvent?.title || newEvent.title || ''}
                  onChange={(e) => editingEvent 
                    ? setEditingEvent({ ...editingEvent, title: e.target.value })
                    : setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editingEvent?.start.toISOString().slice(0, 16) || newEvent.start?.toISOString().slice(0, 16) || ''}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      editingEvent 
                        ? setEditingEvent({ ...editingEvent, start: date })
                        : setNewEvent({ ...newEvent, start: date });
                    }}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editingEvent?.end.toISOString().slice(0, 16) || newEvent.end?.toISOString().slice(0, 16) || ''}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      editingEvent 
                        ? setEditingEvent({ ...editingEvent, end: date })
                        : setNewEvent({ ...newEvent, end: date });
                    }}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={editingEvent?.category || newEvent.category || 'business'}
                  onChange={(e) => {
                    const category = e.target.value as 'business' | 'body' | 'balance' | 'personal';
                    editingEvent 
                      ? setEditingEvent({ ...editingEvent, category })
                      : setNewEvent({ ...newEvent, category });
                  }}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="business">Business</option>
                  <option value="body">Body</option>
                  <option value="balance">Balance</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isMilestone"
                  checked={editingEvent?.isMilestone || newEvent.isMilestone || false}
                  onChange={(e) => {
                    const isMilestone = e.target.checked;
                    editingEvent 
                      ? setEditingEvent({ ...editingEvent, isMilestone })
                      : setNewEvent({ ...newEvent, isMilestone });
                  }}
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isMilestone" className="ml-2 text-sm text-slate-700">
                  This is a milestone
                </label>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setNewEvent({});
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                
                {editingEvent ? (
                  <button
                    onClick={() => {
                      if (editingEvent.title && editingEvent.start && editingEvent.end) {
                        updateEvent(editingEvent.id, editingEvent);
                        setEditingEvent(null);
                      }
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Update
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (newEvent.title && newEvent.start && newEvent.end && newEvent.category) {
                        addEvent(newEvent);
                        setNewEvent({});
                      }
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
};

export default Calendar;