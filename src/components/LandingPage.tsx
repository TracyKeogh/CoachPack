import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Heart, ImageIcon, Target, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import SignupModal from './SignupModal';
import DemoVideo from './DemoVideo';
import { ViewType } from '../App';

interface LandingPageProps {
  onNavigate: (view: ViewType) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleSignupSuccess = (user: any) => {
    setShowSignupModal(false);
    navigate('/dashboard');
  };

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      title: 'Wheel of Life',
      description: 'Assess your satisfaction across 8 key life areas to identify where to focus your energy.'
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: 'Values Clarity',
      description: 'Discover your core values through a guided process that reveals what truly matters to you.'
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-teal-600" />,
      title: 'Vision Board',
      description: 'Create visual representations of your goals across four key life quadrants.'
    },
    {
      icon: <Target className="w-6 h-6 text-orange-500" />,
      title: 'Goal Setting',
      description: 'Transform your vision into actionable 12-week goals with milestones and weekly actions.'
    },
    {
      icon: <Calendar className="w-6 h-6 text-indigo-600" />,
      title: 'Action Calendar',
      description: 'Schedule your actions to ensure you make time for what matters most.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Bring Clarity to Chaos
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Coach Pack helps you build a vision for your life that connects your daily actions to your deepest values.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Get Full Access - $50
                </button>
                <Link
                  to="/free-wheel"
                  className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold border border-purple-200"
                >
                  Try Free Assessment
                </Link>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                One-time payment • 30 days full access • No subscription
              </p>
            </div>
            <div className="relative">
              <DemoVideo autoPlay={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              A Complete Self-Coaching System
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Five powerful tools that work together to transform abstract concepts into concrete actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How Coach Pack Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A structured journey from self-awareness to daily action
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Assess & Discover</h3>
              <p className="text-slate-600">
                Complete your Wheel of Life assessment and clarify your core values
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Envision & Plan</h3>
              <p className="text-slate-600">
                Create your vision board and set 12-week goals with milestones
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Act & Track</h3>
              <p className="text-slate-600">
                Schedule weekly actions and track your progress toward your goals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join thousands who have transformed their lives with Coach Pack
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Coach Pack helped me connect my daily actions to my bigger vision. For the first time, I feel like I'm making progress on what truly matters.",
                author: "Sarah J.",
                role: "Entrepreneur"
              },
              {
                quote: "The Wheel of Life assessment was eye-opening. I realized I was neglecting key areas of my life, and now I have a plan to create better balance.",
                author: "Michael T.",
                role: "Marketing Director"
              },
              {
                quote: "I've tried many productivity apps, but Coach Pack is different. It's not just about getting things done—it's about getting the right things done.",
                author: "Elena R.",
                role: "Healthcare Professional"
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-slate-50 rounded-xl p-6 border border-slate-200"
              >
                <div className="mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.author}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Get the complete self-coaching toolkit for just $50 with 30 days of full access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowSignupModal(true)}
                className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
              >
                Get Full Access - $50
              </button>
              <Link
                to="/free-wheel"
                className="px-8 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors border border-purple-500"
              >
                Try Free Assessment
              </Link>
            </div>
            <p className="text-sm text-purple-200 mt-3">
              One-time payment • 30 days full access • No subscription
            </p>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={handleSignupSuccess}
        selectedPlan="complete"
      />
    </div>
  );
};

export default LandingPage;