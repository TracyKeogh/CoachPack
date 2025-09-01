import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Heart, 
  ImageIcon,
  Download,
  Target, 
  Calendar as CalendarIcon,
  Home,
  ChevronRight,
  Menu,
  X,
  ArrowLeft,
  User,
  Eye,
  CheckSquare,
  TrendingUp
} from 'lucide-react';
import type { ViewType } from '../App';

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
  // Load user progress data
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

  // Journey sections with real progress data
  const sections = [
    { 
      id: 'wheel' as ViewType, 
      icon: User, 
      title: 'Baseline', 
      progress: wheelStats.wheelCompleted ? (wheelStats.allReflectionsCompleted ? 100 : 75) : (wheelStats.averageScore > 0 ? 50 : 0),
      active: currentView === 'wheel'
    },
    { 
      id: 'values' as ViewType, 
      icon: Heart, 
      title: 'Values', 
      progress: valuesData.rankedCoreValues ? Math.min(100, (valuesData.rankedCoreValues.length / 6) * 100) : 0,
      active: currentView === 'values'
    },
    { 
      id: 'vision' as ViewType, 
      icon: Eye, 
      title: 'Vision', 
      progress: visionItems.length > 0 ? Math.min(100, (visionItems.length / 4) * 100) : 0,
      active: currentView === 'vision'
    },
    { 
      id: 'goals' as ViewType, 
      icon: CheckSquare, 
      title: 'Plan', 
      progress: goalsProgress.percentage,
      active: currentView === 'goals'
    },
    { 
      id: 'calendar' as ViewType, 
      icon: CalendarIcon, 
      title: 'Calendar', 
      progress: 0, // Add tracking completion logic when implemented
      active: currentView === 'calendar'
    }
  ];

  // Calculate overall progress
  const overallProgress = Math.round(sections.reduce((sum, section) => sum + section.progress, 0) / sections.length);

  // Traditional nav items (for reference/fallback)
  const traditionalNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-slate-600' },
    { id: 'templates', label: 'Templates', icon: Download, color: 'text-purple-500' },
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
      {/* Collapsed Navigation Toggle Button */}
      {isCollapsed && (
        <div className="fixed left-4 top-24 z-50">
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 bg-white shadow-lg border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors group"
            title="Open navigation"
          >
            <Menu className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
          </button>
        </div>
      )}

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
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Dashboard</span>
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
                <Menu className="w-4 h-4 text-slate-600" />
              ) : (
                <X className="w-4 h-4 text-slate-600" />
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

          {/* Overall Progress */}
          {!isCollapsed && (
            <div className={`p-4 rounded-xl text-white mb-8 ${
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
          )}

          {/* Additional Navigation Items */}
          {!isCollapsed ? (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Additional Tools
              </h3>
              <ul className="space-y-2">
                {traditionalNavItems.map((item) => {
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
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          isActive ? 'text-purple-500 transform rotate-90' : 'text-slate-400 group-hover:text-slate-600'
                        }`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="border-t border-slate-200 pt-6">
              <ul className="space-y-2">
                {traditionalNavItems.map((item) => {
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