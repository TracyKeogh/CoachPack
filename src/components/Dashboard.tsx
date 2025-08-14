import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Target, Calendar, Sparkles, ChevronRight, Clock, BarChart3, Eye, CheckSquare, TrendingUp, User, Menu, Home, ExternalLink } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dashboardData = useDashboardData();

  // Left sidebar sections with proper feature mapping and navigation
  const sections = [
    { 
      id: 'baseline', 
      icon: User, 
      title: 'Baseline', 
      progress: dashboardData.baselineProgress, 
      active: false,
      features: ['Wheel of Life', 'Values Clarity'],
      routes: ['/wheel-of-life', '/values']
    },
    { 
      id: 'vision', 
      icon: Eye, 
      title: 'Vision', 
      progress: dashboardData.visionProgress, 
      active: true,
      features: ['Vision Board'],
      routes: ['/vision-board']
    },
    { 
      id: 'plan', 
      icon: CheckSquare, 
      title: 'Plan', 
      progress: dashboardData.planProgress, 
      active: false,
      features: ['Goal Setting'],
      routes: ['/goal-setting']
    },
    { 
      id: 'stress', 
      icon: TrendingUp, 
      title: 'Stress Test', 
      progress: 0, 
      active: false,
      comingSoon: true,
      features: ['Goal Stress Testing'],
      routes: []
    },
    { 
      id: 'track', 
      icon: Calendar, 
      title: 'Track', 
      progress: 30, 
      active: false,
      external: true,
      features: ['Mobile App'],
      routes: ['/calendar']
    }
  ];

  const handleSectionClick = (section: any) => {
    if (section.comingSoon) return;
    
    if (section.routes && section.routes.length > 0) {
      // Navigate to the first route for now
      navigate(section.routes[0]);
    }
  };

  const SidebarSection = ({ section }: { section: any }) => (
    <div 
      onClick={() => handleSectionClick(section)}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200
        ${section.active ? 'bg-purple-100 border-l-4 border-purple-500' : 'hover:bg-slate-100'}
        ${section.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      <section.icon className={`w-5 h-5 ${section.active ? 'text-purple-600' : 'text-slate-600'}`} />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${section.active ? 'text-purple-900' : 'text-slate-700'}`}>
            {section.title}
          </span>
          {section.comingSoon && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Soon</span>
          )}
          {section.external && (
            <ExternalLink className="w-3 h-3 text-slate-400" />
          )}
        </div>
        <div className="text-xs text-slate-500 mb-1">
          {section.features.join(', ')}
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              section.progress > 0 ? 'bg-purple-500' : 'bg-slate-300'
            }`}
            style={{ width: `${section.progress}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-slate-500 font-medium">{section.progress}%</span>
    </div>
  );

  const progressPercentage = (dashboardData.daysIntoJourney / dashboardData.totalDays) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
      
      {/* Hero Section - Their Vision */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative max-w-6xl mx-auto px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium">Day {dashboardData.daysIntoJourney} of Your Journey</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              {dashboardData.visionStatement}
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              {dashboardData.currentFocus}
            </p>
          </div>

          {/* Core Values */}
          <div className="flex justify-center space-x-6 mb-12">
            {dashboardData.coreValues.map((value, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4">
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold">{value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Vision Board Integration */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Your Vision</h3>
              <p className="text-slate-400">The life you're creating</p>
            </div>
            
            {/* Sleek vision board frame */}
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl">
              {/* Vision board content */}
              <div className="grid grid-cols-2 gap-1 aspect-[5/4] overflow-hidden rounded-xl">
                {dashboardData.visionBoard.length > 0 ? (
                  dashboardData.visionBoard.map((item, i) => (
                    <div key={i} className="relative overflow-hidden group">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-102"
                      />
                      
                      {/* Minimal overlay on hover only */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <span className="text-white text-sm font-medium px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                            {item.quadrant}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback when no vision board items
                  Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="bg-slate-700/50 flex items-center justify-center">
                      <span className="text-slate-400 text-sm">Add Vision Item</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Minimal description */}
            <div className="text-center mt-4">
              <p className="text-slate-500 text-sm">Your visual guide</p>
            </div>
          </div>

          {/* Journey Progress Arc */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full transition-all duration-2000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-slate-400">Start</span>
                <span className="text-purple-300 font-medium">{Math.round(progressPercentage)}% Complete</span>
                <span className="text-green-400">Vision Achieved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Life Areas - Visual Story */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Your Life Today</h2>
          <p className="text-slate-400">See how each area is evolving toward your vision</p>
        </div>

        {/* Wheel Comparison */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-3xl p-8 mb-12">
          <div className="flex items-center justify-center space-x-16">
            {/* Current State Wheel */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-300 mb-6">Today</h3>
              <div className="relative mb-4">
                <svg width="200" height="200" className="transform -rotate-90">
                  {dashboardData.lifeAreas.map((area, index) => {
                    const startAngle = (index * 360) / dashboardData.lifeAreas.length;
                    const endAngle = ((index + 1) * 360) / dashboardData.lifeAreas.length;
                    const radius = (area.now / 10) * 80;
                    
                    const startAngleRad = (startAngle * Math.PI) / 180;
                    const endAngleRad = (endAngle * Math.PI) / 180;
                    
                    const x1 = 100 + radius * Math.cos(startAngleRad);
                    const y1 = 100 + radius * Math.sin(startAngleRad);
                    const x2 = 100 + radius * Math.cos(endAngleRad);
                    const y2 = 100 + radius * Math.sin(endAngleRad);
                    
                    const largeArcFlag = endAngleRad - startAngleRad <= Math.PI ? "0" : "1";
                    
                    return (
                      <path
                        key={index}
                        d={`M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill="rgba(147, 51, 234, 0.6)"
                        stroke="rgba(147, 51, 234, 0.8)"
                        strokeWidth="1"
                      />
                    );
                  })}
                  
                  {/* Background rings */}
                  {[20, 40, 60, 80].map(r => (
                    <circle
                      key={r}
                      cx="100"
                      cy="100"
                      r={r}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.1)"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-300">
                      {Math.round(dashboardData.lifeAreas.reduce((sum, area) => sum + area.now, 0) / 8 * 10) / 10}
                    </div>
                    <div className="text-xs text-slate-400">Avg</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <ChevronRight className="w-12 h-12 text-purple-400 mb-2" />
              <div className="text-sm text-purple-400 font-medium">12 Weeks</div>
            </div>

            {/* Vision State Wheel */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-green-300 mb-6">Your Vision</h3>
              <div className="relative mb-4">
                <svg width="200" height="200" className="transform -rotate-90">
                  {dashboardData.lifeAreas.map((area, index) => {
                    const startAngle = (index * 360) / dashboardData.lifeAreas.length;
                    const endAngle = ((index + 1) * 360) / dashboardData.lifeAreas.length;
                    const radius = (area.vision / 10) * 80;
                    
                    const startAngleRad = (startAngle * Math.PI) / 180;
                    const endAngleRad = (endAngle * Math.PI) / 180;
                    
                    const x1 = 100 + radius * Math.cos(startAngleRad);
                    const y1 = 100 + radius * Math.sin(startAngleRad);
                    const x2 = 100 + radius * Math.cos(endAngleRad);
                    const y2 = 100 + radius * Math.sin(endAngleRad);
                    
                    const largeArcFlag = endAngleRad - startAngleRad <= Math.PI ? "0" : "1";
                    
                    return (
                      <path
                        key={index}
                        d={`M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill="rgba(34, 197, 94, 0.6)"
                        stroke="rgba(34, 197, 94, 0.8)"
                        strokeWidth="1"
                      />
                    );
                  })}
                  
                  {/* Background rings */}
                  {[20, 40, 60, 80].map(r => (
                    <circle
                      key={r}
                      cx="100"
                      cy="100"
                      r={r}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.1)"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">
                      {Math.round(dashboardData.lifeAreas.reduce((sum, area) => sum + area.vision, 0) / 8 * 10) / 10}
                    </div>
                    <div className="text-xs text-green-400">Target</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center space-x-8 mt-8 text-sm">
            {dashboardData.lifeAreas.slice(0, 4).map((area, i) => (
              <div key={i} className="text-slate-400">{area.area}</div>
            ))}
          </div>
        </div>

        {/* 90-Day Calendar Journey */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Your 90-Day Journey</h3>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Day {dashboardData.daysIntoJourney} of 90</div>
              <div className="text-lg font-semibold text-purple-400">{90 - dashboardData.daysIntoJourney} days remaining</div>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-10 gap-1 mb-6">
            {Array.from({ length: 90 }, (_, i) => {
              const dayNumber = i + 1;
              const isPast = dayNumber <= dashboardData.daysIntoJourney;
              const isToday = dayNumber === dashboardData.daysIntoJourney;
              
              // Sample goals and milestones positioned on specific days
              const events: { [key: number]: { type: string; title: string; color: string } } = {
                5: { type: 'milestone', title: '10K Run', color: 'bg-blue-500' },
                15: { type: 'milestone', title: 'Beta Launch', color: 'bg-purple-500' },
                30: { type: 'goal', title: 'Health Review', color: 'bg-green-500' },
                45: { type: 'milestone', title: 'Product Launch', color: 'bg-yellow-500' },
                60: { type: 'goal', title: 'Career Review', color: 'bg-indigo-500' },
                75: { type: 'milestone', title: 'Marathon', color: 'bg-red-500' },
                90: { type: 'goal', title: 'Vision Complete', color: 'bg-emerald-500' }
              };
              
              const event = events[dayNumber];
              
              return (
                <div
                  key={i}
                  className={`
                    aspect-square rounded-sm flex items-center justify-center text-xs font-medium relative
                    ${isPast 
                      ? 'bg-slate-600/60 text-slate-400' 
                      : isToday 
                        ? 'bg-purple-500 text-white animate-pulse ring-2 ring-purple-400' 
                        : 'bg-slate-700/30 text-slate-500 hover:bg-slate-600/40'
                    }
                  `}
                >
                  {event ? (
                    <div className={`absolute inset-0 ${event.color} rounded-sm flex items-center justify-center text-white`}>
                      {event.type === 'milestone' ? (
                        // Star icon for milestones
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ) : (
                        // Target icon for goals
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      )}
                    </div>
                  ) : (
                    dayNumber
                  )}
                </div>
              );
            })}
          </div>

          {/* Timeline Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-slate-400 via-purple-500 to-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${(dashboardData.daysIntoJourney / 90) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-slate-400">Start</span>
              <span className="text-purple-400 font-medium">Day {dashboardData.daysIntoJourney}</span>
              <span className="text-green-400">Vision Achieved</span>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { title: "Beta Launch", date: "Day 15", daysAway: 15 - dashboardData.daysIntoJourney, type: "milestone", color: "purple" },
              { title: "Health Review", date: "Day 30", daysAway: 30 - dashboardData.daysIntoJourney, type: "goal", color: "green" },
              { title: "Product Launch", date: "Day 45", daysAway: 45 - dashboardData.daysIntoJourney, type: "milestone", color: "yellow" }
            ].filter(event => event.daysAway > 0).map((event, i) => (
              <div key={i} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30">
                <div className="flex items-center space-x-2 mb-2">
                  {event.type === 'milestone' ? (
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  )}
                  <span className="text-xs text-slate-400 uppercase font-medium">{event.type}</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">{event.title}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{event.date}</span>
                  <span className="text-purple-400 text-sm font-medium">{event.daysAway} days</span>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-600 rounded-sm"></div>
              <span className="text-slate-400">Past</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
              <span className="text-slate-400">Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-700 rounded-sm"></div>
              <span className="text-slate-400">Future</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-slate-400">Milestones</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              <span className="text-slate-400">Goals</span>
            </div>
          </div>
        </div>

        {/* Momentum Indicator */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-purple-600/20 to-green-600/20 border border-purple-500/30 rounded-2xl px-8 py-6">
            <div className="text-3xl">🚀</div>
            <div>
              <div className="text-lg font-semibold text-white">You're Building Momentum</div>
              <div className="text-slate-400 text-sm">
                {84 - dashboardData.daysIntoJourney} days remaining to achieve your vision
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Right Sidebar Navigation */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white border-l border-slate-200 transition-all duration-300 flex flex-col relative`}>
        
        {/* Top Section - Always visible */}
        <div className="p-4">
          {/* Hamburger Menu - Top */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors mb-6"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Navigation Icons - Always visible */}
        <div className="flex-1 p-2">
          <div className="space-y-3">
            {/* Dashboard Icon */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center cursor-pointer hover:bg-purple-200 transition-colors"
            >
              <Home className="w-5 h-5" />
            </div>
            
            {/* Journey Section Icons */}
            {sections.map(section => (
              <div 
                key={section.id}
                onClick={() => handleSectionClick(section)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors relative
                  ${section.active ? 'bg-purple-100 text-purple-600' : 'hover:bg-slate-100 text-slate-600'}
                  ${section.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}
                `}
              >
                <section.icon className="w-5 h-5" />
                {section.active && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-r-full -ml-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Expanded Menu Content - Only when sidebar is open */}
        {sidebarOpen && (
          <div className="absolute left-0 top-0 w-80 h-full bg-white border-l border-slate-200 shadow-xl z-10">
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Your Journey</h2>
                <p className="text-slate-600 text-sm">From values to daily action</p>
              </div>
              
              <div className="space-y-3">
                {sections.map(section => (
                  <SidebarSection key={section.id} section={section} />
                ))}
              </div>

              {/* Overall Progress */}
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white">
                <h3 className="font-semibold mb-2">Overall Progress</h3>
                <div className="text-2xl font-bold">{dashboardData.overallProgress}%</div>
                <p className="text-purple-100 text-sm">Keep building momentum</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;