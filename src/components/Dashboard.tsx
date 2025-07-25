import React from 'react';
import { 
  BarChart3, 
  Heart, 
  ImageIcon, 
  Target,
  Calendar as CalendarIcon,
  ArrowRight,
  Download,
  Sparkles,
  CheckCircle2,
  Clock,
  Star,
  Zap,
  Eye,
  Compass,
  TrendingUp,
  User
} from 'lucide-react';
import type { ViewType } from '../App';
import { useValuesData } from '../hooks/useValuesData';
import { useWheelData } from '../hooks/useWheelData';
import { useVisionBoardData } from '../hooks/useVisionBoardData';
import { useGoalSettingData } from '../hooks/useGoalSettingData';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // Load real data from hooks
  const { data: valuesData } = useValuesData();
  const { data: wheelData, reflectionData } = useWheelData();
  const { visionItems, getCompletionStats } = useVisionBoardData();
  const { data: goalsData } = useGoalSettingData();

  // Get top values
  const coreValues = valuesData.rankedCoreValues.slice(0, 6);
  const supportingValues = valuesData.supportingValues.slice(0, 3);

  // Get wheel areas
  const wheelAreas = wheelData || [];
  
  // Get goals
  const activeGoals = Object.values(goalsData.categoryGoals)
    .filter(goal => goal.goal && goal.goal.trim() !== '');

  // Calculate completion stats
  const wheelCompleted = wheelAreas.length > 0 && wheelAreas.some(area => area.score > 0);
  const valuesCompleted = coreValues.length > 0;
  
  // Check for actual user-created vision content (not default stock photos)
  const defaultImageUrls = [
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400'
  ];
  
  const customVisionItems = visionItems.filter(item => 
    !defaultImageUrls.includes(item.imageUrl) || 
    (item.title !== 'Dream Office Space' && item.title !== 'Mountain Adventure' && 
     item.title !== 'Family Time' && item.title !== 'Inner Peace')
  );
  
  const visionCompleted = customVisionItems.length > 0;
  const goalsCompleted = activeGoals.length > 0;

  const completedFeatures = [wheelCompleted, valuesCompleted, visionCompleted, goalsCompleted].filter(Boolean).length;
  const totalProgress = Math.round((completedFeatures / 4) * 100);

  // Get today's date
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const todayFormatted = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

  // Get greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get a focus for today based on goals
  const todaysFocus = activeGoals.length > 0 
    ? `Focus on: ${activeGoals[0].goal}`
    : wheelCompleted
    ? 'Consider setting some goals based on your wheel assessment'
    : 'Start with your Wheel of Life assessment';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getGreeting()}!
            </h1>
            <p className="text-gray-600 mt-1">Here's your progress on your intentional living journey</p>
            <p className="text-sm text-gray-500 mt-1">{todayFormatted}</p>
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
              <p className="text-3xl font-bold text-gray-900">{totalProgress}%</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 rounded-full h-2 transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Features Completed</p>
              <p className="text-3xl font-bold text-gray-900">{completedFeatures}/4</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {4 - completedFeatures} features remaining
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vision Items</p>
              <p className="text-3xl font-bold text-gray-900">{customVisionItems.length}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Items in your vision board
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
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => onNavigate('wheel')}>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Wheel of Life</h3>
                    <p className="text-sm text-gray-600">
                      {wheelCompleted ? 
                        `Average score: ${wheelAreas.length > 0 ? 
                          (wheelAreas.reduce((sum, area) => sum + area.score, 0) / wheelAreas.length).toFixed(1) : 
                          '0'}/10` : 
                        'Not started'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {wheelCompleted ? '100%' : '0%'}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              {/* Goals */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => onNavigate('goals')}>
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 rounded-lg p-3">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">90-Day Goals</h3>
                    <p className="text-sm text-gray-600">
                      {goalsCompleted ? 
                        `${activeGoals.length} goal${activeGoals.length === 1 ? '' : 's'} set` : 
                        'Not started'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {goalsCompleted ? '100%' : '0%'}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-green-600" />
                </div>
              </div>

              {/* Values */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => onNavigate('values')}>
                <div className="flex items-center space-x-4">
                  <div className="bg-red-100 rounded-lg p-3">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Core Values</h3>
                    <p className="text-sm text-gray-600">
                      {valuesCompleted ? 
                        `${coreValues.length} values identified` : 
                        'Not started'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {valuesCompleted ? '100%' : '0%'}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-red-600" />
                </div>
              </div>

              {/* Vision Board */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => onNavigate('vision')}>
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Vision Board</h3>
                    <p className="text-sm text-gray-600">
                      {visionCompleted ? 
                        `${customVisionItems.length} vision item${customVisionItems.length === 1 ? '' : 's'} created` : 
                        'Not started'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {visionCompleted ? '100%' : '0%'}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vision Board Preview - Show actual user images */}
          {(() => {
            // Filter out default stock photos to show only user-customized content
            const defaultImageUrls = [
              'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400'
            ];
            
            const customVisionItems = visionItems.filter(item => 
              !defaultImageUrls.includes(item.imageUrl) || 
              (item.title !== 'Dream Office Space' && item.title !== 'Mountain Adventure' && 
               item.title !== 'Family Time' && item.title !== 'Inner Peace')
            );
            
            return customVisionItems.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Your Vision Board
                </h2>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {customVisionItems.slice(0, 4).map((item, index) => (
                    <div key={item.id || index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title || 'Vision item'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`fallback absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-xs text-gray-600 ${item.imageUrl ? 'hidden' : 'flex'}`}>
                        {item.title || 'Vision Item'}
                      </div>
                    </div>
                  ))}
                </div>
                {customVisionItems.length > 4 && (
                  <p className="text-xs text-gray-500 mb-2">
                    +{customVisionItems.length - 4} more items
                  </p>
                )}
                <button 
                  onClick={() => onNavigate('vision')}
                  className="w-full text-center py-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  View Full Vision Board →
                </button>
              </div>
            ) : null;
          })()}

          {/* Today's Focus */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Today's Focus
            </h2>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                {todaysFocus}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {wheelAreas.length > 0 ? 
                    (wheelAreas.reduce((sum, area) => sum + area.score, 0) / wheelAreas.length).toFixed(1) : 
                    '0'}
                </div>
                <p className="text-xs text-gray-600">Avg Life Score</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{coreValues.length}</div>
                <p className="text-xs text-gray-600">Core Values</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{activeGoals.length}</div>
                <p className="text-xs text-gray-600">Active Goals</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{customVisionItems.length}</div>
                <p className="text-xs text-gray-600">Vision Items</p>
              </div>
            </div>
          </div>

          {/* Next Actions */}
          {completedFeatures < 4 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Next Steps
              </h2>
              <div className="space-y-3">
                {!wheelCompleted && (
                  <button
                    onClick={() => onNavigate('wheel')}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full p-2 bg-blue-100">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Wheel of Life</p>
                        <p className="text-xs text-gray-600">Assess your life areas</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                )}
                {!valuesCompleted && (
                  <button
                    onClick={() => onNavigate('values')}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full p-2 bg-red-100">
                        <Heart className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Core Values</p>
                        <p className="text-xs text-gray-600">Clarify what matters most</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                )}
                {!visionCompleted && (
                  <button
                    onClick={() => onNavigate('vision')}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full p-2 bg-purple-100">
                        <Eye className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Vision Board</p>
                        <p className="text-xs text-gray-600">Create visual goals</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                )}
                {!goalsCompleted && (
                  <button
                    onClick={() => onNavigate('goals')}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full p-2 bg-green-100">
                        <Target className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">90-Day Goals</p>
                        <p className="text-xs text-gray-600">Set actionable goals</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Celebration when complete */}
          {completedFeatures === 4 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Features Complete!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You've completed your intentional living foundation. Time to take action on your goals!
                </p>
                <button 
                  onClick={() => onNavigate('calendar')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Plan Your Actions →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;