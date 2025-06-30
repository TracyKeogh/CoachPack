import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  ArrowRight, 
  BarChart3, 
  Heart, 
  ImageIcon, 
  Calendar,
  Star,
  TrendingUp,
  Play,
  X,
  Check,
  Zap,
  Crown,
  Users,
  Mail,
  Shield
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import InteractiveDemoVideo from './InteractiveDemoVideo';
import WheelSignupModal from './WheelSignupModal';

interface LandingPageProps {
  onNavigate?: (view: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [showVideoDemo, setShowVideoDemo] = useState(false);
  const [showWheelSignup, setShowWheelSignup] = useState(false);

  const handleWheelSignupSuccess = (email: string) => {
    setShowWheelSignup(false);
    // Navigate to free wheel assessment
    if (onNavigate) {
      onNavigate('free-wheel');
    } else {
      navigate('/free-wheel');
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Wheel of Life Assessment',
      description: 'Rate your satisfaction across 8 life areas to see where you stand'
    },
    {
      icon: Heart,
      title: 'Values Clarification',
      description: 'Identify what matters most to you through guided exercises'
    },
    {
      icon: ImageIcon,
      title: 'Vision Board Creation',
      description: 'Create visual representations of your goals and aspirations'
    },
    {
      icon: Target,
      title: '12-Week Goal Framework',
      description: 'Break down what you want into manageable quarterly steps'
    },
    {
      icon: Calendar,
      title: 'Action Calendar',
      description: 'Schedule time for what matters and track your follow-through'
    },
    {
      icon: TrendingUp,
      title: 'Progress Dashboard',
      description: 'See your patterns and progress over time'
    }
  ];

  const howItWorksSteps = [
    {
      number: 1,
      title: 'Assess',
      subtitle: 'Rate where you are across different life areas to get a clear picture of your current situation.',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      number: 2,
      title: 'Clarify',
      subtitle: 'Identify your core values and what you want your life to look like.',
      icon: Heart,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600'
    },
    {
      number: 3,
      title: 'Visualize',
      subtitle: 'Create visual reminders of your goals and what you\'re working toward.',
      icon: ImageIcon,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      iconColor: 'text-teal-600'
    },
    {
      number: 4,
      title: 'Plan',
      subtitle: 'Break down your goals into 12-week chunks and schedule time for what matters.',
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Target className="w-8 h-8 text-purple-600" />
                <Sparkles className="w-4 h-4 text-orange-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">Coach Pack</span>
                <div className="text-xs text-slate-600">Self-Coaching Toolkit</div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
              <button 
                onClick={() => setShowVideoDemo(true)}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Demo</span>
              </button>
              <Link 
                to="/pricing" 
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Pricing
              </Link>
              <button 
                onClick={() => setShowWheelSignup(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Try Free Assessment
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Proven Self-Coaching Tools</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Get Clarity on
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                  Where You Stand
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                A collection of proven assessment and planning tools in one place. 
                See where your energy goes, clarify what matters, and make intentional choices about your time and focus.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setShowWheelSignup(true)}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                <span>Start Free Assessment</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowVideoDemo(true)}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-lg border border-slate-200"
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white" />
                  ))}
                </div>
                <span className="text-sm text-slate-600">1,000+ people using these tools</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-slate-600 ml-2">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              See Coach Pack in Action
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Watch how these tools help you get clarity on your priorities and create actionable plans for change.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <InteractiveDemoVideo 
              autoPlay={false}
              onComplete={() => {
                // Optional: Show CTA after demo completes
              }}
            />
          </div>

          <div className="text-center mt-8">
            <button 
              onClick={() => setShowWheelSignup(true)}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Try It Yourself - Free Assessment
            </button>
            <p className="text-slate-500 text-sm mt-2">No sign up required • Takes 5 minutes</p>
          </div>
        </div>
      </section>

      {/* Free Assessment CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-bold text-white">See Where You Stand</h2>
                <p className="text-purple-100 text-lg">Free assessment • Takes 5 minutes • Instant results</p>
              </div>
            </div>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Rate your satisfaction across 8 life areas. Get a clear picture of where you are and where you might want to focus your energy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setShowWheelSignup(true)}
                className="flex items-center space-x-2 px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-lg shadow-lg"
              >
                <Mail className="w-5 h-5" />
                <span>Get My Free Assessment</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2 text-purple-200 text-sm">
                <Shield className="w-4 h-4" />
                <span>No spam, just your results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Modal */}
      {showVideoDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full relative">
            <button
              onClick={() => setShowVideoDemo(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-lg z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-slate-900 mb-2">See Coach Pack in Action</h3>
                <p className="text-slate-600">Watch how these tools help you get clarity on your priorities</p>
              </div>
              
              <InteractiveDemoVideo 
                autoPlay={true}
                onComplete={() => {
                  // Optional: Auto-close or show CTA after video completes
                }}
              />
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => {
                    setShowVideoDemo(false);
                    setShowWheelSignup(true);
                  }}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Try Free Assessment
                </button>
                <p className="text-slate-500 text-sm mt-2">No sign up required • Instant access</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wheel Signup Modal */}
      <WheelSignupModal
        isOpen={showWheelSignup}
        onClose={() => setShowWheelSignup(false)}
        onSuccess={handleWheelSignupSuccess}
      />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Four simple steps to get clarity on where you are and where you want to focus your energy.
            </p>
          </div>

          {/* Steps in clean horizontal layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative group"
                >
                  {/* Step Card */}
                  <div className={`${step.bgColor} ${step.borderColor} border rounded-2xl p-6 h-full transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1`}>
                    {/* Step Number */}
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                      <span className="text-xl font-bold text-white">{step.number}</span>
                    </div>

                    {/* Icon */}
                    <div className="text-center mb-4">
                      <Icon className={`w-8 h-8 mx-auto ${step.iconColor}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">{step.subtitle}</p>
                    </div>
                  </div>

                  {/* Connector Arrow (except for last item) */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-200">
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Process Flow Summary */}
          <div className="mt-16 bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl p-8 border border-slate-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                From Assessment to Action
              </h3>
              <p className="text-lg text-slate-600 mb-6 max-w-3xl mx-auto">
                These aren't magic solutions - they're proven frameworks that help you see patterns, 
                clarify priorities, and make more intentional choices about where to spend your time and energy.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setShowWheelSignup(true)}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Start Your Assessment
                </button>
                <Link
                  to="/pricing"
                  className="px-8 py-3 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold border border-slate-200"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Proven Tools in One Place
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Assessment and planning tools that coaches and consultants have used for decades, 
              now organized in a simple digital format.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Some Clarity?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Start with a simple assessment to see where you stand across different life areas
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setShowWheelSignup(true)}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-lg shadow-lg"
            >
              Start Free Assessment
            </button>
            <Link
              to="/pricing"
              className="px-8 py-4 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition-colors font-semibold text-lg border border-purple-500"
            >
              View All Tools
            </Link>
          </div>

          <div className="mt-6 text-purple-200 text-sm">
            Free assessment • No sign up required
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="relative">
                <Target className="w-8 h-8 text-purple-400" />
                <Sparkles className="w-4 h-4 text-orange-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="text-xl font-bold">Coach Pack</span>
                <div className="text-xs text-slate-400">Self-Coaching Toolkit</div>
              </div>
            </div>
            
            <div className="text-slate-400 text-sm">
              © 2025 Coach Pack. All rights reserved.
            </div>
          </div>
          
          {/* Built with Bolt badge */}
          <div className="mt-8 flex justify-center">
            <a 
              href="https://stackblitz.com/bolt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium">Built with Bolt</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;