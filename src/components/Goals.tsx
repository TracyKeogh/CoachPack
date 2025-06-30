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
  Circle,
  Heart,
  ArrowRight
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { useValuesData } from '../hooks/useValuesData';
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

const Goals: React.FC = () => {
  const { data: goalData } = useGoalSettingData();
  const { data: valuesData } = useValuesData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('monthly');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventDate, setNewEventDate] = useState<string>('');
  
  // Goal inputs state
  const [goals, setGoals] = useState({
    business: '',
    body: '',
    balance: ''
  });

  // Values alignment state
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [valueAlignments, setValueAlignments] = useState<Record<string, string[]>>({
    business: [],
    body: [],
    balance: []
  });
  
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

  // Get user's core values from Values Clarification
  const getUserValues = () => {
    if (!valuesData || !valuesData.rankedCoreValues || valuesData.rankedCoreValues.length === 0) {
      return [];
    }
    return valuesData.rankedCoreValues.slice(0, 6); // Top 6 values
  };

  const userValues = getUserValues();

  // Handle goal input changes
  const handleGoalChange = (category: 'business' | 'body' | 'balance', value: string) => {
    setGoals(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Handle value selection for alignment
  const toggleValueSelection = (valueId: string) => {
    setSelectedValues(prev => 
      prev.includes(valueId) 
        ? prev.filter(id => id !== valueId)
        : [...prev, valueId]
    );
  };

  // Handle value alignment to categories
  const toggleValueAlignment = (valueId: string, category: 'business' | 'body' | 'balance') => {
    setValueAlignments(prev => ({
      ...prev,
      [category]: prev[category].includes(valueId)
        ? prev[category].filter(id => id !== valueId)
        : [...prev[category], valueId]
    }));
  };

  // Get value by ID
  const getValueById = (valueId: string) => {
    return userValues.find(value => value.id === valueId);
  };

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
    { id: 'business', name: 'Business', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50', icon: '💼' },
    { id: 'body', name: 'Health', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50', icon: '💪' },
    { id: 'balance', name: 'Balance', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50', icon: '⚖️' },
    { id: 'personal', name: 'Personal', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50', icon: '🎯' }
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Annual Goal Setting</h1>
          <p className="text-slate-600 mt-2">
            Set your goals for the year and align them with your core values
          </p>
        </div>
      </div>

      {/* Goal Setting Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Business Goals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              💼
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Business & Career</h3>
              <p className="text-sm text-slate-600">Professional growth and success</p>
            </div>
          </div>
          
          <textarea
            value={goals.business}
            onChange={(e) => handleGoalChange('business', e.target.value)}
            placeholder="e.g., Get promoted to senior role and increase income by 30%"
            className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
          />

          {/* Aligned Values */}
          {valueAlignments.business.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Aligned Values:</h4>
              <div className="flex flex-wrap gap-2">
                {valueAlignments.business.map(valueId => {
                  const value = getValueById(valueId);
                  return value ? (
                    <span key={valueId} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {value.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Body Goals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              💪
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Health & Body</h3>
              <p className="text-sm text-slate-600">Physical wellness and fitness</p>
            </div>
          </div>
          
          <textarea
            value={goals.body}
            onChange={(e) => handleGoalChange('body', e.target.value)}
            placeholder="e.g., Lose 20 pounds and run a marathon"
            className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
          />

          {/* Aligned Values */}
          {valueAlignments.body.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Aligned Values:</h4>
              <div className="flex flex-wrap gap-2">
                {valueAlignments.body.map(valueId => {
                  const value = getValueById(valueId);
                  return value ? (
                    <span key={valueId} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {value.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Balance Goals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              ⚖️
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Life Balance</h3>
              <p className="text-sm text-slate-600">Relationships and harmony</p>
            </div>
          </div>
          
          <textarea
            value={goals.balance}
            onChange={(e) => handleGoalChange('balance', e.target.value)}
            placeholder="e.g., Strengthen family relationships and create better work-life balance"
            className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />

          {/* Aligned Values */}
          {valueAlignments.balance.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Aligned Values:</h4>
              <div className="flex flex-wrap gap-2">
                {valueAlignments.balance.map(valueId => {
                  const value = getValueById(valueId);
                  return value ? (
                    <span key={valueId} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {value.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Values Alignment Section */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 border border-red-200 animate-fadeIn">
        <div className="flex items-center space-x-3 mb-6">
          <Heart className="w-8 h-8 text-red-600" />
          <div>
            <h3 className="text-2xl font-bold text-red-900">Values Alignment</h3>
            <p className="text-red-700">Connect your core values to your goals for authentic motivation</p>
          </div>
        </div>

        {userValues.length > 0 ? (
          <>
            {/* Values Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-red-900 mb-4">Your Core Values</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {userValues.map((value, index) => (
                  <button
                    key={value.id}
                    onClick={() => toggleValueSelection(value.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedValues.includes(value.id)
                        ? 'border-red-500 bg-red-100 text-red-900 shadow-md transform scale-105'
                        : 'border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{value.name}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                        {selectedValues.includes(value.id) && (
                          <CheckCircle2 className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm opacity-75">{value.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Values Alignment Interface */}
            {selectedValues.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-red-200">
                <h4 className="text-lg font-semibold text-red-900 mb-4">
                  Align Selected Values to Your Goals
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'business', name: 'Business & Career', icon: '💼', color: 'purple' },
                    { id: 'body', name: 'Health & Body', icon: '💪', color: 'green' },
                    { id: 'balance', name: 'Life Balance', icon: '⚖️', color: 'blue' }
                  ].map(category => (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xl">{category.icon}</span>
                        <h5 className="font-medium text-slate-900">{category.name}</h5>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {valueAlignments[category.id as keyof typeof valueAlignments].length} aligned
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {selectedValues.map(valueId => {
                          const value = getValueById(valueId);
                          const isAligned = valueAlignments[category.id as keyof typeof valueAlignments].includes(valueId);
                          
                          return value ? (
                            <button
                              key={valueId}
                              onClick={() => toggleValueAlignment(valueId, category.id as any)}
                              className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
                                isAligned
                                  ? `border-${category.color}-500 bg-${category.color}-50 text-${category.color}-900`
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{value.name}</span>
                                {isAligned && <Check className="w-4 h-4" />}
                              </div>
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Heart className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-red-900 mb-2">No Values Found</h4>
            <p className="text-red-700 mb-4">
              Complete your Values Clarification first to align your goals with your core values.
            </p>
            <button
              onClick={() => window.location.href = '/values'}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <span>Complete Values Clarification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
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

export default Goals;