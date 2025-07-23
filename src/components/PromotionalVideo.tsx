import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Star,
  Heart,
  Lightbulb,
  Calendar,
  Award,
  Zap
} from 'lucide-react';

interface PromotionalVideoProps {
  autoPlay?: boolean;
  onComplete?: () => void;
  showControls?: boolean;
  onCTAClick?: () => void;
}

const PromotionalVideo: React.FC<PromotionalVideoProps> = ({ 
  autoPlay = false, 
  onComplete,
  showControls = true,
  onCTAClick 
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const duration = 35; // 35 seconds - perfect for social media

  // Promotional scenes with compelling messaging
  const scenes = [
    {
      id: 'hook',
      title: 'Feeling Stuck?',
      subtitle: 'You\'re not alone. 73% of people feel overwhelmed by life.',
      duration: 4,
      content: 'hook'
    },
    {
      id: 'problem',
      title: 'The Problem',
      subtitle: 'Most people know what they want but don\'t know how to get there.',
      duration: 4,
      content: 'problem'
    },
    {
      id: 'solution',
      title: 'Meet Coach Pack',
      subtitle: 'The structured system that transforms chaos into clarity.',
      duration: 5,
      content: 'solution'
    },
    {
      id: 'features',
      title: 'Proven Tools',
      subtitle: 'Everything you need in one integrated platform.',
      duration: 8,
      content: 'features'
    },
    {
      id: 'results',
      title: 'Real Results',
      subtitle: '1,000+ people already transforming their lives.',
      duration: 6,
      content: 'results'
    },
    {
      id: 'social-proof',
      title: 'Join the Movement',
      subtitle: 'Thousands are already living more intentionally.',
      duration: 4,
      content: 'social-proof'
    },
    {
      id: 'cta',
      title: 'Start Your Journey',
      subtitle: 'Get clarity in just 5 minutes.',
      duration: 4,
      content: 'cta'
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

  // Scene renderers
  const renderHookScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated stress indicators */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-red-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          />
        ))}
      </div>
      
      <div className="text-center text-white z-10 max-w-2xl mx-auto px-8">
        <div className="text-6xl mb-6 animate-bounce">😰</div>
        <h1 className="text-5xl font-bold mb-6 animate-fadeIn">Feeling Stuck?</h1>
        <p className="text-2xl text-slate-300 mb-8 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          Overwhelmed by endless goals but no clear path forward?
        </p>
        <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-6 border border-red-400/30 animate-fadeIn" style={{ animationDelay: '1s' }}>
          <p className="text-xl text-red-200">
            <strong>73%</strong> of people feel overwhelmed by life decisions
          </p>
        </div>
      </div>
    </div>
  );

  const renderProblemScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center text-white">
        <div className="text-6xl mb-6">🤔</div>
        <h2 className="text-4xl font-bold mb-6">The Real Problem</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-fadeIn">
            <div className="text-3xl mb-3">❓</div>
            <h3 className="text-xl font-semibold mb-2">No Clear Direction</h3>
            <p className="text-orange-100">You know you want change but don't know where to start</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Scattered Energy</h3>
            <p className="text-orange-100">Trying everything but making progress on nothing</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Same Patterns</h3>
            <p className="text-orange-100">Stuck in cycles that don't lead to lasting change</p>
          </div>
        </div>
        
        <p className="text-2xl text-pink-100 font-medium">
          Sound familiar? There's a better way.
        </p>
      </div>
    </div>
  );

  const renderSolutionScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center overflow-hidden">
      {/* Animated success particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random()}s`
            }}
          />
        ))}
      </div>
      
      <div className="text-center text-white z-10 max-w-3xl mx-auto px-8">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="relative">
            <Target className="w-16 h-16 text-white animate-pulse" />
            <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <div>
            <h1 className="text-5xl font-bold mb-2">Coach Pack</h1>
            <p className="text-2xl text-purple-200">Intentional Living Made Actionable</p>
          </div>
        </div>
        
        <p className="text-2xl text-purple-100 mb-8">
          The structured system that transforms chaos into clarity
        </p>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold mb-4">Finally, a clear path forward</h3>
          <div className="flex items-center justify-center space-x-8 text-purple-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <span>Proven frameworks</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <span>Step-by-step guidance</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <span>Real results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturesScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything You Need</h2>
          <p className="text-xl text-slate-600">Integrated tools that work together</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Wheel of Life */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200 transform hover:scale-105 transition-transform animate-fadeIn">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-center">Life Assessment</h3>
            <p className="text-slate-600 text-sm text-center">See where you stand across 8 key areas</p>
          </div>

          {/* Values */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 transform hover:scale-105 transition-transform animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-center">Values Clarity</h3>
            <p className="text-slate-600 text-sm text-center">Discover what truly matters to you</p>
          </div>

          {/* Vision Board */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-teal-200 transform hover:scale-105 transition-transform animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Lightbulb className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-center">Vision Board</h3>
            <p className="text-slate-600 text-sm text-center">Visualize your goals and dreams</p>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200 transform hover:scale-105 transition-transform animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-center">12-Week Goals</h3>
            <p className="text-slate-600 text-sm text-center">Turn insights into action plans</p>
          </div>
        </div>

        {/* Feature highlight */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">All Connected. All Integrated.</h3>
          <p className="text-purple-100">Your values inform your vision. Your vision drives your goals. Your goals become daily actions.</p>
        </div>
      </div>
    </div>
  );

  const renderResultsScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Real People. Real Results.</h2>
          <p className="text-xl text-slate-600">See what happens when you get clarity</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Stat 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 text-center animate-fadeIn">
            <div className="text-4xl font-bold text-green-600 mb-2">1,000+</div>
            <div className="text-slate-600 mb-2">Active Users</div>
            <div className="text-sm text-green-700">Growing every day</div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
            <div className="text-slate-600 mb-2">Goal Achievement</div>
            <div className="text-sm text-green-700">Complete their 12-week goals</div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 text-center animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <div className="text-4xl font-bold text-green-600 mb-2">4.9/5</div>
            <div className="text-slate-600 mb-2">User Rating</div>
            <div className="text-sm text-green-700">Consistently high satisfaction</div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-200 text-center animate-fadeIn" style={{ animationDelay: '0.9s' }}>
          <div className="flex items-center justify-center space-x-1 mb-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
          </div>
          <p className="text-lg text-slate-700 mb-4 italic">
            "Coach Pack gave me the structure I needed to finally make progress on my goals. 
            The step-by-step approach made everything feel achievable."
          </p>
          <p className="text-sm font-medium text-slate-900">Sarah M., Marketing Director</p>
        </div>
      </div>
    </div>
  );

  const renderSocialProofScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center text-white">
        <div className="mb-8">
          <Users className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <h2 className="text-4xl font-bold mb-4">Join the Movement</h2>
          <p className="text-2xl text-purple-100">Thousands are already living more intentionally</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-fadeIn">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Fast Results</h3>
            <p className="text-purple-100">Get clarity in just 5 minutes with our free assessment</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="text-3xl mb-3">💪</div>
            <h3 className="text-xl font-semibold mb-2">Lasting Change</h3>
            <p className="text-purple-100">Build habits and systems that create long-term transformation</p>
          </div>
        </div>
        
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <p className="text-xl text-purple-100">
            Stop spinning your wheels. Start making real progress.
          </p>
        </div>
      </div>
    </div>
  );

  const renderCTAScene = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center text-white">
        <div className="mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-5xl font-bold mb-4">Ready to Get Clarity?</h2>
          <p className="text-2xl text-green-100 mb-8">
            Start with our free 5-minute life assessment
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-green-100">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>5 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>Instant insights</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onCTAClick}
            className="bg-white text-green-600 px-8 py-4 rounded-2xl font-bold text-xl hover:bg-green-50 transition-all transform hover:scale-105 shadow-2xl animate-pulse"
          >
            Start Free Assessment
          </button>
          
          <p className="text-green-100 text-sm">
            No email required • Get results immediately
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurrentScene = () => {
    switch (currentSceneData?.content) {
      case 'hook': return renderHookScene();
      case 'problem': return renderProblemScene();
      case 'solution': return renderSolutionScene();
      case 'features': return renderFeaturesScene();
      case 'results': return renderResultsScene();
      case 'social-proof': return renderSocialProofScene();
      case 'cta': return renderCTAScene();
      default: return renderHookScene();
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
                  className="bg-gradient-to-r from-white to-green-300 h-2 rounded-full transition-all duration-100 relative"
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

      {/* CTA Button overlay for final scene */}
      {currentScene === scenes.length - 1 && isPlaying && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <button
            onClick={onCTAClick}
            className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-all transform hover:scale-105 shadow-2xl animate-bounce"
          >
            Start Free Assessment
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionalVideo;