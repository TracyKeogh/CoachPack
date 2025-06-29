import React from 'react';
import { 
  BarChart3, 
  Heart, 
  ImageIcon, 
  Target, 
  Calendar as CalendarIcon,
  Home,
  ChevronRight,
  Menu,
  X,
  ArrowLeft
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
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-slate-600' },
    { id: 'wheel', label: 'Wheel of Life', icon: BarChart3, color: 'text-purple-600' },
    { id: 'values', label: 'Values Clarity', icon: Heart, color: 'text-red-500' },
    { id: 'vision', label: 'Vision Board', icon: ImageIcon, color: 'text-teal-600' },
    { id: 'goals', label: 'Goals', icon: Target, color: 'text-orange-500' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, color: 'text-indigo-600' },
  ];

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
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-6">
          {/* Header with Toggle */}
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onNavigate('landing')}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Back to Landing</span>
                </button>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className={`p-1 hover:bg-slate-100 rounded transition-colors ${
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
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Your Journey
            </h2>
          )}

          {/* Navigation Items */}
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id as ViewType)}
                    className={`w-full flex items-center rounded-lg transition-all duration-200 group relative ${
                      isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'
                    } ${
                      isActive 
                        ? 'bg-purple-50 text-purple-700 shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : item.color}`} />
                      {!isCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-purple-500 transform rotate-90' : 'text-slate-400 group-hover:text-slate-600'
                      }`} />
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}

                    {/* Active indicator for collapsed state */}
                    {isCollapsed && isActive && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-purple-600 rounded-l" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Progress Indicator (only when expanded) */}
          {!isCollapsed && (
            <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <h3 className="text-sm font-semibold text-purple-900 mb-2">Journey Progress</h3>
              <div className="space-y-2">
                {navItems.slice(1).map((item) => {
                  const isCompleted = false; // You can add completion logic here
                  const isCurrentlyWorking = currentView === item.id;
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isCompleted ? 'bg-green-500' : 
                        isCurrentlyWorking ? 'bg-purple-500' : 
                        'bg-slate-300'
                      }`} />
                      <span className={`text-xs ${
                        isCurrentlyWorking ? 'text-purple-700 font-medium' : 'text-slate-600'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
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