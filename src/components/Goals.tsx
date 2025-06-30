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
  Circle
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

interface DraggableLifeAreaProps {
  area: any;
  onMove: (areaId: string, targetCategory: string) => void;
  currentCategory?: string;
}

const DraggableLifeArea: React.FC<DraggableLifeAreaProps> = ({ area, onMove, currentCategory }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'life-area',
    item: { id: area.area, type: 'life-area' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getChangeDirection = (score: number) => {
    if (score >= 8) return { symbol: '→', color: 'text-blue-600', label: 'maintain' };
    if (score >= 6) return { symbol: '↗', color: 'text-green-600', label: 'improve' };
    return { symbol: '⬆', color: 'text-orange-600', label: 'focus' };
  };

  const change = getChangeDirection(area.score);

  return (
    <div
      ref={drag}
      className={`flex items-center space-x-2 p-2 rounded-lg border cursor-move transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-sm'
      } bg-white border-slate-200`}
    >
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: area.color }}
      />
      <span className="text-sm font-medium text-slate-900 flex-1">{area.area}</span>
      <span className={`text-lg ${change.color}`}>{change.symbol}</span>
    </div>
  );
};

interface DroppableGoalBoxProps {
  category: string;
  categoryInfo: any;
  areas: any[];
  onDrop: (item: any, category: string) => void;
  onRemoveArea: (areaId: string, category: string) => void;
  goal: string;
  onGoalChange: (category: string, goal: string) => void;
  alignedValues: string[];
}

