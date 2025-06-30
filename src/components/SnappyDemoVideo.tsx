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
  Star,
  Zap,
  Crown
} from 'lucide-react';

interface SnappyDemoVideoProps {
  autoPlay?: boolean;
  onComplete?: () => void;
  showControls?: boolean;
}

const SnappyDemoVideo: React.FC<SnappyDemoVideoProps> = ({ 
  autoPlay = false, 
  onComplete,
  showControls = true 
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const duration = 30; // 30 seconds - snappy!

  // Demo scenes with precise timing
  const scenes = [
    {
      id: 'intro',
      title: 'Coach Pack',
      subtitle: 'Proven tools. Real clarity.',
      duration: 3,
      content: 'intro'
    },
    {
      id: 'wheel',
      title: 'Wheel of Life',
      subtitle: 'See where you stand',
      duration: 5,
      content: 'wheel'
    },
    {
      id: 'values',
      title: 'Values Clarity',
      subtitle: 'What matters most?',
      duration: 5,
      content: 'values'
    },
    {
      id: 'vision',
      title: 'Vision Board',
      subtitle: 'Picture your goals',
      duration: 5,
      content: 'vision'
    },
    {
      id: 'goals',
      title: '12-Week Goals',
      subtitle: 'Make it happen',
      duration: 5,
      content: 'goals'
    },
    {
      id: 'calendar',
      title: 'Action Calendar',
      subtitle: 'Time for what matters',
      duration: 4,
      content: 'calendar'
    },
    {
      id: 'results',
      title: 'Get Clarity',
      subtitle: 'Start your assessment',
      duration: 3,
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
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="text-center text-white z-10 animate-fadeIn">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="relative">
            <Target className="w-12 h-12 text-white animate-pulse" />
            <Sparkles className="w-6 h-6 text-orange-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div>
            <h1 className="text-5xl font-bold mb-2">Coach Pack</h1>
            <p className="text-xl text-purple-200">Proven tools. Real clarity.</p>
          </div>
        </div>
        
        <div className="text-lg text-purple-100 max-w-md mx-auto">
          Get clarity on where your energy goes
        </div>
      </div>
    </div>
  );

  const renderWheelScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Animated Wheel */}
        <div className="flex flex-col items-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Rate Your Life Areas</h3>
          <div className="relative">
            {/* Simplified animated wheel */}
            <svg width="250" height="250" viewBox="0 0 250 250" className="animate-spin-slow">
              {/* Wheel segments with animation */}
              {Array.from({ length: 8 }, (_, i) => {
                const angle = (i * 45) - 90;
                const score = [7, 6, 8, 9, 5, 8, 6, 7][i];
                const maxRadius = 100;
                const minRadius = 20;
                const segmentRadius = minRadius + (score / 10) * (maxRadius - minRadius);
                const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316'];
                
                return (
                  <g key={i}>
                    <path
                      d={`M 125 125 L ${125 + segmentRadius * Math.cos(angle * Math.PI / 180)} ${125 + segmentRadius * Math.sin(angle * Math.PI / 180)} A ${segmentRadius} ${segmentRadius} 0 0 1 ${125 + segmentRadius * Math.cos((angle + 45) * Math.PI / 180)} ${125 + segmentRadius * Math.sin((angle + 45) * Math.PI / 180)} Z`}
                      fill={colors[i]}
                      fillOpacity="0.8"
                      stroke="white"
                      strokeWidth="2"
                      className="animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  </g>
                );
              })}
              <circle cx="125" cy="125" r="15" fill="white" stroke="#8B5CF6" strokeWidth="2" />
              <text x="125" y="130" textAnchor="middle" className="text-sm font-bold fill-slate-900">7.1</text>
            </svg>
            
            {/* Floating labels */}
            <div className="absolute -top-2 -right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
              Click to rate!
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border border-purple-200 transform hover:scale-105 transition-transform">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <div>
              <h4 className="font-semibold text-slate-900">8 Life Areas</h4>
              <p className="text-slate-600 text-sm">Career, Health, Family & more</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border border-green-200 transform hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-slate-900">Instant Insights</h4>
              <p className="text-slate-600 text-sm">See your balance at a glance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border border-blue-200 transform hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-slate-900">Deep Reflection</h4>
              <p className="text-slate-600 text-sm">What's working? What needs attention?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderValuesScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Discover Your Core Values</h3>
          <p className="text-xl text-slate-600">What truly matters to you?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-transform">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-red-600 font-bold">1</span>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2 text-center">Reflect</h4>
            <p className="text-slate-600 text-sm text-center mb-4">Share meaningful moments</p>
            <div className="space-y-2">
              {['Courage', 'Growth', 'Kindness'].map((theme, i) => (
                <div key={theme} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs text-center animate-fadeIn" style={{ animationDelay: `${i * 0.3}s` }}>
                  {theme}
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-transform">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-red-600 font-bold">2</span>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2 text-center">Select</h4>
            <p className="text-slate-600 text-sm text-center mb-4">Choose 12 from 150+ values</p>
            <div className="grid grid-cols-2 gap-2">
              {['Excellence', 'Love', 'Freedom', 'Growth'].map((value, i) => (
                <div key={value} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs text-center font-medium animate-fadeIn" style={{ animationDelay: `${i * 0.2}s` }}>
                  {value}
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-transform">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-red-600 font-bold">3</span>
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2 text-center">Prioritize</h4>
            <p className="text-slate-600 text-sm text-center mb-4">Rank your top 6</p>
            <div className="space-y-1">
              {['Excellence', 'Growth', 'Love'].map((value, i) => (
                <div key={value} className="flex items-center space-x-2 animate-fadeIn" style={{ animationDelay: `${i * 0.3}s` }}>
                  <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
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
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <ImageIcon className="w-12 h-12 text-teal-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Create Your Vision Board</h3>
          <p className="text-xl text-slate-600">Picture your ideal life</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Business Quadrant */}
          <div className="bg-purple-50 border-2 border-dashed border-purple-300 rounded-2xl p-4 min-h-32 transform hover:scale-105 transition-transform">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">💼</span>
              <h4 className="text-sm font-semibold text-purple-900">Business & Career</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded p-2 shadow-sm animate-fadeIn">
                <div className="w-full h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded mb-1"></div>
                <p className="text-xs font-medium text-slate-700">Dream Office</p>
              </div>
              <div className="bg-white rounded p-2 shadow-sm animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <div className="w-full h-8 bg-gradient-to-r from-green-400 to-green-600 rounded mb-1"></div>
                <p className="text-xs font-medium text-slate-700">Financial Goals</p>
              </div>
            </div>
          </div>

          {/* Health Quadrant */}
          <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-2xl p-4 min-h-32 transform hover:scale-105 transition-transform">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">💪</span>
              <h4 className="text-sm font-semibold text-green-900">Health & Body</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded p-2 shadow-sm animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                <div className="w-full h-8 bg-gradient-to-r from-green-400 to-emerald-600 rounded mb-1"></div>
                <p className="text-xs font-medium text-slate-700">Fitness Goals</p>
              </div>
              <div className="bg-white rounded p-2 shadow-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                <div className="w-full h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded mb-1"></div>
                <p className="text-xs font-medium text-slate-700">Wellness</p>
              </div>
            </div>
          </div>

          {/* Balance Quadrant */}
          <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-4 min-h-32 transform hover:scale-105 transition-transform">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">⚖️</span>
              <h4 className="text-sm font-semibold text-blue-900">Life Balance</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded p-2 shadow-sm animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <div className="w-full h-8 bg-gradient-to-r from-pink-400 to-pink-600 rounded mb-1"></div>
                <p className="text-xs font-medium text-slate-700">Family Time</p>
              </div>
              <div className="bg-white rounded p-2 shadow-sm animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <div className="w-full h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded mb-1"></div>
                <p className="text-xs font-medium text-slate-700">Adventures</p>
              </div>
            </div>
          </div>

          {/* Emotions Quadrant */}
          <div className="bg-pink-50 border-2 border-dashed border-pink-300 rounded-2xl p-4 min-h-32 transform hover:scale-105 transition-transform">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">❤️</span>
              <h4 className="text-sm font-semibold text-pink-900">Emotions & Growth</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded p-2 shadow-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                <div className="w-full h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded mb-1"></div>
                <p className="text-xs font-medium text-slate-700">Inner Peace</p>
              </div>
              <div className="bg-white rounded p-2 shadow-sm animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                <div className="w-full h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded mb-1"></div>
                <p className="text-xs font-medium text-slate-700">Joy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGoalsScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <Target className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-3xl font-bold text-slate-900 mb-2">12-Week Goal Framework</h3>
          <p className="text-xl text-slate-600">Turn insights into action</p>
        </div>
        
        <div className="space-y-6">
          {/* Goal Hierarchy */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center transform hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Vision</h4>
                <p className="text-xs text-slate-600">Your big picture</p>
              </div>
              
              <div className="text-center transform hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">12-Week Goals</h4>
                <p className="text-xs text-slate-600">Quarterly focus</p>
              </div>
              
              <div className="text-center transform hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Weekly Actions</h4>
                <p className="text-xs text-slate-600">What to do</p>
              </div>
              
              <div className="text-center transform hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">Daily Schedule</h4>
                <p className="text-xs text-slate-600">When to do it</p>
              </div>
            </div>
          </div>

          {/* Sample Goal */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
            <h4 className="text-lg font-bold mb-2">Sample Goal</h4>
            <p className="text-orange-100 mb-4">"Improve my health to feel more energetic"</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/20 rounded-lg p-3">
                <h5 className="font-semibold mb-2 text-sm">Connected Values</h5>
                <div className="space-y-1">
                  <span className="bg-white/30 px-2 py-1 rounded text-xs">Health</span>
                  <span className="bg-white/30 px-2 py-1 rounded text-xs">Vitality</span>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <h5 className="font-semibold mb-2 text-sm">Life Areas</h5>
                <div className="space-y-1">
                  <span className="bg-white/30 px-2 py-1 rounded text-xs">Health: 6→8</span>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <h5 className="font-semibold mb-2 text-sm">Actions</h5>
                <div className="space-y-1 text-xs">
                  <div>• Gym 3x/week</div>
                  <div>• Meal prep</div>
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
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <Calendar className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-3xl font-bold text-slate-900 mb-2">Action Calendar</h3>
          <p className="text-xl text-slate-600">Schedule what matters</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-indigo-600 text-white p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">January 2025</h4>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-xs">Business</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs">Health</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-xs">Balance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-slate-600 py-1 text-sm">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 6;
                const isCurrentMonth = day > 0 && day <= 31;
                const hasEvents = isCurrentMonth && [5, 7, 12, 15, 20, 22, 28].includes(day);
                
                return (
                  <div key={i} className={`min-h-16 p-1 border border-slate-100 rounded text-xs ${
                    isCurrentMonth ? 'bg-white' : 'bg-slate-50'
                  }`}>
                    {isCurrentMonth && (
                      <>
                        <div className={`text-xs font-medium ${day === 15 ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}>
                          {day}
                        </div>
                        {hasEvents && (
                          <div className="space-y-1 mt-1">
                            {day === 5 && <div className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded text-xs animate-fadeIn">Meeting</div>}
                            {day === 7 && <div className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs animate-fadeIn">Gym</div>}
                            {day === 12 && <div className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs animate-fadeIn">Family</div>}
                            {day === 15 && (
                              <>
                                <div className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded text-xs animate-fadeIn">Review</div>
                                <div className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs animate-fadeIn">Workout</div>
                              </>
                            )}
                            {day === 20 && <div className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs animate-fadeIn">Prep</div>}
                            {day === 22 && <div className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs animate-fadeIn">Date</div>}
                            {day === 28 && <div className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded text-xs animate-fadeIn">Goals</div>}
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-4xl font-bold text-slate-900 mb-4">Get Clarity</h3>
          <p className="text-xl text-slate-600 mb-8">Proven tools. Real insights. Your clarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 transform hover:scale-105 transition-transform">
            <div className="text-2xl font-bold text-green-600 mb-2">1,000+</div>
            <div className="text-slate-600">People using these tools</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 transform hover:scale-105 transition-transform">
            <div className="text-2xl font-bold text-green-600 mb-2">5 min</div>
            <div className="text-slate-600">To complete assessment</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 transform hover:scale-105 transition-transform">
            <div className="text-2xl font-bold text-green-600 mb-2">Free</div>
            <div className="text-slate-600">Wheel of Life tool</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h4 className="text-2xl font-bold mb-4">Ready to get some clarity?</h4>
          <p className="text-purple-100 mb-6">Start with a simple assessment to see where you stand</p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors animate-pulse">
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
          {currentScene + 1} / {scenes.length}
        </div>
      </div>
    </div>
  );
};

export default SnappyDemoVideo;