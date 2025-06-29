import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize
} from 'lucide-react';

interface DemoVideoProps {
  autoPlay?: boolean;
  onComplete?: () => void;
}

const DemoVideo: React.FC<DemoVideoProps> = ({ autoPlay = false, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 20; // Extended to 20 seconds for individual sorting

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
          return newTime;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, onComplete]);

  const togglePlay = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Animation progress (0 to 1)
  const progress = currentTime / duration;

  // Phase 1: Chaos (0-5s)
  const chaosPhase = Math.min(1, Math.max(0, currentTime / 5));
  
  // Phase 2: Individual Sorting (5-15s) - Extended for individual brick movement
  const sortingPhase = Math.min(1, Math.max(0, (currentTime - 5) / 10));
  
  // Phase 3: Final Organization (15-20s)
  const organizationPhase = Math.min(1, Math.max(0, (currentTime - 15) / 5));

  // LEGO brick component
  const LEGOBrick: React.FC<{
    color: string;
    size?: 'small' | 'medium' | 'large';
    className?: string;
    style?: React.CSSProperties;
    studs?: number;
  }> = ({ color, size = 'medium', className = '', style = {}, studs = 2 }) => {
    const sizeClasses = {
      small: 'w-6 h-3',
      medium: 'w-8 h-4',
      large: 'w-12 h-6'
    };

    const studSize = {
      small: 'w-1 h-1',
      medium: 'w-1.5 h-1.5',
      large: 'w-2 h-2'
    };

    return (
      <div
        className={`${sizeClasses[size]} rounded-sm shadow-lg relative border border-black/20 ${className}`}
        style={{ 
          backgroundColor: color, 
          boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.3)`,
          ...style 
        }}
      >
        {/* LEGO studs */}
        <div className="absolute inset-0 flex items-start justify-center pt-0.5 gap-0.5">
          {Array.from({ length: studs }, (_, i) => (
            <div
              key={i}
              className={`${studSize[size]} bg-white/40 rounded-full shadow-inner`}
              style={{
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderAnimation = () => {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
    const colorNames = ['red', 'blue', 'green', 'yellow'];
    
    if (currentTime < 5) {
      // Phase 1: Chaotic pile (recreating first image)
      return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Central chaotic pile */}
          <div className="relative">
            {Array.from({ length: 80 }, (_, i) => {
              const sizes = ['small', 'medium', 'large'] as const;
              const angle = (i * 137.5) % 360; // Golden angle for natural distribution
              const radius = 10 + (i % 40) * 2.5;
              const xPos = Math.cos(angle * Math.PI / 180) * radius;
              const yPos = Math.sin(angle * Math.PI / 180) * radius;
              const fallDelay = (i * 0.03) % 1.5;
              
              return (
                <LEGOBrick
                  key={i}
                  color={colors[i % colors.length]}
                  size={sizes[i % 3]}
                  className="absolute transition-all duration-1000"
                  style={{
                    left: `calc(50% + ${xPos}px)`,
                    top: `calc(50% + ${yPos}px)`,
                    transform: `translate(-50%, -50%) rotate(${(i * 45) % 360}deg) ${
                      isPlaying && chaosPhase > fallDelay ? 'scale(1)' : 'scale(0)'
                    }`,
                    animationDelay: `${fallDelay}s`,
                    zIndex: Math.floor(Math.random() * 10),
                    opacity: isPlaying && chaosPhase > fallDelay ? 1 : 0
                  }}
                />
              );
            })}
          </div>

          {/* Chaos text overlay */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-xl font-bold bg-black/30 rounded-lg px-4 py-2">
            Life's overwhelming pieces...
          </div>
        </div>
      );
    } else if (currentTime < 15) {
      // Phase 2: Individual brick sorting animation
      const totalBricks = 40;
      const bricksPerColor = 10;
      
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Sorting animation with individual brick movement */}
          <div className="relative w-full h-full">
            
            {/* Individual bricks moving to their sorted positions */}
            {Array.from({ length: totalBricks }, (_, i) => {
              const colorIndex = Math.floor(i / bricksPerColor);
              const brickInColorGroup = i % bricksPerColor;
              const color = colors[colorIndex];
              
              // Original chaotic position
              const originalAngle = (i * 137.5) % 360;
              const originalRadius = 10 + (i % 20) * 2;
              const originalX = Math.cos(originalAngle * Math.PI / 180) * originalRadius;
              const originalY = Math.sin(originalAngle * Math.PI / 180) * originalRadius;
              
              // Target sorted position
              const targetX = -150 + (colorIndex * 100); // Spread colors horizontally
              const targetY = -100 + (brickInColorGroup * 12); // Stack vertically
              
              // Animation timing - each brick moves at a different time
              const moveStartTime = (i * 0.2) % 8; // Spread over 8 seconds
              const moveProgress = Math.min(1, Math.max(0, (sortingPhase * 10 - moveStartTime) / 2));
              
              // Interpolate position
              const currentX = originalX + (targetX - originalX) * moveProgress;
              const currentY = originalY + (targetY - originalY) * moveProgress;
              
              // Rotation animation
              const rotation = (1 - moveProgress) * ((i * 45) % 360);
              
              return (
                <LEGOBrick
                  key={i}
                  color={color}
                  size="small"
                  className="absolute transition-all duration-2000 ease-out"
                  style={{
                    left: `calc(50% + ${currentX}px)`,
                    top: `calc(50% + ${currentY}px)`,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    zIndex: moveProgress > 0.5 ? 100 + i : 10 + i,
                    opacity: 1
                  }}
                />
              );
            })}

            {/* Sorting progress indicator */}
            <div 
              className="absolute top-1/4 left-1/2 transform -translate-x-1/2 transition-opacity duration-1000"
              style={{ opacity: sortingPhase > 0.2 ? 1 : 0 }}
            >
              <div className="flex items-center space-x-4 text-white text-lg font-bold bg-black/40 rounded-lg px-6 py-3">
                <div className="animate-pulse">✨</div>
                <div>SORTING BY COLOR</div>
                <div className="animate-pulse">✨</div>
              </div>
            </div>

            {/* Color labels appearing */}
            {colorNames.map((colorName, index) => (
              <div
                key={colorName}
                className="absolute transition-all duration-2000"
                style={{
                  left: `calc(50% + ${-150 + (index * 100)}px)`,
                  top: `calc(50% + ${-130}px)`,
                  transform: 'translate(-50%, -50%)',
                  opacity: sortingPhase > 0.3 + (index * 0.1) ? 1 : 0
                }}
              >
                <div 
                  className="px-3 py-1 rounded-lg text-white font-bold text-sm border-2"
                  style={{ 
                    backgroundColor: colors[index],
                    borderColor: 'white'
                  }}
                >
                  {colorName.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* Transition text */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-xl font-bold bg-black/30 rounded-lg px-4 py-2">
            When you pause and reflect...
          </div>
        </div>
      );
    } else {
      // Phase 3: Final organized state (recreating second image layout)
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Organized stacks (recreating second image layout) */}
          <div className="flex items-end justify-center space-x-8">
            {/* Red stack */}
            <div 
              className="flex flex-col items-center transition-all duration-1000"
              style={{
                opacity: organizationPhase,
                transform: `translateY(${(1 - organizationPhase) * 50}px)`
              }}
            >
              <div className="flex flex-col space-y-1 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <LEGOBrick
                    key={i}
                    color="#ef4444"
                    size="large"
                    studs={4}
                    className="shadow-xl"
                    style={{
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              <LEGOBrick color="#ef4444" size="small" studs={1} />
            </div>

            {/* Blue stack */}
            <div 
              className="flex flex-col items-center transition-all duration-1000"
              style={{
                opacity: organizationPhase,
                transform: `translateY(${(1 - organizationPhase) * 50}px)`,
                animationDelay: '0.2s'
              }}
            >
              <div className="flex flex-col space-y-1 mb-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <LEGOBrick
                    key={i}
                    color="#3b82f6"
                    size="large"
                    studs={4}
                    className="shadow-xl"
                    style={{
                      animationDelay: `${0.2 + i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              <LEGOBrick color="#3b82f6" size="small" studs={1} />
            </div>

            {/* Yellow stack */}
            <div 
              className="flex flex-col items-center transition-all duration-1000"
              style={{
                opacity: organizationPhase,
                transform: `translateY(${(1 - organizationPhase) * 50}px)`,
                animationDelay: '0.4s'
              }}
            >
              <div className="flex flex-col space-y-1 mb-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <LEGOBrick
                    key={i}
                    color="#f59e0b"
                    size="large"
                    studs={4}
                    className="shadow-xl"
                    style={{
                      animationDelay: `${0.4 + i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              <LEGOBrick color="#f59e0b" size="small" studs={1} />
            </div>

            {/* Green stack */}
            <div 
              className="flex flex-col items-center transition-all duration-1000"
              style={{
                opacity: organizationPhase,
                transform: `translateY(${(1 - organizationPhase) * 50}px)`,
                animationDelay: '0.6s'
              }}
            >
              <div className="flex flex-col space-y-1 mb-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <LEGOBrick
                    key={i}
                    color="#10b981"
                    size="large"
                    studs={4}
                    className="shadow-xl"
                    style={{
                      animationDelay: `${0.6 + i * 0.1}s`
                    }}
                  />
                ))}
              </div>
              <LEGOBrick color="#10b981" size="small" studs={1} />
            </div>
          </div>

          {/* Final message */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-xl font-bold bg-black/30 rounded-lg px-4 py-2">
            ...clarity emerges from chaos
          </div>

          {/* Sparkle effects */}
          {organizationPhase > 0.5 && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="absolute animate-ping"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${30 + (i % 3) * 20}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '2s'
                  }}
                >
                  <div className="w-2 h-2 bg-yellow-300 rounded-full opacity-75" />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div 
      className="relative rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-600 to-slate-800"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Main animation area */}
      <div className="absolute inset-0">
        {renderAnimation()}
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
                className="bg-gradient-to-r from-white to-yellow-300 h-2 rounded-full transition-all duration-100 relative"
                style={{ width: `${(currentTime / duration) * 100}%` }}
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

      {/* Progress indicator */}
      <div className="absolute top-4 right-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
          {currentTime < 5 ? 'Chaos' : currentTime < 15 ? 'Individual Sorting' : 'Clarity'}
        </div>
      </div>
    </div>
  );
};

export default DemoVideo;