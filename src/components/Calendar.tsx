import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Eye, Target, Heart, Briefcase, User } from 'lucide-react';
import { useCalendarData } from '../hooks/useCalendarData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  duration?: number;
  category: 'business' | 'body' | 'balance' | 'personal';
  frequency?: 'daily' | 'weekly' | '3x-week';
}

interface ActionItem {
  id: string;
  title: string;
  duration: number;
  frequency: 'daily' | 'weekly' | '3x-week';
  category: 'business' | 'body' | 'balance' | 'personal';
}

const Calendar: React.FC = () => {
  const { data: goalsData } = useGoalSettingData();
  const [currentView, setCurrentView] = useState<'daily' | 'weekly' | '90-day' | 'yearly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showVisionOverlay, setShowVisionOverlay] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [draggedAction, setDraggedAction] = useState<ActionItem | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    category: 'business' as const
  });

  const { data: calendarData, addEvent, updateEvent, removeEvent, refreshActionPool } = useCalendarData();
  
  // Refresh action pool when goals data changes
  useEffect(() => {
    if (goalsData && Object.keys(goalsData.categoryGoals || {}).length > 0) {
      console.log("Refreshing action pool with goals data:", goalsData);
      refreshActionPool();
    }
  }, [goalsData, refreshActionPool]);

  // Default action items that match the screenshot
  const defaultActions: ActionItem[] = [
    { id: '1', title: 'Morning Workout', duration: 60, frequency: 'daily', category: 'body' },
    { id: '2', title: 'Team Meeting', duration: 90, frequency: 'weekly', category: 'business' },
    { id: '3', title: 'Meal Prep', duration: 120, frequency: 'weekly', category: 'body' },
    { id: '4', title: 'Reading Time', duration: 45, frequency: '3x-week', category: 'personal' },
    { id: '5', title: 'Family Dinner', duration: 90, frequency: 'daily', category: 'balance' },
    { id: '6', title: 'Project Work', duration: 180, frequency: '3x-week', category: 'business' },
    { id: '7', title: 'Meditation', duration: 20, frequency: 'daily', category: 'balance' }
  ];

  // Use calendar data action pool if available, otherwise use defaults
  const actionPool = calendarData && calendarData.actionPool && calendarData.actionPool.length > 0 
    ? calendarData.actionPool 
    : defaultActions;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'body': return 'bg-green-100 text-green-800 border-green-200';
      case 'balance': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'personal': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return <Briefcase className="w-4 h-4" />;
      case 'body': return <Heart className="w-4 h-4" />;
      case 'balance': return <Target className="w-4 h-4" />;
      case 'personal': return <User className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'daily';
      case 'weekly': return 'weekly';
      case '3x-week': return '3x_week';
      default: return frequency;
    }
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      const event: CalendarEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        duration: newEvent.duration,
        category: newEvent.category
      };
      addEvent(event);
      setNewEvent({ title: '', date: '', time: '', duration: 60, category: 'business' });
      setShowAddEventForm(false);
    }
  };

  const renderDailyView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const dayEvents = calendarData?.events?.filter(event => event.date === currentDateStr) || [];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-1 p-6">
            <div className="space-y-1">
              {hours.map(hour => (
                <div key={hour} className="flex items-start border-b border-slate-100 py-2">
                  <div className="w-16 text-sm text-slate-500 font-medium">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 min-h-[40px] relative">
                    {dayEvents
                      .filter(event => event.time && parseInt(event.time.split(':')[0]) === hour)
                      .map(event => (
                        <div
                          key={event.id}
                          className={`absolute left-0 right-0 p-2 rounded-lg border ${getCategoryColor(event.category)} text-sm`}
                        >
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(event.category)}
                            <span className="font-medium">{event.title}</span>
                            {event.duration && (
                              <span className="text-xs opacity-75">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {event.duration}m
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-80 border-l border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Reflection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What went well today?
                </label>
                <textarea
                  className="w-full p-3 border border-slate-200 rounded-lg resize-none"
                  rows={3}
                  placeholder="Reflect on your wins..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What could be improved?
                </label>
                <textarea
                  className="w-full p-3 border border-slate-200 rounded-lg resize-none"
                  rows={3}
                  placeholder="Areas for growth..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tomorrow's priority
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-slate-200 rounded-lg"
                  placeholder="Most important task..."
                />
              </div>
              <div className="text-center py-6">
                <p className="text-slate-500">No actions available</p>
                <p className="text-xs text-slate-500">Add goals to see actions here</p>
                <button
                  onClick={refreshActionPool}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                  Refresh Actions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    const timeSlots = ['Morning', 'Afternoon', 'Evening'];

    // Sample events for demonstration
    const sampleEvents = [
      { id: '1', title: 'Morning Workout', day: 0, slot: 'Morning', duration: 60, category: 'body' },
      { id: '2', title: 'Team Meeting', day: 1, slot: 'Morning', duration: 90, category: 'business' },
      { id: '3', title: 'Meal Prep', day: 2, slot: 'Morning', duration: 120, category: 'body' },
      { id: '4', title: 'Reading Time', day: 2, slot: 'Afternoon', duration: 45, category: 'personal' },
      { id: '5', title: 'Reading Time', day: 3, slot: 'Afternoon', duration: 45, category: 'personal' },
      { id: '6', title: 'Project Work', day: 4, slot: 'Morning', duration: 180, category: 'business' }
    ];

    return (
      <div className="flex space-x-6">
        {/* Action Pool Sidebar */}
        <div className="w-80 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Action Pool</h3>
            <button className="p-2 hover:bg-slate-100 rounded-lg">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {actionPool.length > 0 ? (
              actionPool.map(action => (
                <div
                  key={action.id}
                  className={`p-3 rounded-lg border cursor-move ${getCategoryColor(action.category)}`}
                  draggable
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {getCategoryIcon(action.category)}
                    <span className="font-medium text-sm">{action.title}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs opacity-75">
                    <Clock className="w-3 h-3" />
                    <span>{action.duration}m • {getFrequencyText(action.frequency)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No actions available</p>
                <button
                  onClick={refreshActionPool}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                  Refresh Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Weekly Planning</h2>
                <p className="text-slate-600">
                  {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {
                    new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setDate(currentDate.getDate() - 7);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  This Week
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setDate(currentDate.getDate() + 7);
                    setCurrentDate(newDate);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-8 gap-4">
              {/* Time slots header */}
              <div className="space-y-4">
                <div className="h-12"></div>
                {timeSlots.map(slot => (
                  <div key={slot} className="h-32 flex items-center">
                    <span className="text-sm font-medium text-slate-600">{slot}</span>
                  </div>
                ))}
              </div>

              {/* Days */}
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-slate-600">
                      {day.toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                    <div className={`text-lg font-bold mt-1 ${
                      day.toDateString() === new Date().toDateString() 
                        ? 'text-blue-600' 
                        : 'text-slate-900'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                  
                  {timeSlots.map(slot => (
                    <div key={slot} className="h-32 border border-slate-200 rounded-lg p-2 relative">
                      {sampleEvents
                        .filter(event => event.day === dayIndex && event.slot === slot)
                        .map(event => (
                          <div
                            key={event.id}
                            className={`p-2 rounded-lg border text-xs ${getCategoryColor(event.category)}`}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="flex items-center space-x-1 mt-1 opacity-75">
                              <Clock className="w-3 h-3" />
                              <span>{event.duration}m</span>
                            </div>
                          </div>
                        ))}
                      {!sampleEvents.some(event => event.day === dayIndex && event.slot === slot) && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                          Drop actions here
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const render90DayView = () => {
    const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
    const categories = ['business', 'body', 'balance'];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">90-Day Action Focus</h2>
              <p className="text-slate-600">12 Week Year Action Focus</p>
            </div>
            <button
              onClick={() => setShowVisionOverlay(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Eye className="w-4 h-4" />
              <span>Show Vision</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 gap-6">
            {/* Categories sidebar */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Action Pool</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="p-4 border border-slate-200 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2 capitalize">{category === 'business' ? 'Business' : category === 'body' ? 'Body' : 'Balance'}</h4>
                    <div className="space-y-2">
                      {/* Direct access to the goals data */}
                      {category === 'business' && (
                        <>
                          <div className="text-sm text-slate-600 font-medium">
                            Grow my business to $10k/month revenue
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            <div className="font-medium mb-1">Actions:</div>
                            <ul className="list-disc pl-4 space-y-1">
                              {actionPool
                                .filter(action => action.category === 'business')
                                .map((action, idx) => (
                                  <li 
                                    key={idx}
                                    draggable
                                    onDragStart={() => setDraggedAction(action)}
                                    className="cursor-move hover:text-blue-600"
                                  >
                                    {action.title}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </>
                      )}
                      
                      {category === 'body' && (
                        <>
                          <div className="text-sm text-slate-600 font-medium">
                            Improve energy and physical health
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            <div className="font-medium mb-1">Actions:</div>
                            <ul className="list-disc pl-4 space-y-1">
                              {actionPool
                                .filter(action => action.category === 'body')
                                .map((action, idx) => (
                                  <li 
                                    key={idx}
                                    draggable
                                    onDragStart={() => setDraggedAction(action)}
                                    className="cursor-move hover:text-green-600"
                                  >
                                    {action.title}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </>
                      )}
                      
                      {category === 'balance' && (
                        <>
                          <div className="text-sm text-slate-600 font-medium">
                            Create better work-life harmony
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            <div className="font-medium mb-1">Actions:</div>
                            <ul className="list-disc pl-4 space-y-1">
                              {actionPool
                                .filter(action => action.category === 'balance')
                                .map((action, idx) => (
                                  <li 
                                    key={idx}
                                    draggable
                                    onDragStart={() => setDraggedAction(action)}
                                    className="cursor-move hover:text-purple-600"
                                  >
                                    {action.title}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 12-week timeline */}
            <div className="col-span-3">
              <div className="grid grid-cols-4 gap-4">
                {weeks.map((week) => (
                  <div 
                    key={week} 
                    className="border border-slate-200 rounded-lg p-4"
                  >
                    <div className="text-center mb-3">
                      <div className="text-sm font-medium text-slate-600">Week</div>
                      <div className="text-xl font-bold text-slate-900">{week}</div>
                    </div>
                    
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div 
                          key={category} 
                          className={`h-12 rounded border-2 border-dashed ${
                            category === 'business' ? 'border-blue-200 bg-blue-50' : 
                            category === 'body' ? 'border-green-200 bg-green-50' : 
                            'border-purple-200 bg-purple-50'
                          } flex items-center justify-center`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('bg-opacity-70');
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove('bg-opacity-70');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('bg-opacity-70');
                            if (draggedAction) {
                              // Here we would normally update state with the dropped action
                              // For now, we'll just show a visual indicator
                              const target = e.currentTarget;
                              const originalContent = target.innerHTML;
                              target.innerHTML = `
                                <div class="p-1 text-xs font-medium ${
                                  draggedAction.category === 'business' ? 'text-blue-700' : 
                                  draggedAction.category === 'body' ? 'text-green-700' : 
                                  'text-purple-700'
                                }">
                                  ${draggedAction.title}
                                </div>
                              `;
                              
                              // Reset after animation
                              setTimeout(() => {
                                const allDropZones = document.querySelectorAll('.drop-highlight');
                                allDropZones.forEach(zone => zone.classList.remove('drop-highlight'));
                              }, 100);
                            }
                          }}
                        >
                          <span className="text-xs text-slate-400">Drop action here</span>
                        </div>
                      ))}
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

  const renderYearlyView = () => {
    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-8 text-center">
          <h1 className="text-4xl font-bold">THE BIG A## CALENDAR 2025</h1>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-16"></th>
                {days.map(day => (
                  <th key={day} className="text-center p-2 text-blue-600 font-semibold border-b border-blue-200">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((month, monthIndex) => (
                <tr key={month}>
                  <td className="text-blue-600 font-semibold p-3 border-r border-blue-200 text-center">
                    {month}
                  </td>
                  {days.map(day => (
                    <td key={day} className="border border-blue-100 h-8 w-8 p-1">
                      <div className="w-full h-full bg-blue-50 hover:bg-blue-100 cursor-pointer rounded-sm"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAddEventForm = () => {
    if (!showAddEventForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Event</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
                placeholder="Event title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={newEvent.duration}
                onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg"
                min="15"
                step="15"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              >
                <option value="business">Business</option>
                <option value="body">Body</option>
                <option value="balance">Balance</option>
                <option value="personal">Personal</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAddEventForm(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEvent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Event
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVisionOverlay = () => {
    if (!showVisionOverlay) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Your Vision</h3>
            <button
              onClick={() => setShowVisionOverlay(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">Values</h4>
              <p className="text-blue-700">Your core values guide every decision and action.</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-green-900 mb-3">Vision Board</h4>
              <p className="text-green-700">Visual representation of your ideal future.</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-purple-900 mb-3">Wheel of Life</h4>
              <p className="text-purple-700">Balance across all areas of your life.</p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-slate-50 rounded-lg">
            <h4 className="text-lg font-semibold text-slate-900 mb-3">How This Connects</h4>
            <p className="text-slate-700">
              Your calendar is where your vision becomes reality. Each scheduled action should align with your values, 
              move you toward your vision, and maintain balance across all life areas. Use this view to ensure your 
              daily schedule reflects your bigger purpose.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <style jsx>{`
        .drop-highlight {
          box-shadow: inset 0 0 0 2px rgba(79, 70, 229, 0.6);
          background-color: rgba(79, 70, 229, 0.1);
        }
      `}</style>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-600">Transform your vision into daily action</p>
        </div>
        <button
          onClick={() => setShowAddEventForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1 flex space-x-1 max-w-md">
        {(['daily', 'weekly', '90-day', 'yearly'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === view
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {view === '90-day' ? '90-Day' : view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
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
    </div>
  );
};

export default Calendar;