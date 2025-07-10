import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock,
  Edit3,
  X,
  Check,
  Move,
  Flag,
  Star,
  Trophy,
  Sparkles,
  Crown,
  Zap,
  Target,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { ActionItem, Milestone } from '../types/goals';

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: 'business' | 'body' | 'balance' | 'personal';
  duration: number;
  frequency?: 'daily' | 'weekly' | 'multiple';
  specificDays?: string[];
  isGoalAction?: boolean;
  goalCategory?: string;
  isMilestone?: boolean;
  milestoneData?: Milestone;
}

interface DraggableEventProps {
  event: CalendarEvent;
  onMove: (eventId: string, newDate: string) => void;
  onTimeChange: (eventId: string, newTime: string) => void;
  onRemove: (eventId: string) => void;
  compact?: boolean;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({ 
  event, 
  onMove, 
  onTimeChange, 
  onRemove,
  compact = false 
}) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [tempTime, setTempTime] = useState(event.time);

  const [{ isDragging }, drag] = useDrag({
    type: 'calendar-event',
    item: { id: event.id, type: 'calendar-event' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleTimeSubmit = () => {
    onTimeChange(event.id, tempTime);
    setIsEditingTime(false);
  };

  const handleTimeCancel = () => {
    setTempTime(event.time);
    setIsEditingTime(false);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      business: 'bg-purple-500 border-purple-600 text-purple-700',
      body: 'bg-green-500 border-green-600 text-green-700',
      balance: 'bg-blue-500 border-blue-600 text-blue-700',
      personal: 'bg-orange-500 border-orange-600 text-orange-700'
    };
    return colors[category as keyof typeof colors] || colors.personal;
  };

  const getMilestoneIcon = () => {
    if (!event.isMilestone) return null;
    
    const icons = [Trophy, Star, Crown, Zap, Target];
    const IconComponent = icons[Math.floor(Math.random() * icons.length)];
    return <IconComponent className="w-3 h-3" />;
  };

  if (event.isMilestone) {
    return (
      <div
        ref={drag}
        className={`relative group cursor-move transition-all duration-200 ${
          isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
        }`}
      >
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-2 shadow-lg border-2 border-yellow-300 relative overflow-hidden">
          {/* Celebration sparkles */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 animate-pulse" />
          <Sparkles className="absolute top-1 right-1 w-3 h-3 text-yellow-200 animate-bounce" />
          
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-1">
              {getMilestoneIcon()}
              <span className="text-white font-bold text-xs">🎯 MILESTONE</span>
            </div>
            <div className="text-white font-semibold text-sm">{event.title}</div>
            {!compact && (
              <div className="text-yellow-100 text-xs mt-1">{event.time}</div>
            )}
          </div>
          
          {/* Remove button */}
          <button
            onClick={() => onRemove(event.id)}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
          >
            <X className="w-2 h-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={drag}
      className={`relative group cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
      }`}
    >
      <div className={`rounded-lg p-2 shadow-sm border-l-4 ${getCategoryColor(event.category)} bg-white`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Move className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-medium text-slate-900 text-sm truncate">{event.title}</span>
              {event.isGoalAction && (
                <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  Goal
                </span>
              )}
            </div>
            
            {!compact && (
              <>
                {event.description && (
                  <div className="text-slate-600 text-xs mt-1 truncate">{event.description}</div>
                )}
                
                <div className="flex items-center space-x-2 mt-1">
                  {isEditingTime ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="time"
                        value={tempTime}
                        onChange={(e) => setTempTime(e.target.value)}
                        className="text-xs border border-slate-300 rounded px-1 py-0.5"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleTimeSubmit();
                          if (e.key === 'Escape') handleTimeCancel();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleTimeSubmit}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleTimeCancel}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingTime(true)}
                      className="flex items-center space-x-1 text-slate-500 hover:text-slate-700 text-xs"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{event.time}</span>
                      <Edit3 className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                  
                  <span className="text-slate-500 text-xs">{event.duration}min</span>
                </div>
              </>
            )}
          </div>
          
          <button
            onClick={() => onRemove(event.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 ml-2"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface DroppableCalendarCellProps {
  date: string;
  onDrop: (item: any, date: string) => void;
  children: React.ReactNode;
  className?: string;
}

const DroppableCalendarCell: React.FC<DroppableCalendarCellProps> = ({ 
  date, 
  onDrop, 
  children, 
  className = '' 
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: ['goal-action', 'calendar-event'],
    drop: (item) => onDrop(item, date),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`${className} ${isOver ? 'bg-blue-50 border-blue-300' : ''} transition-colors`}
    >
      {children}
    </div>
  );
};

const Calendar: React.FC = () => {
  const { data: goalData } = useGoalSettingData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('monthly');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventDate, setNewEventDate] = useState<string>('');
  
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Morning Workout',
      description: 'Gym session focusing on strength training',
      date: '2025-01-10',
      time: '07:00',
      category: 'body',
      duration: 60,
      frequency: 'daily'
    },
    {
      id: '2',
      title: 'Client Strategy Call',
      description: 'Quarterly planning session with key client',
      date: '2025-01-10',
      time: '10:00',
      category: 'business',
      duration: 90
    }
  ]);

  // Get available goal actions that haven't been scheduled yet
  const getAvailableGoalActions = () => {
    const actions: Array<{
      id: string;
      text: string;
      frequency: 'daily' | 'weekly' | 'multiple';
      specificDays?: string[];
      category: string;
    }> = [];

    Object.entries(goalData.categoryGoals).forEach(([category, goal]) => {
      goal.actions.forEach((action, index) => {
        const actionId = `${category}-${index}`;
        
        // Check if this action is already scheduled
        const isScheduled = events.some(event => 
          event.isGoalAction && 
          event.goalCategory === category && 
          event.title === action.text
        );

        if (!isScheduled) {
          actions.push({
            id: actionId,
            text: action.text,
            frequency: action.frequency,
            specificDays: action.specificDays,
            category
          });
        }
      });
    });

    return actions;
  };

  // Get milestones for calendar display
  const getMilestones = () => {
    const milestones: CalendarEvent[] = [];

    Object.entries(goalData.categoryGoals).forEach(([category, goal]) => {
      goal.milestones.forEach((milestone) => {
        milestones.push({
          id: `milestone-${milestone.id}`,
          title: milestone.title,
          description: milestone.description || '',
          date: milestone.dueDate,
          time: '09:00', // Default time for milestones
          category: category as any,
          duration: 30,
          isMilestone: true,
          milestoneData: milestone
        });
      });
    });

    return milestones;
  };

  const allEvents = [...events, ...getMilestones()];

  const categories = [
    { id: 'business', name: 'Business', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
    { id: 'body', name: 'Health', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
    { id: 'balance', name: 'Balance', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
    { id: 'personal', name: 'Personal', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' }
  ];

  const handleDrop = (item: any, date: string) => {
    if (item.type === 'goal-action') {
      // Add goal action to calendar
      const action = getAvailableGoalActions().find(a => a.id === item.id);
      if (action) {
        const newEvent: CalendarEvent = {
          id: `event-${Date.now()}`,
          title: action.text,
          description: `Goal action from ${action.category}`,
          date,
          time: '09:00',
          category: action.category as any,
          duration: 60,
          frequency: action.frequency,
          specificDays: action.specificDays,
          isGoalAction: true,
          goalCategory: action.category
        };

        setEvents(prev => [...prev, newEvent]);
      }
    } else if (item.type === 'calendar-event') {
      // Move existing event to new date
      setEvents(prev => prev.map(event => 
        event.id === item.id ? { ...event, date } : event
      ));
    }
  };

  const handleEventTimeChange = (eventId: string, newTime: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, time: newTime } : event
    ));
  };

  const handleEventRemove = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const getEventsForDate = (date: Date | string) => {
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return allEvents.filter(event => event.date === dateString);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      switch (view) {
        case 'daily':
          newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
          break;
        case 'weekly':
          newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'monthly':
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
          break;
        case 'yearly':
          newDate.setFullYear(prev.getFullYear() + (direction === 'next' ? 1 : -1));
          break;
      }
      return newDate;
    });
  };

  const getDateRangeText = () => {
    switch (view) {
      case 'daily':
        return formatDate(currentDate);
      case 'weekly':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      case 'monthly':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'yearly':
        return currentDate.getFullYear().toString();
      default:
        return '';
    }
  };

  // Generate hours for daily view
  const generateHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      hours.push(`${hour}:00`);
    }
    return hours;
  };

  // Get days in month for monthly view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Get weeks for weekly view
  const getWeekDays = (date: Date) => {
    const days = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Get months for yearly view
  const getMonthsInYear = (date: Date) => {
    const months = [];
    const year = date.getFullYear();
    
    for (let month = 0; month < 12; month++) {
      months.push(new Date(year, month, 1));
    }
    
    return months;
  };

  const renderDailyView = () => {
    const hours = generateHours();
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-900">{formatDate(currentDate)}</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter(event => event.time.startsWith(hour.split(':')[0]));
            
            return (
              <DroppableCalendarCell
                key={hour}
                date={currentDate.toISOString().split('T')[0]}
                onDrop={handleDrop}
                className="border-b border-slate-100 p-3 min-h-16 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-sm font-medium text-slate-500 w-16 flex-shrink-0">
                    {hour}
                  </div>
                  <div className="flex-1 space-y-2">
                    {hourEvents.map((event) => (
                      <DraggableEvent
                        key={event.id}
                        event={event}
                        onMove={(eventId, newDate) => handleDrop({ id: eventId, type: 'calendar-event' }, newDate)}
                        onTimeChange={handleEventTimeChange}
                        onRemove={handleEventRemove}
                        compact
                      />
                    ))}
                  </div>
                </div>
              </DroppableCalendarCell>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekDays = getWeekDays(currentDate);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className="p-4 text-center font-medium text-slate-600 bg-slate-50 border-r border-slate-200 last:border-r-0">
              <div>{day}</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {weekDays[index]?.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 min-h-96">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <DroppableCalendarCell
                key={index}
                date={day.toISOString().split('T')[0]}
                onDrop={handleDrop}
                className={`p-2 border-r border-slate-100 last:border-r-0 ${
                  isToday ? 'bg-purple-50' : 'hover:bg-slate-50'
                } transition-colors`}
              >
                <div className="space-y-2">
                  {dayEvents.slice(0, 3).map((event) => (
                    <DraggableEvent
                      key={event.id}
                      event={event}
                      onMove={(eventId, newDate) => handleDrop({ id: eventId, type: 'calendar-event' }, newDate)}
                      onTimeChange={handleEventTimeChange}
                      onRemove={handleEventRemove}
                      compact
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </DroppableCalendarCell>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthlyView = () => {
    const days = getDaysInMonth(currentDate);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-4 text-center font-medium text-slate-600 bg-slate-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : [];
            const isToday = day && day.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && day && day.toDateString() === selectedDate.toDateString();

            return (
              <DroppableCalendarCell
                key={index}
                date={day ? day.toISOString().split('T')[0] : ''}
                onDrop={handleDrop}
                className={`min-h-24 p-2 border-r border-b border-slate-100 ${
                  day ? 'cursor-pointer hover:bg-slate-50' : 'bg-slate-25'
                } ${isSelected ? 'bg-purple-50' : ''} ${isToday ? 'bg-blue-50' : ''}`}
              >
                {day && (
                  <>
                    <div 
                      className={`text-sm font-medium mb-1 ${
                        isToday ? 'bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-900'
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <DraggableEvent
                          key={event.id}
                          event={event}
                          onMove={(eventId, newDate) => handleDrop({ id: eventId, type: 'calendar-event' }, newDate)}
                          onTimeChange={handleEventTimeChange}
                          onRemove={handleEventRemove}
                          compact
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-slate-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </DroppableCalendarCell>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearlyView = () => {
    const months = getMonthsInYear(currentDate);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-6">
          {months.map((month) => {
            const monthEvents = allEvents.filter(event => {
              const eventDate = new Date(event.date);
              return eventDate.getMonth() === month.getMonth() && 
                     eventDate.getFullYear() === month.getFullYear();
            });

            const milestones = monthEvents.filter(event => event.isMilestone);

            return (
              <div key={month.getMonth()} className="border border-slate-200 rounded-lg p-3">
                <h4 className="font-semibold text-slate-900 mb-2">
                  {month.toLocaleDateString('en-US', { month: 'long' })}
                </h4>
                
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">
                    {monthEvents.length} events
                  </div>
                  
                  {milestones.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-yellow-600 flex items-center space-x-1">
                        <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                        <span>{milestones.length} milestone{milestones.length !== 1 ? 's' : ''}</span>
                      </div>
                      {milestones.slice(0, 2).map((milestone) => (
                        <div key={milestone.id} className="text-xs text-slate-700 truncate bg-yellow-50 rounded px-2 py-1">
                          🎯 {milestone.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (view) {
      case 'daily':
        return renderDailyView();
      case 'weekly':
        return renderWeeklyView();
      case 'monthly':
        return renderMonthlyView();
      case 'yearly':
        return renderYearlyView();
      default:
        return renderMonthlyView();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Action Calendar</h1>
          <p className="text-slate-600 mt-2">
            Schedule and track your daily actions aligned with your goals
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly', 'yearly'] as ViewMode[]).map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === viewType 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>
          <button 
            onClick={() => {
              setNewEventDate(new Date().toISOString().split('T')[0]);
              setShowNewEventModal(true);
            }}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-xl font-semibold text-slate-900">{getDateRangeText()}</h2>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Category Legend */}
          <div className="flex items-center space-x-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <span className="text-sm text-slate-600">{category.name}</span>
              </div>
            ))}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Milestones</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Goal Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Goal Actions</h3>
            
            <div className="space-y-3">
              {getAvailableGoalActions().map((action) => (
                <DraggableGoalAction
                  key={action.id}
                  action={action}
                />
              ))}
              
              {getAvailableGoalActions().length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All goal actions have been scheduled!</p>
                  <p className="text-xs mt-1">Create more goals to see actions here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-900">Upcoming Milestones</h3>
            </div>
            
            <div className="space-y-3">
              {getMilestones()
                .filter(milestone => new Date(milestone.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3)
                .map((milestone) => (
                  <div key={milestone.id} className="bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-slate-900 text-sm">{milestone.title}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Due: {new Date(milestone.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              
              {getMilestones().filter(milestone => new Date(milestone.date) >= new Date()).length === 0 && (
                <div className="text-center py-4 text-yellow-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm">No upcoming milestones</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="lg:col-span-3">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

// Draggable Goal Action Component
interface DraggableGoalActionProps {
  action: {
    id: string;
    text: string;
    frequency: 'daily' | 'weekly' | 'multiple';
    specificDays?: string[];
    category: string;
  };
}

const DraggableGoalAction: React.FC<DraggableGoalActionProps> = ({ action }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'goal-action',
    item: { id: action.id, type: 'goal-action' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      business: 'border-purple-300 bg-purple-50 text-purple-700',
      body: 'border-green-300 bg-green-50 text-green-700',
      balance: 'border-blue-300 bg-blue-50 text-blue-700'
    };
    return colors[category as keyof typeof colors] || colors.business;
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'multiple': return '🗓️';
      default: return '📋';
    }
  };

  return (
    <div
      ref={drag}
      className={`p-3 rounded-lg border-2 border-dashed cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
      } ${getCategoryColor(action.category)}`}
    >
      <div className="flex items-start space-x-2">
        <span className="text-lg">{getFrequencyIcon(action.frequency)}</span>
        <div className="flex-1">
          <div className="font-medium text-sm">{action.text}</div>
          <div className="text-xs opacity-75 mt-1">
            {action.frequency === 'multiple' && action.specificDays?.length 
              ? `${action.specificDays.length} days/week`
              : action.frequency
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;