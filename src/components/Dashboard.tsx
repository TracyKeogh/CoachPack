import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Heart, 
  ImageIcon, 
  Target, 
  Calendar as CalendarIcon,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  Zap,
  Trophy,
  Flag,
  ArrowRight,
  Sparkles,
  Crown,
  Circle,
  ChevronRight,
  Activity,
  Users,
  Compass,
  Wind,
  Globe,
  BookOpen,
  Shield,
  Lightbulb,
  Eye,
  Mountain,
  Sunrise,
  Flame,
  Rocket,
  Diamond,
  Edit3,
  Plus,
  Move,
  ArrowDown,
  Link,
  Quote,
  CheckSquare,
  Repeat,
  StickyNote
} from 'lucide-react';
import type { ViewType } from '../App';
import { useWheelData } from '../hooks/useWheelData';
import { useValuesData } from '../hooks/useValuesData';
import { useVisionBoardData } from '../hooks/useVisionBoardData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import NotesPanel from './NotesPanel';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

// Calendar data interface (matching Calendar component)
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
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { data: wheelData, getCompletionStats: getWheelStats } = useWheelData();
  const { data: valuesData, getCompletionStats: getValuesStats } = useValuesData();
  const { visionItems, textElements, getCompletionStats: getVisionStats } = useVisionBoardData();
  const { data: goalData } = useGoalSettingData();
  const [showNotes, setShowNotes] = useState(false);

  // Load calendar events from localStorage (same key as Calendar component)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('coach-pack-calendar-events');
      if (stored) {
        const events = JSON.parse(stored);
        setCalendarEvents(events);
      } else {
        // Default events if none exist
        setCalendarEvents([
          {
            id: '1',
            title: 'Morning Workout',
            description: 'Gym session focusing on strength training',
            date: new Date().toISOString().split('T')[0],
            time: '07:00',
            category: 'body',
            duration: 60,
            frequency: 'daily',
            isGoalAction: true,
            goalCategory: 'body'
          },
          {
            id: '2',
            title: 'Deep Work Session',
            description: 'Focus time for important projects',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            category: 'business',
            duration: 90,
            frequency: 'daily',
            isGoalAction: true,
            goalCategory: 'business'
          },
          {
            id: '3',
            title: 'Family Time',
            description: 'Quality time with loved ones',
            date: new Date().toISOString().split('T')[0],
            time: '18:00',
            category: 'balance',
            duration: 60,
            frequency: 'daily',
            isGoalAction: true,
            goalCategory: 'balance'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load calendar events:', error);
      setCalendarEvents([]);
    }
  }, []);

  // Get today's actions from calendar
  const getTodaysActions = () => {
    const today = new Date().toISOString().split('T')[0];
    return calendarEvents
      .filter(event => event.date === today)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 6); // Limit to 6 actions for display
  };

  // Get 12-week progress based on actual goal data
  const getTwelveWeekProgress = () => {
    // Calculate based on when goals were first created
    const goalCreationDate = goalData.lastUpdated ? new Date(goalData.lastUpdated) : new Date();
    const startDate = new Date(goalCreationDate);
    startDate.setDate(startDate.getDate() - 7); // Assume started a week before first update
    
    const today = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (12 * 7)); // 12 weeks later
    
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    
    return {
      progress: Math.round(progress),
      weeksPassed: Math.floor(daysPassed / 7),
      weeksRemaining: Math.max(0, 12 - Math.floor(daysPassed / 7)),
      startDate,
      endDate
    };
  };

  // Get all milestones with timeline positioning
  const getMilestonesTimeline = () => {
    const milestones: Array<{
      id: string;
      title: string;
      dueDate: string;
      category: string;
      completed: boolean;
      completedDate?: string;
      daysFromStart: number;
      urgency: 'overdue' | 'urgent' | 'soon' | 'normal';
      icon: any;
    }> = [];

    const startDate = new Date('2025-01-01');
    const today = new Date();

    Object.entries(goalData.categoryGoals).forEach(([category, goal]) => {
      goal.milestones?.forEach((milestone) => {
        const dueDate = new Date(milestone.dueDate);
        const daysFromStart = Math.floor((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let urgency: 'overdue' | 'urgent' | 'soon' | 'normal' = 'normal';
        if (daysUntilDue < 0) urgency = 'overdue';
        else if (daysUntilDue <= 3) urgency = 'urgent';
        else if (daysUntilDue <= 7) urgency = 'soon';

        // Assign different icons for variety
        const icons = [Trophy, Star, Crown, Diamond, Rocket, Mountain, Flame, Zap];
        const icon = icons[Math.floor(Math.random() * icons.length)];
        
        milestones.push({
          id: milestone.id,
          title: milestone.title,
          dueDate: milestone.dueDate,
          category,
          completed: milestone.completed,
          completedDate: milestone.completedDate,
          daysFromStart,
          urgency,
          icon
        });
      });
    });

    return milestones.sort((a, b) => a.daysFromStart - b.daysFromStart);
  };

  // Get comprehensive journey progress
  const getJourneyProgress = () => {
    const wheelStats = getWheelStats();
    const valuesStats = getValuesStats();
    const visionStats = getVisionStats();
    
    // Calculate goal completion
    const totalGoals = Object.keys(goalData.categoryGoals).length;
    const completedGoals = Object.values(goalData.categoryGoals).filter(goal => 
      goal.goal && goal.actions && goal.actions.length > 0
    ).length;
    
    const totalMilestones = Object.values(goalData.categoryGoals).reduce((sum, goal) => 
      sum + (goal.milestones?.length || 0), 0
    );
    const completedMilestones = Object.values(goalData.categoryGoals).reduce((sum, goal) => 
      sum + (goal.milestones?.filter(m => m.completed).length || 0), 0
    );

    // Calculate scheduled actions
    const goalActions = calendarEvents.filter(event => event.isGoalAction).length;
    const totalPossibleActions = Object.values(goalData.categoryGoals).reduce((sum, goal) => 
      sum + (goal.actions?.length || 0), 0
    );

    return {
      wheel: {
        completed: wheelStats.wheelCompleted,
        averageScore: wheelStats.averageScore,
        reflections: wheelStats.completedReflections,
        totalAreas: wheelStats.totalAreas
      },
      values: {
        completed: valuesStats.isComplete,
        currentStep: valuesStats.currentStep,
        coreValues: valuesStats.coreValuesCount,
        definedValues: valuesStats.definedValuesCount
      },
      vision: {
        totalItems: visionStats.totalItems,
        customizedItems: visionStats.itemsWithCustomContent,
        completionPercentage: visionStats.completionPercentage
      },
      goals: {
        totalGoals,
        completedGoals,
        hasAnnualVision: !!goalData.annualSnapshot?.snapshot,
        totalMilestones,
        completedMilestones,
        scheduledActions: goalActions,
        totalPossibleActions
      }
    };
  };

  // Get life areas summary
  const getLifeAreasSummary = () => {
    if (!wheelData || wheelData.length === 0) return null;

    const averageScore = wheelData.reduce((sum, area) => sum + area.score, 0) / wheelData.length;
    const strongAreas = wheelData.filter(area => area.score >= 8);
    const growthAreas = wheelData.filter(area => area.score <= 5);
    
    return {
      averageScore: averageScore.toFixed(1),
      strongAreas: strongAreas.slice(0, 3),
      growthAreas: growthAreas.slice(0, 3),
      totalAreas: wheelData.length
    };
  };

  const twelveWeekProgress = getTwelveWeekProgress();
  const milestonesTimeline = getMilestonesTimeline();
  const lifeAreas = getLifeAreasSummary();
  const journeyProgress = getJourneyProgress();
  const todaysActions = getTodaysActions();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      business: 'bg-purple-500 text-purple-700 border-purple-300',
      body: 'bg-green-500 text-green-700 border-green-300',
      balance: 'bg-blue-500 text-blue-700 border-blue-300',
      personal: 'bg-orange-500 text-orange-700 border-orange-300'
    };
    return colors[category as keyof typeof colors] || colors.personal;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      business: '💼',
      body: '💪',
      balance: '⚖️',
      personal: '🎯'
    };
    return icons[category as keyof typeof icons] || '📋';
  };

  const getFrequencyIcon = (frequency?: string) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'multiple': return '🗓️';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-8">
      {/* Life Overview Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Life Dashboard</h1>
              <p className="text-white/80">
                Living intentionally, one day at a time. Here's your journey overview.
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-2">{lifeAreas?.averageScore || '0'}/10</div>
              <div className="text-white/90">Life Balance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Life Assessment</h3>
              <p className="text-sm text-slate-600">Wheel of Life</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Average Score</span>
              <span className="font-bold text-slate-900">{journeyProgress.wheel.averageScore.toFixed(1)}/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Reflections</span>
              <span className="font-bold text-slate-900">{journeyProgress.wheel.reflections}/{journeyProgress.wheel.totalAreas}</span>
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              journeyProgress.wheel.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {journeyProgress.wheel.completed ? '✓ Complete' : 'In Progress'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Core Values</h3>
              <p className="text-sm text-slate-600">Values Clarity</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Core Values</span>
              <span className="font-bold text-slate-900">{journeyProgress.values.coreValues}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Defined</span>
              <span className="font-bold text-slate-900">{journeyProgress.values.definedValues}</span>
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              journeyProgress.values.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {journeyProgress.values.completed ? '✓ Complete' : `Step ${journeyProgress.values.currentStep}/5`}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Vision Board</h3>
              <p className="text-sm text-slate-600">Visual Goals</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Vision Items</span>
              <span className="font-bold text-slate-900">{journeyProgress.vision.totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Customized</span>
              <span className="font-bold text-slate-900">{journeyProgress.vision.customizedItems}</span>
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              journeyProgress.vision.completionPercentage >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {journeyProgress.vision.completionPercentage}% Complete
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Goals & Actions</h3>
              <p className="text-sm text-slate-600">12-Week Focus</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Goals Set</span>
              <span className="font-bold text-slate-900">{journeyProgress.goals.completedGoals}/{journeyProgress.goals.totalGoals}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Milestones</span>
              <span className="font-bold text-slate-900">{journeyProgress.goals.completedMilestones}/{journeyProgress.goals.totalMilestones}</span>
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              journeyProgress.goals.hasAnnualVision && journeyProgress.goals.completedGoals > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {journeyProgress.goals.scheduledActions} Actions Scheduled
            </div>
          </div>
        </div>
      </div>

      {/* Notes Panel */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Your Journey Notes</h2>
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <StickyNote className="w-4 h-4" />
          <span>{showNotes ? 'Hide Notes' : 'Show Notes'}</span>
        </button>
      </div>

      {showNotes && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <NotesPanel feature="general" />
        </div>
      )}

      {/* Values → Vision → Actions Flow */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Life Architecture</h2>
          <p className="text-slate-600">How your values flow through your vision into daily actions</p>
        </div>

        <div className="space-y-12">
          {/* Core Values Foundation */}
          {valuesData.rankedCoreValues && valuesData.rankedCoreValues.length > 0 && (
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Core Values</h3>
                    <p className="text-slate-600 text-sm">Your guiding principles</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('values')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Refine</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {valuesData.rankedCoreValues.slice(0, 6).map((value, index) => {
                  const definition = valuesData.valueDefinitions[value.id];
                  return (
                    <div key={value.id} className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <h4 className="font-semibold text-red-900 text-sm">{value.name}</h4>
                      </div>
                      
                      {definition?.meaning ? (
                        <p className="text-red-700 text-xs italic">"{definition.meaning.slice(0, 80)}..."</p>
                      ) : (
                        <p className="text-red-700 text-xs">{value.description.slice(0, 80)}...</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Flow Arrow */}
              <div className="flex justify-center my-6">
                <div className="flex items-center space-x-2 text-slate-400">
                  <ArrowDown className="w-5 h-5" />
                  <span className="text-sm font-medium">Guides Your</span>
                  <ArrowDown className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Annual Snapshot */}
          {goalData.annualSnapshot?.snapshot && (
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Sunrise className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Annual Vision</h3>
                    <p className="text-slate-600 text-sm">Your life 12 months from now</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('goals')}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Refine</span>
                </button>
              </div>

              {/* Annual Vision Display */}
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-8 border border-indigo-200 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 opacity-20">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="absolute bottom-4 left-4 opacity-20">
                  <Mountain className="w-8 h-8 text-purple-600" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start space-x-4 mb-6">
                    <Quote className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
                    <blockquote className="text-indigo-900 text-lg leading-relaxed italic font-medium">
                      "{goalData.annualSnapshot.snapshot}"
                    </blockquote>
                  </div>
                  
                  {goalData.annualSnapshot.mantra && (
                    <div className="text-center mt-6 pt-6 border-t border-indigo-200">
                      <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-indigo-300">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-indigo-800 font-bold text-lg">"{goalData.annualSnapshot.mantra}"</span>
                        <Flame className="w-5 h-5 text-orange-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Flow Arrow */}
              <div className="flex justify-center my-6">
                <div className="flex items-center space-x-2 text-slate-400">
                  <ArrowDown className="w-5 h-5" />
                  <span className="text-sm font-medium">Inspires Your</span>
                  <ArrowDown className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Vision Board */}
          {visionItems && visionItems.length > 0 && (
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Life Vision</h3>
                    <p className="text-slate-600 text-sm">What you're creating</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('vision')}
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Update</span>
                </button>
              </div>

              {/* Compact Vision Board */}
              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 overflow-hidden" style={{ height: '200px' }}>
                {/* Vision Items */}
                {visionItems.slice(0, 8).map((item, index) => (
                  <div
                    key={item.id}
                    className="absolute"
                    style={{
                      left: `${10 + (index % 4) * 22}%`,
                      top: `${20 + Math.floor(index / 4) * 40}%`,
                      zIndex: 1
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-lg shadow-md border border-white hover:scale-110 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/220301/pexels-photo-220301.jpeg?auto=compress&cs=tinysrgb&w=400';
                      }}
                    />
                  </div>
                ))}

                {/* Quadrant Labels */}
                <div className="absolute top-2 left-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                  💼 Business
                </div>
                <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  💪 Health
                </div>
                <div className="absolute bottom-2 left-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  ⚖️ Balance
                </div>
                <div className="absolute bottom-2 right-2 bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs font-medium">
                  ❤️ Emotions
                </div>
              </div>

              {/* Flow Arrow */}
              <div className="flex justify-center my-6">
                <div className="flex items-center space-x-2 text-slate-400">
                  <ArrowDown className="w-5 h-5" />
                  <span className="text-sm font-medium">Breaks Down Into</span>
                  <ArrowDown className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Goals & Actions */}
          {Object.keys(goalData.categoryGoals).length > 0 && (
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">12-Week Goals</h3>
                    <p className="text-slate-600 text-sm">Your current focus</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('goals')}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Adjust</span>
                </button>
              </div>

              {/* Category Goals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(goalData.categoryGoals).map(([category, goal]) => (
                  <div key={category} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">
                        {category === 'business' ? '💼' : category === 'body' ? '💪' : '⚖️'}
                      </span>
                      <h4 className="font-semibold text-slate-900 capitalize">{category}</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-slate-700 mb-1">Goal</h5>
                        <p className="text-slate-900 font-medium">{goal.goal}</p>
                      </div>

                      {goal.actions && goal.actions.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-2">Key Actions</h5>
                          <div className="space-y-2">
                            {goal.actions.slice(0, 3).map((action, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <div className="w-2 h-2 bg-slate-400 rounded-full" />
                                <span className="text-slate-700">{action.text}</span>
                                <span className="text-xs text-slate-500">
                                  ({getFrequencyIcon(action.frequency)})
                                </span>
                              </div>
                            ))}
                            {goal.actions.length > 3 && (
                              <div className="text-xs text-slate-500">+{goal.actions.length - 3} more actions</div>
                            )}
                          </div>
                        </div>
                      )}

                      {goal.milestones && goal.milestones.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-2">Next Milestone</h5>
                          <div className="flex items-center space-x-2">
                            {goal.milestones[0].completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400" />
                            )}
                            <span className="text-sm text-slate-700">{goal.milestones[0].title}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Due: {formatDate(goal.milestones[0].dueDate)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Flow Arrow */}
              <div className="flex justify-center my-6">
                <div className="flex items-center space-x-2 text-slate-400">
                  <ArrowDown className="w-5 h-5" />
                  <span className="text-sm font-medium">Scheduled As</span>
                  <ArrowDown className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Daily Actions - Real Data from Calendar */}
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Today's Actions</h3>
                  <p className="text-slate-600 text-sm">
                    {todaysActions.length > 0 
                      ? `${todaysActions.length} actions scheduled for today`
                      : 'No actions scheduled for today'
                    }
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('calendar')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Schedule More</span>
              </button>
            </div>

            {/* Today's Actions from Calendar */}
            {todaysActions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todaysActions.map((action) => (
                  <div key={action.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-900">{action.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500">{action.duration}min</span>
                        {action.isGoalAction && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            Goal
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        action.category === 'business' ? 'bg-purple-500' :
                        action.category === 'body' ? 'bg-green-500' :
                        action.category === 'balance' ? 'bg-blue-500' :
                        'bg-orange-500'
                      }`} />
                      <span className="text-sm font-medium text-slate-700">{action.title}</span>
                    </div>
                    
                    {action.description && (
                      <p className="text-xs text-slate-600 mb-2">{action.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 capitalize">
                        {getCategoryIcon(action.category)} {action.category}
                      </span>
                      {action.frequency && (
                        <div className="flex items-center space-x-1">
                          <Repeat className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {getFrequencyIcon(action.frequency)} {action.frequency}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h4 className="text-lg font-semibold text-slate-700 mb-2">No Actions Scheduled Today</h4>
                <p className="text-slate-600 mb-4">Start by scheduling some goal actions for today</p>
                <button 
                  onClick={() => onNavigate('calendar')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule Actions</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 12-Week Progress Timeline */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">12-Week Journey Progress</h2>
            <p className="text-slate-600">Week {twelveWeekProgress.weeksPassed + 1} of 12 • {twelveWeekProgress.weeksRemaining} weeks remaining</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">{twelveWeekProgress.progress}%</div>
            <div className="text-slate-500 text-sm">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="w-full bg-slate-200 rounded-full h-4">
            <div 
              className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500 relative"
              style={{ width: `${twelveWeekProgress.progress}%` }}
            >
              {/* Current position indicator */}
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 bg-white border-4 border-purple-600 rounded-full shadow-lg">
                  <div className="w-full h-full bg-purple-600 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Week markers */}
          <div className="flex justify-between mt-2">
            {Array.from({ length: 13 }, (_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${
                  i <= twelveWeekProgress.weeksPassed ? 'bg-purple-600' : 'bg-slate-300'
                }`} />
                <span className="text-xs text-slate-500 mt-1">W{i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="relative">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Milestones & Achievements</h3>
          
          {milestonesTimeline.length > 0 ? (
            <div className="space-y-4">
              {milestonesTimeline.map((milestone) => {
                const position = Math.min(100, Math.max(0, (milestone.daysFromStart / (12 * 7)) * 100));
                const Icon = milestone.icon;
                
                return (
                  <div key={milestone.id} className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-6 w-full h-0.5 bg-slate-200" />
                    
                    {/* Milestone marker */}
                    <div 
                      className="absolute top-3 transform -translate-x-1/2"
                      style={{ left: `${position}%` }}
                    >
                      <div className={`relative ${
                        milestone.completed 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                          : milestone.urgency === 'overdue' 
                          ? 'bg-gradient-to-r from-red-400 to-red-500'
                          : milestone.urgency === 'urgent'
                          ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                          : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      } w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white`}>
                        {milestone.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <Icon className="w-6 h-6 text-white" />
                        )}
                        
                        {/* Celebration sparkles for completed milestones */}
                        {milestone.completed && (
                          <>
                            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-bounce" />
                            <Sparkles className="absolute -bottom-1 -left-1 w-3 h-3 text-yellow-400 animate-pulse" />
                          </>
                        )}
                      </div>
                      
                      {/* Milestone info */}
                      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-slate-200 p-3 min-w-48 z-10">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(milestone.category)} bg-opacity-20`}>
                            {milestone.category}
                          </span>
                          {milestone.completed && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              ✓ Complete
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">{milestone.title}</h4>
                        <p className="text-xs text-slate-600">
                          {milestone.completed 
                            ? `Completed ${formatDate(milestone.completedDate || milestone.dueDate)}`
                            : `Due ${formatDate(milestone.dueDate)}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Flag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No milestones set yet</p>
              <p className="text-sm">Create goals to see your milestone timeline</p>
            </div>
          )}
        </div>
      </div>

      {/* Life Balance Overview */}
      {wheelData && wheelData.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Life Balance Overview</h2>
              <p className="text-slate-600">Current satisfaction across life areas</p>
            </div>
            <button 
              onClick={() => onNavigate('wheel')}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Update Scores</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wheelData.map((area) => (
              <div key={area.area} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: area.color }}
                  />
                  <h3 className="font-semibold text-slate-900 text-sm">{area.area}</h3>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-slate-900">{area.score}/10</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    area.score >= 8 ? 'bg-green-100 text-green-700' :
                    area.score >= 6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {area.score >= 8 ? 'Strong' : area.score >= 6 ? 'Good' : 'Focus'}
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${area.score * 10}%`,
                      backgroundColor: area.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate('wheel')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <BarChart3 className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-900">Rate Life Areas</span>
          </button>
          
          <button 
            onClick={() => onNavigate('goals')}
            className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
          >
            <Target className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-900">Set New Goal</span>
          </button>
          
          <button 
            onClick={() => onNavigate('calendar')}
            className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors group"
          >
            <CalendarIcon className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-900">Schedule Actions</span>
          </button>
          
          <button 
            onClick={() => onNavigate('vision')}
            className="flex flex-col items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors group"
          >
            <ImageIcon className="w-6 h-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-slate-900">Update Vision</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;