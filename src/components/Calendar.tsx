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
  Edit,
  Flag,
  Target,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { useCalendarData, Event, ActionPoolItem } from '../hooks/useCalendarData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { useNotes } from '../hooks/useNotes';
import NotesPanel from './NotesPanel';

const Calendar: React.FC = () => {
  // State variables
  const [viewMode, setViewMode] = useState<'week' | '90day' | 'year'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayView, setShowDayView] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event>>({});
  const [editingAction, setEditingAction] = useState<Partial<ActionPoolItem>>({});
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showActionPool, setShowActionPool] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Get data from hooks
  const { data, addEvent, updateEvent, removeEvent, addActionToPool, updateActionInPool, removeActionFromPool, scheduleActionFromPool } = useCalendarData();
  const { goals } = useGoalSettingData();
  const { notes, createNote, updateNote, deleteNote } = useNotes('calendar');

  // Helper functions
  const getMilestoneDates = () => {
    // Get all milestones from goals
    const milestones: { date: Date; title: string; category: string }[] = [];
    
    // Add some sample milestones for demonstration
    const today = new Date();
    
    milestones.push({
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
      title: 'Complete Project Proposal',
      category: 'business'
    });
    
    milestones.push({
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30),
      title: 'Fitness Milestone: 10k Run',
      category: 'body'
    });
    
    milestones.push({
      date: new Date(today.getFullYear(), today.getMonth() + 1, 15),
      title: 'Family Vacation',
      category: 'balance'
    });
    
    return milestones;
  };

  const getMonthGroups = (startDate: Date, numDays: number = 90) => {
    const result = [];
    const currentDate = new Date(startDate);
    
    while (currentDate < new Date(startDate.getTime() + numDays * 24 * 60 * 60 * 1000)) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const monthGroup = {
        monthName: monthStart.toLocaleDateString('en-US', { month: 'long' }),
        year: monthStart.getFullYear(),
        days: []
      };
      
      // Add empty days for the start of the month
      const firstDayOfWeek = monthStart.getDay();
      for (let i = 0; i < firstDayOfWeek; i++) {
        monthGroup.days.push({ date: null });
      }
      
      // Add all days of the month
      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        monthGroup.days.push({ date });
      }
      
      result.push(monthGroup);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return result;
  };

  const milestones = getMilestoneDates();

  // Generate 90-day view data
  const generate90DayView = () => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 90);
    
    const monthGroups = getMonthGroups(today);
    
    return { monthGroups, milestones };
  };

  // Get data for 90-day view
  const { monthGroups } = generate90DayView();

  // Get week dates for the weekly view
  const getWeekDates = (date: Date) => {
    const result = [];
    const day = date.getDay();
    const diff = date.getDate() - day;
    
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(date);
      weekDate.setDate(diff + i);
      result.push(weekDate);
    }
    
    return result;
  };

  // Get current week dates based on the selected date
  const weekDates = getWeekDates(currentDate);

  // Navigation functions
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Year view navigation
  const goToPreviousYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() - 1);
    setCurrentDate(newDate);
  };

  const goToNextYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + 1);
    setCurrentDate(newDate);
  };

  // Generate year view data
  const generateYearView = () => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const firstDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Add empty days for the start of the month
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({ date: null });
      }
      
      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        days.push({ date });
      }
      
      months.push({
        name: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' }),
        year,
        days
      });
    }
    
    return months;
  };
  
  const yearMonths = generateYearView();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Action Calendar</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Notes</span>
          </button>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')} 
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  viewMode === 'week' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('90day')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  viewMode === '90day' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                >
                  90-Day
                </button>
              <button
                onClick={() => setViewMode('year')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  viewMode === 'year' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                >
                  Year
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Panel */}
      {showNotes && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <NotesPanel feature="calendar" compact={true} />
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={goToPreviousWeek}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextWeek}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-slate-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
              >
                Today
              </button>
              <button
                onClick={() => setViewMode('90day')} 
                className="flex items-center space-x-1 px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
              >
                <Flag className="w-4 h-4" />
                <span>Milestones</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowActionPool(!showActionPool)}
                className="flex items-center space-x-1 px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Action</span>
              </button>
              <div className="relative ml-2">
                <button
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className="flex items-center space-x-1 px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                  {filterCategory && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
                
                {showCategoryFilter && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10 py-2">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Categories</div>
                    <button
                      onClick={() => setFilterCategory(null)} 
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 ${
                        filterCategory === null ? 'text-purple-600 font-medium' : 'text-slate-700'
                      }`}
                    >
                      All Categories
                    </button>
                    <button
                      onClick={() => setFilterCategory('business')} 
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 ${
                        filterCategory === 'business' ? 'text-purple-600 font-medium' : 'text-slate-700'
                      }`}
                    >
                      Business
                    </button>
                    <button
                      onClick={() => setFilterCategory('body')} 
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 ${
                        filterCategory === 'body' ? 'text-green-600 font-medium' : 'text-slate-700'
                      }`}
                    >
                      Body
                    </button>
                    <button
                      onClick={() => setFilterCategory('balance')} 
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 ${
                        filterCategory === 'balance' ? 'text-blue-600 font-medium' : 'text-slate-700'
                      }`}
                    >
                      Balance
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Weekly Calendar Grid */}
          <div className="grid grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const dayEvents = data.events.filter(event => event.start.toDateString() === date.toDateString());
              
              return (
                <div key={index} className="space-y-2">
                  <div className={`text-center p-2 rounded-lg ${isWeekend ? 'bg-blue-50' : ''}`}>
                    <div className="text-xs text-slate-500 uppercase">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div 
                      className={`text-lg font-semibold cursor-pointer hover:bg-slate-100 rounded-lg p-1 ${
                        isToday 
                        ? 'bg-purple-100 text-purple-700 font-bold'
                        : 'text-slate-700'
                      }`}
                      onClick={() => { 
                        setSelectedDate(date);
                        setShowDayView(true);
                      }}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                  <div className="space-y-1 min-h-32">
                    {/* Events for this day */}
                    {data.events
                      .filter(event => {
                        const eventDate = event.start.toDateString() === date.toDateString();
                        const categoryMatch = !filterCategory || event.category === filterCategory;
                        return eventDate && categoryMatch;
                      })
                      .sort((a, b) => a.start.getTime() - b.start.getTime())
                      .map(event => (
                        <div 
                          key={event.id}
                          onClick={() => { 
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className={`p-2 rounded-lg border text-xs ${
                            event.category === 'business' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            event.category === 'body' ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          } cursor-pointer`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium">{event.title}</div>
                            <button className="text-slate-400 hover:text-slate-600">
                              <MoreHorizontal className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-xs opacity-75 flex items-center space-x-1 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {event.start.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 90-Day View */}
      {viewMode === '90day' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode('week')}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Week</span>
              </button>
              <h2 className="text-lg font-semibold text-slate-900">
                90-Day Outlook
              </h2>
            </div>
          </div>
          
          {/* 90-Day Calendar Grid */}
          <div className="space-y-8">
            {monthGroups && monthGroups.map((month, monthIndex) => (
              <div key={monthIndex} className="space-y-2">
                <h3 className="font-semibold text-slate-900">
                  {month.monthName} {month.year}
                </h3>
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-slate-500 p-1 uppercase">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {month.days.map((day, dayIndex) => {
                    const isToday = day.date && day.date.toDateString() === new Date().toDateString();
                    const isWeekend = day.date && [0, 6].includes(day.date.getDay());
                    
                    // Check if there are events or milestones for this day
                    const hasEvents = day.date && data.events.some(event => 
                        event.start.getFullYear() === day.date.getFullYear() && 
                        event.start.getMonth() === day.date.getMonth() && 
                        event.start.getDate() === day.date.getDate()
                    );
                    const hasMilestones = day.date && milestones && milestones.some(milestone => 
                      milestone.date.getFullYear() === day.date.getFullYear() && 
                      milestone.date.getMonth() === day.date.getMonth() && 
                      milestone.date.getDate() === day.date.getDate()
                    );
                    
                    return (
                      <div 
                        key={dayIndex}
                        className={`p-1 min-h-8 text-center border border-slate-100 ${
                          !day.date ? 'bg-slate-50/50' : 
                          isToday ? 'bg-purple-100 font-bold' : 
                          isWeekend ? 'bg-slate-50' : 'bg-white'
                        } ${
                          day.date ? 'hover:bg-slate-100 cursor-pointer' : ''
                        }`}
                        onClick={() => { 
                          if (day.date) {
                            setCurrentDate(day.date);
                            setSelectedDate(day.date);
                            setViewMode('week');
                          }
                        }}
                      >
                        <div className={`text-xs ${isToday ? 'text-purple-700' : 'text-slate-700'} font-medium`}>
                          {day.date ? day.date.getDate() : ''}
                        </div>
                        
                        {/* Event and milestone indicators */}
                        {(hasEvents || hasMilestones) && (
                          <div className="flex items-center justify-center space-x-1 mt-1">
                            {hasEvents && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Has events" />
                            )}
                            {hasMilestones && (
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Milestones Section */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <Flag className="w-5 h-5 mr-2 text-orange-500" />
              Upcoming Milestones
            </h3>
            
            <div className="space-y-3">
              {milestones.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  <p>No milestones in the next 90 days</p>
                </div>
              ) : (
                milestones
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 flex-shrink-0">
                        <Flag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{milestone.title}</div>
                        <div className="text-sm text-slate-600">
                          {milestone.date.toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Pool Sidebar */}
      {showActionPool && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
              <button
                onClick={() => setShowActionPool(false)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {data.actionPool.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  <p>No actions in your pool</p>
                  <button
                    onClick={() => {
                      addActionToPool({
                        title: 'New Action',
                        duration: 60,
                        category: 'business',
                        frequency: 'weekly' 
                      });
                    }}
                    className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Add your first action
                  </button>
                </div>
              ) : (
                data.actionPool.map(action => (
                  <div 
                    key={action.id}
                    className={`p-3 rounded-lg border group ${
                      action.category === 'business' ? 'bg-purple-50 border-purple-200' :
                      action.category === 'body' ? 'bg-green-50 border-green-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-slate-900">{action.title}</div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            // Open edit modal for this action
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit action"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeActionFromPool(action.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete action"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mt-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{action.duration} min</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        action.category === 'business' ? 'bg-purple-100 text-purple-700' :
                        action.category === 'body' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {action.category}
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 mt-1">
                      {action.frequency}
                    </div>
                    
                    {selectedDate && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => {
                            // Schedule this action for the selected date
                            // Default to 9 AM
                            const newDate = new Date(selectedDate);
                            newDate.setHours(9, 0, 0, 0); // Default to 9 AM
                            scheduleActionFromPool(action.id, newDate);
                            setShowActionPool(false); 
                          }}
                          className="w-full py-1 text-sm text-center bg-white text-slate-700 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                        >
                          Schedule for {selectedDate.toLocaleDateString()}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Year View */}
      {viewMode === 'year' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={goToPreviousYear}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextYear}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-blue-700">
                THE BIG CALENDAR {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
              >
                Today
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode('week')}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Week</span>
              </button>
            </div>
          </div>
          
          {/* Year Calendar Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
            {yearMonths.map((month, monthIndex) => (
              <div key={monthIndex} className="space-y-2">
                <h3 className="font-semibold text-slate-900 text-center">
                  {month.name}
                </h3>
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-slate-500 p-1">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {month.days.map((day, dayIndex) => {
                    const isToday = day.date && day.date.toDateString() === new Date().toDateString();
                    const isWeekend = day.date && [0, 6].includes(day.date.getDay());
                    
                    // Check if there are events or milestones for this day
                    const hasEvents = day.date && data.events.some(event => 
                        event.start.getFullYear() === day.date.getFullYear() && 
                        event.start.getMonth() === day.date.getMonth() && 
                        event.start.getDate() === day.date.getDate()
                    );
                    
                    const hasMilestones = day.date && milestones && milestones.some(milestone => 
                      milestone.date.getFullYear() === day.date.getFullYear() && 
                      milestone.date.getMonth() === day.date.getMonth() && 
                      milestone.date.getDate() === day.date.getDate()
                    );
                    
                    return (
                      <div 
                        key={dayIndex}
                        className={`p-1 min-h-6 text-center border border-slate-100 ${
                          !day.date ? 'bg-slate-50/50' : 
                          isToday ? 'bg-purple-100 font-bold' : 
                          isWeekend ? 'bg-blue-50' : 'bg-white'
                        } ${
                          day.date ? 'hover:bg-slate-100 cursor-pointer' : ''
                        }`}
                        onClick={() => { 
                          if (day.date) {
                            setCurrentDate(day.date);
                            setSelectedDate(day.date);
                            setViewMode('week');
                          }
                        }}
                      >
                        <div className={`text-xs ${isToday ? 'text-purple-700' : 'text-slate-700'}`}>
                          {day.date ? day.date.getDate() : ''}
                        </div>
                        
                        {/* Event and milestone indicators */}
                        {(hasEvents || hasMilestones) && (
                          <div className="flex items-center justify-center space-x-1 mt-0.5">
                            {hasEvents && (
                              <div className="w-1 h-1 rounded-full bg-blue-500" title="Has events" />
                            )}
                            {hasMilestones && (
                              <div className="w-1 h-1 rounded-full bg-orange-500" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day View Modal */}
      {showDayView && selectedDate && ( 
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDayView(false)} 
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Events for this day */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900">Events</h4>
                  <button
                    onClick={() => {
                      // Create a new event at 9 AM on the selected date
                      const newDate = new Date(selectedDate);
                      newDate.setHours(9, 0, 0, 0);
                      const endDate = new Date(newDate); 
                      endDate.setHours(10, 0, 0, 0);
                      
                      addEvent({
                        id: Date.now().toString(),
                        start: newDate,
                        end: endDate,
                        category: 'business',
                        title: 'New Event' 
                      });
                    }}
                    className="flex items-center space-x-1 px-3 py-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Event</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {data.events 
                    .filter(event => 
                      event.start.toDateString() === selectedDate.toDateString() &&
                      (!filterCategory || event.category === filterCategory)
                    )
                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                    .map(event => (
                      <div 
                        key={event.id} 
                        className={`p-3 rounded-lg border ${
                          event.category === 'business' ? 'bg-purple-50 border-purple-200' :
                          event.category === 'body' ? 'bg-green-50 border-green-200' :
                          'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-slate-900">{event.title || 'Untitled Event'}</div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowEventModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit event"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeEvent(event.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete event"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm mt-1">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              {event.start.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })} - {event.end.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.category === 'business' ? 'bg-purple-100 text-purple-700' :
                            event.category === 'body' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {event.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {data.events.filter(event => event.start.toDateString() === selectedDate.toDateString()).length === 0 && (
                    <div className="text-center py-4 text-slate-500">
                      <p>No events scheduled for this day</p>
                      <p className="text-sm mt-1">Click "Add Event" to schedule something</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setShowActionPool(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add from Pool</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Edit Modal */}
      {showEventModal && selectedEvent && ( 
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Edit Event</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-slate-400 hover:text-slate-600" 
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingEvent.title || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingEvent.category || 'business'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as 'business' | 'body' | 'balance' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="business">Business</option>
                    <option value="body">Body</option>
                    <option value="balance">Balance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editingEvent.start ? editingEvent.start.toTimeString().slice(0, 5) : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newStart = new Date(editingEvent.start || new Date());
                      newStart.setHours(parseInt(hours), parseInt(minutes));
                      setEditingEvent({ ...editingEvent, start: newStart });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editingEvent.end ? editingEvent.end.toTimeString().slice(0, 5) : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newEnd = new Date(editingEvent.end || new Date());
                      newEnd.setHours(parseInt(hours), parseInt(minutes));
                      setEditingEvent({ ...editingEvent, end: newEnd });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { 
                    if (selectedEvent) {
                      updateEvent(selectedEvent.id, {
                        title: editingEvent.title,
                        category: editingEvent.category,
                        start: editingEvent.start,
                        end: editingEvent.end
                      });
                      setShowEventModal(false);
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Edit Modal */}
      {showActionModal && ( 
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Edit Action</h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-slate-400 hover:text-slate-600" 
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingAction.title || ''}
                    onChange={(e) => setEditingAction({ ...editingAction, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingAction.category || 'business'}
                    onChange={(e) => setEditingAction({ ...editingAction, category: e.target.value as 'business' | 'body' | 'balance' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="business">Business</option>
                    <option value="body">Body</option>
                    <option value="balance">Balance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={editingAction.duration || 60}
                    onChange={(e) => setEditingAction({ ...editingAction, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={editingAction.frequency || 'weekly'}
                    onChange={(e) => setEditingAction({ ...editingAction, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { 
                    if (editingAction.id) {
                      // Update existing action
                      updateActionInPool(editingAction.id, {
                        title: editingAction.title,
                        category: editingAction.category,
                        duration: editingAction.duration,
                        frequency: editingAction.frequency
                      });
                    } else {
                      // Create new action
                      addActionToPool({
                        title: editingAction.title || 'New Action',
                        category: editingAction.category || 'business',
                        duration: editingAction.duration || 60,
                        frequency: editingAction.frequency || 'weekly'
                      });
                    }
                    setShowActionModal(false);
                  }} 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ); 
};

export default Calendar;