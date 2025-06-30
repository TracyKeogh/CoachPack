import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { 
  Target, ArrowLeft, ArrowRight, Check, Sparkles, Calendar as CalendarIcon, 
  Plus, Minus, Link, TrendingUp, Clock, Repeat, CheckSquare, 
  Flag, CheckCircle2, Circle, Star, Award, Zap, BarChart3, Heart, X
} from 'lucide-react';
import { useGoalSettingData } from '../hooks/useGoalSettingData';
import { useWheelData } from '../hooks/useWheelData';
import { 
  GOAL_CATEGORIES, getTwelveWeeksFromNow, getMilestoneDueDates, 
  DAYS_OF_WEEK, ActionItem, Milestone 
} from '../types/goals';

interface DraggableLifeAreaProps {
  area: {
    area: string;
    score: number;
    color: string;
    improvement: number;
  };
  onRemove: () => void;
}

const DraggableLifeArea: React.FC<DraggableLifeAreaProps> = ({ area, onRemove }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'life-area',
    item: { area },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-move transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-sm'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: area.color }}
        />
        <span className="font-medium text-slate-900">{area.area}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-slate-600">{area.score}/10</span>
        <span className="text-sm font-medium text-green-600">+{area.improvement}</span>
        <button
          onClick={onRemove}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface DroppableGoalSegmentProps {
  category: string;
  categoryInfo: any;
  goal: string;
  onGoalChange: (goal: string) => void;
  lifeAreas: any[];
  onDropLifeArea: (area: any) => void;
  onRemoveLifeArea: (areaName: string) => void;
}

const DroppableGoalSegment: React.FC<DroppableGoalSegmentProps> = ({
  category,
  categoryInfo,
  goal,
  onGoalChange,
  lifeAreas,
  onDropLifeArea,
  onRemoveLifeArea
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'life-area',
    drop: (item: { area: any }) => onDropLifeArea(item.area),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all ${
        isOver ? 'border-purple-300 bg-purple-50' : 'border-slate-200'
      }`}
    >
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
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          placeholder={categoryInfo.examples[0]}
          className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={3}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-medium text-slate-700">Connected Life Areas</h4>
          </div>
          <span className="text-xs text-slate-500">{lifeAreas.length} areas</span>
        </div>
        
        <div className="space-y-2 min-h-[100px]">
          {lifeAreas.map((area, index) => (
            <DraggableLifeArea
              key={`${area.area}-${index}`}
              area={area}
              onRemove={() => onRemoveLifeArea(area.area)}
            />
          ))}
          
          {lifeAreas.length === 0 && (
            <div className="flex items-center justify-center h-20 border-2 border-dashed border-slate-200 rounded-lg text-slate-500">
              <span className="text-sm">Drag life areas here</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Goals: React.FC = () => {
  const { data: goalData } = useGoalSettingData();
  const { data: wheelData } = useWheelData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'monthly'>('monthly');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventDate, setNewEventDate] = useState<string>('');
  
  // Initialize life areas for each category
  const [categoryLifeAreas, setCategoryLifeAreas] = useState<Record<string, any[]>>(() => {
    const initialAreas: Record<string, any[]> = {};
    
    if (wheelData && wheelData.length > 0) {
      Object.entries(GOAL_CATEGORIES).forEach(([category, categoryInfo]) => {
        initialAreas[category] = wheelData
          .filter(area => categoryInfo.wheelAreas.includes(area.area))
          .map(area => ({
            ...area,
            improvement: Math.max(1, Math.floor(Math.random() * 3) + 1) // Random improvement 1-3
          }));
      });
    }
    
    return initialAreas;
  });

  const [goals, setGoals] = useState<Record<string, string>>({
    business: '',
    body: '',
    balance: ''
  });

  const handleGoalChange = (category: string, goal: string) => {
    setGoals(prev => ({ ...prev, [category]: goal }));
  };

  const handleDropLifeArea = (category: string, area: any) => {
    // Remove from other categories
    setCategoryLifeAreas(prev => {
      const newAreas = { ...prev };
      Object.keys(newAreas).forEach(cat => {
        newAreas[cat] = newAreas[cat].filter(a => a.area !== area.area);
      });
      // Add to target category
      newAreas[category] = [...(newAreas[category] || []), area];
      return newAreas;
    });
  };

  const handleRemoveLifeArea = (category: string, areaName: string) => {
    setCategoryLifeAreas(prev => ({
      ...prev,
      [category]: prev[category].filter(area => area.area !== areaName)
    }));
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
        {Object.entries(GOAL_CATEGORIES).map(([category, categoryInfo]) => (
          <DroppableGoalSegment
            key={category}
            category={category}
            categoryInfo={categoryInfo}
            goal={goals[category] || ''}
            onGoalChange={(goal) => handleGoalChange(category, goal)}
            lifeAreas={categoryLifeAreas[category] || []}
            onDropLifeArea={(area) => handleDropLifeArea(category, area)}
            onRemoveLifeArea={(areaName) => handleRemoveLifeArea(category, areaName)}
          />
        ))}
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
                    <Heart className="w-4 h-4 text-red-500" />
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