import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import WheelOfLife from './components/WheelOfLife';
import ValuesClarity from './components/ValuesClarity';
import VisionBoard from './components/VisionBoard';
import GoalSetting from './components/GoalSetting';
import Goals from './components/Goals';
import NotesPanel from './components/NotesPanel';
import Calendar from './components/Calendar';
import CheckoutPage from './components/CheckoutPage';
import CheckoutSuccessPage from './components/CheckoutSuccessPage';
import CancelPage from './components/CancelPage';
import PricingPage from './components/PricingPage';
import CompanyLandingPage from './components/CompanyLandingPage';
import CommunityTemplates from './components/CommunityTemplates';
import FreeAssessmentPage from './components/FreeAssessmentPage';

export type ViewType = 'dashboard' | 'wheel-of-life' | 'values' | 'vision' | 'goals' | 'calendar' | 'templates';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/companies" element={<CompanyLandingPage />} />
        <Route path="/community" element={<CommunityTemplates />} />
        <Route path="/free-assessment" element={<FreeAssessmentPage />} />
        
        {/* Protected routes - temporarily without authentication */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wheel-of-life" element={<WheelOfLife />} />
        <Route path="/values" element={<ValuesClarity />} />
        <Route path="/vision-board" element={<VisionBoard />} />
        <Route path="/goal-setting" element={<GoalSetting />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/notes" element={<NotesPanel />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        
        {/* Redirect old routes */}
        <Route path="/home" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;