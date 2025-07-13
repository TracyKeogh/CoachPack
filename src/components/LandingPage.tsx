import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface SnappyDemoVideoProps {
  autoPlay?: boolean;
  onComplete?: () => void;
}

const SnappyDemoVideo: React.FC<SnappyDemoVideoProps> = ({ 
  autoPlay = false, 
  onComplete 
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Demo steps/scenes
  const demoSteps = [
    {
      title: "Step 1: Wheel of Life Assessment",
      description: "Rate your satisfaction across 8 life areas",
      duration: 3000,
      visual: "wheel"
    },
    {
      title: "Step 2: Values Clarification", 
      description: "Identify what matters most to you",
      duration: 3000,
      visual: "values"
    },
    {
      title: "Step 3: Goal Setting",
      description: "Set 12-week goals based on your priorities", 
      duration: 3000,
      visual: "goals"
    },
    {
      title: "Step 4: Action Planning",
      description: "Break goals into weekly actions",
      duration: 3000,
      visual: "actions"
    },
    {
      title: "Step 5: Calendar Integration",
      description: "Schedule time for what matters most",
      duration: 3000,
      visual: "calendar"
    }
  ];

  const totalDuration = demoSteps.reduce((sum, step) => sum + step.duration, 0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (totalDuration / 50));
          
          if (newProgress >= 100) {
            setIsPlaying(false);
            setCurrentStep(0);
            if (onComplete) onComplete();
            return 0;
          }
          
          // Calculate current step based on progress
          let accumulatedTime = 0;
          for (let i = 0; i < demoSteps.length; i++) {
            accumulatedTime += demoSteps[i].duration;
            if ((newProgress / 100) * totalDuration <= accumulatedTime) {
              setCurrentStep(i);
              break;
            }
          }
          
          return newProgress;
        });
      }, 50);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalDuration, onComplete]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentStep(0);
  };

  const renderVisual = (visual: string) => {
    switch (visual) {
      case 'wheel':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-full border-8 border-purple-200"></div>
              <div className="absolute inset-4 rounded-full border-4 border-purple-400"></div>
              <div className="absolute inset-8 rounded-full border-2 border-purple-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-600 rounded-full"></div>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-20 bg-purple-300 origin-bottom"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -100%) rotate(${angle}deg)`
                  }}
                />
              ))}
            </div>
          </div>
        );
      
      case 'values':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="grid grid-cols-2 gap-4">
              {['Family', 'Career', 'Health', 'Growth'].map((value, i) => (
                <div key={i} className="bg-red-100 border border-red-300 rounded-lg p-4 text-center">
                  <div className="text-red-600 font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'goals':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-3 w-full max-w-sm">
              {[1, 2, 3].map((goal, i) => (
                <div key={i} className="bg-orange-100 border border-orange-300 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div className="text-orange-700 font-medium">12-Week Goal {goal}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'actions':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-2 w-full max-w-sm">
              {[1, 2, 3, 4].map((action, i) => (
                <div key={i} className="bg-blue-100 border border-blue-300 rounded-lg p-2 flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked={i < 2} />
                  <span className="text-blue-700 text-sm">Weekly Action {action}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'calendar':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 21 }, (_, i) => (
                <div 
                  key={i} 
                  className={`w-8 h-8 border rounded text-xs flex items-center justify-center ${
                    i % 7 === 0 || i % 7 === 6 ? 'bg-slate-100' :
                    i === 8 || i === 15 ? 'bg-green-200 border-green-400' :
                    'bg-white border-slate-200'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
      {/* Video Area */}
      <div className="relative bg-white aspect-video">
        <div className="absolute inset-0 p-8">
          {renderVisual(demoSteps[currentStep]?.visual)}
        </div>
        
        {/* Play overlay when paused */}
        {!isPlaying && progress === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
            >
              <Play className="w-8 h-8 text-slate-700 ml-1" />
            </button>
          </div>
        )}
        
        {/* Current step info */}
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white rounded-lg p-3">
          <div className="font-semibold">{demoSteps[currentStep]?.title}</div>
          <div className="text-sm opacity-90">{demoSteps[currentStep]?.description}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            
            <button
              onClick={handleRestart}
              className="w-10 h-10 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-400 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-400 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="text-sm text-slate-600">
            Step {currentStep + 1} of {demoSteps.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SnappyDemoVideo;