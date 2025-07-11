import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Target, 
  Heart, 
  BarChart3,
  Eye,
  Grid,
  List,
  Layers,
  Check,
  X,
  Edit3,
  Trash2,
  Save,
  ArrowRight,
  ArrowLeft,
  Filter,
  Search,
  Menu,
  MoreHorizontal,
  Zap,
  Sparkles
} from 'lucide-react';
import { useCalendarData, Event, ActionPoolItem } from '../hooks/useCalendarData';
import { useWheelData } from '../hooks/useWheelData';
import { useValuesData } from '../hooks/useValuesData';
import { useVisionBoardData } from '../hooks/useVisionBoardData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';

type CalendarView = 'daily' | 'weekly' | '90-day' | 'yearly';

const Calendar: React.FC = () => {
  const [currentView, setCurrentView] = useState<CalendarView>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showVisionOverlay, setShowVisionOverlay] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    category: 'business',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000) // 1 hour later
  });
  
  const { 
    data: calendarData, 
    addEvent, 
    updateEvent, 
    removeEvent, 
    scheduleActionFromPool,
    refreshActionPool
  } = useCalendarData();
  
  const { events, actionPool } = calendarData || { events: [], actionPool: [] };
  
  const { data: wheelData } = useWheelData();
  const { data: valuesData } = useValuesData();
  const { visionItems } = useVisionBoardData();
  const { data: goalsData } = useGoalSettingData();

  // Refresh action pool when component mounts
  useEffect(() => {
    refreshActionPool();
    console.log("Refreshing action pool with goals data:", goalsData);
  }, [refreshActionPool, goalsData]);

  const handlePrevious = () => {
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

  const handleNext = () => {
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

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.start && newEvent.end && newEvent.category) {
      const event: Event = {
        title: newEvent.title,
        start: new Date(newEvent.start),
        end: new Date(newEvent.end),
        category: newEvent.category as 'business' | 'body' | 'balance' | 'personal',
        frequency: newEvent.frequency as 'daily' | 'weekly' | '3x-week' | undefined
      };
      
      addEvent(event);
      setIsAddingEvent(false);
      setNewEvent({
        category: 'business',
        start: new Date(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000)
      });
    }
  };

  const handleDeleteEvent = (id: string) => {
    removeEvent(id);
  };

  const handleToggleEventCompletion = (id: string) => {
    const event = events.find(e => e.id === id);
    if (event) {
      updateEvent(id, { completed: !event.completed });
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getWeekDates = (): Date[] => {
    const dates: Date[] = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const getEventsForDay = (date: Date): Event[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const getCategoryColor = (category: string): string => {
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
        return <Target className="w-4 h-4" />;
      case 'body':
        return <Heart className="w-4 h-4" />;
      case 'balance':
        return <Zap className="w-4 h-4" />;
      case 'personal':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getFrequencyLabel = (frequency?: string): string => {
    switch (frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        return 'Once a week';
      case '3x-week':
        return '3x per week';
      default:
        return 'One time';
    }
  };

  const renderDailyView = () => {
    const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm
    const dayEvents = getEventsForDay(currentDate);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Daily Focus</h2>
          <p className="text-slate-600">{formatDate(currentDate)}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Schedule</h3>
            <button
              onClick={() => setIsAddingEvent(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
          
          <div className="space-y-2">
            {hours.map(hour => {
              const timeStart = new Date(currentDate);
              timeStart.setHours(hour, 0, 0);
              
              const timeEnd = new Date(currentDate);
              timeEnd.setHours(hour + 1, 0, 0);
              
              const hourEvents = dayEvents.filter(event => {
                const eventStart = new Date(event.start);
                return eventStart.getHours() === hour;
              });
              
              return (
                <div key={hour} className="flex">
                  <div className="w-20 py-2 text-right pr-4 text-slate-500 font-medium">
                    {hour === 12 ? '12:00 PM' : hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
                  </div>
                  
                  <div className="flex-1 min-h-16 border border-slate-200 rounded-lg">
                    {hourEvents.length > 0 ? (
                      <div className="p-2 space-y-2">
                        {hourEvents.map(event => (
                          <div 
                            key={event.id}
                            className={`p-2 rounded-lg border ${getCategoryColor(event.category)} flex items-center justify-between`}
                          >
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleEventCompletion(event.id)}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  event.completed 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-slate-300 hover:border-slate-400'
                                }`}
                              >
                                {event.completed && <Check className="w-3 h-3" />}
                              </button>
                              <div>
                                <div className="font-medium">{event.title}</div>
                                <div className="text-xs opacity-75">
                                  {formatTime(event.start)} - {formatTime(event.end)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        <span>Drop tasks here</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-900 mb-2">Daily Reflection</h4>
            <textarea
              placeholder="What went well today? What could be improved tomorrow?"
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekDates = getWeekDates();
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Weekly Planning</h2>
          <p className="text-slate-600">
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
            {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Action Pool Sidebar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Action Pool</h3>
            <div className="space-y-3">
              {actionPool.map(action => (
                <div 
                  key={action.id}
                  className={`p-3 rounded-lg border ${getCategoryColor(action.category)} cursor-move hover:shadow-md transition-shadow`}
                  draggable
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">{action.title}</div>
                    <div className="flex items-center space-x-1 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{action.duration}m</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(action.category)}
                      <span className="capitalize">{action.category}</span>
                    </div>
                    <div className="px-2 py-0.5 bg-white/50 rounded-full">
                      {getFrequencyLabel(action.frequency)}
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => setIsAddingEvent(true)}
                className="w-full flex items-center justify-center space-x-2 p-3 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-slate-700 hover:border-slate-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Action</span>
              </button>
            </div>
          </div>
          
          {/* Weekly Calendar */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, index) => (
                <div key={index} className="text-center">
                  <div className={`font-medium mb-1 ${
                    date.getDate() === new Date().getDate() &&
                    date.getMonth() === new Date().getMonth() &&
                    date.getFullYear() === new Date().getFullYear()
                      ? 'text-purple-600'
                      : 'text-slate-900'
                  }`}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                    date.getDate() === new Date().getDate() &&
                    date.getMonth() === new Date().getMonth() &&
                    date.getFullYear() === new Date().getFullYear()
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-700'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2 mt-4">
              {weekDates.map((date, dateIndex) => (
                <div key={dateIndex} className="min-h-64 border border-slate-200 rounded-lg">
                  <div className="p-2 space-y-2">
                    <div className="text-xs font-medium text-slate-500 mb-1">Morning</div>
                    {getEventsForDay(date)
                      .filter(event => {
                        const hour = new Date(event.start).getHours();
                        return hour >= 5 && hour < 12;
                      })
                      .map(event => (
                        <div 
                          key={event.id}
                          className={`p-2 rounded-lg border ${getCategoryColor(event.category)} text-xs`}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="opacity-75">{formatTime(event.start)}</div>
                        </div>
                      ))}
                    <div className="h-12 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                      Drop actions here
                    </div>
                  </div>
                  
                  <div className="p-2 space-y-2">
                    <div className="text-xs font-medium text-slate-500 mb-1">Afternoon</div>
                    {getEventsForDay(date)
                      .filter(event => {
                        const hour = new Date(event.start).getHours();
                        return hour >= 12 && hour < 17;
                      })
                      .map(event => (
                        <div 
                          key={event.id}
                          className={`p-2 rounded-lg border ${getCategoryColor(event.category)} text-xs`}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="opacity-75">{formatTime(event.start)}</div>
                        </div>
                      ))}
                    <div className="h-12 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                      Drop actions here
                    </div>
                  </div>
                  
                  <div className="p-2 space-y-2">
                    <div className="text-xs font-medium text-slate-500 mb-1">Evening</div>
                    {getEventsForDay(date)
                      .filter(event => {
                        const hour = new Date(event.start).getHours();
                        return hour >= 17 && hour < 24;
                      })
                      .map(event => (
                        <div 
                          key={event.id}
                          className={`p-2 rounded-lg border ${getCategoryColor(event.category)} text-xs`}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="opacity-75">{formatTime(event.start)}</div>
                        </div>
                      ))}
                    <div className="h-12 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                      Drop actions here
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const render90DayView = () => {
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 90);
    
    // Generate 12 weeks
    const weeks = Array.from({ length: 12 }, (_, i) => {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      return weekStart;
    });
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">90-Day Focus</h2>
          <p className="text-slate-600">
            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
            {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Milestones Timeline</h3>
          
          <div className="relative pb-4">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
            
            <div className="space-y-8">
              {/* Sample milestones */}
              {['business', 'body', 'balance'].map((category, index) => {
                const milestones = goalsData?.categoryGoals?.[category]?.milestones || [];
                return milestones.map((milestone, mIndex) => {
                  const weekIndex = Math.floor(mIndex * 4); // Distribute across 12 weeks
                  const date = new Date(startDate);
                  date.setDate(date.getDate() + (weekIndex * 7));
                  
                  return (
                    <div key={`${category}-${mIndex}`} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className={`absolute left-2 top-1.5 w-5 h-5 rounded-full border-2 ${
                        category === 'business' ? 'border-purple-500 bg-purple-100' :
                        category === 'body' ? 'border-green-500 bg-green-100' :
                        'border-blue-500 bg-blue-100'
                      }`}></div>
                      
                      <div className={`p-4 rounded-lg border ${
                        category === 'business' ? 'border-purple-200 bg-purple-50' :
                        category === 'body' ? 'border-green-200 bg-green-50' :
                        'border-blue-200 bg-blue-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-slate-900">{milestone.title}</div>
                          <div className="text-sm text-slate-500">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">
                          {milestone.description || `Milestone for ${category} goal`}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs">
                            {getCategoryIcon(category)}
                            <span className="capitalize">{category}</span>
                          </div>
                          <button
                            className={`px-2 py-1 rounded-full text-xs ${
                              milestone.completed
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {milestone.completed ? 'Completed' : 'In Progress'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Weekly Planning</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeks.slice(0, 6).map((weekStart, index) => {
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekEnd.getDate() + 6);
              
              return (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="font-medium text-slate-900 mb-2">
                    Week {index + 1}: {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                    {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  
                  <div className="space-y-2">
                    {['business', 'body', 'balance'].map(category => (
                      <div 
                        key={category}
                        className={`p-2 rounded-lg ${
                          category === 'business' ? 'bg-purple-50 border border-purple-200' :
                          category === 'body' ? 'bg-green-50 border border-green-200' :
                          'bg-blue-50 border border-blue-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 text-sm font-medium mb-1">
                          {getCategoryIcon(category)}
                          <span className="capitalize">{category}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          {actionPool
                            .filter(action => action.category === category)
                            .slice(0, 2)
                            .map((action, i) => (
                              <div key={i} className="flex items-center space-x-1 mb-1">
                                <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                <span>{action.title}</span>
                              </div>
                            ))}
                          <div className="text-purple-600 hover:text-purple-700 cursor-pointer mt-1">
                            + Add actions
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderYearlyView = () => {
    const year = currentDate.getFullYear();
    const months = [
      { abbr: 'JAN', name: 'January' },
      { abbr: 'FEB', name: 'February' },
      { abbr: 'MAR', name: 'March' },
      { abbr: 'APR', name: 'April' },
      { abbr: 'MAY', name: 'May' },
      { abbr: 'JUN', name: 'June' },
      { abbr: 'JUL', name: 'July' },
      { abbr: 'AUG', name: 'August' },
      { abbr: 'SEP', name: 'September' },
      { abbr: 'OCT', name: 'October' },
      { abbr: 'NOV', name: 'November' },
      { abbr: 'DEC', name: 'December' }
    ];
    
    // Get days in a month (1-31)
    const daysInMonth = (month: number, year: number) => {
      return new Date(year, month + 1, 0).getDate();
    };
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-5xl font-bold text-blue-600">THE BIG A## CALENDAR {year}</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border-2 border-blue-500 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-blue-500">
                <th className="w-16 border-r-2 border-blue-500"></th>
                {Array.from({ length: 31 }, (_, i) => (
                  <th key={i} className="text-center py-2 text-blue-600 font-medium border-r border-blue-300">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((month, monthIndex) => (
                <tr key={month.abbr} className="border-b border-blue-300">
                  <td className="w-16 py-4 text-center border-r-2 border-blue-500">
                    <span className="text-blue-600 font-bold text-xl">{month.abbr}</span>
                  </td>
                  {Array.from({ length: 31 }, (_, dayIndex) => {
                    const isValidDay = dayIndex < daysInMonth(monthIndex, year);
                    
                    return (
                      <td 
                        key={dayIndex}
                        className={`min-h-12 border-r border-blue-300 ${isValidDay ? 'bg-blue-50' : 'bg-slate-100'}`}
                      >
                        {/* Event indicators would go here */}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Annual Goals Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['business', 'body', 'balance'].map(category => {
              const goal = goalsData?.categoryGoals?.[category];
              
              return (
                <div 
                  key={category}
                  className={`p-4 rounded-lg ${
                    category === 'business' ? 'bg-purple-50 border border-purple-200' :
                    category === 'body' ? 'bg-green-50 border border-green-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {getCategoryIcon(category)}
                    <h4 className="font-semibold text-slate-900 capitalize">{category}</h4>
                  </div>
                  
                  <p className="text-slate-700 mb-3">
                    {goal?.goal || `No ${category} goal set yet`}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-slate-600">Progress</div>
                    <div className="w-full bg-white rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          category === 'business' ? 'bg-purple-600' :
                          category === 'body' ? 'bg-green-600' :
                          'bg-blue-600'
                        }`}
                        style={{ width: '45%' }}
                      ></div>
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

  const renderAddEventForm = () => {
    if (!isAddingEvent) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Event</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Event title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.start ? new Date(newEvent.start).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.end ? new Date(newEvent.end).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={newEvent.category || 'business'}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
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
                value={newEvent.frequency || ''}
                onChange={(e) => setNewEvent({ ...newEvent, frequency: e.target.value as any })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">One time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="3x-week">3x per week</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsAddingEvent(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVisionOverlay = () => {
    if (!showVisionOverlay) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Your Vision</h3>
            <button
              onClick={() => setShowVisionOverlay(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Annual Vision */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-semibold text-purple-900 mb-3">Annual Vision</h4>
              <p className="text-purple-800 italic">
                {goalsData.annualSnapshot?.snapshot || 
                  "I feel energized and healthy. My career is thriving with new opportunities and growth. My relationships are deep and fulfilling, and I'm living with purpose and joy every day."}
              </p>
            </div>
            
            {/* Core Values */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Core Values</h4>
              <div className="flex flex-wrap gap-2">
                {valuesData.rankedCoreValues.slice(0, 6).map(value => (
                  <div 
                    key={value.id}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm border border-purple-200"
                  >
                    {value.name}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Vision Board */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Vision Board</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {visionItems.slice(0, 8).map(item => (
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
              <h4 className="text-lg font-semibold text-slate-900 mb-3">Life Areas</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {wheelData.map(area => (
                  <div 
                    key={area.area}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: area.lightColor, borderColor: area.color, borderWidth: 1 }}
                  >
                    <div className="font-medium" style={{ color: area.darkColor }}>{area.area}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">Current: {area.score}/10</div>
                      <div className="text-sm font-medium" style={{ color: area.color }}>
                        Target: {area.score + 2 > 10 ? 10 : area.score + 2}/10
                      </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600 mt-2">
            Schedule your time based on your vision, values, and goals
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
            onClick={handleToday}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Today
          </button>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevious}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 flex space-x-1 max-w-md">
        <button
          onClick={() => setCurrentView('daily')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            currentView === 'daily'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setCurrentView('weekly')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            currentView === 'weekly'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setCurrentView('90-day')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            currentView === '90-day'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          90-Day
        </button>
        <button
          onClick={() => setCurrentView('yearly')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            currentView === 'yearly'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Yearly
        </button>
      </div>

      {/* Calendar Content */}
      <div>
        {currentView === 'daily' && renderDailyView()}
        {currentView === 'weekly' && renderWeeklyView()}
        {currentView === '90-day' && render90DayView()}
        {currentView === 'yearly' && renderYearlyView()}
      </div>

      {/* Add Event Form */}
      {renderAddEventForm()}
      
      {/* Vision Overlay */}
      {renderVisionOverlay()}
      
      {/* Add custom CSS for grid-cols-31 */}
      <style jsx>{`
        .grid-cols-31 {
          display: grid;
          grid-template-columns: repeat(31, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
};

export default Calendar;