const DroppableGoalBox: React.FC<DroppableGoalBoxProps> = ({ 
  category, 
  categoryInfo, 
  areas, 
  onDrop, 
  onRemoveArea,
  goal,
  onGoalChange,
  alignedValues
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: ['life-area'],
    drop: (item) => onDrop(item, category),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`p-4 rounded-xl border-2 border-dashed transition-all ${
        isOver ? 'border-purple-400 bg-purple-50' : 'border-slate-300 bg-slate-50'
      }`}
    >
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-2xl">{categoryInfo.icon}</span>
        <h3 className="font-semibold text-slate-900">{categoryInfo.name}</h3>
      </div>
      
      {/* Goal Input */}
      <div className="mb-3">
        <textarea
          value={goal}
          onChange={(e) => onGoalChange(category, e.target.value)}
          placeholder={categoryInfo.examples[0]}
          className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          rows={2}
        />
      </div>

      {/* Aligned Values */}
      {alignedValues.length > 0 && (
        <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-200">
          <div className="text-xs font-medium text-red-800 mb-1">Aligned Values:</div>
          <div className="flex flex-wrap gap-1">
            {alignedValues.map(value => (
              <span key={value} className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {value}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-2 min-h-[100px]">
        {areas.map((area) => (
          <div key={area.area} className="relative group">
            <DraggableLifeArea 
              area={area} 
              onMove={onDrop}
              currentCategory={category}
            />
            <button
              onClick={() => onRemoveArea(area.area, category)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {areas.length === 0 && (
          <div className="text-center py-6 text-slate-500">
            <p className="text-sm">Drag life areas here</p>
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
  
  const [categoryAreas, setCategoryAreas] = useState<Record<string, any[]>>({
    business: [],
    body: [],
    balance: []
  });
  
  const [goals, setGoals] = useState<Record<string, string>>({
    business: '',
    body: '',
    balance: ''
  });

  const [valueAlignments, setValueAlignments] = useState<Record<string, string[]>>({
    business: [],
    body: [],
    balance: []
  });

  const [availableAreas, setAvailableAreas] = useState<any[]>([]);

  // Initialize available areas from wheel data
  React.useEffect(() => {
    if (wheelData && wheelData.length > 0) {
      const usedAreas = Object.values(categoryAreas).flat().map(area => area.area);
      const available = wheelData.filter(area => !usedAreas.includes(area.area));
      setAvailableAreas(available);
    }
  }, [wheelData, categoryAreas]);

  const handleDrop = (item: any, targetCategory: string) => {
    const sourceArea = availableAreas.find(area => area.area === item.id) ||
                      Object.values(categoryAreas).flat().find(area => area.area === item.id);
    
    if (!sourceArea) return;

    // Remove from current category if it exists
    const newCategoryAreas = { ...categoryAreas };
    Object.keys(newCategoryAreas).forEach(category => {
      newCategoryAreas[category] = newCategoryAreas[category].filter(area => area.area !== item.id);
    });

    // Add to target category
    newCategoryAreas[targetCategory] = [...newCategoryAreas[targetCategory], sourceArea];
    
    setCategoryAreas(newCategoryAreas);
  };

  const handleRemoveArea = (areaId: string, category: string) => {
    setCategoryAreas(prev => ({
      ...prev,
      [category]: prev[category].filter(area => area.area !== areaId)
    }));
  };

  const handleGoalChange = (category: string, goal: string) => {
    setGoals(prev => ({
      ...prev,
      [category]: goal
    }));
  };

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

  // Get user's core values from values data
  const userValues = valuesData?.rankedCoreValues?.slice(0, 6) || [];

  const categories = [
    {
      id: 'business',
      ...GOAL_CATEGORIES.business
    },
    {
      id: 'body', 
      ...GOAL_CATEGORIES.body
    },
    {
      id: 'balance',
      ...GOAL_CATEGORIES.balance
    }
  ];

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
      {userValues.length > 0 ? (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200 animate-fadeIn">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            Align Your Goals with Your Values
          </h3>
          <p className="text-red-700 mb-4 text-sm">
            Connect your core values to specific goal categories to ensure authentic motivation and sustainable progress.
          </p>
          
          {/* Values Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {userValues.map((value, index) => {
              const alignmentCount = Object.values(valueAlignments).reduce((count, alignments) => 
                count + (alignments.includes(value.name) ? 1 : 0), 0
              );
              
              return (
                <div key={value.id} className="relative">
                  <div className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-red-900 text-sm">{value.name}</span>
                      {alignmentCount > 0 && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {alignmentCount}
                        </span>
                      )}
                    </div>
                    <p className="text-red-600 text-xs mb-3">{value.description}</p>
                    
                    {/* Category Alignment Buttons */}
                    <div className="flex space-x-1">
                      {categories.map(category => {
                        const isAligned = valueAlignments[category.id]?.includes(value.name);
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleValueAlignment(value.name, category.id)}
                            className={`flex-1 p-1 rounded text-xs font-medium transition-colors ${
                              isAligned 
                                ? 'bg-red-600 text-white' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={`Align with ${category.name}`}
                          >
                            {category.icon}
                            {isAligned && <Check className="w-3 h-3 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Alignment Summary */}
          <div className="grid grid-cols-3 gap-4">
            {categories.map(category => (
              <div key={category.id} className="bg-white rounded-lg p-3 border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium text-red-900 text-sm">{category.name}</span>
                </div>
                <div className="text-red-700 text-xs">
                  {valueAlignments[category.id]?.length || 0} values aligned
                </div>
                {valueAlignments[category.id]?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {valueAlignments[category.id].map(valueName => (
                      <span key={valueName} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                        {valueName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Values Alignment Available</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Complete your Values Clarification to align your goals with your core values for more authentic motivation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Goal Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <DroppableGoalBox
            key={category.id}
            category={category.id}
            categoryInfo={category}
            areas={categoryAreas[category.id] || []}
            onDrop={handleDrop}
            onRemoveArea={handleRemoveArea}
            goal={goals[category.id] || ''}
            onGoalChange={handleGoalChange}
            alignedValues={valueAlignments[category.id] || []}
          />
        ))}
      </div>

      {/* Available Life Areas */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Available Life Areas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableAreas.map((area) => (
            <DraggableLifeArea 
              key={area.area}
              area={area} 
              onMove={handleDrop}
            />
          ))}
        </div>
        {availableAreas.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">All life areas have been assigned to goals</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;