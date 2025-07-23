import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Auth Components
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import CheckoutPage from './components/CheckoutPage';
import SuccessPage from './components/SuccessPage';
import CancelPage from './components/CancelPage';
import AdminDashboard from './components/AdminDashboard';
import AuthProvider from './AuthProvider';

// Main App Components
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import WheelOfLife from './components/WheelOfLife';
import ValuesClarity from './components/ValuesClarity';
import VisionBoard from './components/VisionBoard';
import GoalSetting from './components/GoalSetting';
import Calendar from './components/Calendar';
import LandingPage from './components/LandingPage';
import CommunityTemplates from './components/CommunityTemplates';
import FreeWheelAssessment from './components/FreeWheelAssessment';
import PricingPage from './components/PricingPage';

export type ViewType = 'landing' | 'free-wheel' | 'dashboard' | 'wheel' | 'values' | 'vision' | 'goals' | 'calendar' | 'templates';

// Custom component to handle 404 errors
const NotFound = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-red-600">404</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-600 mb-6">
          We couldn't find the page you're looking for: <span className="font-medium">{location.pathname}</span>
        </p>
        <div className="space-y-3">
          <a 
            href="/"
            className="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Home
          </a>
          <a 
            href="/dashboard"
            className="block w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const [isNavigationCollapsed, setIsNavigationCollapsed] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // THIS WAS MISSING - CRITICAL FIX

  // Auto-collapse navigation when on dashboard, expand for other views
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') {
      setIsNavigationCollapsed(true);
    } else {
      setIsNavigationCollapsed(false);
    }
  }, [location.pathname]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Header />
        <div className="flex">
          <Navigation 
            currentView={location.pathname.substring(1) as ViewType || 'dashboard'} 
            onNavigate={(view: ViewType) => navigate(`/${view}`)}
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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wheel" element={<WheelOfLife />} />
                <Route path="/values" element={<ValuesClarity />} />
                <Route path="/vision" element={<VisionBoard />} />
                <Route path="/goals" element={<GoalSetting />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/templates" element={<CommunityTemplates />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </DndProvider>
  );
}

// Layout component for auth pages
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <Router basename="/">
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onNavigate={(view) => window.location.href = `/${view}`} />} />
          
          {/* Auth Routes with consistent layout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
          
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
         
         {/* Dashboard Route */}
         <Route path="/dashboard" element={
           <ProtectedRoute>
             <AppContent />
           </ProtectedRoute>
         } />
          
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
          <Route path="/wheel" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/values" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/vision" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/goals" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/templates" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;