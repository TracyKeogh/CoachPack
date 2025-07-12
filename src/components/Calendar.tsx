import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flag, MoreHorizontal, X, ArrowLeft } from 'lucide-react';
import { useCalendarData } from '../hooks/useCalendarData';
import { useGoalsData } from '../hooks/useGoalsData';

interface CalendarProps {}

interface Milestone {
  id: string;
  title: string;
  date: Date;
  category: string;
  completed?: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  category: string;
  type: 'milestone' | 'action';
}

const Calendar: React.FC<CalendarProps> = () => {
  const { data, loading, error } = useCalendarData();
  const { data: goalsData } = useGoalsData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showActionPool, setShowActionPool] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | '90day'>('week');

  // Extract milestones from goals data
  const getMilestoneDates = useCallback(() => {
    if (!goalsData?.categoryGoals) return [];
    
    const milestones: Milestone[] = [];
    
    try {
      Object.entries(goalsData.categoryGoals).forEach(([category, categoryData]: [string, any]) => {
        if (categoryData?.goals) {
          categoryData.goals.forEach((goal: any) => {
            if (goal?.milestones) {
              goal.milestones.forEach((milestone: any) => {
                if (milestone?.dueDate || milestone?.targetDate) {
                  const dateStr = milestone.dueDate || milestone.targetDate;
                  const date = new Date(dateStr);
                  
                  if (!isNaN(date.getTime())) {
                    milestones.push({
                      id: milestone.id || `${goal.id}-${milestone.title}`,
                      title: milestone.title || milestone.name || 'Untitled Milestone',
                      date: date,
                      category: category,
                      completed: milestone.completed || false
                    });
                  }
                }
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Error extracting milestones:', error);
    }

    // Add test milestones if none found
    if (milestones.length === 0) {
      const today = new Date();
      milestones.push(
        {
          id: 'test-1',
          title: 'Complete project milestone',
          date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          category: 'business',
          completed: false
        },
        {
          id: 'test-2',
          title: 'Health checkup',
          date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
          category: 'body',
          completed: false
        }
      );
    }

    console.log('Extracted milestones:', milestones);
    return milestones;
  }, [goalsData]);

  const getMilestonesForDate = useCallback((date: Date) => {
    const milestones = getMilestoneDates();
    return milestones.filter(milestone => 
      milestone.date.getDate() === date.getDate() &&
      milestone.date.getMonth() === date.getMonth() &&
      milestone.date.getFullYear() === date.getFullYear()
    );
  }, [getMilestoneDates]);

  const getEventsForDate = useCallback((date: Date) => {
    if (!data?.events) return [];
    return data.events.filter((event: CalendarEvent) => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  }, [data?.events]);

  const getWeekDates = useCallback((date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  }, []);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  }, []);

  const openDayView = useCallback((date: Date) => {
    setSelectedDate(date);
    if (viewMode === '90day') {
      setViewMode('week');
    }
  }, [viewMode]);

  const closeDayView = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, action: any) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(action));
  }, []);

  const refreshActionPool = useCallback(() => {
    console.log('Refreshing action pool...');
  }, []);

  const getCategoryColor = useCallback((category: string) => {
    const colors: Record<string, string> = {
      business: 'bg-blue-100 text-blue-800',
      body: 'bg-green-100 text-green-800',
      balance: 'bg-purple-100 text-purple-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.default;
  }, []);

  const getCategoryIcon = useCallback((category: string) => {
    return <Flag className="w-4 h-4" />;
  }, []);

  const generate90DayView = useCallback(() => {
    const today = new Date();
    const endDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const milestones = getMilestoneDates();
    
    console.log('Generating 90-day view with milestones:', milestones);
    
    const monthGroups: { [key: string]: Date[] } = {};
    
    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(new Date(d));
    }
    
    return { monthGroups, milestones };
  }, [getMilestoneDates]);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate, getWeekDates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error loading calendar: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600 mt-1">Track your milestones and daily actions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'week' ? '90day' : 'week')}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>{viewMode === 'week' ? '90-Day View' : 'Back to Week'}</span>
          </button>
          <button
            onClick={() => setShowActionPool(!showActionPool)}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span>Notes</span>
          </button>
        </div>
      </div>

      {viewMode === 'week' ? (
        <>
          {/* Week Navigation */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              <p className="text-sm text-slate-600">
                Week of {weekDates[0].toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Weekly Calendar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-4 text-center font-medium text-slate-700 bg-slate-50">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {weekDates.map(date => {
                const milestones = getMilestonesForDate(date);
                const events = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={date.toISOString()}
                    className={`min-h-32 p-4 border-r border-b border-slate-200 last:border-r-0 ${
                      isToday ? 'bg-purple-50' : 'hover:bg-slate-50'
                    } cursor-pointer transition-colors`}
                    onClick={() => openDayView(date)}
                  >
                    <div className={`font-medium mb-2 ${
                      isToday ? 'text-purple-600' : 'text-slate-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    {/* Milestones */}
                    {milestones.map(milestone => (
                      <div 
                        key={milestone.id}
                        className={`mb-1 px-2 py-1 rounded text-xs ${getCategoryColor(milestone.category)}`}
                      >
                        {milestone.title}
                      </div>
                    ))}
                    
                    {/* Events */}
                    {events.map(event => (
                      <div 
                        key={event.id}
                        className={`mb-1 px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* 90-Day View */
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          {(() => {
            const { monthGroups, milestones } = generate90DayView();
            
            return (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">90-Day Milestone View</h2>
                    <p className="text-slate-600 text-sm mt-1">Found: {milestones.length} milestones</p>
                  </div>
                </div>

                {milestones.length === 0 ? (
                  <div className="text-center py-12">
                    <Flag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No milestones found</h3>
                    <p className="text-slate-500">Add milestones in the Goals section</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(monthGroups).map(([monthKey, dates]) => {
                      const firstDate = dates[0];
                      const monthName = firstDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      });

                      // Get first day of month and calculate grid start
                      const firstDayOfMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
                      const startDay = firstDayOfMonth.getDay();
                      
                      // Create array of all days to display (including empty cells)
                      const allDays = [];
                      
                      // Add empty cells for days before month starts
                      for (let i = 0; i < startDay; i++) {
                        allDays.push(null);
                      }
                      
                      // Add all days of the month
                      const lastDay = new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 0).getDate();
                      for (let day = 1; day <= lastDay; day++) {
                        const date = new Date(firstDate.getFullYear(), firstDate.getMonth(), day);
                        allDays.push(date);
                      }

                      return (
                        <div key={monthKey} className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-800 px-4 py-2 bg-slate-100 rounded-lg">
                            {monthName}
                          </h3>
                          
                          {/* Day headers */}
                          <div className="grid grid-cols-7 gap-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          {/* Calendar grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {allDays.map((date, index) => {
                              if (!date) {
                                return <div key={index} className="min-h-24"></div>;
                              }

                              const milestonesForDay = milestones.filter(m => 
                                m.date.getDate() === date.getDate() &&
                                m.date.getMonth() === date.getMonth() &&
                                m.date.getFullYear() === date.getFullYear()
                              );
                              
                              const isToday = date.toDateString() === new Date().toDateString();
                              
                              return (
                                <div 
                                  key={date.toISOString()}
                                  className={`min-h-24 p-2 rounded-lg border ${
                                    isToday ? 'border-purple-500 bg-purple-50' : 'border-slate-200'
                                  } hover:shadow-sm transition-all cursor-pointer`}
                                  onClick={() => openDayView(date)}
                                >
                                  <div className="font-medium text-slate-900">
                                    {date.getDate()}
                                  </div>
                                  
                                  {milestonesForDay.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {milestonesForDay.map((milestone, idx) => (
                                        <div 
                                          key={idx}
                                          className={`px-2 py-1 rounded-lg text-xs ${getCategoryColor(milestone.category)}`}
                                        >
                                          {milestone.title}
                                        </div>
                                      ))}
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
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Action Pool */}
      {showActionPool && viewMode === 'week' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
            <button
              onClick={refreshActionPool}
              className="text-slate-600 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.actionPool?.map((action: any) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:shadow-sm transition-all"
                draggable
                onDragStart={(e) => handleDragStart(e, action)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getCategoryColor(action.category)}`}>
                    {getCategoryIcon(action.category)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{action.title}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(action.category)}`}>
                        {action.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )) || []}
          </div>
        </div>
      )}

      {/* Day View Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              <button
                onClick={closeDayView}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Milestones for selected date */}
              {(() => {
                const milestones = getMilestonesForDate(selectedDate);
                const events = getEventsForDate(selectedDate);
                
                return (
                  <>
                    {milestones.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Milestones</h4>
                        <div className="space-y-2">
                          {milestones.map(milestone => (
                            <div 
                              key={milestone.id}
                              className={`p-3 rounded-lg ${getCategoryColor(milestone.category)}`}
                            >
                              <div className="font-medium">{milestone.title}</div>
                              <div className="text-sm opacity-75">{milestone.category}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {events.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Events</h4>
                        <div className="space-y-2">
                          {events.map(event => (
                            <div 
                              key={event.id}
                              className={`p-3 rounded-lg ${getCategoryColor(event.category)}`}
                            >
                              <div className="font-medium">{event.title}</div>
                              <div className="text-sm opacity-75">{event.category}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {milestones.length === 0 && events.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        No milestones or events for this date
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;