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
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Link 
              to="/pricing"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium"
            >
              Individual Plans
            </Link>
            <Link 
              to="/companies"
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              For Companies
            </Link>
          </div>
          
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-4">
            Individual access or team workshops - choose what works for you.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Individual Plan */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Individual Access</h3>
              <p className="text-slate-600 mb-4">Complete self-coaching toolkit</p>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-4xl font-bold text-slate-900">$50</span>
                <span className="text-slate-600">one-time</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">30 days of full access</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Interactive Wheel of Life</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Values Clarification Process</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Vision Board Creator</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">12-Week Goal Framework</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Action Calendar</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Progress Tracking</span>
              </li>
            </ul>

            <button
              onClick={() => navigate('/checkout?productId=complete-toolkit')}
              className="w-full py-3 rounded-lg font-semibold transition-colors bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center space-x-2"
            >
              <span>Get Individual Access</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Company Plan */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Team Workshop</h3>
              <p className="text-slate-600 mb-4">Workshop + platform access for teams</p>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-2xl font-bold text-slate-900">On Application</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Custom pricing based on team size</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Half-day workshop session</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">3-month platform access per employee</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Basic progress tracking</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Email support</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Expert facilitation included</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">Customized to your team</span>
              </li>
            </ul>

            <a
              href="mailto:hello@spremtlabs.com?subject=Coach Pack Team Workshop Inquiry"
              className="w-full block text-center py-3 rounded-lg font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              Contact for Quote
            </a>
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
            Start your journey to more intentional living
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/free-wheel"
              className="px-8 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Try Free Assessment
            </Link>
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