import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Crown, Target, Sparkles, ArrowRight } from 'lucide-react';
import SignupModal from './SignupModal';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  const handleSignupSuccess = (user: any) => {
    setShowSignupModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Target className="w-8 h-8 text-purple-600" />
              <Sparkles className="w-4 h-4 text-orange-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Coach Pack</h1>
              <p className="text-slate-600">Intentional Living Made Actionable</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Transform Your Life with Proven Tools
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-4">
            Get the complete self-coaching toolkit for just $50 with 30 days of full access.
          </p>
          <button
            onClick={() => setShowSignupModal(true)}
            className="inline-flex items-center space-x-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-8 border-2 border-purple-500 ring-2 ring-purple-200 relative hover:shadow-xl transition-all duration-300 max-w-2xl mx-auto">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                <Crown className="w-4 h-4" />
                <span>Limited Time Offer</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Complete Toolkit</h3>
              <p className="text-slate-600 mb-4">Full access to all self-coaching tools for 30 days</p>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-4xl font-bold text-slate-900">$50</span>
                <span className="text-slate-600">one-time</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">30 days of full access</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Interactive Wheel of Life</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Advanced Values Clarification</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Visual Vision Board Creation</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">12-Week Goal Framework</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Action Calendar & Scheduling</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Progress Analytics & Insights</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Reflection Tools & Prompts</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Data Export & Backup</span>
              </li>
            </ul>

            <button
              onClick={() => navigate('/checkout?productId=complete-toolkit')}
              className="w-full py-3 rounded-lg font-semibold transition-colors bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center space-x-2"
            >
              <span>Get Full Access</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Everything You Need for Transformation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Life Assessment',
                description: 'Interactive 8-area wheel to identify where to focus your energy',
                icon: '🎯'
              },
              {
                title: 'Values Discovery',
                description: 'Guided process to clarify what truly matters to you',
                icon: '❤️'
              },
              {
                title: 'Vision Creation',
                description: 'Visual goal-setting across business, health, balance, and emotions',
                icon: '🎨'
              },
              {
                title: 'Goal Framework',
                description: '12-week system to break down big dreams into daily actions',
                icon: '📈'
              },
              {
                title: 'Action Planning',
                description: 'Calendar integration to schedule and track your progress',
                icon: '📅'
              },
              {
                title: 'Progress Tracking',
                description: 'Analytics and insights to keep you motivated and on track',
                icon: '📊'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h4 className="font-semibold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-4">
            {[
              {
                question: 'How long do I have access to the toolkit?',
                answer: 'With the one-time payment, you get full access to all features for 14 weeks, which is the perfect timeframe to complete a full 12-week goal cycle plus onboarding and wrap-up.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'We offer a <Link to="/free-wheel" className="text-purple-600 hover:text-purple-700 font-medium">free Wheel of Life assessment</Link> that gives you a taste of our approach. You can try it without any commitment.'
              },
              {
                question: 'How is this different from other goal-setting apps?',
                answer: 'Coach Pack provides a comprehensive, integrated approach that connects your values to your vision, goals, and daily actions - creating a complete system for intentional living.'
              },
              {
                question: 'Can I export my data?',
                answer: 'Yes, all your data can be exported in JSON format for backup or transfer purposes.'
              },
              {
                question: 'Is there a refund policy?',
                answer: 'Yes, we offer a 7-day money-back guarantee if you\'re not satisfied with the toolkit. Contact hello@coachpack.org for refunds.'
              },
              {
                question: 'Do I need to be tech-savvy to use Coach Pack?',
                answer: 'Not at all! The interface is intuitive and designed for users of all technical abilities. We also provide helpful guidance throughout the process.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">{faq.question}</h4>
                <p className="text-slate-600" dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-6">
            Join thousands who have transformed their lives with Coach Pack
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup?productId=complete-toolkit')}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Get Started Now
            </button>
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
    </div>
  );
};

export default PricingPage;