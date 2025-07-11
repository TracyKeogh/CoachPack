import React, { useState, useRef, useEffect } from 'react';
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
  Circle,
  BarChart3,
  ArrowRight,
  Info,
  Heart,
  Lightbulb
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { useVisionBoardData } from '../hooks/useVisionBoardData';
import { useValuesData } from '../hooks/useValuesData';
import { ActionItem, Milestone } from '../types/goals';

type ViewMode = 'daily' | 'weekly' | '90day' | 'yearly';

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
  completed?: boolean;
}

interface DraggableEventProps {
  event: CalendarEvent;
  onMove: (eventId: string, newDate: string) => void;
  onTimeChange: (eventId: string, newTime: string) => void;
  onRemove: (eventId: string) => void;
  onToggleComplete: (eventId: string) => void;
  compact?: boolean;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({ 
  event, 
  onMove, 
  onTimeChange, 
  onRemove,
  onToggleComplete,
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

  const getCategoryIcon = (category: string) => {
    const icons = {
      business: <Target className="w-3 h-3 text-purple-700" />,
      body: <Heart className="w-3 h-3 text-green-700" />,
      balance: <Sparkles className="w-3 h-3 text-blue-700" />,
      personal: <Star className="w-3 h-3 text-orange-700" />
    };
    return icons[category as keyof typeof icons] || icons.personal;
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
              <div 
                className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ml-auto ${
                  event.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-white/70 bg-white/20 hover:bg-white/30'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(event.id);
                }}
              >
                {event.completed && <Check className="w-3 h-3" />}
              </div>
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
              <div className="flex items-center space-x-1">
                {getCategoryIcon(event.category)}
                <span className="font-medium text-slate-900 text-sm truncate">{event.title}</span>
              </div>
              {event.isGoalAction && (
                <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  Goal
                </span>
              )}
              <div 
                className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  event.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(event.id);
                }}
              >
                {event.completed && <Check className="w-3 h-3" />}
              </div>
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
                  
