import React from 'react';
import { MdDashboard, MdCalendarToday } from 'react-icons/md';
import { FaHeart, FaTarget } from 'react-icons/fa';
import { IoEye } from 'react-icons/io5';
import { HiMenu, HiX, HiHome, HiDownload, HiArrowLeft } from 'react-icons/hi';
import { useValuesData } from '../hooks/useValuesData';
import { useWheelData } from '../hooks/useWheelData';
import { useVisionBoardData } from '../hooks/useVisionBoardData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';

export type ViewType = 'dashboard' | 'wheel-of-life' | 'values' | 'vision' | 'goals' | 'calendar' | 'templates';

interface NavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  onNavigate, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  // Use proper data hooks instead of managing state directly
  const { data: valuesData } = useValuesData();
  const { data: wheelData } = useWheelData();
  const { data: visionData } = useVisionBoardData();
  const { data: goalsData } = useGoalSettingData();

  const getCompletionStats = () => {
    const lifeAreas = wheelData?.lifeAreas || [];
    const reflections = wheelData?.reflections || {};
    
    const completedReflections = Object.values(reflections).filter(
      (reflection: any) => 
        reflection?.goingWell?.length > 0 || 
        reflection?.needsImprovement?.length > 0 || 
        reflection?.idealVision?.trim() !== ''
    ).length;

    const averageScore = lifeAreas.length > 0 ? 
      lifeAreas.reduce((sum, item: any) => sum + (item?.score || 0), 0) / lifeAreas.length : 0;
    
    return {
      averageScore,
      completedReflections,
      totalAreas: lifeAreas.length,
      wheelCompleted: lifeAreas.every((area: any) => (area?.score || 0) > 0),
      allReflectionsCompleted: completedReflections === lifeAreas.length
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
  const visionItems = visionData?.visionItems || [];

  // Journey sections with real progress data
  const sections = [
    { 
      id: 'wheel-of-life' as ViewType, 
      icon: MdDashboard, 
      title: 'Baseline', 
      progress: wheelStats.wheelCompleted ? (wheelStats.allReflectionsCompleted ? 100 : 75) : (wheelStats.averageScore > 0 ? 50 : 0),
      active: currentView === 'wheel-of-life'
    },
    { 
      id: 'values' as ViewType, 
      icon: FaHeart, 
      title: 'Values', 
      progress: valuesData?.rankedCoreValues ? Math.min(100, (valuesData.rankedCoreValues.length / 6) * 100) : 0,
      active: currentView === 'values'
    },
    { 
      id: 'vision' as ViewType, 
      icon: IoEye, 
      title: 'Vision', 
      progress: visionItems.length > 0 ? Math.min(100, (visionItems.length / 4) * 100) : 0,
      active: currentView === 'vision'
    },
    { 
      id: 'goals' as ViewType,
      icon: FaTarget,
      title: 'Plan',
      progress: goalsProgress.percentage,
      active: currentView === 'goals'
    },
    { 
      id: 'calendar' as ViewType, 
      icon: MdCalendarToday, 
      title: 'Calendar', 
      progress: 0,
      active: currentView === 'calendar'
    }
  ];

  // Additional nav items
  const additionalNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HiHome, color: 'text-slate-600' },
    { id: 'templates', label: 'Templates', icon: HiDownload, color: 'text-purple-500' },
  ];

  const JourneySection = ({ section }: { section: typeof sections[0] }) => (
    <div 
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group relative ${
        section.active ? 'bg-purple-100 border-l-4 border-purple-500' : 'hover:bg-slate-100'
      } ${isCollapsed ? 'justify-center' : ''}`}
      onClick={() => onNavigate && onNavigate(section.id)}
    >
      <section.icon className={`w-5 h-5 ${
        section.active ? 'text-purple-600' : section.progress > 0 ? 'text-slate-600' : 'text-slate-400'
      }`} />
      {!isCollapsed && (
        <>
          <div className="flex-1">
            <span className={`text-sm font-medium ${
              section.active ? 'text-purple-900' : section.progress > 0 ? 'text-slate-700' : 'text-slate-500'
            }`}>
              {section.title}
            </span>
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
        </>
      )}
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {section.title} - {section.progress}%
        </div>
      )}

      {/* Active indicator for collapsed state */}
      {isCollapsed && section.active && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-l" />
      )}
    </div>
  );

  return (
    <>
      {/* Navigation Panel */}
      <nav 
        className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white shadow-lg border-r border-slate-200 overflow-y-auto transition-all duration-300 z-40 ${
          isCollapsed ? 'w-16' : 'w-80'
        }`}
      >
        <div className={`${isCollapsed ? 'p-2' : 'p-6'}`}>
          {/* Header with Toggle */}
          <div className={`flex items-center justify-between ${isCollapsed ? 'mb-2' : 'mb-6'}`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <HiArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className={`p-2 hover:bg-slate-100 rounded transition-colors ${
                isCollapsed ? 'mx-auto' : ''
              }`}
              title={isCollapsed ? "Open navigation" : "Collapse navigation"}
            >
              {isCollapsed ? (
                <HiMenu className="w-4 h-4 text-slate-600" />
              ) : (
                <HiX className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>

          {!isCollapsed && (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Your Journey</h2>
                <p className="text-slate-600 text-sm">From values to daily action</p>
              </div>
            </>
          )}

          {/* Journey Progress Sections */}
          <div className="space-y-2 mb-8">
            {sections.map(section => (
              <JourneySection key={section.id} section={section} />
            ))}
          </div>

          {/* Additional Navigation Items */}
          {!isCollapsed ? (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Additional Tools
              </h3>
              <ul className="space-y-2">
                {additionalNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onNavigate(item.id as ViewType)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                          isActive 
                            ? 'bg-purple-50 text-purple-700 shadow-sm' 
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : item.color}`} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="border-t border-slate-200 pt-6">
              <ul className="space-y-2">
                {additionalNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onNavigate(item.id as ViewType)}
                        className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative ${
                          isActive 
                            ? 'bg-purple-50 text-purple-700 shadow-sm' 
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        title={item.label}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : item.color}`} />
                        
                        {/* Tooltip for collapsed state */}
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </div>

                        {/* Active indicator for collapsed state */}
                        {isActive && (
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-l" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Overlay for mobile when expanded */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}
    </>
  );
};

export default Navigation;