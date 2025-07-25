import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  BarChart3, 
  Target, 
  Heart, 
  Eye, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  User
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    wheel: null,
    goals: null,
    values: null,
    vision: null,
    profile: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    completedFeatures: 0,
    totalProgress: 0,
    recentActivity: [],
    nextActions: []
  });

  // Load all user data from different feature tables
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load feature data
      const [wheelResult, goalsResult, valuesResult, visionResult] = await Promise.all([
        supabase
          .from('user_wheel_data')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('user_goals_data')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('user_values_data')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('user_vision_data')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ]);

      const data = {
        profile,
        wheel: wheelResult.data,
        goals: goalsResult.data,
        values: valuesResult.data,
        vision: visionResult.data
      };

      setDashboardData(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress statistics
  const calculateStats = (data) => {
    let completedFeatures = 0;
    let totalProgress = 0;
    const recentActivity = [];
    const nextActions = [];

    // Check Wheel of Life completion
    if (data.wheel?.life_areas && Array.isArray(data.wheel.life_areas) && data.wheel.life_areas.length > 0) {
      completedFeatures++;
      totalProgress += 100;
      recentActivity.push({
        feature: 'Wheel of Life',
        action: 'Completed assessment',
        date: data.wheel.last_updated || data.wheel.created_at,
        icon: BarChart3,
        color: 'text-blue-600'
      });
    } else {
      nextActions.push({
        feature: 'Wheel of Life',
        action: 'Complete your life assessment',
        icon: BarChart3,
        color: 'text-blue-600',
        route: '/wheel'
      });
    }

    // Check Goals completion
    if (data.goals?.category_goals) {
      const goals = data.goals.category_goals;
      let goalProgress = 0;
      let completedGoals = 0;
      
      Object.keys(goals).forEach(category => {
        const categoryData = goals[category];
        if (categoryData.goalText && categoryData.measureText) {
          completedGoals++;
          goalProgress += 33.33; // Each category is worth ~33%
        }
      });

      if (completedGoals > 0) {
        completedFeatures++;
        totalProgress += goalProgress;
        recentActivity.push({
          feature: 'Goals',
          action: `Set ${completedGoals} goal${completedGoals > 1 ? 's' : ''}`,
          date: data.goals.last_updated,
          icon: Target,
          color: 'text-green-600'
        });
      } else {
        nextActions.push({
          feature: 'Goals',
          action: 'Set your 90-day goals',
          icon: Target,
          color: 'text-green-600',
          route: '/goals'
        });
      }
    } else {
      nextActions.push({
        feature: 'Goals',
        action: 'Set your 90-day goals',
        icon: Target,
        color: 'text-green-600',
        route: '/goals'
      });
    }

    // Check Values completion
    if (data.values?.core_values && data.values.core_values.length > 0) {
      completedFeatures++;
      totalProgress += 100;
      recentActivity.push({
        feature: 'Values',
        action: 'Clarified core values',
        date: data.values.last_updated,
        icon: Heart,
        color: 'text-red-600'
      });
    } else {
      nextActions.push({
        feature: 'Values',
        action: 'Clarify your core values',
        icon: Heart,
        color: 'text-red-600',
        route: '/values'
      });
    }

    // Check Vision completion (check both vision_elements and vision_items)
    const visionItems = data.vision?.vision_items || data.vision?.vision_elements || [];
    if (visionItems && visionItems.length > 0) {
      completedFeatures++;
      totalProgress += 100;
      recentActivity.push({
        feature: 'Vision Board',
        action: `Created vision board with ${visionItems.length} items`,
        date: data.vision.last_updated,
        icon: Eye,
        color: 'text-purple-600'
      });
    } else {
      nextActions.push({
        feature: 'Vision Board',
        action: 'Create your vision board',
        icon: Eye,
        color: 'text-purple-600',
        route: '/vision'
      });
    }

    // Sort recent activity by date (most recent first)
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    setStats({
      completedFeatures,
      totalProgress: Math.round(totalProgress / 4), // Average across 4 features
      recentActivity: recentActivity.slice(0, 5), // Show last 5 activities
      nextActions: nextActions.slice(0, 3) // Show next 3 actions
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Navigation handler using React Router
  const handleNavigation = (route) => {
    navigate(route);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}{dashboardData.profile?.full_name ? `, ${dashboardData.profile.full_name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-gray-600 mt-1">Here's your progress on your intentional living journey</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <User className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProgress}%</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                style={{ width: `${stats.totalProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Features Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedFeatures}/4</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {4 - stats.completedFeatures} features remaining
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Actions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.nextActions.length}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Ready to continue your journey
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feature Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Features</h2>
              <div className="space-y-4">
                {/* Wheel of Life */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Wheel of Life</h3>
                      <p className="text-sm text-gray-600">
                        {dashboardData.wheel ? 'Assessment completed' : 'Not started'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {dashboardData.wheel ? '100%' : '0%'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleNavigation('/wheel')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Goals */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 rounded-lg p-3">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">90-Day Goals</h3>
                      <p className="text-sm text-gray-600">
                        {dashboardData.goals?.category_goals ? 
                          `${Object.keys(dashboardData.goals.category_goals).filter(k => 
                            dashboardData.goals.category_goals[k].goalText
                          ).length} goals set` : 
                          'Not started'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {dashboardData.goals?.category_goals ? 
                          `${Math.round((Object.keys(dashboardData.goals.category_goals).filter(k => 
                            dashboardData.goals.category_goals[k].goalText
                          ).length / 3) * 100)}%` : 
                          '0%'
                        }
                      </p>
                    </div>
                    <button 
                      onClick={() => handleNavigation('/goals')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Values */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 rounded-lg p-3">
                      <Heart className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Core Values</h3>
                      <p className="text-sm text-gray-600">
                        {dashboardData.values?.core_values?.length > 0 ? 
                          `${dashboardData.values.core_values.length} values identified` : 
                          'Not started'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {dashboardData.values?.core_values?.length > 0 ? '100%' : '0%'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleNavigation('/values')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Vision Board */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Vision Board</h3>
                      <p className="text-sm text-gray-600">
                        {dashboardData.vision?.vision_elements?.length > 0 ? 
                          `${dashboardData.vision.vision_elements.length} elements added` : 
                          'Not started'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {dashboardData.vision?.vision_elements?.length > 0 ? '100%' : '0%'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleNavigation('/vision')}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Recent Activity
              </h2>
              {stats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`rounded-full p-2 ${activity.color.replace('text-', 'bg-').replace('600', '100')}`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.feature}</p>
                        <p className="text-xs text-gray-600">{activity.action}</p>
                        <p className="text-xs text-gray-400">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent activity yet. Start by completing a feature!</p>
              )}
            </div>

            {/* Next Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Next Steps
              </h2>
              {stats.nextActions.length > 0 ? (
                <div className="space-y-3">
                  {stats.nextActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleNavigation(action.route)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`rounded-full p-2 ${action.color.replace('text-', 'bg-').replace('600', '100')}`}>
                          <action.icon className={`h-4 w-4 ${action.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{action.feature}</p>
                          <p className="text-xs text-gray-600">{action.action}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">All caught up!</p>
                  <p className="text-xs text-gray-600">You've completed all available features</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;