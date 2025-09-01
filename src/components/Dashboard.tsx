import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Target, Calendar, Sparkles, ChevronRight, Clock, BarChart3, Eye, CheckSquare, TrendingUp, User, Menu, Home, ExternalLink, Edit3, Check, X } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dashboardData = useDashboardData();
  const { data: goalsData, updateAnnualSnapshot } = useGoalSettingData();
  const [isEditingVision, setIsEditingVision] = useState(false);
  const [editVisionText, setEditVisionText] = useState('');
  const [isEditingWhy, setIsEditingWhy] = useState(false);
  const [editWhyText, setEditWhyText] = useState('');

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

  const startEditingVision = () => {
    setEditVisionText(goalsData.annualSnapshot?.snapshot || '');
    setIsEditingVision(true);
  };

  const saveVisionEdit = () => {
    updateAnnualSnapshot({
      ...goalsData.annualSnapshot,
      snapshot: editVisionText
    });
    setIsEditingVision(false);
  };

  const cancelVisionEdit = () => {
    setIsEditingVision(false);
    setEditVisionText('');
  };

  const startEditingWhy = () => {
    setEditWhyText(goalsData.annualSnapshot?.mantra || '');
    setIsEditingWhy(true);
  };

  const saveWhyEdit = () => {
    updateAnnualSnapshot({
      ...goalsData.annualSnapshot,
      mantra: editWhyText
    });
    setIsEditingWhy(false);
  };

  const cancelWhyEdit = () => {
    setIsEditingWhy(false);
    setEditWhyText('');
  };

  // Check if vision statement has been edited
  const hasVisionContent = goalsData.annualSnapshot?.snapshot?.trim();
  const hasWhyContent = goalsData.annualSnapshot?.mantra?.trim();
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
              {isEditingVision ? (
                <div className="max-w-4xl mx-auto">
                  <textarea
                    value={editVisionText}
                    onChange={(e) => setEditVisionText(e.target.value)}
                    placeholder="a one line summary of the vision"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6 text-white placeholder-white/60 text-4xl font-bold text-center resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex items-center justify-center space-x-4 mt-4">
                    <button
                      onClick={saveVisionEdit}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelVisionEdit}
                      className="flex items-center space-x-2 px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group cursor-pointer" onClick={startEditingVision}>
                  <div className="flex items-center justify-center space-x-3">
                    <span>
                      {goalsData.annualSnapshot?.snapshot || 'a one line summary of the vision'}
                    </span>
                    {!hasVisionContent && (
                      <Edit3 className="w-6 h-6 text-white/60 transition-opacity" />
                    )}
                  </div>
                  {!hasVisionContent && (
                    <p className="text-purple-200 text-lg mt-2 opacity-75">Click to add your vision statement</p>
                  )}
                </div>
              )}
            </h1>
            {isEditingWhy ? (
              <div className="max-w-3xl mx-auto">
                <textarea
                  value={editWhyText}
                  onChange={(e) => setEditWhyText(e.target.value)}
                  placeholder="my big why"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-white placeholder-white/60 text-xl text-center resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
                  rows={1}
                  autoFocus
                />
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <button
                    onClick={saveWhyEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={cancelWhyEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="group cursor-pointer max-w-3xl mx-auto" onClick={startEditingWhy}>
                <div className="flex items-center justify-center space-x-3">
                  <p className="text-xl text-slate-300">
                    {goalsData.annualSnapshot?.mantra || 'my big why'}
                  </p>
                  {!hasWhyContent && (
                    <Edit3 className="w-5 h-5 text-white/60 transition-opacity" />
                  )}
                </div>
                {!hasWhyContent && (
                  <p className="text-purple-200 text-sm mt-2 opacity-75">Click to add your motivation</p>
                )}
              </div>
            )}
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
                      {Math.round(dashboardData.lifeAreas.reduce((sum, area) => sum + area.now, 0) / dashboardData.lifeAreas.length * 10) / 10}
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
                      {Math.round(dashboardData.lifeAreas.reduce((sum, area) => sum + area.vision, 0) / dashboardData.lifeAreas.length * 10) / 10}
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

        {/* Next Milestones from Real Data */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Your Next Milestones</h3>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Day {dashboardData.daysIntoJourney} of {dashboardData.totalDays}</div>
              <div className="text-lg font-semibold text-purple-400">{dashboardData.totalDays - dashboardData.daysIntoJourney} days remaining</div>
            </div>
          </div>
          
          {/* Real Milestones */}
          {dashboardData.nextMilestones && dashboardData.nextMilestones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {dashboardData.nextMilestones.slice(0, 3).map((milestone, i) => (
                <div key={i} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-xs text-slate-400 uppercase font-medium">milestone</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-1">{milestone.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{milestone.date}</span>
                    <span className="text-purple-400 text-sm font-medium">{milestone.daysAway} days</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No upcoming milestones. Complete your Goals section to see your progress here.</p>
            </div>
          )}

          {/* Overall Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-slate-400 via-purple-500 to-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-slate-400">Start</span>
              <span className="text-purple-400 font-medium">Day {dashboardData.daysIntoJourney}</span>
              <span className="text-green-400">Vision Achieved</span>
            </div>
          </div>
        </div>

        {/* 90-Day Journey Section */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-3xl p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Your 90-Day Journey</h3>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Day {dashboardData.daysIntoJourney} of 90</div>
              <div className="text-lg font-semibold text-purple-400">{90 - dashboardData.daysIntoJourney} days remaining</div>
            </div>
          </div>
          
          {/* 90-Day Calendar Grid */}
          <div className="grid grid-cols-10 gap-1 mb-6">
            {Array.from({ length: 90 }, (_, i) => {
              const day = i + 1;
              const isCurrentDay = day === dashboardData.daysIntoJourney;
              const isPastDay = day < dashboardData.daysIntoJourney;
              const isMilestoneDay = dashboardData.milestoneCalendar && dashboardData.milestoneCalendar[day];
              
              let bgColor = 'bg-slate-700/30'; // Default future day
              let textColor = 'text-slate-400';
              let showStar = false;
              
              if (isPastDay) {
                bgColor = 'bg-slate-600/50';
                textColor = 'text-slate-300';
              } else if (isCurrentDay) {
                bgColor = 'bg-orange-500'; // Orange for current day
                textColor = 'text-white';
              }
              
              if (isMilestoneDay) {
                showStar = true;
                const milestone = dashboardData.milestoneCalendar[day];
                if (!isCurrentDay) { // Don't override current day color
                  if (milestone.category === 'business') {
                    bgColor = isPastDay ? 'bg-purple-600/70' : 'bg-purple-500';
                  } else if (milestone.category === 'body') {
                    bgColor = isPastDay ? 'bg-green-600/70' : 'bg-green-500';
                  } else if (milestone.category === 'balance') {
                    bgColor = isPastDay ? 'bg-blue-600/70' : 'bg-blue-500';
                  }
                  textColor = 'text-white';
                }
              }
              
              return (
                <div
                  key={day}
                  className={`aspect-square ${bgColor} ${textColor} rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 hover:scale-110 relative group cursor-pointer`}
                  title={isMilestoneDay ? `Day ${day}: ${dashboardData.milestoneCalendar[day].title}` : `Day ${day}`}
                >
                  {showStar ? (
                    <div className="w-3 h-3 text-yellow-400">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  ) : (
                    day
                  )}
                  
                  {/* Tooltip on hover */}
                  {isMilestoneDay && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {dashboardData.milestoneCalendar[day].title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-600/50 rounded"></div>
              <span className="text-slate-400">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-orange-400">Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-purple-400">Business</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-green-400">Health</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-blue-400">Balance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span className="text-yellow-400">Milestone</span>
            </div>
          </div>
        </div>
        {/* Progress Momentum Indicator */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-purple-600/20 to-green-600/20 border border-purple-500/30 rounded-2xl px-8 py-6">
            <div className="text-3xl">🚀</div>
            <div>
              <div className="text-lg font-semibold text-white">Overall Progress: {dashboardData.overallProgress}%</div>
              <div className="text-slate-400 text-sm">
                {90 - dashboardData.daysIntoJourney} days remaining in your 90-day journey
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