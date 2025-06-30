import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Auth Components
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './AuthProvider';

// Main App Components
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import WheelOfLife from './components/WheelOfLife';
import ValuesClarity from './components/ValuesClarity';
import VisionBoard from './components/VisionBoard';
import Goals from './components/Goals';
import Calendar from './components/Calendar';
import LandingPage from './components/LandingPage';
import FreeWheelAssessment from './components/FreeWheelAssessment';
import PricingPage from './components/PricingPage';

export type ViewType = 'landing' | 'free-wheel' | 'dashboard' | 'wheel' | 'values' | 'vision' | 'goals' | 'calendar';

function AppContent() {
  const [isNavigationCollapsed, setIsNavigationCollapsed] = React.useState(false);

  // Auto-collapse navigation when on dashboard, expand for other views
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') {
      setIsNavigationCollapsed(true);
    } else {
      setIsNavigationCollapsed(false);
    }
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Header />
        <div className="flex">
          <Navigation 
            currentView={window.location.pathname.substring(1) as ViewType || 'dashboard'} 
            onNavigate={(view) => window.location.href = `/${view}`}
            isCollapsed={isNavigationCollapsed}
            onToggleCollapse={() => setIsNavigationCollapsed(!isNavigationCollapsed)}
          />
          <main 
            className={`flex-1 p-6 transition-all duration-300 ${
              isNavigationCollapsed ? 'ml-16' : 'ml-64'
            }`}
          >
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/dashboard" element={<Dashboard onNavigate={(view) => window.location.href = `/${view}`} />} />
                <Route path="/wheel" element={<WheelOfLife />} />
                <Route path="/values" element={<ValuesClarity />} />
                <Route path="/vision" element={<VisionBoard />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/calendar" element={<Calendar />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </DndProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onNavigate={(view) => window.location.href = `/${view}`} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          
          {/* Free Assessment Route */}
          <Route 
            path="/free-wheel" 
            element={
              <FreeWheelAssessment 
                onComplete={(results) => {
                  console.log('Assessment completed:', results);
                }}
                onBackToLanding={() => window.location.href = '/'}
              />
            } 
          />

          {/* Dashboard and feature routes */}
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;