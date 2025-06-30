import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize,
  BarChart3,
  Heart,
  ImageIcon,
  Target,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';

interface InteractiveDemoVideoProps {
  autoPlay?: boolean;
  onComplete?: () => void;
  showControls?: boolean;
}

const InteractiveDemoVideo: React.FC<InteractiveDemoVideoProps> = ({ 
  autoPlay = false, 
  onComplete,
  showControls = true 
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const duration = 45; // 45 seconds total

  // Demo scenes with timing
  const scenes = [
    {
      id: 'intro',
      title: 'Welcome to Coach Pack',
      subtitle: 'Intentional Living Made Actionable',
      duration: 5,
      content: 'intro'
    },
    {
      id: 'wheel',
      title: 'Wheel of Life Assessment',
      subtitle: 'See where you stand across 8 life areas',
      duration: 8,
      content: 'wheel'
    },
    {
      id: 'values',
      title: 'Values Clarification',
      subtitle: 'Discover what truly matters to you',
      duration: 7,
      content: 'values'
    },
    {
      id: 'vision',
      title: 'Vision Board Creation',
      subtitle: 'Visualize your goals and dreams',
      duration: 8,
      content: 'vision'
    },
    {
      id: 'goals',
      title: '12-Week Goal Framework',
      subtitle: 'Turn insights into actionable plans',
      duration: 7,
      content: 'goals'
    },
    {
      id: 'calendar',
      title: 'Action Calendar',
      subtitle: 'Schedule time for what matters most',
      duration: 6,
      content: 'calendar'
    },
    {
      id: 'results',
      title: 'Transform Your Life',
      subtitle: 'Join thousands creating lasting change',
      duration: 4,
      content: 'results'
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            setIsPlaying(false);
            onComplete?.();
            return duration;
          }
          
          // Update current scene based on time
          let accumulatedTime = 0;
          for (let i = 0; i < scenes.length; i++) {
            accumulatedTime += scenes[i].duration;
            if (newTime <= accumulatedTime) {
              setCurrentScene(i);
              break;
            }
          }
          
          return newTime;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, onComplete, scenes]);

  const togglePlay = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
      setCurrentScene(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    setCurrentTime(newTime);
    
    // Update scene based on new time
    let accumulatedTime = 0;
    for (let i = 0; i < scenes.length; i++) {
      accumulatedTime += scenes[i].duration;
      if (newTime <= accumulatedTime) {
        setCurrentScene(i);
        break;
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentSceneData = scenes[currentScene];
  const progress = currentTime / duration;

  // Scene-specific content renderers
  const renderIntroScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="text-center text-white z-10">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="relative">
            <Target className="w-16 h-16 text-white" />
            <Sparkles className="w-8 h-8 text-orange-400 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <div>
            <h1 className="text-6xl font-bold mb-2">Coach Pack</h1>
            <p className="text-2xl text-purple-200">Intentional Living Made Actionable</p>
          </div>
        </div>
        
        <div className="space-y-4 max-w-2xl mx-auto">
          <p className="text-xl text-purple-100">
            Transform your life with proven self-coaching tools
          </p>
          <div className="flex items-center justify-center space-x-8 text-purple-200">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>1,000+ users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span>4.9/5 rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWheelScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl w-full">
        {/* Interactive Wheel Mockup */}
        <div className="flex flex-col items-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Interactive Life Assessment</h3>
          <div className="relative">
            {/* Simplified wheel visualization */}
            <svg width="300" height="300" viewBox="0 0 300 300" className="transform rotate-12 hover:rotate-0 transition-transform duration-1000">
              {/* Wheel segments */}
              {Array.from({ length: 8 }, (_, i) => {
                const angle = (i * 45) - 90;
                const score = [7, 6, 8, 9, 5, 8, 6, 7][i];
                const maxRadius = 120;
                const minRadius = 20;
                const segmentRadius = minRadius + (score / 10) * (maxRadius - minRadius);
                
                return (
                  <g key={i}>
                    <path
                      d={`M 150 150 L ${150 + segmentRadius * Math.cos(angle * Math.PI / 180)} ${150 + segmentRadius * Math.sin(angle * Math.PI / 180)} A ${segmentRadius} ${segmentRadius} 0 0 1 ${150 + segmentRadius * Math.cos((angle + 45) * Math.PI / 180)} ${150 + segmentRadius * Math.sin((angle + 45) * Math.PI / 180)} Z`}
                      fill={['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316'][i]}
                      fillOpacity="0.7"
                      stroke="white"
                      strokeWidth="2"
                      className="hover:fill-opacity-90 transition-all duration-300"
                    />
                  </g>
                );
              })}
              <circle cx="150" cy="150" r="15" fill="white" stroke="#8B5CF6" strokeWidth="2" />
              <text x="150" y="155" textAnchor="middle" className="text-sm font-bold fill-slate-900">7.1</text>
            </svg>
            
            {/* Floating score indicators */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
              Health: 8/10
            </div>
            <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce" style={{ animationDelay: '0.5s' }}>
              Career: 7/10
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-purple-200 transform hover:scale-105 transition-transform">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <h4 className="font-semibold text-slate-900">Click to Rate</h4>
                <p className="text-slate-600 text-sm">Interactive wheel responds to your clicks</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-green-200 transform hover:scale-105 transition-transform">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-semibold text-slate-900">Instant Insights</h4>
                <p className="text-slate-600 text-sm">See your life balance at a glance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-blue-200 transform hover:scale-105 transition-transform">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-semibold text-slate-900">Deep Reflection</h4>
                <p className="text-slate-600 text-sm">Guided questions for each life area</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderValuesScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Discover Your Core Values</h3>
          <p className="text-xl text-slate-600">Guided process to clarify what truly matters</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-red-600 font-bold text-xl">1</span>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2 text-center">Reflect</h4>
            <p className="text-slate-600 text-sm text-center">Share meaningful moments and experiences</p>
            <div className="mt-4 space-y-2">
              {['Courage', 'Growth', 'Kindness'].map((theme, i) => (
                <div key={theme} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs text-center">
                  {theme}
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-red-600 font-bold text-xl">2</span>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2 text-center">Select</h4>
            <p className="text-slate-600 text-sm text-center">Choose 12 values from curated categories</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {['Excellence', 'Love', 'Freedom', 'Growth'].map((value, i) => (
                <div key={value} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs text-center font-medium">
                  {value}
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-red-600 font-bold text-xl">3</span>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2 text-center">Prioritize</h4>
            <p className="text-slate-600 text-sm text-center">Rank your top 6 core values</p>
            <div className="mt-4 space-y-1">
              {['Excellence', 'Growth', 'Love'].map((value, i) => (
                <div key={value} className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-slate-700 text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVisionScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <ImageIcon className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Create Your Vision Board</h3>
          <p className="text-xl text-slate-600">Visual goals across four life quadrants</p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Business Quadrant */}
          <div className="bg-purple-50 border-2 border-dashed border-purple-300 rounded-2xl p-6 min-h-48">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">💼</span>
              <h4 className="text-lg font-semibold text-purple-900">Business & Career</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="w-full h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded mb-2"></div>
                <p className="text-xs font-medium text-slate-700">Dream Office</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="w-full h-16 bg-gradient-to-r from-green-400 to-green-600 rounded mb-2"></div>
                <p className="text-xs font-medium text-slate-700">Financial Freedom</p>
              </div>
            </div>
          </div>

          {/* Health Quadrant */}
          <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-2xl p-6 min-h-48">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">💪</span>
              <h4 className="text-lg font-semibold text-green-900">Health & Body</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="w-full h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded mb-2"></div>
                <p className="text-xs font-medium text-slate-700">Marathon Goal</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="w-full h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded mb-2"></div>
                <p className="text-xs font-medium text-slate-700">Yoga Practice</p>
              </div>
            </div>
          </div>

          {/* Balance Quadrant */}
          <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-6 min-h-48">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">⚖️</span>
              <h4 className="text-lg font-semibold text-blue-900">Life Balance</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="w-full h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded mb-2"></div>
                <p className="text-xs font-medium text-slate-700">Family Time</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="w-full h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded mb-2"></div>
                <p className="text-xs font-medium text-slate-700">Travel Dreams</p>
              </div>
            </div>
          </div>

          {/* Emotions Quadrant */}
          <div className="bg-pink-50 border-2 border-dashed border-pink-300 rounded-2xl p-6 min-h-48">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">❤️</span>
              <h4 className="text-lg font-semibold text-pink-900">Emotions & Growth</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="w-full h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded mb-2"></div>
                <p className="text-xs font-medium text-slate-700">Inner Peace</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="w-full h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded mb-2"></div>
                <p className="text-xs font-medium text-slate-700">Joy & Gratitude</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoalsScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <Target className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-slate-900 mb-2">12-Week Goal Framework</h3>
          <p className="text-xl text-slate-600">Transform insights into actionable plans</p>
        </div>
        
        <div className="space-y-6">
          {/* Goal Hierarchy Visualization */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Annual Vision</h4>
                <p className="text-sm text-slate-600">Your big picture dream</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">12-Week Goals</h4>
                <p className="text-sm text-slate-600">Quarterly milestones</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Weekly Actions</h4>
                <p className="text-sm text-slate-600">Specific tasks</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Daily Schedule</h4>
                <p className="text-sm text-slate-600">Time blocks</p>
              </div>
            </div>
          </div>

          {/* Sample Goal Card */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
            <h4 className="text-xl font-bold mb-2">Sample 12-Week Goal</h4>
            <p className="text-orange-100 mb-4">"Improve my health and fitness to feel more energetic and confident"</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/20 rounded-lg p-3">
                <h5 className="font-semibold mb-2">Connected Values</h5>
                <div className="space-y-1">
                  <span className="bg-white/30 px-2 py-1 rounded text-xs">Health</span>
                  <span className="bg-white/30 px-2 py-1 rounded text-xs">Vitality</span>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <h5 className="font-semibold mb-2">Life Areas</h5>
                <div className="space-y-1">
                  <span className="bg-white/30 px-2 py-1 rounded text-xs">Health: 6→8</span>
                  <span className="bg-white/30 px-2 py-1 rounded text-xs">Energy: 5→8</span>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <h5 className="font-semibold mb-2">Weekly Actions</h5>
                <div className="space-y-1 text-sm">
                  <div>• Gym 3x per week</div>
                  <div>• Meal prep Sundays</div>
                  <div>• 8 hours sleep</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendarScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <Calendar className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Action Calendar</h3>
          <p className="text-xl text-slate-600">Schedule time for what matters most</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-indigo-600 text-white p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold">January 2025</h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">Business</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm">Health</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Balance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-slate-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 6; // Start from previous month
                const isCurrentMonth = day > 0 && day <= 31;
                const hasEvents = isCurrentMonth && [5, 7, 12, 15, 20, 22, 28].includes(day);
                
                return (
                  <div key={i} className={`min-h-20 p-2 border border-slate-100 rounded ${
                    isCurrentMonth ? 'bg-white' : 'bg-slate-50'
                  }`}>
                    {isCurrentMonth && (
                      <>
                        <div className={`text-sm font-medium ${day === 15 ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}>
                          {day}
                        </div>
                        {hasEvents && (
                          <div className="space-y-1 mt-1">
                            {day === 5 && <div className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded text-xs">Team Meeting</div>}
                            {day === 7 && <div className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs">Gym</div>}
                            {day === 12 && <div className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs">Family Time</div>}
                            {day === 15 && (
                              <>
                                <div className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded text-xs">Project Review</div>
                                <div className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs">Workout</div>
                              </>
                            )}
                            {day === 20 && <div className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs">Meal Prep</div>}
                            {day === 22 && <div className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs">Date Night</div>}
                            {day === 28 && <div className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded text-xs">Goal Review</div>}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultsScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-4xl font-bold text-slate-900 mb-4">Transform Your Life</h3>
          <p className="text-xl text-slate-600 mb-8">Join thousands creating lasting change with Coach Pack</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">1,000+</div>
            <div className="text-slate-600">Active Users</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">4.9/5</div>
            <div className="text-slate-600">User Rating</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
            <div className="text-slate-600">Goal Achievement</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h4 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h4>
          <p className="text-purple-100 mb-6">Get clarity on where you stand and create a plan for where you want to go</p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
            Start Free Assessment
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentScene = () => {
    switch (currentSceneData?.content) {
      case 'intro': return renderIntroScene();
      case 'wheel': return renderWheelScene();
      case 'values': return renderValuesScene();
      case 'vision': return renderVisionScene();
      case 'goals': return renderGoalsScene();
      case 'calendar': return renderCalendarScene();
      case 'results': return renderResultsScene();
      default: return renderIntroScene();
    }
  };

  return (
    <div 
      className="relative rounded-xl overflow-hidden shadow-2xl bg-white"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Main content area */}
      <div className="absolute inset-0">
        {renderCurrentScene()}
      </div>

      {/* Scene title overlay */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
        <h3 className="font-semibold">{currentSceneData?.title}</h3>
        <p className="text-sm opacity-90">{currentSceneData?.subtitle}</p>
      </div>

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="group relative"
          >
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-pulse" />
          </button>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            <div className="flex-1">
              <div 
                className="w-full bg-white/20 rounded-full h-2 cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="bg-gradient-to-r from-white to-purple-300 h-2 rounded-full transition-all duration-100 relative"
                  style={{ width: `${progress * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <Volume2 className="w-4 h-4 text-white/80 hover:text-white transition-colors cursor-pointer" />
              <Maximize className="w-4 h-4 text-white/80 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      {/* Scene progress indicator */}
      <div className="absolute top-4 right-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
          Scene {currentScene + 1} of {scenes.length}
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemoVideo;