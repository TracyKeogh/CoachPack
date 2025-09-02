import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardData = useDashboardData();
  const { data: goalsData, updateAnnualSnapshot } = useGoalSettingData();
  const [isEditingVision, setIsEditingVision] = useState(false);
  const [editVisionText, setEditVisionText] = useState('');
  const [isEditingWhy, setIsEditingWhy] = useState(false);
  const [editWhyText, setEditWhyText] = useState('');

  // Determine which section is currently active based on the route
  const getActiveView = (): ViewType => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/wheel-of-life') return 'wheel-of-life';
    if (path === '/vision-board') return 'vision';
    if (path === '/goal-setting' || path === '/goals') return 'goals';
    if (path === '/values') return 'values';
    if (path === '/calendar') return 'calendar';
    return 'dashboard';
  };

  const handleNavigate = (view: ViewType) => {
    switch (view) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'wheel-of-life':
        navigate('/wheel-of-life');
        break;
      case 'values':
        navigate('/values');
        break;
      case 'vision':
        navigate('/vision-board');
        break;
      case 'goals':
        navigate('/goal-setting');
        break;
      case 'calendar':
        navigate('/calendar');
        break;
      case 'templates':
        navigate('/community');
        break;
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

  const progressPercentage = (dashboardData.daysIntoJourney / dashboardData.totalDays) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Navigation Sidebar */}
      <Navigation 
        currentView={getActiveView()} 
        onNavigate={handleNavigate}
        isCollapsed={!sidebarOpen}
        onToggleCollapse={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-16'} overflow-y-auto`}>
      
      {/* Hero Section - Their Vision */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative max-w-6xl mx-auto px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 px-4 py-2 rounded-full mb-6">
              <span className="w-5 h-5 text-purple-400 flex items-center justify-center">✨</span>
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
                  <div className="flex items-center justify-center space-x-2 mt-3">
                    <button
                      onClick={saveVisionEdit}
                      className="w-8 h-8 bg-green-500/80 text-white rounded-full hover:bg-green-500 transition-colors flex items-center justify-center"
                      title="Save changes"
                    >
                      <span className="w-4 h-4 flex items-center justify-center">✓</span>
                    </button>
                    <button
                      onClick={cancelVisionEdit}
                      className="w-8 h-8 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors flex items-center justify-center"
                      title="Cancel editing"
                    >
                      <span className="w-4 h-4 flex items-center justify-center">✖️</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group cursor-pointer" onClick={startEditingVision}>
                  <div className="flex items-center justify-center space-x-3">
                    <span>
                      {hasVisionContent ? goalsData.annualSnapshot.snapshot : 'a one line summary of the vision'}
                    </span>
                    {!hasVisionContent && (
                      <span className="w-6 h-6 text-white/60 group-hover:text-white/80 transition-colors flex items-center justify-center">✏️</span>
                    )}
                  </div>
                  {!hasVisionContent && (
                    <p className="text-purple-200 text-sm mt-2 opacity-75">Click to edit</p>
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
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <button
                    onClick={saveWhyEdit}
                    className="w-6 h-6 bg-green-500/80 text-white rounded-full hover:bg-green-500 transition-colors flex items-center justify-center"
                    title="Save changes"
                  >
                    <span className="w-3 h-3 flex items-center justify-center">✓</span>
                  </button>
                  <button
                    onClick={cancelWhyEdit}
                    className="w-6 h-6 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors flex items-center justify-center"
                    title="Cancel editing"
                  >
                    <span className="w-3 h-3 flex items-center justify-center">✖️</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="group cursor-pointer max-w-3xl mx-auto" onClick={startEditingWhy}>
                <div className="flex items-center justify-center space-x-3">
                  <p className="text-xl text-slate-300">
                    {hasWhyContent ? goalsData.annualSnapshot.mantra : 'my big why'}
   \               </p>
                  {!hasWhyContent && (
                    <span className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors flex items-center justify-center">✏️</span>
                  )}
                </div>
                {!hasWhyContent && (
                  <p className="text-purple-200 text-sm mt-1 opacity-75">Click to edit</p>
                )}
              </div>
            )}
          </div>

          {/* \Core Values */}
          <div className="flex justify-center space-x-6 mb-12">
            {dashboardData.coreValues.map((value, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4">
                <div className="flex items-center space-x-3">
                  <span className="w-5 h-5 text-purple-400 flex items-center justify-center">❤️</span>
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
              <span className="w-12 h-12 text-purple-400 mb-2 flex items-center justify-center">→</span>
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
              <span className="w-8 h-8 text-purple-400 flex items-center justify-center">🎯</span>
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
                <span className="w-6 h-6 text-purple-400 flex items-center justify-center">🎯</span>
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
    </div>
  );
};

export default Dashboard;