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
import { useWheelData } from '../hooks/useWheelData';
import { useValuesData } from '../hooks/useValuesData';
import { 
  GOAL_CATEGORIES, getTwelveWeeksFromNow, getMilestoneDueDates, 
  DAYS_OF_WEEK, ActionItem, Milestone 
} from '../types/goals';

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

interface DraggableSegmentProps {
  segment: {
    area: string;
    score: number;
    color: string;
    change: number;
  };
  onRemove: () => void;
}

const DraggableSegment: React.FC<DraggableSegmentProps> = ({ segment, onRemove }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'wheel-segment',
    item: { segment },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getChangeDisplay = (change: number) => {
    if (change === 0) return '→';
    return change > 0 ? `+${change}` : `${change}`;
  };

  const getChangeColor = (change: number) => {
    if (change === 0) return 'text-slate-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div
      ref={drag}
      className={`relative group cursor-move p-3 rounded-lg border-2 border-dashed transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
      }`}
      style={{ borderColor: segment.color, backgroundColor: `${segment.color}15` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: segment.color }}
          />
          <span className="font-medium text-slate-900 text-sm">{segment.area}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`font-bold text-lg ${getChangeColor(segment.change)}`}>
            {getChangeDisplay(segment.change)}
          </span>
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface DroppableGoalBoxProps {
  category: 'business' | 'body' | 'balance';
  segments: Array<{
    area: string;
    score: number;
    color: string;
    change: number;
  }>;
  onDrop: (segment: any) => void;
  onRemoveSegment: (area: string) => void;
  goal: string;
  onGoalChange: (goal: string) => void;
  alignedValues: string[];
}

const DroppableGoalBox: React.FC<DroppableGoalBoxProps> = ({ 
  category, 
  segments, 
  onDrop, 
  onRemoveSegment, 
  goal, 
  onGoalChange,
  alignedValues 
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'wheel-segment',
    drop: (item: { segment: any }) => onDrop(item.segment),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const categoryInfo = GOAL_CATEGORIES[category];
  const categoryEmojis = {
    business: '💼',
    body: '💪',
    balance: '⚖️'
  };

  const placeholders = {
    business: 'e.g., Increase revenue by 30% this quarter',
    body: 'e.g., Run a 10K race by the end of the quarter',
    balance: 'e.g., Spend quality time with family every weekend'
  };

  return (
    <div
      ref={drop}
      className={`rounded-2xl border-2 border-dashed p-6 min-h-96 transition-all duration-200 ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
      }`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">{categoryEmojis[category]}</span>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{categoryInfo.name}</h3>
          <p className="text-sm text-slate-600">{categoryInfo.description}</p>
        </div>
      </div>

      {/* Goal Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          12-Week Goal
        </label>
        <textarea
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          placeholder={placeholders[category]}
          className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={2}
        />
      </div>

      {/* Aligned Values */}
      {alignedValues.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Aligned Values</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {alignedValues.map((value, index) => (
              <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Connected Life Areas */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-700">Connected Life Areas</h4>
        {segments.map((segment, index) => (
          <DraggableSegment
            key={`${segment.area}-${index}`}
            segment={segment}
            onRemove={() => onRemoveSegment(segment.area)}
          />
        ))}
        
        {segments.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm">Drag life areas here to connect them to this goal</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Goals: React.FC = () => {
  const { data: goalData } = useGoalSettingData();
  const { data: wheelData } = useWheelData();
  const { data: valuesData } = useValuesData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('monthly');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventDate, setNewEventDate] = useState<string>('');
  
  // Goal states
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

  // Connected segments state
  const [connectedSegments, setConnectedSegments] = useState<Record<string, Array<{
    area: string;
    score: number;
    color: string;
    change: number;
  }>>>({
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
    if (!valuesData || !valuesData.isLoaded) {
      console.log('Values data not loaded yet');
      return [];
    }
    
    console.log('Values data:', valuesData.data);
    
    // Try to get ranked core values first, then fall back to core values
    if (valuesData.data.rankedCoreValues && valuesData.data.rankedCoreValues.length > 0) {
      console.log('Using ranked core values:', valuesData.data.rankedCoreValues);
      return valuesData.data.rankedCoreValues.slice(0, 6); // Top 6 values
    } else if (valuesData.data.coreValues && valuesData.data.coreValues.length > 0) {
      console.log('Using core values:', valuesData.data.coreValues);
      return valuesData.data.coreValues.slice(0, 6);
    } else if (valuesData.data.selectedValues && valuesData.data.selectedValues.length > 0) {
      console.log('Using selected values:', valuesData.data.selectedValues);
      return valuesData.data.selectedValues.slice(0, 6);
    }
    
    console.log('No values found');
    return [];
  };

  const userValues = getUserValues();
  console.log('Final user values:', userValues);

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

  // Handle segment drop
  const handleSegmentDrop = (category: string, segment: any) => {
    // Remove from other categories
    const newConnectedSegments = { ...connectedSegments };
    Object.keys(newConnectedSegments).forEach(cat => {
      newConnectedSegments[cat] = newConnectedSegments[cat].filter(s => s.area !== segment.area);
    });
    
    // Add to target category
    newConnectedSegments[category] = [...newConnectedSegments[category], segment];
    setConnectedSegments(newConnectedSegments);
  };

  // Handle segment removal
  const handleSegmentRemove = (category: string, area: string) => {
    setConnectedSegments(prev => ({
      ...prev,
      [category]: prev[category].filter(s => s.area !== area)
    }));
  };

  // Handle goal changes
  const handleGoalChange = (category: string, goal: string) => {
    setGoals(prev => ({
      ...prev,
      [category]: goal
    }));
  };

  // Handle value selection
  const handleValueSelect = (valueName: string) => {
    setSelectedValues(prev => 
      prev.includes(valueName) 
        ? prev.filter(v => v !== valueName)
        : [...prev, valueName]
    );
  };

  // Handle value alignment to category
  const handleValueAlignment = (valueName: string, category: string) => {
    setValueAlignments(prev => {
      const currentAlignments = prev[category] || [];
      const isAligned = currentAlignments.includes(valueName);
      
      return {
        ...prev,
        [category]: isAligned 
          ? currentAlignments.filter(v => v !== valueName)
          : [...currentAlignments, valueName]
      };
    });
  };

  // Get available wheel segments
  const getAvailableSegments = () => {
    if (!wheelData || !wheelData.data) return [];
    
    const usedAreas = Object.values(connectedSegments).flat().map(s => s.area);
    return wheelData.data
      .filter(area => !usedAreas.includes(area.area))
      .map(area => ({
        area: area.area,
        score: area.score,
        color: area.color,
        change: Math.floor(Math.random() * 5) - 2 // Random change for demo
      }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">12-Week Goals</h1>
          <p className="text-slate-600 mt-2">
            Set meaningful goals aligned with your values and life areas
          </p>
        </div>
      </div>

      {/* Values Alignment Section */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200 animate-fadeIn">
        <div className="flex items-center space-x-3 mb-6">
          <Heart className="w-6 h-6 text-red-600" />
          <div>
            <h2 className="text-xl font-semibold text-red-900">Values Alignment</h2>
            <p className="text-red-700 text-sm">Connect your core values to your goals for authentic motivation</p>
          </div>
        </div>

        {userValues.length > 0 ? (
          <div className="space-y-6">
            {/* Values Selector */}
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-3">Your Core Values</h3>
              <div className="flex flex-wrap gap-2">
                {userValues.map((value, index) => {
                  const valueName = typeof value === 'string' ? value : value.name;
                  const isSelected = selectedValues.includes(valueName);
                  const alignmentCount = Object.values(valueAlignments).reduce(
                    (count, alignments) => count + (alignments.includes(valueName) ? 1 : 0), 0
                  );
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleValueSelect(valueName)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-red-500 bg-red-100 text-red-800 shadow-md'
                          : 'border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{valueName}</span>
                        {alignmentCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {alignmentCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Alignment */}
            {selectedValues.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-3">Align Selected Values to Goals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['business', 'body', 'balance'] as const).map((category) => {
                    const categoryInfo = GOAL_CATEGORIES[category];
                    const categoryEmojis = {
                      business: '💼',
                      body: '💪',
                      balance: '⚖️'
                    };
                    
                    return (
                      <div key={category} className="bg-white rounded-lg p-4 border border-red-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-lg">{categoryEmojis[category]}</span>
                          <span className="font-medium text-slate-900">{categoryInfo.name}</span>
                        </div>
                        
                        <div className="space-y-2">
                          {selectedValues.map((valueName, index) => {
                            const isAligned = valueAlignments[category]?.includes(valueName);
                            
                            return (
                              <button
                                key={index}
                                onClick={() => handleValueAlignment(valueName, category)}
                                className={`w-full text-left px-3 py-2 rounded-lg border transition-all duration-200 ${
                                  isAligned
                                    ? 'border-green-500 bg-green-50 text-green-800'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{valueName}</span>
                                  {isAligned && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">No Values Found</h3>
            <p className="text-red-600 mb-4">Complete your Values Clarification to align your goals with your core values.</p>
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

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(['business', 'body', 'balance'] as const).map((category) => (
          <DroppableGoalBox
            key={category}
            category={category}
            segments={connectedSegments[category]}
            onDrop={(segment) => handleSegmentDrop(category, segment)}
            onRemoveSegment={(area) => handleSegmentRemove(category, area)}
            goal={goals[category]}
            onGoalChange={(goal) => handleGoalChange(category, goal)}
            alignedValues={valueAlignments[category] || []}
          />
        ))}
      </div>

      {/* Available Segments */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Life Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getAvailableSegments().map((segment, index) => (
            <DraggableSegment
              key={`available-${segment.area}-${index}`}
              segment={segment}
              onRemove={() => {}} // No remove for available segments
            />
          ))}
          
          {getAvailableSegments().length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">All life areas have been connected to goals!</p>
            </div>
          )}
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

export default Goals;