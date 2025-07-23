import React, { useState, useEffect } from 'react';
import { Heart, Target, Calendar, Sparkles, ChevronRight, Clock, BarChart3, Eye, CheckSquare, TrendingUp, User } from 'lucide-react';

type ViewType = 'dashboard' | 'wheel' | 'values' | 'vision' | 'goals' | 'calendar' | 'templates';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [valuesData, setValuesData] = useState({ rankedCoreValues: [] });
  const [wheelData, setWheelData] = useState([]);
  const [reflectionData, setReflectionData] = useState({});
  const [visionItems, setVisionItems] = useState([]);
  const [goalsData, setGoalsData] = useState({ categoryGoals: {}, annualSnapshot: {} });

  useEffect(() => {
    try {
      const storedValues = localStorage.getItem('coach-pack-values-clarity');
      if (storedValues) {
        setValuesData(JSON.parse(storedValues));
      }
    } catch (error) {
      console.error('Failed to load values data:', error);
    }

    try {
      const storedWheel = localStorage.getItem('coach-pack-wheel-of-life');
      if (storedWheel) {
        const wheelDataParsed = JSON.parse(storedWheel);
        setWheelData(wheelDataParsed.lifeAreas || []);
        setReflectionData(wheelDataParsed.reflections || {});
      }
    } catch (error) {
      console.error('Failed to load wheel data:', error);
    }

    try {
      const storedVision = localStorage.getItem('coach-pack-vision-board');
      if (storedVision) {
        const visionDataParsed = JSON.parse(storedVision);
        setVisionItems(visionDataParsed.visionItems || []);
      }
    } catch (error) {
      console.error('Failed to load vision data:', error);
    }

    try {
      const storedGoals = localStorage.getItem('coach-pack-goal-setting');
      if (storedGoals) {
        setGoalsData(JSON.parse(storedGoals));
      }
    } catch (error) {
      console.error('Failed to load goals data:', error);
    }
  }, []);

  const getCompletionStats = () => {
    const completedReflections = Object.values(reflectionData).filter(
      (reflection: any) => 
        reflection?.goingWell?.length > 0 || 
        reflection?.needsImprovement?.length > 0 || 
        reflection?.idealVision?.trim() !== ''
    ).length;

    const averageScore = wheelData.length > 0 ? 
      wheelData.reduce((sum, item: any) => sum + (item?.score || 0), 0) / wheelData.length : 0;
    
    return {
      averageScore,
      completedReflections,
      totalAreas: wheelData.length,
      wheelCompleted: wheelData.every((area: any) => (area?.score || 0) > 0),
      allReflectionsCompleted: completedReflections === wheelData.length
    };
  };

  const getGoalsProgress = () => {
    const categoryGoals = goalsData?.categoryGoals || {};
    const totalCategories = 3;
    const completedCategories = Object.values(categoryGoals).filter((goal: any) => goal?.goal?.trim()).length;
    const hasAnnualSnapshot = goalsData?.annualSnapshot?.snapshot?.trim();
    
    const totalSteps = 1 + totalCategories;
    const completedSteps = (hasAnnualSnapshot ? 1 : 0) + completedCategories;
    
    return {
      completed: completedSteps,
      total: totalSteps,
      percentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    };
  };

  const wheelStats = getCompletionStats();
  const goalsProgress = getGoalsProgress();
  
  const sections = [
    { 
      id: 'baseline' as ViewType, 
      icon: User, 
      title: 'Baseline', 
      progress: wheelStats.wheelCompleted ? (wheelStats.allReflectionsCompleted ? 100 : 75) : (wheelStats.averageScore > 0 ? 50 : 0),
      active: true 
    },
    { 
      id: 'vision' as ViewType, 
      icon: Eye, 
      title: 'Vision', 
      progress: visionItems.length > 0 ? Math.min(100, (visionItems.length / 4) * 100) : 0,
      active: false 
    },
    { 
      id: 'goals' as ViewType, 
      icon: CheckSquare, 
      title: 'Plan', 
      progress: goalsProgress.percentage,
      active: false 
    },
    { 
      id: 'calendar' as ViewType, 
      icon: Calendar, 
      title: 'Track', 
      progress: 0,
      active: false 
    }
  ];

  const overallProgress = Math.round(sections.reduce((sum, section) => sum + section.progress, 0) / sections.length);

  const getUserStory = () => {
    const hasValues = valuesData?.rankedCoreValues && valuesData.rankedCoreValues.length > 0;
    const hasWheel = wheelData && wheelData.length > 0 && wheelStats.averageScore > 0;
    const hasVision = visionItems && visionItems.length > 0;
    const hasGoals = Object.keys(goalsData?.categoryGoals || {}).length > 0;

    const daysIntoJourney = Math.max(1, Math.round((overallProgress / 100) * 30) + 1);
    
    let visionStatement = "Complete your baseline assessment to unlock your personal vision";
    if (hasGoals && goalsData?.annualSnapshot?.snapshot) {
      visionStatement = goalsData.annualSnapshot.snapshot;
    } else if (hasVision && visionItems.length > 0) {
      visionStatement = "Building a life of purpose, growth, and fulfillment";
    }

    let currentFocus = "Taking the first steps toward intentional living";
    if (hasGoals) {
      const activeGoals = Object.values(goalsData?.categoryGoals || {}).filter((goal: any) => goal?.goal?.trim());
      if (activeGoals.length > 0) {
        currentFocus = `Focusing on ${activeGoals.map((g: any) => g.category).join(', ')} goals for meaningful progress`;
      }
    } else if (hasValues) {
      currentFocus = "Aligning daily actions with your core values";
    }

    let coreValues = ["Select Your Values", "Complete Baseline", "To See Results"];
    if (hasValues && valuesData.rankedCoreValues.length > 0) {
      coreValues = valuesData.rankedCoreValues.slice(0, 3).map((v: any) => v.name);
    }

    let lifeAreas = Array(8).fill(null).map((_, i) => ({
      area: ['Career', 'Health', 'Relationships', 'Growth', 'Recreation', 'Money', 'Environment', 'Contribution'][i],
      now: 0,
      vision: 0,
      gap: 0
    }));

    if (hasWheel && wheelData) {
      lifeAreas = wheelData.map((area: any, index: number) => {
        const reflection = (reflectionData as any)[index];
        const visionScore = reflection?.targetRating || Math.min(10, (area?.score || 0) + 2);
        return {
          area: area?.area || 'Unknown',
          now: area?.score || 0,
          vision: visionScore,
          gap: visionScore - (area?.score || 0)
        };
      });
    }

    return {
      name: "Your Journey",
      daysIntoJourney,
      totalDays: 90,
      coreValues,
      visionStatement,
      currentFocus,
      lifeAreas,
      hasData: hasValues || hasWheel || hasVision || hasGoals
    };
  };

  const storyData = getUserStory();
  const progressPercentage = (storyData.daysIntoJourney / storyData.totalDays) * 100;

  const getUpcomingMilestones = () => {
    const milestones: Array<{
      title: string;
      date: string;
      daysAway: number;
      type: 'milestone' | 'goal';
      color: string;
    }> = [];

    const categoryGoals = goalsData?.categoryGoals || {};
    
    Object.entries(categoryGoals).forEach(([category, goalData]: [string, any]) => {
      if (goalData?.milestones && Array.isArray(goalData.milestones)) {
        goalData.milestones.forEach((milestone: any) => {
          if (milestone?.dueDate && milestone?.title) {
            const dueDate = new Date(milestone.dueDate);
            const today = new Date();
            const daysAway = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysAway > 0 && daysAway <= 60) {
              milestones.push({
                title: milestone.title,
                date: `Day ${storyData.daysIntoJourney + daysAway}`,
                daysAway,
                type: 'milestone',
                color: category === 'business' ? 'purple' : category === 'body' ? 'green' : 'blue'
              });
            }
          }
        });
      }
    });

    return milestones.sort((a, b) => a.daysAway - b.daysAway).slice(0, 3);
  };

  const upcomingMilestones = getUpcomingMilestones();

  const SidebarSection = ({ section }: { section: typeof sections[0] }) => (
    <div 
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        section.active ? 'bg-purple-100 border-l-4 border-purple-500' : 'hover:bg-slate-100'
      }`}
      onClick={() => onNavigate && onNavigate(section.id)}
    >
      <section.icon className={`w-5 h-5 ${
        section.active ? 'text-purple-600' : section.progress > 0 ? 'text-slate-600' : 'text-slate-400'
      }`} />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${
            section.active ? 'text-purple-900' : section.progress > 0 ? 'text-slate-700' : 'text-slate-500'
          }`}>
            {section.title}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your Journey</h2>
          <p className="text-slate-600 text-sm">From values to daily action</p>
        </div>
        
        <div className="space-y-3">
          {sections.map(section => (
            <SidebarSection key={section.id} section={section} />
          ))}
        </div>

        <div className={`mt-8 p-4 rounded-xl text-white ${
          overallProgress > 50 ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 
          overallProgress > 0 ? 'bg-gradient-to-r from-slate-500 to-slate-600' : 
          'bg-gradient-to-r from-slate-400 to-slate-500'
        }`}>
          <h3 className="font-semibold mb-2">Overall Progress</h3>
          <div className="text-2xl font-bold">{overallProgress}%</div>
          <p className={`text-sm ${
            overallProgress > 50 ? 'text-purple-100' : 'text-slate-100'
          }`}>
            {overallProgress === 0 ? 'Ready to begin' : 
             overallProgress < 25 ? 'Getting started' :
             overallProgress < 50 ? 'Building momentum' :
             overallProgress < 75 ? 'Making great progress' : 'Almost there!'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
          <div className="relative max-w-6xl mx-auto px-8 py-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-purple-500/20 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-medium">Day {storyData.daysIntoJourney} of Your Journey</span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                {storyData.visionStatement}
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                {storyData.currentFocus}
              </p>
            </div>

            {/* Core Values */}
            <div className="flex justify-center space-x-6 mb-12">
              {storyData.coreValues.map((value, i) => (
                <div key={i} className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 ${
                  !storyData.hasData ? 'opacity-60' : ''
                }`}>
                  <div className="flex items-center space-x-3">
                    <Heart className={`w-5 h-5 ${storyData.hasData ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className={`font-semibold ${storyData.hasData ? 'text-white' : 'text-slate-300'}`}>{value}</span>
                  </div>
                </div>
              ))}
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
                  <span className={progressPercentage > 50 ? 'text-green-400' : 'text-slate-500'}>Vision Achieved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Life Areas */}
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Your Life Today</h2>
            <p className="text-slate-400">
              {storyData.hasData ? "See how each area is evolving toward your vision" : "Complete your assessment to see your starting point and vision"}
            </p>
          </div>

          {/* Wheel Comparison */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-3xl p-8 mb-12">
            <div className="flex items-center justify-center space-x-16">
              {/* Current State Wheel */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-300 mb-6">Today</h3>
                <div className="relative mb-4">
                  <svg width="200" height="200" className="transform -rotate-90">
                    {storyData.lifeAreas.map((area, index) => {
                      const startAngle = (index * 360) / storyData.lifeAreas.length;
                      const endAngle = ((index + 1) * 360) / storyData.lifeAreas.length;
                      const radius = Math.max(20, (area.now / 10) * 80);
                      
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
                          fill={area.now > 0 ? "rgba(147, 51, 234, 0.6)" : "rgba(71, 85, 105, 0.4)"}
                          stroke={area.now > 0 ? "rgba(147, 51, 234, 0.8)" : "rgba(71, 85, 105, 0.6)"}
                          strokeWidth="1"
                        />
                      );
                    })}
                    
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
                        {storyData.hasData ? 
                          Math.round(storyData.lifeAreas.reduce((sum, area) => sum + area.now, 0) / 8 * 10) / 10 :
                          '?'
                        }
                      </div>
                      <div className="text-xs text-slate-400">{storyData.hasData ? 'Avg' : 'Start'}</div>
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
                    {storyData.lifeAreas.map((area, index) => {
                      const startAngle = (index * 360) / storyData.lifeAreas.length;
                      const endAngle = ((index + 1) * 360) / storyData.lifeAreas.length;
                      const radius = Math.max(20, (area.vision / 10) * 80);
                      
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
                          fill={area.vision > 0 ? "rgba(34, 197, 94, 0.6)" : "rgba(71, 85, 105, 0.4)"}
                          stroke={area.vision > 0 ? "rgba(34, 197, 94, 0.8)" : "rgba(71, 85, 105, 0.6)"}
                          strokeWidth="1"
                        />
                      );
                    })}
                    
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
                        {storyData.hasData ? 
                          Math.round(storyData.lifeAreas.reduce((sum, area) => sum + area.vision, 0) / 8 * 10) / 10 :
                          '?'
                        }
                      </div>
                      <div className="text-xs text-green-400">{storyData.hasData ? 'Target' : 'Vision'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-8 mt-8 text-sm">
              {storyData.lifeAreas.slice(0, 4).map((area, i) => (
                <div key={i} className={storyData.hasData ? "text-slate-400" : "text-slate-500"}>{area.area}</div>
              ))}
            </div>
          </div>

          {/* 90-Day Calendar */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Target className="w-8 h-8 text-purple-400" />
                <h3 className="text-2xl font-bold text-white">Your 90-Day Journey</h3>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Day {storyData.daysIntoJourney} of 90</div>
                <div className="text-lg font-semibold text-purple-400">{90 - storyData.daysIntoJourney} days remaining</div>
              </div>
            </div>
            
            <div className="grid grid-cols-10 gap-1 mb-6">
              {Array.from({ length: 90 }, (_, i) => {
                const dayNumber = i + 1;
                const isPast = dayNumber <= storyData.daysIntoJourney;
                const isToday = dayNumber === storyData.daysIntoJourney;
                
                const milestone = upcomingMilestones.find(m => 
                  m.daysAway === dayNumber - storyData.daysIntoJourney
                );
                
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm flex items-center justify-center text-xs font-medium relative ${
                      isPast 
                        ? 'bg-slate-600/60 text-slate-400' 
                        : isToday 
                          ? 'bg-purple-500 text-white animate-pulse ring-2 ring-purple-400' 
                          : 'bg-slate-700/30 text-slate-500 hover:bg-slate-600/40'
                    }`}
                  >
                    {milestone ? (
                      <div className={`absolute inset-0 ${
                        milestone.color === 'purple' ? 'bg-purple-500' :
                        milestone.color === 'green' ? 'bg-green-500' :
                        'bg-blue-500'
                      } rounded-sm flex items-center justify-center text-white`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    ) : (
                      dayNumber
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mb-6">
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-slate-400 via-purple-500 to-green-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(storyData.daysIntoJourney / 90) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-slate-400">Start</span>
                <span className="text-purple-400 font-medium">Day {storyData.daysIntoJourney}</span>
                <span className="text-green-400">Vision Achieved</span>
              </div>
            </div>

            {upcomingMilestones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {upcomingMilestones.map((event, i) => (
                  <div key={i} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
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
            ) : (
              <div className="text-center py-8">
                <div className="text-slate-500 mb-4">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p>
                    {storyData.hasData ? 
                      "Add milestones to your goals to see upcoming events" : 
                      "Complete your planning stages to see upcoming milestones and goals"
                    }
                  </p>
                </div>
              </div>
            )}

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
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl px-8 py-6">
              <div className="text-3xl">🎯</div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {storyData.hasData ? "You're Building Momentum" : "Your Journey Awaits"}
                </div>
                <div className="text-slate-400 text-sm">
                  {storyData.hasData ? 
                    `${90 - storyData.daysIntoJourney} days remaining to achieve your vision` :
                    "Complete your baseline assessment to unlock your personal story"
                  }
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