                  {event.frequency && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      event.frequency === 'daily' ? 'bg-green-100 text-green-700' :
                      event.frequency === 'weekly' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {event.frequency === 'daily' ? 'Daily' : 
                       event.frequency === 'weekly' ? 'Weekly' : 
                       'Multiple'}
                    </span>
                  )}
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
  const { visionItems } = useVisionBoardData();
  const { data: valuesData } = useValuesData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('weekly');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventDate, setNewEventDate] = useState<string>('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showVisionOverlay, setShowVisionOverlay] = useState(false);
  
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Morning Workout',
      description: 'Gym session focusing on strength training',
      date: '2025-01-10',
      time: '07:00',
      category: 'body',
      duration: 60,
      frequency: 'daily',
      completed: false
    },
    {
      id: '2',
      title: 'Client Strategy Call',
      description: 'Quarterly planning session with key client',
      date: '2025-01-10',
      time: '10:00',
      category: 'business',
      duration: 90,
      completed: true
    },
    {
      id: '3',
      title: 'Family Dinner',
      description: 'Weekly family dinner night',
      date: '2025-01-12',
      time: '18:30',
      category: 'balance',
      duration: 120,
      frequency: 'weekly',
      completed: false
    },
    {
      id: '4',
      title: 'Meal Prep',
      description: 'Prepare meals for the week',
      date: '2025-01-12',
      time: '14:00',
      category: 'body',
      duration: 90,
      frequency: 'weekly',
      completed: false
    },
    {
      id: '5',
      title: 'Team Meeting',
      description: 'Weekly team sync',
      date: '2025-01-13',
      time: '09:00',
      category: 'business',
      duration: 60,
      frequency: 'weekly',
      completed: false
    },
    {
      id: '6',
      title: 'Meditation',
      description: 'Morning mindfulness practice',
      date: '2025-01-14',
      time: '06:30',
      category: 'balance',
      duration: 20,
      frequency: 'daily',
      completed: false
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

    Object.entries(goalData.categoryGoals).forEach(([category, categoryGoal]) => {
      if (!categoryGoal || !categoryGoal.actions) return;
      
      categoryGoal.actions.forEach((action, index) => {
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
            frequency: action.frequency || 'weekly',
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

    Object.entries(goalData.categoryGoals).forEach(([category, categoryGoal]) => {
      if (!categoryGoal || !categoryGoal.milestones) return;
      
      categoryGoal.milestones.forEach((milestone) => {
        if (!milestone.title || !milestone.targetDate) return;
        
        milestones.push({
          id: `milestone-${milestone.id}`,
          title: milestone.title,
          description: milestone.description || '',
          date: milestone.targetDate,
          time: '09:00', // Default time for milestones
          category: category as any,
          duration: 30,
          isMilestone: true,
          milestoneData: milestone,
          completed: milestone.completed
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
          goalCategory: action.category,
          completed: false
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
  
  const handleToggleComplete = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, completed: !event.completed } : event
    ));
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
        case '90day':
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 3 : -3));
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
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case '90day':
        const quarterStart = new Date(currentDate);
        const quarterEnd = new Date(currentDate);
        quarterEnd.setDate(quarterEnd.getDate() + 90);
        return `${quarterStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${quarterEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'yearly':
        return currentDate.getFullYear().toString();
      default:
        return '';
    }
  };

  // Generate hours for daily view
  const generateHours = () => {
    const hours = [];
    for (let i = 6; i < 22; i++) { // 6am to 10pm
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

  // Get weeks for 90-day view
  const getWeeksIn90Days = (date: Date) => {
    const weeks = [];
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 90);
    
    // Start with the beginning of the week
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startDate.getDate() - startDate.getDay());
    
    // Generate weeks until we reach the end date
    let currentWeekStart = new Date(startOfWeek);
    while (currentWeekStart < endDate) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      
      weeks.push({
        start: new Date(currentWeekStart),
        end: weekEnd
      });
      
      // Move to next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return weeks;
  };

  const renderDailyView = () => {
    const hours = generateHours();
    const dayEvents = getEventsForDate(currentDate);
    const formattedDate = currentDate.toISOString().split('T')[0];

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900">{formatDate(currentDate)}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowVisionOverlay(!showVisionOverlay)}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                showVisionOverlay 
                  ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {showVisionOverlay ? 'Hide Vision' : 'Show Vision'}
            </button>
          </div>
        </div>
        
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto relative">
          {/* Vision overlay */}
          {showVisionOverlay && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center p-8">
              <div className="max-w-2xl w-full space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-purple-900 mb-2">Your Vision</h3>
                  <p className="text-purple-700">
                    {goalData.annualSnapshot?.snapshot || "I feel energized and healthy. My career is thriving with new opportunities and growth. My relationships are deep and fulfilling, and I'm living with purpose and joy every day."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {visionItems.slice(0, 4).map(item => (
                    <div key={item.id} className="relative group overflow-hidden rounded-lg h-24">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <p className="text-white text-center p-2 text-sm font-medium">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Today's Focus</h4>
                  <p className="text-purple-700">
                    {Object.values(goalData.categoryGoals).length > 0 
                      ? Object.values(goalData.categoryGoals)[0].goal 
                      : "Align your actions with your values"}
                  </p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {valuesData.rankedCoreValues.slice(0, 3).map(value => (
                      <span key={value.id} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {value.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => setShowVisionOverlay(false)}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Return to Calendar
                </button>
              </div>
            </div>
          )}
          
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter(event => event.time.startsWith(hour.split(':')[0]));
            
            return (
              <DroppableCalendarCell
                key={hour}
                date={formattedDate}
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
                        onToggleComplete={handleToggleComplete}
                      />
                    ))}
                    {hourEvents.length === 0 && (
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-2 text-center text-slate-400 text-sm">
                        <p>No white space - schedule something!</p>
                      </div>
                    )}
                  </div>
                </div>
              </DroppableCalendarCell>
            );
          })}
          
          {/* Daily reflection section */}
          <div className="border-t-2 border-purple-200 p-4 bg-purple-50">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-purple-700" />
              Daily Reflection
            </h4>
            <textarea
              placeholder="What went well today? What could be improved? How did your actions align with your values and goals?"
              className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const weekDays = getWeekDays(currentDate);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-8 border-b border-slate-200">
          <div className="p-4 text-center font-medium text-slate-600 bg-slate-50 border-r border-slate-200">
            <div>Action Pool</div>
          </div>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className="p-4 text-center font-medium text-slate-600 bg-slate-50 border-r border-slate-200 last:border-r-0">
              <div>{day}</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {weekDays[index]?.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Week Days with Action Pool */}
        <div className="grid grid-cols-8 min-h-96">
          {/* Action Pool Column */}
          <div className="border-r border-slate-200 p-4 bg-slate-50">
            <h3 className="font-medium text-slate-900 mb-3">Available Actions</h3>
            <div className="space-y-3">
              {getAvailableGoalActions().map((action) => (
                <DraggableGoalAction
                  key={action.id}
                  action={action}
                />
              ))}
              
              {getAvailableGoalActions().length === 0 && (
                <div className="text-center py-4 text-slate-500">
                  <Target className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All actions scheduled!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Days Columns */}
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const formattedDate = day.toISOString().split('T')[0];

            return (
              <DroppableCalendarCell
                key={index}
                date={formattedDate}
                onDrop={handleDrop}
                className={`p-3 border-r border-slate-100 last:border-r-0 ${
                  isToday ? 'bg-purple-50' : 'hover:bg-slate-50'
                } transition-colors`}
              >
                <div className="space-y-2">
                  {/* Morning Section */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">Morning</div>
                    {dayEvents
                      .filter(e => {
                        const hour = parseInt(e.time.split(':')[0]);
                        return hour >= 6 && hour < 12;
                      })
                      .slice(0, 2)
                      .map((event) => (
                        <DraggableEvent
                          key={event.id}
                          event={event}
                          onMove={(eventId, newDate) => handleDrop({ id: eventId, type: 'calendar-event' }, newDate)}
                          onTimeChange={handleEventTimeChange}
                          onRemove={handleEventRemove}
                          onToggleComplete={handleToggleComplete}
                          compact
                        />
                      ))
                    }
                    {dayEvents.filter(e => {
                      const hour = parseInt(e.time.split(':')[0]);
                      return hour >= 6 && hour < 12;
                    }).length === 0 && (
                      <div className="border border-dashed border-slate-200 rounded p-2 text-center text-xs text-slate-400">
                        Drop morning actions
                      </div>
                    )}
                  </div>
                  
                  {/* Afternoon Section */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">Afternoon</div>
                    {dayEvents
                      .filter(e => {
                        const hour = parseInt(e.time.split(':')[0]);
                        return hour >= 12 && hour < 17;
                      })
                      .slice(0, 2)
                      .map((event) => (
                        <DraggableEvent
                          key={event.id}
                          event={event}
                          onMove={(eventId, newDate) => handleDrop({ id: eventId, type: 'calendar-event' }, newDate)}
                          onTimeChange={handleEventTimeChange}
                          onRemove={handleEventRemove}
                          onToggleComplete={handleToggleComplete}
                          compact
                        />
                      ))
                    }
                    {dayEvents.filter(e => {
                      const hour = parseInt(e.time.split(':')[0]);
                      return hour >= 12 && hour < 17;
                    }).length === 0 && (
                      <div className="border border-dashed border-slate-200 rounded p-2 text-center text-xs text-slate-400">
                        Drop afternoon actions
                      </div>
                    )}
                  </div>
                  
                  {/* Evening Section */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">Evening</div>
                    {dayEvents
                      .filter(e => {
                        const hour = parseInt(e.time.split(':')[0]);
                        return hour >= 17 && hour < 22;
                      })
                      .slice(0, 2)
                      .map((event) => (
                        <DraggableEvent
                          key={event.id}
                          event={event}
                          onMove={(eventId, newDate) => handleDrop({ id: eventId, type: 'calendar-event' }, newDate)}
                          onTimeChange={handleEventTimeChange}
                          onRemove={handleEventRemove}
                          onToggleComplete={handleToggleComplete}
                          compact
                        />
                      ))
                    }
                    {dayEvents.filter(e => {
                      const hour = parseInt(e.time.split(':')[0]);
                      return hour >= 17 && hour < 22;
                    }).length === 0 && (
                      <div className="border border-dashed border-slate-200 rounded p-2 text-center text-xs text-slate-400">
                        Drop evening actions
                      </div>
                    )}
                  </div>
                  
                  {/* Milestones */}
                  {dayEvents.filter(e => e.isMilestone).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="text-xs font-medium text-amber-600 mb-1">Milestones</div>
                      {dayEvents
                        .filter(e => e.isMilestone)
                        .map((event) => (
                          <DraggableEvent
                            key={event.id}
                            event={event}
                            onMove={(eventId, newDate) => handleDrop({ id: eventId, type: 'calendar-event' }, newDate)}
                            onTimeChange={handleEventTimeChange}
                            onRemove={handleEventRemove}
                            onToggleComplete={handleToggleComplete}
                            compact
                          />
                        ))
                      }
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

  const render90DayView = () => {
    const weeks = getWeeksIn90Days(currentDate);
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-900">90-Day Plan</h3>
          <p className="text-sm text-slate-600">Milestones and key actions for the next 90 days</p>
        </div>
        
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-4">
          {/* Milestone Timeline */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 text-amber-500 mr-2" />
              Milestones
            </h4>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-200"></div>
              
              <div className="space-y-6">
                {getMilestones()
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((milestone) => {
                    const milestoneDate = new Date(milestone.date);
                    const isPast = milestoneDate < new Date();
                    const isNear = Math.abs(milestoneDate.getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000; // Within a week
                    
                    return (
                      <div key={milestone.id} className="flex items-start ml-4 pl-6 relative">
                        {/* Timeline dot */}
                        <div className={`absolute left-0 w-4 h-4 rounded-full border-2 ${
                          isPast ? 'bg-amber-500 border-amber-600' : 
                          isNear ? 'bg-amber-300 border-amber-400 animate-pulse' : 
                          'bg-amber-100 border-amber-300'
                        }`}></div>
                        
                        <div className={`bg-white rounded-lg p-3 shadow-sm border ${
                          isPast ? 'border-amber-300' : 
                          isNear ? 'border-amber-400' : 
                          'border-slate-200'
                        } w-full`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Trophy className={`w-4 h-4 ${
                                isPast ? 'text-amber-500' : 
                                isNear ? 'text-amber-400' : 
                                'text-amber-300'
                              }`} />
                              <span className="font-medium text-slate-900">{milestone.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-slate-500">
                                {new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <div 
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  milestone.completed 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-amber-400 hover:border-amber-500'
                                }`}
                                onClick={() => handleToggleComplete(milestone.id)}
                              >
                                {milestone.completed && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                          {milestone.description && (
                            <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                          )}
                          
                          {/* Show connected goal */}
                          <div className="mt-2 flex items-center">
                            <div className={`w-2 h-2 rounded-full bg-${milestone.category === 'business' ? 'purple' : milestone.category === 'body' ? 'green' : 'blue'}-500 mr-2`}></div>
                            <span className="text-xs text-slate-500">
                              {milestone.category === 'business' ? 'Business Goal' : 
                               milestone.category === 'body' ? 'Health Goal' : 
                               'Balance Goal'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          
          {/* Weekly Overview */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 text-blue-500 mr-2" />
              Weekly Plan
            </h4>
            
            <div className="space-y-4">
              {weeks.slice(0, 13).map((week, index) => {
                const weekEvents = allEvents.filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate >= week.start && eventDate <= week.end;
                });
                
                const weekMilestones = weekEvents.filter(event => event.isMilestone);
                const weekActions = weekEvents.filter(event => !event.isMilestone);
                
                return (
                  <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-slate-900">
                        Week {index + 1}: {week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {week.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </h5>
                      <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">
                        {weekEvents.length} events
                      </span>
                    </div>
                    
                    {weekMilestones.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-amber-700 mb-2">Milestones:</div>
                        <div className="flex flex-wrap gap-2">
                          {weekMilestones.map(milestone => (
                            <div key={milestone.id} className="bg-amber-50 text-amber-800 text-xs px-2 py-1 rounded-full border border-amber-200 flex items-center space-x-1">
                              <Trophy className="w-3 h-3 text-amber-500" />
                              <span>{milestone.title}</span>
                              <div 
                                className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                                  milestone.completed 
                                    ? 'bg-green-500 border-green-500' 
                                    : 'border-amber-400'
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {weekActions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {categories.map(category => {
                          const categoryEvents = weekActions.filter(event => event.category === category.id);
                          if (categoryEvents.length === 0) return null;
                          
                          return (
                            <div key={category.id} className={`${category.bgColor} rounded-lg p-2 border border-${category.id === 'business' ? 'purple' : category.id === 'body' ? 'green' : category.id === 'balance' ? 'blue' : 'orange'}-200`}>
                              <div className={`text-xs font-medium ${category.textColor} mb-1`}>{category.name}:</div>
                              <div className="space-y-1">
                                {categoryEvents.slice(0, 3).map(event => (
                                  <div key={event.id} className="text-xs text-slate-700 bg-white/80 px-2 py-1 rounded flex items-center justify-between">
                                    <span className="truncate">{event.title}</span>
                                    <div 
                                      className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                                        event.completed 
                                          ? 'bg-green-500 border-green-500' 
                                          : 'border-slate-300'
                                      }`}
                                    />
                                  </div>
                                ))}
                                {categoryEvents.length > 3 && (
                                  <div className="text-xs text-slate-500 text-center">+{categoryEvents.length - 3} more</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-slate-500 text-sm">
                        No events scheduled
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderYearlyView = () => {
    const months = getMonthsInYear(currentDate);
    const visionBackgroundUrl = visionItems.length > 0 ? visionItems[0].imageUrl : '';

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-900">Yearly Vision {currentDate.getFullYear()}</h3>
          <p className="text-sm text-slate-600">Big picture view of your year</p>
        </div>
        
        <div className="relative">
          {/* Vision board background with overlay */}
          {visionBackgroundUrl && (
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: `url(${visionBackgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
          )}
          
          <div className="relative z-10 p-6">
            {/* Annual vision statement */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200 mb-6 max-w-3xl mx-auto">
              <h4 className="text-lg font-semibold text-purple-900 mb-2">Annual Vision</h4>
              <p className="text-purple-800">
                {goalData.annualSnapshot?.snapshot || "I feel energized and healthy. My career is thriving with new opportunities and growth. My relationships are deep and fulfilling, and I'm living with purpose and joy every day."}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {valuesData.rankedCoreValues.slice(0, 3).map(value => (
                  <span key={value.id} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {value.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {months.map((month) => {
                const monthEvents = allEvents.filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate.getMonth() === month.getMonth() && 
                         eventDate.getFullYear() === month.getFullYear();
                });

                const milestones = monthEvents.filter(event => event.isMilestone);
                const completedEvents = monthEvents.filter(event => event.completed);
                const completionRate = monthEvents.length > 0 
                  ? Math.round((completedEvents.length / monthEvents.length) * 100) 
                  : 0;

                return (
                  <div key={month.getMonth()} className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white/90">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center justify-between">
                      <span>{month.toLocaleDateString('en-US', { month: 'long' })}</span>
                      {completionRate > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          {completionRate}%
                        </span>
                      )}
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-slate-600 flex items-center justify-between">
                        <span>{monthEvents.length} events</span>
                        <span className="text-xs">{completedEvents.length} completed</span>
                      </div>
                      
                      {milestones.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-yellow-600 flex items-center space-x-1">
                            <Trophy className="w-3 h-3" />
                            <span>{milestones.length} milestone{milestones.length !== 1 ? 's' : ''}</span>
                          </div>
                          {milestones.slice(0, 2).map((milestone) => (
                            <div key={milestone.id} className="text-xs text-slate-700 truncate bg-yellow-50 rounded px-2 py-1 flex items-center justify-between">
                              <span>🎯 {milestone.title}</span>
                              <div 
                                className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                                  milestone.completed 
                                    ? 'bg-green-500 border-green-500' 
                                    : 'border-amber-400'
                                }`}
                              />
                            </div>
                          ))}
                          {milestones.length > 2 && (
                            <div className="text-xs text-slate-500">+{milestones.length - 2} more</div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {categories.map(category => {
                          const count = monthEvents.filter(e => e.category === category.id && !e.isMilestone).length;
                          if (count === 0) return null;
                          
                          return (
                            <div key={category.id} className={`text-xs ${category.textColor} ${category.bgColor} px-1.5 py-0.5 rounded-full`}>
                              {count} {category.name}
                            </div>
                          );
                        })}
                      </div>
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

  const renderCurrentView = () => {
    switch (view) {
      case 'daily':
        return renderDailyView();
      case 'weekly':
        return renderWeeklyView();
      case '90day':
        return render90DayView();
      case 'yearly':
        return renderYearlyView();
      default:
        return renderWeeklyView();
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
            {(['daily', 'weekly', '90day', 'yearly'] as ViewMode[]).map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === viewType 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {viewType === 'daily' ? 'Day' : 
                 viewType === 'weekly' ? 'Week' : 
                 viewType === '90day' ? '90 Days' : 'Year'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
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
              <Trophy className="w-3 h-3 text-yellow-500" />
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
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-slate-900 text-sm">{milestone.title}</span>
                      </div>
                      <div 
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          milestone.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-amber-400 hover:border-amber-500'
                        }`}
                        onClick={() => handleToggleComplete(milestone.id)}
                      >
                        {milestone.completed && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">
                      Due: {new Date(milestone.date).toLocaleDateString()}
                    </div>
                    <div className="mt-1 flex items-center">
                      <div className={`w-2 h-2 rounded-full bg-${milestone.category === 'business' ? 'purple' : milestone.category === 'body' ? 'green' : 'blue'}-500 mr-2`}></div>
                      <span className="text-xs text-slate-500">
                        {milestone.category === 'business' ? 'Business Goal' : 
                         milestone.category === 'body' ? 'Health Goal' : 
                         'Balance Goal'}
                      </span>
                    </div>
                  </div>
                ))}
              
              {getMilestones().filter(milestone => new Date(milestone.date) >= new Date()).length === 0 && (
                <div className="text-center py-4 text-yellow-700">
                  <Flag className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming milestones</p>
                </div>
              )}
            </div>
          </div>

          {/* Goal Progress Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">Progress Summary</h3>
            </div>
            
            <div className="space-y-4">
              {categories.slice(0, 3).map(category => {
                const categoryGoal = goalData.categoryGoals[category.id];
                if (!categoryGoal || !categoryGoal.milestones) return null;
                
                const totalMilestones = categoryGoal.milestones.length;
                const completedMilestones = categoryGoal.milestones.filter(m => m.completed).length;
                const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
                
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${category.textColor}`}>{category.name}</span>
                      <span className="text-xs text-slate-500">
                        {completedMilestones}/{totalMilestones} milestones
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-2 ${category.color}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Pro Tip:</span> Drag actions from your goals directly onto your calendar to schedule them.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="lg:col-span-3">
          {renderCurrentView()}
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Calendar Guide</h3>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <CalendarIcon className="w-4 h-4 text-purple-600 mr-2" />
                  Calendar Views
                </h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 mt-0.5">D</div>
                    <div>
                      <span className="font-medium">Daily View</span> - Time-block your entire day with no white space. Hour-by-hour planning from 6am to 10pm.
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mt-0.5">W</div>
                    <div>
                      <span className="font-medium">Weekly View</span> - See your week at a glance. Drag and drop tasks to reschedule.
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-700 mt-0.5">Q</div>
                    <div>
                      <span className="font-medium">90-Day View</span> - Track progress toward quarterly goals and milestones.
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mt-0.5">Y</div>
                    <div>
                      <span className="font-medium">Yearly View</span> - Big picture view of your entire year with key milestones.
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <Target className="w-4 h-4 text-green-600 mr-2" />
                  Goal Integration
                </h4>
                <p className="text-sm text-slate-700 mb-2">
                  Your calendar automatically integrates with your goals:
                </p>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>Annual goals cascade to 90-day goals</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>90-day goals break down into weekly actions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>Weekly actions appear in your calendar</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <Move className="w-4 h-4 text-blue-600 mr-2" />
                  Tips & Tricks
                </h4>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Drag and drop actions from the sidebar to schedule them</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Drag events between days to reschedule</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Click on time to edit event timing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Milestones automatically appear from your goals</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Click "Show Vision" in daily view to see your big picture</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
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

  const getCategoryIcon = (category: string) => {
    const icons = {
      business: <Target className="w-4 h-4 text-purple-700" />,
      body: <Heart className="w-4 h-4 text-green-700" />,
      balance: <Sparkles className="w-4 h-4 text-blue-700" />
    };
    return icons[category as keyof typeof icons] || icons.business;
  };

  const getFrequencyText = (frequency: string, specificDays?: string[]) => {
    switch (frequency) {
      case 'daily': return 'Every day';
      case 'weekly': return 'Once a week';
      case 'multiple': return specificDays && specificDays.length > 0 
        ? `${specificDays.length}x per week` 
        : 'Multiple times/week';
      default: return 'Scheduled';
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
        {getCategoryIcon(action.category)}
        <div className="flex-1">
          <div className="font-medium text-sm">{action.text}</div>
          <div className="text-xs opacity-75 mt-1 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{getFrequencyText(action.frequency, action.specificDays)}</span>
          </div>
        </div>
        <Move className="w-3 h-3 text-slate-400" />
      </div>
    </div>
  );
};

export default Calendar;