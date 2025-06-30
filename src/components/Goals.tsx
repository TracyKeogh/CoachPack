import React, { useState, useEffect } from 'react';
import { 
  Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar as CalendarIcon, 
  Plus, Minus, Link, TrendingUp, Clock, Repeat, CheckSquare, 
  Flag, CheckCircle2, Circle, Star, Award, Zap, BarChart3
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { useWheelData } from '../hooks/useWheelData';
import { 
  GOAL_CATEGORIES, getTwelveWeeksFromNow, getMilestoneDueDates, 
  DAYS_OF_WEEK, ActionItem, Milestone 
} from '../types/goals';

const Goals: React.FC = () => {
  const { data: goalData } = useGoalSettingData();
  const { data: wheelData } = useWheelData();
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

  if (!wheelData || wheelData.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Complete Your Wheel of Life First</h2>
            <p className="text-slate-600">Please complete your Wheel of Life assessment to set up your goals.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">12-Week Goals</h1>
          <p className="text-slate-600 mt-2">
            Set your goals for the next 12 weeks and connect them to your life areas
          </p>
        </div>
      </div>

      {/* Annual Vision */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-900">Your Annual Vision</h2>
            <p className="text-purple-700">Imagine it's one year from now...</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <textarea
              placeholder="I feel energized and healthy. My career is thriving. My relationships are deep and fulfilling..."
              className="w-full p-4 border border-purple-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-800 mb-2">
              Personal Mantra <span className="text-purple-600">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Living with purpose and joy"
              className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            />
          </div>
        </div>
      </div>

      {/* Goal Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {Object.entries(GOAL_CATEGORIES).map(([category, categoryInfo]) => {
          // Get connected wheel areas for this category
          const connectedAreas = wheelData?.filter(area => 
            categoryInfo.wheelAreas.includes(area.area)
          ) || [];

          return (
            <div key={category} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-slate-100">
                  {categoryInfo.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{categoryInfo.name}</h3>
                  <p className="text-sm text-slate-600">{categoryInfo.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What's your main {categoryInfo.name.toLowerCase()} goal for the next 12 weeks?
                </label>
                <textarea
                  placeholder={categoryInfo.examples[0]}
                  className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-slate-600" />
                  <h4 className="text-sm font-medium text-slate-700">Connected Life Areas</h4>
                </div>
                
                <div className="space-y-2">
                  {connectedAreas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: area.color }}
                        />
                        <span className="text-sm font-medium text-slate-700">{area.area}</span>
                      </div>
                      <div className="text-sm font-medium text-green-600">+2</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Values Alignment */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Align Your Values</h2>
          <p className="text-slate-600">Connect your core values to each goal area for authentic motivation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(GOAL_CATEGORIES).map(([category, categoryInfo]) => (
            <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg bg-slate-100">
                  {categoryInfo.icon}
                </div>
                <h3 className="font-semibold text-slate-900">{categoryInfo.name}</h3>
              </div>
              
              <div className="space-y-3">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-4 h-4 text-red-500">❤️</div>
                    <input
                      type="text"
                      placeholder={`Core value ${index}`}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Steps */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Ready to Take Action?</h3>
        <p className="text-blue-100 mb-6">
          Your goals are connected to your life areas and values. Now it's time to break them down into actionable steps.
        </p>
        
        <button className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium">
          <CalendarIcon className="w-5 h-5" />
          <span>Create Action Plan</span>
        </button>
      </div>
    </div>
  );
};

export default Goals;