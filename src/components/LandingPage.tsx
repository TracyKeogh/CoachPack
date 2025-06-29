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
import DemoVideo from './DemoVideo';
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
      description: 'Interactive 8-area life balance evaluation with reflection tools'
    },
    {
      icon: Heart,
      title: 'Values Clarification',
      description: 'Discover and rank your core values through guided exercises'
    },
    {
      icon: ImageIcon,
      title: 'Vision Board Creation',
      description: 'Visual goal-setting across business, health, balance, and emotions'
    },
    {
      icon: Target,
      title: '12-Week Goal Framework',
      description: 'Break down annual vision into actionable quarterly milestones'
    },
    {
      icon: Calendar,
      title: 'Action Calendar',
      description: 'Schedule and track daily actions aligned with your goals'
    },
    {
      icon: TrendingUp,
      title: 'Progress Dashboard',
      description: 'Comprehensive overview of your transformation journey'
    }
  ];

  const howItWorksSteps = [
    {
      number: 1,
      title: 'Assess',
      subtitle: 'Complete your Wheel of Life assessment to understand where you stand across 8 key life areas.',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      number: 2,
      title: 'Clarify',
      subtitle: 'Discover your core values through our guided 5-step process to ensure authentic decision-making.',
      icon: Heart,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600'
    },
    {
      number: 3,
      title: 'Visualize',
      subtitle: 'Create your vision board with images and goals that represent your ideal life across all areas.',
      icon: ImageIcon,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      iconColor: 'text-teal-600'
    },
    {
      number: 4,
      title: 'Act',
      subtitle: 'Break down your vision into 12-week goals with daily actions that move you forward consistently.',
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
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Demo
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
                <span>Self-Coaching Tools for Intentional Living</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Transform Your Life
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                  With Proven Tools
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Get the complete self-coaching toolkit used by thousands to clarify values, 
                set meaningful goals, and create lasting change. No coaches needed - just you and the tools.
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
              <Link 
                to="/pricing"
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-lg border border-slate-200"
              >
                <span>View Pricing</span>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white" />
                  ))}
                </div>
                <span className="text-sm text-slate-600">1,000+ self-coached</span>
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

      {/* Free Assessment CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-bold text-white">Try Our Wheel of Life Assessment</h2>
                <p className="text-purple-100 text-lg">Free • No sign up required • Instant results</p>
              </div>
            </div>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Discover your life balance across 8 key areas. Get personalized insights and see where to focus your energy for maximum impact.
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
                <span>Your email is safe with us</span>
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
                <p className="text-slate-600">Watch how Coach Pack transforms abstract goals into daily actions</p>
              </div>
              
              <DemoVideo 
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
              How Coach Pack Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A simple 4-step process to transform your life from reactive to intentional living.
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
                From Self-Discovery to Daily Action
              </h3>
              <p className="text-lg text-slate-600 mb-6 max-w-3xl mx-auto">
                Coach Pack guides you through a proven methodology that thousands have used to create meaningful change. 
                Each step builds on the previous one, ensuring your actions are aligned with your authentic self.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setShowWheelSignup(true)}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Start Your Journey
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
              Complete Self-Coaching Toolkit
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to go from self-discovery to daily action - no coach required
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
            Ready to Start Your Transformation?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands who have taken control of their lives with proven self-coaching tools
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
              View Pricing
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
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;