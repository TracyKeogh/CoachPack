import React from 'react';
import { Target, Sparkles, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <Target className="w-8 h-8 text-purple-600" />
              <Sparkles className="w-4 h-4 text-orange-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Coach Pack</h1>
              <p className="text-sm text-slate-600">Intentional Living Made Actionable</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard"
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/pricing"
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Pricing
            </Link>
            {user ? (
              <div className="relative">
                <div 
                  className="flex items-center space-x-4 cursor-pointer"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{user.name || 'Welcome back!'}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                    <div className="py-1">
                      <Link 
                        to="/dashboard" 
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link 
                        to="/pricing" 
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Pricing
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;