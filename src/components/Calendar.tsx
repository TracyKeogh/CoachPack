import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  X,
  Edit3,
  Trash2,
  Check,
  Filter,
  BarChart3,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Heart,
  Sparkles
} from 'lucide-react';
import { useCalendarData, Event, ActionPoolItem } from '../hooks/useCalendarData';
import YearlyBigCalendar from './YearlyBigCalendar';

type CalendarView = 'month' | 'week' | 'day' | 'year';

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
    refreshActionPool
  } = useCalendarData();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingAction, setEditingAction] = useState<ActionPoolItem | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
    category: 'business' as 'business' | 'body' | 'balance' | 'personal'
  });
  const [newAction, setNewAction] = useState({
    title: '',
    duration: 60,
    category: 'business' as 'business' | 'body' | 'balance' | 'personal',
    frequency: 'weekly' as 'daily' | 'weekly' | '3x-week'
  });
  const [draggedAction, setDraggedAction] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const calendarRef = useRef<HTMLDivElement>(null);

  // Refresh action pool on mount
  useEffect(() => {
    if (isLoaded) {
      refreshActionPool();
    }
  }, [isLoaded, refreshActionPool]);

  // Navigation functions
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPrevious = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else if (view === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    } else if (view === 'year') {
      setCurrentYear(currentYear - 1);
    }
  };

  const goToNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else if (view === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    } else if (view === 'year') {
      setCurrentYear(currentYear + 1);
    }
  };

  // Helper functions
  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  const getYearString = (date: Date) => {
    return date.getFullYear().toString();
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h` : ''}${mins > 0 ? ` ${mins}m` : ''}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'body': return 'bg-green-100 text-green-800 border-green-200';
      case 'balance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'personal': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return <Briefcase className="w-4 h-4" />;
      case 'body': return <Heart className="w-4 h-4" />;
      case 'balance': return <Sparkles className="w-4 h-4" />;
      case 'personal': return <CalendarIcon className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  // Event handlers
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (view === 'month') {
      setCurrentDate(date);
      setView('day');
    } else if (view === 'year') {
      setCurrentDate(date);
      setView('month');
    }
  };

  const handleAddEvent = () => {
    if (selectedDate) {
      const startTime = new Date(selectedDate);
      startTime.setHours(9, 0, 0, 0); // 9:00 AM
      
      const endTime = new Date(selectedDate);
      endTime.setHours(10, 0, 0, 0); // 10:00 AM
      
      setNewEvent({
        title: '',
        start: startTime,
        end: endTime,
        category: 'business'
      });
      
      setShowEventModal(true);
    }
  };

  const handleAddAction = () => {
    setNewAction({
      title: '',
      duration: 60,
      category: 'business',
      frequency: 'weekly'
    });
    
    setShowActionModal(true);
  };

  const handleSaveEvent = () => {
    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        category: newEvent.category
      });
    } else {
      addEvent({
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        category: newEvent.category
      });
    }
    
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleSaveAction = () => {
    if (editingAction) {
      updateActionInPool(editingAction.id, {
        title: newAction.title,
        duration: newAction.duration,
        category: newAction.category,
        frequency: newAction.frequency
      });
    } else {
      addActionToPool({
        title: newAction.title,
        duration: newAction.duration,
        category: newAction.category,
        frequency: newAction.frequency
      });
    }
    
    setShowActionModal(false);
    setEditingAction(null);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      category: event.category
    });
    setShowEventModal(true);
  };

  const handleEditAction = (action: ActionPoolItem) => {
    setEditingAction(action);
    setNewAction({
      title: action.title,
      duration: action.duration,
      category: action.category,
      frequency: action.frequency
    });
    setShowActionModal(true);
  };

  const handleDragStart = (actionId: string) => {
    setDraggedAction(actionId);
  };

  const handleDragOver = (date: Date, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDate(date);
  };

  const handleDrop = (date: Date, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedAction) {
      const startTime = new Date(date);
      startTime.setHours(9, 0, 0, 0); // Default to 9 AM
      
      scheduleActionFromPool(draggedAction, startTime);
      setDraggedAction(null);
      setDragOverDate(null);
    }
  };

  // Render functions
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Create array of dates for the month view
    const dates = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      dates.push(null);
    }
    
    // Add dates for the current month
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }
    
    // Calculate total number of cells needed (7 days per week)
    const totalCells = Math.ceil(dates.length / 7) * 7;
    
    // Add empty cells for days after the last day of the month
    while (dates.length < totalCells) {
      dates.push(null);
    }
    
    // Group dates into weeks
    const weeks = [];
    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7));
    }
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-2 font-semibold text-slate-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {weeks.map((week, weekIndex) => (
            week.map((date, dayIndex) => {
              const isToday = date && 
                date.getDate() === new Date().getDate() && 
                date.getMonth() === new Date().getMonth() && 
                date.getFullYear() === new Date().getFullYear();
              
              const isSelected = date && selectedDate && 
                date.getDate() === selectedDate.getDate() && 
                date.getMonth() === selectedDate.getMonth() && 
                date.getFullYear() === selectedDate.getFullYear();
              
              const isCurrentMonth = date && date.getMonth() === month;
              
              // Get events for this date
              const dateEvents = date ? data.events.filter(event => {
                const eventDate = new Date(event.start);
                return eventDate.getDate() === date.getDate() && 
                       eventDate.getMonth() === date.getMonth() && 
                       eventDate.getFullYear() === date.getFullYear();
              }) : [];
              
              return (
                <div 
                  key={`${weekIndex}-${dayIndex}`}
                  className={`min-h-24 p-1 border-b border-r border-slate-200 ${
                    isToday ? 'bg-blue-50' : 
                    !isCurrentMonth ? 'bg-slate-50' : 
                    ''
                  } ${
                    isSelected ? 'ring-2 ring-purple-500' : ''
                  } ${
                    dragOverDate && date && dragOverDate.getDate() === date.getDate() && 
                    dragOverDate.getMonth() === date.getMonth() && 
                    dragOverDate.getFullYear() === date.getFullYear() 
                      ? 'bg-purple-100' : ''
                  }`}
                  onClick={() => date && handleDateClick(date)}
                  onDragOver={(e) => date && handleDragOver(date, e)}
                  onDrop={(e) => date && handleDrop(date, e)}
                >
                  {date && (
                    <>
                      <div className={`text-right text-sm ${
                        isToday ? 'font-bold text-blue-700' : 'text-slate-600'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="mt-1 space-y-1">
                        {dateEvents.slice(0, 3).map(event => (
                          <div 
                            key={event.id}
                            className={`px-1 py-0.5 text-xs rounded truncate ${getCategoryColor(event.category)}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                          >
                            {formatTime(event.start)} {event.title}
                          </div>
                        ))}
                        
                        {dateEvents.length > 3 && (
                          <div className="text-xs text-slate-500 pl-1">
                            +{dateEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    // Create array of dates for the week
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    
    // Create array of hours for the day
    const hours = [];
    for (let i = 7; i < 22; i++) { // 7 AM to 9 PM
      hours.push(i);
    }
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Day headers */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200">
          <div className="p-2"></div>
          {dates.map((date, index) => {
            const isToday = 
              date.getDate() === new Date().getDate() && 
              date.getMonth() === new Date().getMonth() && 
              date.getFullYear() === new Date().getFullYear();
            
            return (
              <div 
                key={index} 
                className={`text-center py-2 ${isToday ? 'font-bold text-blue-700' : 'text-slate-600'}`}
              >
                <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}</div>
                <div className={`text-lg ${isToday ? 'bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Time grid */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)]">
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="border-r border-b border-slate-200 p-1 text-right text-xs text-slate-500">
                {hour % 12 === 0 ? '12' : hour % 12}:00 {hour >= 12 ? 'PM' : 'AM'}
              </div>
              
              {dates.map((date, dateIndex) => {
                const cellDate = new Date(date);
                cellDate.setHours(hour, 0, 0, 0);
                
                // Get events for this hour
                const hourEvents = data.events.filter(event => {
                  const eventStart = new Date(event.start);
                  return eventStart.getDate() === date.getDate() && 
                         eventStart.getMonth() === date.getMonth() && 
                         eventStart.getFullYear() === date.getFullYear() &&
                         eventStart.getHours() === hour;
                });
                
                const isNow = 
                  new Date().getDate() === date.getDate() && 
                  new Date().getMonth() === date.getMonth() && 
                  new Date().getFullYear() === date.getFullYear() &&
                  new Date().getHours() === hour;
                
                return (
                  <div 
                    key={dateIndex}
                    className={`border-r border-b border-slate-200 p-1 min-h-16 relative ${
                      isNow ? 'bg-blue-50' : ''
                    } ${
                      dragOverDate && 
                      dragOverDate.getDate() === date.getDate() && 
                      dragOverDate.getMonth() === date.getMonth() && 
                      dragOverDate.getFullYear() === date.getFullYear() &&
                      dragOverDate.getHours() === hour
                        ? 'bg-purple-100' : ''
                    }`}
                    onClick={() => {
                      setSelectedDate(cellDate);
                      setNewEvent({
                        ...newEvent,
                        start: cellDate,
                        end: new Date(cellDate.getTime() + 60 * 60 * 1000)
                      });
                      setShowEventModal(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverDate(cellDate);
                    }}
                    onDrop={(e) => handleDrop(cellDate, e)}
                  >
                    {hourEvents.map(event => (
                      <div 
                        key={event.id}
                        className={`px-2 py-1 text-xs rounded mb-1 ${getCategoryColor(event.category)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    // Create array of hours for the day
    const hours = [];
    for (let i = 7; i < 22; i++) { // 7 AM to 9 PM
      hours.push(i);
    }
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Day header */}
        <div className="border-b border-slate-200 p-4 text-center">
          <div className="text-lg font-semibold text-slate-900">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        
        {/* Time grid */}
        <div className="grid grid-cols-[80px_1fr]">
          {hours.map(hour => {
            const cellDate = new Date(currentDate);
            cellDate.setHours(hour, 0, 0, 0);
            
            // Get events for this hour
            const hourEvents = data.events.filter(event => {
              const eventStart = new Date(event.start);
              return eventStart.getDate() === currentDate.getDate() && 
                     eventStart.getMonth() === currentDate.getMonth() && 
                     eventStart.getFullYear() === currentDate.getFullYear() &&
                     eventStart.getHours() === hour;
            });
            
            const isNow = 
              new Date().getDate() === currentDate.getDate() && 
              new Date().getMonth() === currentDate.getMonth() && 
              new Date().getFullYear() === currentDate.getFullYear() &&
              new Date().getHours() === hour;
            
            return (
              <React.Fragment key={hour}>
                <div className="border-r border-b border-slate-200 p-2 text-right text-sm text-slate-500">
                  {hour % 12 === 0 ? '12' : hour % 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                </div>
                
                <div 
                  className={`border-b border-slate-200 p-2 min-h-20 ${
                    isNow ? 'bg-blue-50' : ''
                  } ${
                    dragOverDate && 
                    dragOverDate.getDate() === currentDate.getDate() && 
                    dragOverDate.getMonth() === currentDate.getMonth() && 
                    dragOverDate.getFullYear() === currentDate.getFullYear() &&
                    dragOverDate.getHours() === hour
                      ? 'bg-purple-100' : ''
                  }`}
                  onClick={() => {
                    setSelectedDate(cellDate);
                    setNewEvent({
                      ...newEvent,
                      start: cellDate,
                      end: new Date(cellDate.getTime() + 60 * 60 * 1000)
                    });
                    setShowEventModal(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverDate(cellDate);
                  }}
                  onDrop={(e) => handleDrop(cellDate, e)}
                >
                  {hourEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`px-3 py-2 rounded mb-2 ${getCategoryColor(event.category)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs">
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </div>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    return (
      <YearlyBigCalendar
        currentYear={currentYear}
        onDateClick={handleDateClick}
        onPrevYear={() => setCurrentYear(currentYear - 1)}
        onNextYear={() => setCurrentYear(currentYear + 1)}
        onBackToWeek={() => setView('week')}
      />
    );
  };

  const renderView = () => {
    switch (view) {
      case 'month':
        return renderMonthView();
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
      case 'year':
        return renderYearView();
      default:
        return renderMonthView();
    }
  };

  const renderActionPool = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Action Pool</h3>
          <button
            onClick={handleAddAction}
            className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.actionPool.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="mb-2">No actions in your pool</p>
              <button
                onClick={handleAddAction}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Add your first action
              </button>
            </div>
          ) : (
            data.actionPool.map(action => (
              <div 
                key={action.id}
                className={`p-3 rounded-lg border ${getCategoryColor(action.category)} flex items-center justify-between`}
                draggable
                onDragStart={() => handleDragStart(action.id)}
              >
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(action.category)}
                  <div>
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs flex items-center space-x-2">
                      <span>{formatDuration(action.duration)}</span>
                      <span>•</span>
                      <span>{action.frequency === 'daily' ? 'Daily' : action.frequency === 'weekly' ? 'Weekly' : '3x Week'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditAction(action)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeActionFromPool(action.id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-2 text-slate-600 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Business</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Body</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Balance</span>
          </div>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    // Calculate stats
    const totalEvents = data.events.length;
    const businessEvents = data.events.filter(e => e.category === 'business').length;
    const bodyEvents = data.events.filter(e => e.category === 'body').length;
    const balanceEvents = data.events.filter(e => e.category === 'balance').length;
    const personalEvents = data.events.filter(e => e.category === 'personal').length;
    
    // Calculate total hours per category
    const getTotalHours = (category: string) => {
      return data.events
        .filter(e => e.category === category)
        .reduce((total, event) => {
          const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
          return total + duration;
        }, 0);
    };
    
    const businessHours = getTotalHours('business');
    const bodyHours = getTotalHours('body');
    const balanceHours = getTotalHours('balance');
    const personalHours = getTotalHours('personal');
    const totalHours = businessHours + bodyHours + balanceHours + personalHours;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Time Allocation Stats</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">Business & Career</span>
              <span className="text-sm text-slate-600">{businessHours.toFixed(1)} hours</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${totalHours > 0 ? (businessHours / totalHours) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">Health & Body</span>
              <span className="text-sm text-slate-600">{bodyHours.toFixed(1)} hours</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${totalHours > 0 ? (bodyHours / totalHours) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">Life Balance</span>
              <span className="text-sm text-slate-600">{balanceHours.toFixed(1)} hours</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${totalHours > 0 ? (balanceHours / totalHours) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">Personal</span>
              <span className="text-sm text-slate-600">{personalHours.toFixed(1)} hours</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${totalHours > 0 ? (personalHours / totalHours) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-sm text-slate-500">Total Events</div>
            <div className="text-xl font-bold text-slate-900">{totalEvents}</div>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-sm text-slate-500">Total Hours</div>
            <div className="text-xl font-bold text-slate-900">{totalHours.toFixed(1)}</div>
          </div>
        </div>
      </div>
    );
  };

  // Early return if not loaded yet
  if (!isLoaded) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Your Calendar...</h2>
            <p className="text-slate-600">Retrieving your scheduled events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={calendarRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Action Calendar</h1>
          <p className="text-slate-600 mt-2">
            Schedule time for what matters most to you
          </p>
          {lastSaved && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </button>
          <button
            onClick={handleAddAction}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Action</span>
          </button>
          <button
            onClick={handleAddEvent}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPrevious}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-xl font-semibold text-slate-900">
            {view === 'month' && `${getMonthName(currentDate)} ${getYearString(currentDate)}`}
            {view === 'week' && `Week of ${currentDate.toLocaleDateString()}`}
            {view === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {view === 'year' && `${currentYear}`}
          </div>
          
          <button
            onClick={goToNext}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'day' 
                ? 'bg-purple-600 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'week' 
                ? 'bg-purple-600 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'month' 
                ? 'bg-purple-600 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('year')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'year' 
                ? 'bg-purple-600 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {renderView()}
        </div>
        
        <div className="space-y-6">
          {showStats ? renderStats() : renderActionPool()}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingEvent ? 'Edit Event' : 'Add Event'}
              </h3>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    value={newEvent.start.toISOString().slice(0, 16)}
                    onChange={(e) => setNewEvent({ 
                      ...newEvent, 
                      start: new Date(e.target.value) 
                    })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.end.toISOString().slice(0, 16)}
                    onChange={(e) => setNewEvent({ 
                      ...newEvent, 
                      end: new Date(e.target.value) 
                    })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ 
                    ...newEvent, 
                    category: e.target.value as 'business' | 'body' | 'balance' | 'personal'
                  })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="business">Business & Career</option>
                  <option value="body">Health & Body</option>
                  <option value="balance">Life Balance</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                {editingEvent && (
                  <button
                    onClick={() => {
                      if (editingEvent) {
                        removeEvent(editingEvent.id);
                        setShowEventModal(false);
                        setEditingEvent(null);
                      }
                    }}
                    className="flex items-center space-x-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
                
                <div className="flex items-center space-x-3 ml-auto">
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                    }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleSaveEvent}
                    disabled={!newEvent.title}
                    className="flex items-center space-x-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingEvent ? 'Update' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingAction ? 'Edit Action' : 'Add Action'}
              </h3>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setEditingAction(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Action Title
                </label>
                <input
                  type="text"
                  value={newAction.title}
                  onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter action title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newAction.duration}
                  onChange={(e) => setNewAction({ ...newAction, duration: parseInt(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="15"
                  step="15"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={newAction.category}
                  onChange={(e) => setNewAction({ 
                    ...newAction, 
                    category: e.target.value as 'business' | 'body' | 'balance' | 'personal'
                  })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="business">Business & Career</option>
                  <option value="body">Health & Body</option>
                  <option value="balance">Life Balance</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Frequency
                </label>
                <select
                  value={newAction.frequency}
                  onChange={(e) => setNewAction({ 
                    ...newAction, 
                    frequency: e.target.value as 'daily' | 'weekly' | '3x-week'
                  })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="3x-week">3x per Week</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                {editingAction && (
                  <button
                    onClick={() => {
                      if (editingAction) {
                        removeActionFromPool(editingAction.id);
                        setShowActionModal(false);
                        setEditingAction(null);
                      }
                    }}
                    className="flex items-center space-x-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
                
                <div className="flex items-center space-x-3 ml-auto">
                  <button
                    onClick={() => {
                      setShowActionModal(false);
                      setEditingAction(null);
                    }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleSaveAction}
                    disabled={!newAction.title}
                    className="flex items-center space-x-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingAction ? 'Update' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;