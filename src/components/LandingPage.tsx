import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Sparkles, BarChart3, Heart, ImageIcon, Calendar, CheckCircle2 } from 'lucide-react';
import SnappyDemoVideo from './SnappyDemoVideo';
import SignupModal from './SignupModal';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  const handleSignupSuccess = (user: any) => {
    setShowSignupModal(false);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Hero Section */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Target className="w-8 h-8 text-purple-600" />
                <Sparkles className="w-4 h-4 text-orange-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Coach Pack</h1>
                <p className="text-sm text-slate-600">Intentional Living Made Actionable</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/free-wheel"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Free Assessment
              </Link>
              <Link 
                to="/pricing"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Pricing
              </Link>
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
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold text-slate-900 mb-6">
                  Bring Clarity to Chaos
                </h1>
                <p className="text-xl text-slate-600 mb-8">
                  Coach Pack helps you build a vision for your life that connects your daily actions to your deepest values.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/free-wheel"
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center"
                  >
                    <span>Start Free Assessment</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link 
                    to="/pricing"
                    className="px-8 py-3 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium border border-slate-200 flex items-center justify-center"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
              <div>
                <SnappyDemoVideo autoPlay={false} showControls={true} />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Proven Tools for Intentional Living
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Coach Pack transforms abstract coaching concepts into concrete, actionable steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Wheel of Life</h3>
                <p className="text-slate-600 mb-4">
                  Assess your satisfaction across 8 key life areas to identify where to focus your energy
                </p>
                <Link 
                  to="/free-wheel"
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                >
                  Try for free
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Values Clarity</h3>
                <p className="text-slate-600 mb-4">
                  Discover your core values through a guided process that reveals what truly matters to you
                </p>
                <button 
                  onClick={() => setShowSignupModal(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                >
                  Get access
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Vision Board</h3>
                <p className="text-slate-600 mb-4">
                  Create a visual representation of your goals across four key life quadrants
                </p>
                <button 
                  onClick={() => setShowSignupModal(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                >
                  Get access
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Action Calendar</h3>
                <p className="text-slate-600 mb-4">
                  Schedule your priorities and track progress with a purpose-driven calendar
                </p>
                <button 
                  onClick={() => setShowSignupModal(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                >
                  Get access
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                How Coach Pack Works
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                A structured journey from self-awareness to daily action
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Assess & Reflect</h3>
                <p className="text-slate-600 mb-4">
                  Start with the Wheel of Life assessment to see where you stand across 8 key life areas
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Interactive life wheel</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Guided reflection questions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Values clarification process</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Envision & Plan</h3>
                <p className="text-slate-600 mb-4">
                  Create a vision board and set 12-week goals aligned with your values
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Visual goal setting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>12-week goal framework</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Milestone creation</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Act & Track</h3>
                <p className="text-slate-600 mb-4">
                  Schedule weekly actions and track your progress toward your goals
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Weekly action planning</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Progress tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Reflection prompts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Join thousands who have transformed their lives with Coach Pack
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 mb-4">
                  "Coach Pack helped me connect my daily actions to my bigger goals. For the first time, I feel like I'm making progress on what truly matters."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">JM</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Jamie M.</p>
                    <p className="text-sm text-slate-500">Entrepreneur</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 mb-4">
                  "The values clarification process was eye-opening. I finally understand why certain activities drain me while others energize me."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">SL</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Sarah L.</p>
                    <p className="text-sm text-slate-500">Marketing Director</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 mb-4">
                  "The 12-week goal framework has completely changed how I approach my goals. Breaking them down into weekly actions makes everything achievable."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">DT</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">David T.</p>
                    <p className="text-sm text-slate-500">Software Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Life?</h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Start with our free Wheel of Life assessment and discover where to focus your energy for maximum impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/free-wheel"
                className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
              >
                Start Free Assessment
              </Link>
              <Link 
                to="/pricing"
                className="px-8 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors border border-purple-500"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <Target className="w-6 h-6 text-purple-400" />
                  <Sparkles className="w-3 h-3 text-orange-400 absolute -top-1 -right-1" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Coach Pack</h3>
                  <p className="text-xs text-slate-400">Intentional Living Made Actionable</p>
                </div>
              </div>
              <p className="text-sm mb-4">
                Transforming abstract coaching concepts into concrete, actionable steps.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/free-wheel" className="hover:text-white transition-colors">Wheel of Life</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Values Clarity</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Vision Board</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Goal Setting</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Action Calendar</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Coach Pack. All rights reserved.</p>
          </div>
        </div>
      </footer>

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