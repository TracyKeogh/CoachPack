import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Auth Components
import AuthProvider from './AuthProvider';
import LoginPage from './components/auth/LoginPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';

// Main App Components
import LandingPage from './components/LandingPage';
import PricingPage from './components/PricingPage';
import CheckoutPage from './components/CheckoutPage';
import CheckoutSuccessPage from './components/CheckoutSuccessPage';
import CancelPage from './components/CancelPage';
import AdminDashboard from './components/AdminDashboard';
import FreeWheelAssessment from './components/FreeWheelAssessment';

// Dashboard Components
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import WheelOfLife from './components/WheelOfLife';
import ValuesClarity from './components/ValuesClarity';
import VisionBoard from './components/VisionBoard';
import GoalSetting from './components/GoalSetting';
import Calendar from './components/Calendar';
import CommunityTemplates from './components/CommunityTemplates';

// Auth Layout Component
const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your Coach Pack dashboard</p>
        </div>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

// Dashboard Layout Component
const DashboardLayout: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Header />
        <div className="flex">
          <Navigation />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/wheel" element={<WheelOfLife />} />
              <Route path="/values" element={<ValuesClarity />} />
              <Route path="/vision" element={<VisionBoard />} />
              <Route path="/goals" element={<GoalSetting />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/templates" element={<CommunityTemplates />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </DndProvider>
  );
};

// 404 Component
const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-red-600">404</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          
          {/* Free Assessment (No Auth Required) */}
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
          
          {/* Auth Routes */}
          <Route path="/auth/*" element={<AuthLayout />} />
          
          {/* Checkout Route - Make sure it's accessible */}
          <Route path="/checkout" element={<CheckoutPage />} />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          
          {/* Individual Protected Routes (for direct access) */}
          <Route 
            path="/wheel" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/values" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vision" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/goals" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/templates" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Route */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Legacy Redirects */}
          <Route path="/signup" element={<Navigate to="/pricing" replace />} />
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/success" element={<Navigate to="/checkout-success" replace />} />
          {/* Direct Forgot Password Route for convenience */}
          <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;