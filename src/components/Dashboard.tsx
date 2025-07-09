import React from 'react';
import { 
  BarChart3, 
  Heart, 
  ImageIcon, 
  Target, 
  Calendar as CalendarIcon,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import type { ViewType } from '../App';
import { useValuesData } from '../hooks/useValuesData';
import { useWheelData } from '../hooks/useWheelData';
import { useVisionBoardData } from '../hooks/useVisionBoardData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // Load real data from hooks
  const { data: valuesData } = useValuesData();
  const { data: wheelData, reflectionData } = useWheelData();
  const { visionItems } = useVisionBoardData();
  const { data: goalsData } = useGoalSettingData();

  // Get top values
  const topValues = valuesData.rankedCoreValues.slice(0, 3);

  // Get wheel areas that need attention
  const lowScoreAreas = wheelData?.filter(area => area.score <= 5) || [];

  // Get vision items
  const visionHighlights = visionItems.slice(0, 4);
  
  // Get goals
  const activeGoals = Object.values(goalsData.categoryGoals)
    .filter(goal => goal.goal && goal.goal.trim() !== '');

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Your Intentional Living Dashboard
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          From core values to daily actions - your complete journey at a glance
        </p>
      </div>

      {/* Core Values Section */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="w-8 h-8 text-red-600" />
          <h2 className="text-2xl font-bold text-slate-900">Your Core Values</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {topValues.length > 0 ? (
            topValues.map((value, index) => (
              <div key={value.id} className="bg-white rounded-lg p-4 shadow-sm border border-red-100">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-slate-900">{value.name}</h3>
                </div>
                <p className="text-sm text-slate-600">{value.description}</p>
                {valuesData.valueDefinitions[value.id]?.meaning && (
                  <div className="mt-2 text-xs text-red-700 bg-red-50 p-2 rounded">
                    "{valuesData.valueDefinitions[value.id]?.meaning}"
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-6 bg-white rounded-lg border border-red-100">
              <Heart className="w-8 h-8 mx-auto mb-2 text-red-300" />
              <p className="text-slate-600">Discover your core values to see them here</p>
              <button 
                onClick={() => onNavigate('values')}
                className="mt-2 text-red-600 font-medium hover:text-red-700"
              >
                Start Values Clarification →
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={() => onNavigate('values')}
          className="w-full flex items-center justify-center space-x-2 p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          <span>View All Values</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Wheel of Life Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-slate-900">Life Balance Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
            <h3 className="font-semibold text-slate-900 mb-3">Current Balance</h3>
            {wheelData && wheelData.length > 0 ? (
              <div className="space-y-3">
                {wheelData.map(area => (
                  <div key={area.area} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                      <span className="text-sm text-slate-700">{area.area}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-100 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ width: `${area.score * 10}%`, backgroundColor: area.color }}
                        />
                      </div>
                      <span className="text-sm font-medium" style={{ color: area.color }}>{area.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-600">Complete your wheel assessment</p>
                <button 
                  onClick={() => onNavigate('wheel')}
                  className="mt-2 text-purple-600 font-medium hover:text-purple-700"
                >
                  Start Assessment →
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
            <h3 className="font-semibold text-slate-900 mb-3">Focus Areas</h3>
            {lowScoreAreas.length > 0 ? (
              <div className="space-y-3">
                {lowScoreAreas.slice(0, 3).map(area => {
                  const areaReflection = reflectionData[wheelData.findIndex(a => a.area === area.area)];
                  return (
                    <div key={area.area} className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                        <span className="font-medium text-slate-900">{area.area}: {area.score}/10</span>
                      </div>
                      {areaReflection?.idealVision ? (
                        <p className="text-xs text-purple-700 italic">"{areaReflection.idealVision.substring(0, 100)}..."</p>
                      ) : (
                        <p className="text-xs text-slate-600">Add reflection to see your vision for this area</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-green-600">All areas are above 5/10! 🎉</p>
                <p className="text-sm text-slate-600 mt-1">Great job maintaining balance</p>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onNavigate('wheel')}
          className="w-full flex items-center justify-center space-x-2 p-2 mt-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          <span>Update Life Wheel</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Vision Board Preview */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200">
        <div className="flex items-center space-x-3 mb-4">
          <ImageIcon className="w-8 h-8 text-teal-600" />
          <h2 className="text-2xl font-bold text-slate-900">Vision Board</h2>
        </div>
        
        {visionHighlights.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {visionHighlights.map(item => (
              <div key={item.id} className="group relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-lg shadow-sm"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center rounded-lg transition-all duration-200">
                  <div className="text-white text-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="font-medium text-sm">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-white rounded-lg border border-teal-100 mb-4">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-teal-300" />
            <p className="text-slate-600">Create your vision board to see it here</p>
            <button 
              onClick={() => onNavigate('vision')}
              className="mt-2 text-teal-600 font-medium hover:text-teal-700"
            >
              Start Vision Board →
            </button>
          </div>
        )}
        
        <button
          onClick={() => onNavigate('vision')}
          className="w-full flex items-center justify-center space-x-2 p-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
        >
          <span>View Full Vision Board</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Goals & Actions */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold text-slate-900">Goals & Actions</h2>
        </div>
        
        {activeGoals.length > 0 ? (
          <div className="space-y-4 mb-4">
            {activeGoals.map((goal, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                    {goal.category === 'business' ? '💼' : goal.category === 'body' ? '💪' : '⚖️'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{goal.goal}</h3>
                    
                    {goal.actions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 mb-1">Key Actions:</p>
                        <div className="space-y-1">
                          {goal.actions.slice(0, 2).map((action, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                              <p className="text-sm text-slate-700">{action.text}</p>
                            </div>
                          ))}
                          {goal.actions.length > 2 && (
                            <p className="text-xs text-orange-600">+{goal.actions.length - 2} more actions</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-white rounded-lg border border-orange-100 mb-4">
            <Target className="w-8 h-8 mx-auto mb-2 text-orange-300" />
            <p className="text-slate-600">Set your 12-week goals to see them here</p>
            <button 
              onClick={() => onNavigate('goals')}
              className="mt-2 text-orange-600 font-medium hover:text-orange-700"
            >
              Start Goal Setting →
            </button>
          </div>
        )}
        
        <button
          onClick={() => onNavigate('goals')}
          className="w-full flex items-center justify-center space-x-2 p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
        >
          <span>View All Goals</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Calendar Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Action Calendar</h2>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 mb-4">
          <h3 className="font-semibold text-slate-900 mb-3">This Week's Focus</h3>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }, (_, i) => {
              const isToday = i === new Date().getDay();
              return (
                <div 
                  key={i} 
                  className={`h-12 border rounded p-1 text-xs ${
                    isToday ? 'bg-blue-50 border-blue-300' : 'border-slate-200'
                  }`}
                >
                  <div className="font-medium mb-1">{new Date().getDate() - new Date().getDay() + i}</div>
                  {i % 2 === 0 && (
                    <div className="bg-blue-100 text-blue-800 px-1 rounded text-[10px] truncate">Action</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <button
          onClick={() => onNavigate('calendar')}
          className="w-full flex items-center justify-center space-x-2 p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <span>View Full Calendar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Annual Vision */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Your Annual Vision</h2>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 border border-white/20 mb-4">
          <p className="text-lg italic text-white/90">
            {goalsData.annualSnapshot?.snapshot || 
              "I feel energized and healthy. My career is thriving with new opportunities and growth. My relationships are deep and fulfilling, and I'm living with purpose and joy every day."}
          </p>
          
          {goalsData.annualSnapshot?.mantra && (
            <div className="mt-3 text-center">
              <p className="text-sm text-white/70">Personal Mantra</p>
              <p className="text-white font-medium">{goalsData.annualSnapshot.mantra}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => onNavigate('goals')}
          className="w-full flex items-center justify-center space-x-2 p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
        >
          <span>Update Vision</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;