import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flag, StickyNote } from 'lucide-react';
import { useCalendarData } from '../hooks/useCalendarData';
import { useGoalsData } from '../hooks/useGoalsData'; 
import NotesPanel from './NotesPanel';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: 'work' | 'personal' | 'health' | 'other';
}

interface DayViewModalProps {
  date: Date;
  events: Event[];
  onClose: () => void;
}

const DayViewModal: React.FC<DayViewModalProps> = ({ date, events, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            {date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          {events.length > 0 ? (
            events.map(event => (
              <div key={event.id} className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-800">{event.title}</h4>
                <p className="text-sm text-slate-600">
                  {event.start.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })} - {event.end.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-4">No events scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | '90day'>('week');
  const data = useCalendarData();
  const { data: goalsData = { category_goals: { business: { goals: [] }, body: { goals: [] }, balance: { goals: [] } } } } = useGoalsData();

  // Memoized helper function to get milestones with due dates
  const getMilestoneDates = useMemo(() => {
    const milestones: Array<{ date: Date; title: string; category: string }> = [];
    
    console.log('Extracting milestones from goalsData:', goalsData);
    
    if (goalsData?.category_goals) {
      Object.entries(goalsData.category_goals).forEach(([category, categoryData]: [string, any]) => {
        console.log(`Processing category: ${category}`, categoryData);
        
        if (categoryData?.goals) {
          categoryData.goals.forEach((goal: any) => {
            console.log(`Processing goal:`, goal);
            
            if (goal?.milestones && Array.isArray(goal.milestones)) {
              goal.milestones.forEach((milestone: any) => {
                console.log(`Processing milestone:`, milestone);
                
                const dueDate = milestone.dueDate || milestone.targetDate || milestone.date;
                if (dueDate) {
                  const date = new Date(dueDate);
                  if (!isNaN(date.getTime())) {
                    milestones.push({
                      date,
                      title: milestone.title || milestone.name || 'Untitled Milestone',
                      category
                    });
                    console.log(`Added milestone: ${milestone.title} on ${date.toDateString()}`);
                  }
                }
              });
            }
          });
        }
      });
    }
    
    // Add test milestones if none found
    if (milestones.length === 0) {
      console.log('No milestones found in goals data, adding test milestones');
      const today = new Date();
      milestones.push(
        {
          date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          title: 'Complete Q1 Review',
          category: 'business'
        },
        {
          date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000),
          title: 'Fitness Assessment',
          category: 'body'
        },
        {
          date: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000),
          title: 'Family Vacation Planning',
          category: 'balance'
        }
      );
    }
    
    console.log(`Total milestones found: ${milestones.length}`, milestones);
    return milestones; 
  }, [goalsData]);

  // Generate 90-day view data
  const generate90DayView = useMemo(() => {
    const milestones = getMilestoneDates;
    const today = new Date();
    const endDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    const monthGroups: Array<{
      month: string;
      year: number;
      weeks: Array<Array<Date | null>>
    }> = [];
    
    let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    while (currentMonth <= endDate) {
      const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });
      const year = currentMonth.getFullYear();
      
      // Get first day of month and calculate starting day of week
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      const startingDayOfWeek = firstDay.getDay();
      
      const weeks: Array<Array<Date | null>> = [];
      let currentWeek: Array<Date | null> = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        currentWeek.push(null);
      }
      
      // Add all days of the month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        currentWeek.push(date);
        
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }
      
      // Add remaining empty cells if needed
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
      }
      
      monthGroups.push({ month: monthName, year, weeks });
      
      // Move to next month
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    }
    
    return { milestones, monthGroups };
  }, [getMilestoneDates]);

  // Helper function to get events for a specific date
  const getEventsForDate = (date: Date) => {
    return data.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForDay = (date: Date) => {
    return data.events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getMilestonesForDate = (date: Date) => {
    return generate90DayView.milestones.filter(milestone => 
      milestone.date.toDateString() === date.toDateString()
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      work: 'bg-blue-100 text-blue-800',
      personal: 'bg-green-100 text-green-800',
      health: 'bg-red-100 text-red-800',
      business: 'bg-purple-100 text-purple-800',
      body: 'bg-orange-100 text-orange-800',
      balance: 'bg-teal-100 text-teal-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    if (viewMode === '90day') {
      // Switch to week view and show day view for the selected date
      setViewMode('week');
      setCurrentDate(date);
      setSelectedDate(date);
    } else {
      setSelectedDate(date);
    }
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-slate-800">Calendar</h1>
          <button
            onClick={() => setViewMode(viewMode === 'week' ? '90day' : 'week')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span>{viewMode === 'week' ? '90-Day View' : 'Back to Week'}</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showNotes 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <StickyNote className="w-4 h-4" />
            <span>Notes</span>
          </button>
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          {/* Week Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            
            <h2 className="text-lg font-semibold text-slate-800">
              {weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Week Grid */}
          <div className="grid grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-sm font-medium text-slate-600 mb-2">{day}</div>
                <div
                  className="min-h-[120px] p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => handleDateClick(weekDays[index])}
                >
                  <div className="text-sm font-medium text-slate-800 mb-2">
                    {weekDays[index].getDate()}
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-1">
                    {getEventsForDay(weekDays[index]).slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {getEventsForDay(weekDays[index]).length > 3 && (
                      <div className="text-xs text-slate-500">
                        +{getEventsForDay(weekDays[index]).length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 90-Day View */}
      {viewMode === '90day' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          {/* 90-Day Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">90-Day Milestone View</h2>
              <div className="text-sm text-slate-500">
                Found: {generate90DayView.milestones.length} milestones
              </div>
            </div>
            
            {/* Upcoming Milestones Summary */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-slate-800 mb-3">Upcoming Milestones</h3>
              {generate90DayView.milestones.length > 0 ? (
                <div className="space-y-2">
                  {generate90DayView.milestones.slice(0, 5).map((milestone, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{milestone.title}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(milestone.category)}`}>
                          {milestone.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          {milestone.date.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {generate90DayView.milestones.length > 5 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{generate90DayView.milestones.length - 5} more milestones
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-500">
                  <Flag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No milestones found</p>
                  <p className="text-xs">Add milestones in the Goals section</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Calendar Grid */}
          <div className="space-y-8">
            {generate90DayView.monthGroups.map((monthGroup, monthIndex) => (
              <div key={`${monthGroup.month}-${monthGroup.year}`}>
                <div className="bg-slate-800 text-white px-4 py-2 rounded-t-lg">
                  <h3 className="font-semibold">{monthGroup.month} {monthGroup.year}</h3>
                </div>
                
                <div className="border border-slate-200 rounded-b-lg overflow-hidden">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 bg-slate-50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-slate-600 border-r border-slate-200 last:border-r-0">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  {monthGroup.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 border-t border-slate-200">
                      {week.map((date, dayIndex) => {
                        const dateKey = `${monthIndex}-${weekIndex}-${dayIndex}`;
                        
                        return (
                          <div
                            key={dateKey}
                            className={`min-h-[80px] p-2 border-r border-slate-200 last:border-r-0 ${
                              date ? 'cursor-pointer hover:bg-slate-50' : 'bg-slate-25'
                            }`}
                            onClick={() => date && handleDateClick(date)}
                          >
                            {date && (
                              <div>
                                <div className="text-sm font-medium text-slate-800 mb-1">
                                  {date.getDate()}
                                </div>
                                
                                {/* Milestones */}
                                <div className="space-y-1">
                                  {getMilestonesForDate(date).map((milestone, index) => (
                                    <div
                                      key={index}
                                      className={`px-1 py-0.5 rounded text-xs flex items-center ${getCategoryColor(milestone.category)}`}
                                    >
                                      <Flag className="w-3 h-3 mr-1" />
                                      <span className="truncate">{milestone.title}</span>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Events */}
                                <div className="space-y-1 mt-1">
                                  {getEventsForDate(date).slice(0, 2).map(event => (
                                    <div 
                                      key={event.id}
                                      className={`px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}
                                    >
                                      {event.title}
                                    </div>
                                  ))}
                                  {getEventsForDate(date).length > 2 && (
                                    <div className="text-xs text-slate-500 text-center">
                                      +{getEventsForDate(date).length - 2} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Panel */}
      {showNotes && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <NotesPanel feature="calendar" />
        </div>
      )}

      {/* Day View Modal */}
      {selectedDate && (
        <DayViewModal
          date={selectedDate}
          events={getEventsForDay(selectedDate)}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
};

export default Calendar;