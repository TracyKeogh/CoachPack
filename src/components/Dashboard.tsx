import React from 'react';
import { 
  BarChart3, 
  Heart, 
  ImageIcon, 
  Target,
  Calendar as CalendarIcon,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Star,
  Zap,
  Eye,
  Compass
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
  const coreValues = valuesData.rankedCoreValues.slice(0, 6);
  const supportingValues = valuesData.supportingValues.slice(0, 3);

  // Get wheel areas
  const wheelAreas = wheelData || [];
  
  // Get goals
  const activeGoals = Object.values(goalsData.categoryGoals)
    .filter(goal => goal.goal && goal.goal.trim() !== '');

  // Get today's date
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const todayFormatted = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

  // Get a focus for today based on goals
  const todaysFocus = activeGoals.length > 0 
    ? activeGoals[0].goal 
    : "Align your actions with your values";

  // Value emojis/icons mapping
  const valueIcons: Record<string, string> = {
    'Vitality': '⚡',
    'Growth': '🌱',
    'Connection': '🔗',
    'Purpose': '🎯',
    'Freedom': '🕊️',
    'Excellence': '✨',
    'Creativity': '🎨',
    'Adventure': '🧭',
    'Peace': '☮️',
    'Health': '💪',
    'Love': '❤️',
    'Family': '👨‍👩‍👧‍👦',
    'Balance': '⚖️',
    'Wisdom': '🧠',
    'Integrity': '🛡️',
    'Courage': '🦁',
    'Gratitude': '🙏',
    'Joy': '😊'
  };

  // Get icon for value
  const getValueIcon = (valueName: string) => {
    return valueIcons[valueName] || '💎';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">CoachPack Dashboard</h1>
            <p className="text-purple-100">Your journey from values to daily action</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-purple-100">Today's Focus</p>
            <p className="text-xl font-semibold">{todaysFocus}</p>
          </div>
        </div>
      </div>

      {/* Vision Section - Starting with the big picture */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <Eye className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Your Vision</h2>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-6">
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
        
        {visionItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {visionItems.slice(0, 4).map(item => (
              <div key={item.id} className="relative group overflow-hidden rounded-lg h-24">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-200">
                  <p className="text-white text-center p-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-center">
          <button
            onClick={() => onNavigate('vision')}
            className="flex items-center space-x-2 px-6 py-3 bg-white text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-semibold"
          >
            <ImageIcon className="w-5 h-5" />
            <span>{visionItems.length > 0 ? 'View Full Vision Board' : 'Create Vision Board'}</span>
          </button>
          </div>
        </div>

      {/* Core Values Section */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold mb-2">Your Core Values</h2>
          <p className="text-red-100">The principles that guide your decisions and actions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {coreValues.length > 0 ? (
            coreValues.map((value) => {
              const definition = valuesData.valueDefinitions[value.id];
              return (
                <div key={value.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl">{getValueIcon(value.name)}</div>
                    <h3 className="text-xl font-bold">{value.name}</h3>
                  </div>
                  {definition?.meaning ? (
                    <p className="text-red-50">{definition.meaning}</p>
                  ) : (
                    <p className="text-red-50">{value.description}</p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-8 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <Heart className="w-12 h-12 mx-auto mb-3 text-white/70" />
              <h3 className="text-xl font-bold mb-2">Discover Your Core Values</h3>
              <p className="text-red-100 mb-4">Identify what truly matters to guide your decisions</p>
              <button 
                onClick={() => onNavigate('values')}
                className="px-6 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
              >
                Start Values Clarification
              </button>
            </div>
          )}
        </div>

        {supportingValues.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <Star className="w-5 h-5 mr-2" /> Supporting Values
            </h3>
            <div className="flex flex-wrap gap-2">
              {supportingValues.map(value => (
                <div key={value.id} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {getValueIcon(value.name)} {value.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-white/10 rounded-lg p-4 border border-white/20">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-sm">
              <span className="font-semibold">Remember:</span> When your actions align with these values, you feel energized and authentic. When they don't, you feel drained or conflicted.
            </p>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-8 h-8 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">12-Week Goals</h2>
            <p className="text-slate-600">Your focused areas for transformation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeGoals.length > 0 ? (
            activeGoals.map((goal, index) => {
              const categoryIcon = goal.category === 'business' ? '💼' : goal.category === 'body' ? '💪' : '⚖️';
              const categoryColor = goal.category === 'business' ? 'from-purple-500 to-purple-600' : 
                                   goal.category === 'body' ? 'from-green-500 to-green-600' : 
                                   'from-blue-500 to-blue-600';
              const progress = Math.floor(Math.random() * 100); // In a real app, calculate actual progress
              
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className={`bg-gradient-to-r ${categoryColor} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{categoryIcon}</span>
                        <h3 className="font-bold">{goal.category === 'business' ? 'Professional' : goal.category === 'body' ? 'Physical' : 'Personal'}</h3>
                      </div>
                      <div className="text-white/90 font-bold">{progress}%</div>
                    </div>
                    <p className="mt-2 font-semibold">{goal.goal}</p>
                  </div>
                  
                  <div className="p-4">
                    {/* Milestone */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-1">90-Day Milestone</p>
                        <p className="text-sm font-medium text-slate-800">{goal.milestones[0].title || "Set your milestone"}</p>
                      </div>
                    )}
                    
                    {/* Weekly Actions */}
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Weekly Actions</p>
                      <div className="space-y-1">
                        {goal.actions.slice(0, 3).map((action, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            <p className="text-sm text-slate-700">{action.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Connected Values */}
                    <div className="mt-4">
                      <p className="text-xs text-slate-500 mb-2">Connected Values</p>
                      <div className="flex flex-wrap gap-1">
                        {['Vitality', 'Excellence', 'Growth'].slice(0, 2 + index % 2).map((value, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
              <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Set Your 12-Week Goals</h3>
              <p className="text-slate-600 mb-4">Transform your values and life assessment into focused goals</p>
              <button 
                onClick={() => onNavigate('goals')}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
              >
                Create Your Goals
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Life Areas Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-purple-200">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Life Areas</h2>
            <p className="text-slate-600">Your current satisfaction across key life domains</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {wheelAreas.length > 0 ? (
            <>
              <svg width="400" height="400" viewBox="0 0 600 600" className="mb-4">
                {/* Background rings */}
                {Array.from({ length: 10 }, (_, ringIndex) => {
                  const ring = ringIndex + 1;
                  const centerX = 300;
                  const centerY = 300;
                  const maxRadius = 180;
                  const minRadius = 20;
                  const innerRadius = minRadius + (ringIndex * (maxRadius - minRadius)) / 10;
                  const outerRadius = minRadius + ((ringIndex + 1) * (maxRadius - minRadius)) / 10;
                  const segmentCount = wheelAreas.length;
                  const anglePerSegment = segmentCount > 0 ? (2 * Math.PI) / segmentCount : 0;
                  
                  return (
                    <g key={`ring-${ring}`}>
                      {wheelAreas.map((segment, segmentIndex) => {
                        const isScored = segment.score >= ring;
                        
                        // Create segment path
                        const startAngle = segmentIndex * anglePerSegment - Math.PI / 2;
                        const endAngle = (segmentIndex + 1) * anglePerSegment - Math.PI / 2;
                        
                        const x1 = centerX + innerRadius * Math.cos(startAngle);
                        const y1 = centerY + innerRadius * Math.sin(startAngle);
                        const x2 = centerX + outerRadius * Math.cos(startAngle);
                        const y2 = centerY + outerRadius * Math.sin(startAngle);
                        
                        const x3 = centerX + outerRadius * Math.cos(endAngle);
                        const y3 = centerY + outerRadius * Math.sin(endAngle);
                        const x4 = centerX + innerRadius * Math.cos(endAngle);
                        const y4 = centerY + innerRadius * Math.sin(endAngle);
                        
                        const largeArcFlag = anglePerSegment > Math.PI ? 1 : 0;
                        
                        const path = `
                          M ${x1} ${y1}
                          L ${x2} ${y2}
                          A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
                          L ${x4} ${y4}
                          A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
                          Z
                        `;
                        
                        let fillColor = '#f8fafc';
                        let opacity = 0.3;
                        let strokeColor = '#e2e8f0';
                        let strokeWidth = 1;
                        
                        if (isScored) {
                          fillColor = segment.color;
                          opacity = 0.4 + (ring / 10) * 0.5;
                          strokeColor = segment.color;
                          strokeWidth = 2;
                        }
                        
                        return (
                          <path
                            key={`segment-${segmentIndex}-ring-${ring}`}
                            d={path}
                            fill={fillColor}
                            fillOpacity={opacity}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Center circle */}
                <circle
                  cx={300}
                  cy={300}
                  r={20}
                  fill="white"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                />
                <text
                  x={300}
                  y={297}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-bold fill-slate-900"
                >
                  {wheelAreas.length > 0 ? 
                    (wheelAreas.reduce((sum, area) => sum + area.score, 0) / wheelAreas.length).toFixed(1) : 
                    '-'}
                </text>
                <text
                  x={300}
                  y={308}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-slate-600"
                >
                  Avg
                </text>

                {/* Labels */}
                {wheelAreas.map((segment, index) => {
                  const segmentCount = wheelAreas.length;
                  const anglePerSegment = (2 * Math.PI) / segmentCount;
                  const angle = (index + 0.5) * anglePerSegment - Math.PI / 2;
                  const labelRadius = 230;
                  const x = 300 + labelRadius * Math.cos(angle);
                  const y = 300 + labelRadius * Math.sin(angle);
                  
                  let textAnchor = 'middle';
                  if (Math.cos(angle) > 0.3) textAnchor = 'start';
                  else if (Math.cos(angle) < -0.3) textAnchor = 'end';
                  
                  return (
                    <g key={`label-${index}`}>
                      <text
                        x={x}
                        y={y}
                        textAnchor={textAnchor}
                        dominantBaseline="middle"
                        className="text-sm font-bold"
                        fill="white"
                        stroke="white"
                        strokeWidth="3"
                      >
                        {segment.area}
                      </text>
                      <text
                        x={x}
                        y={y}
                        textAnchor={textAnchor}
                        dominantBaseline="middle"
                        className="text-sm font-bold"
                        fill={segment.darkColor}
                      >
                        {segment.area}
                      </text>
                      
                      <text
                        x={x}
                        y={y + 16}
                        textAnchor={textAnchor}
                        dominantBaseline="middle"
                        className="text-xs"
                        fill={segment.color}
                      >
                        {segment.score}/10
                      </text>
                    </g>
                  );
                })}
              </svg>
              
              <button 
                onClick={() => onNavigate('wheel')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Update Your Wheel
              </button>
            </>
          ) : (
            <div className="col-span-4 text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Assess Your Life Balance</h3>
              <p className="text-slate-600 mb-4">Rate your satisfaction across 8 key life areas</p>
              <button 
                onClick={() => onNavigate('wheel')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Complete Wheel Assessment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Daily Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Daily Actions</h2>
            <p className="text-slate-600">{todayFormatted}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" /> Today's Schedule
            </h3>
            
            <div className="space-y-3">
              {activeGoals.length > 0 ? (
                activeGoals.flatMap(goal => 
                  goal.actions.slice(0, 2).map((action, i) => (
                    <div key={`${goal.category}-${i}`} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                        style={{ 
                          backgroundColor: goal.category === 'business' ? '#e0e7ff' : 
                                          goal.category === 'body' ? '#dcfce7' : '#dbeafe',
                          color: goal.category === 'business' ? '#4f46e5' : 
                                goal.category === 'body' ? '#16a34a' : '#2563eb'
                        }}>
                        {goal.category === 'business' ? '💼' : goal.category === 'body' ? '💪' : '⚖️'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{action.text}</p>
                        <p className="text-xs text-slate-500">
                          {action.frequency === 'daily' ? 'Daily' : 
                           action.frequency === 'weekly' ? 'Weekly' : 
                           'Multiple times per week'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs text-blue-600 font-medium">
                          {goal.category === 'business' ? 'Professional' : 
                           goal.category === 'body' ? 'Physical' : 'Personal'}
                        </span>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500">Schedule actions from your goals</p>
                  <button 
                    onClick={() => onNavigate('calendar')}
                    className="mt-2 text-blue-600 font-medium hover:text-blue-700"
                  >
                    Open Calendar →
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <Compass className="w-5 h-5 mr-2 text-purple-600" /> Value Alignment
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900">Values in Action Today</h4>
                  <div className="text-purple-600 font-bold">
                    {coreValues.length > 0 ? `${Math.min(3, coreValues.length)}/${coreValues.length}` : '0/0'}
                  </div>
                </div>
                
                {coreValues.length > 0 ? (
                  <div className="space-y-2">
                    {coreValues.slice(0, 3).map(value => (
                      <div key={value.id} className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                          {getValueIcon(value.name)}
                        </div>
                        <span className="text-sm text-slate-700">{value.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Complete your values clarification</p>
                )}
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Daily Reflection</h4>
                <p className="text-sm text-purple-700">
                  Take a moment to reflect on how today's actions aligned with your core values.
                </p>
                <button 
                  onClick={() => onNavigate('wheel')}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Start Reflection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Navigation */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-teal-600">
              <Eye className="w-5 h-5" />
              <span className="font-medium">Vision</span>
            </div>
            <div className="text-slate-300">→</div>
            <div className="flex items-center space-x-2 text-red-600">
              <Heart className="w-5 h-5" />
              <span className="font-medium">Values</span>
            </div>
            <div className="text-slate-300">→</div>
            <div className="flex items-center space-x-2 text-purple-600">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Life Areas</span>
            </div>
            <div className="text-slate-300">→</div>
            <div className="flex items-center space-x-2 text-orange-600">
              <Target className="w-5 h-5" />
              <span className="font-medium">Goals</span>
            </div>
            <div className="text-slate-300">→</div>
            <div className="flex items-center space-x-2 text-blue-600">
              <CalendarIcon className="w-5 h-5" />
              <span className="font-medium">Daily Actions</span>
            </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-teal-600 mb-1">
              {visionItems.length}
            </div>
            <p className="text-slate-600">Vision Items</p>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-red-600 mb-1">
              {coreValues.length > 0 ? coreValues.length : 0}
            </div>
            <p className="text-slate-600">Core Values</p>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {activeGoals.length}
            </div>
            <p className="text-slate-600">Active Goals</p>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {wheelAreas.length > 0 ? 
                (wheelAreas.reduce((sum, area) => sum + area.score, 0) / wheelAreas.length).toFixed(1) : 
                '-'}
            </div>
            <p className="text-slate-600">Life Balance Score</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-4">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Your goals connect to {coreValues.length > 0 ? '83%' : '0%'} of your core values</h3>
              <p className="text-sm text-slate-600">
                {coreValues.length > 0 ? 
                  'Great alignment! Your actions are supporting what matters most to you.' : 
                  'Complete your values clarification to see alignment'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;