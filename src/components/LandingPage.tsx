import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Sparkles, BarChart3, Heart, ImageIcon, Calendar, CheckCircle2, Crown, Star } from 'lucide-react';
import SnappyDemoVideo from './SnappyDemoVideo';

const LandingPage: React.FC = () => {
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
                to="/auth/login"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/pricing"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Crown className="w-4 h-4" />
                  <span>Limited Time: $50 Complete Access</span>
                </div>
                
                <h1 className="text-5xl font-bold text-slate-900 mb-6">
                  Bring Clarity to Chaos
                </h1>
                <p className="text-xl text-slate-600 mb-8">
                  Coach Pack helps you build a vision for your life that connects your daily actions to your deepest values. Transform abstract goals into concrete action plans.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link 
                    to="/pricing"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg shadow-lg flex items-center justify-center"
                  >
                    <span>Get Complete Access - $50</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link 
                    to="/free-wheel"
                    className="px-8 py-4 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium border border-slate-200 flex items-center justify-center"
                  >
                    Try Free Assessment
                  </Link>
                </div>

                {/* Social Proof */}
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span>5.0 rating</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <span>1,000+ transformations</span>
                </div>
              </div>

              <div>
                <SnappyDemoVideo autoPlay={false} showControls={true} />
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-16 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Why Choose Coach Pack?</h2>
            <p className="text-xl text-purple-100 mb-8">
              Most people struggle with abstract goal-setting advice. Coach Pack gives you proven frameworks that actually work.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Structured Process</h3>
                <p className="text-purple-100">
                  Step-by-step guidance that takes you from confusion to clarity in hours, not months.
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
                <p className="text-purple-100">
                  Based on research-backed coaching methods used by thousands of people worldwide.
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Access</h3>
                <p className="text-purple-100">
                  No waiting, no subscriptions. Pay once, get immediate access to all tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Complete Self-Coaching Toolkit
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Everything you need to transform your life, organized in a logical progression
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
                  to="/pricing"
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                >
                  Get access
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-indigo-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Join thousands who've used Coach Pack to create meaningful change in their lives.
            </p>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-purple-100 rounded-full p-3">
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Complete Toolkit - $50</h3>
              <p className="text-slate-600 mb-6">
                30 days of full access to all coaching tools. No subscriptions, no recurring fees.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-700">Wheel of Life Assessment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-700">Values Clarification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-700">Vision Board Creator</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-700">12-Week Goal Planning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-700">Action Calendar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-700">Progress Tracking</span>
                </div>
              </div>
              
              <Link 
                to="/pricing"
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg shadow-lg flex items-center justify-center"
              >
                <span>Get Started Now - $50</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <p className="text-sm text-slate-500 mt-4">
                Secure payment • Instant access • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-12">
              What People Are Saying
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "Coach Pack helped me identify what was really important to me. The structured approach made all the difference."
                </p>
                <p className="text-sm font-medium text-slate-900">Sarah M.</p>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "Finally, a system that actually works. I've tried so many goal-setting methods before, but this one stuck."
                </p>
                <p className="text-sm font-medium text-slate-900">David L.</p>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "The vision board tool is incredible. It helped me visualize my goals in a way that actually motivates me daily."
                </p>
                <p className="text-sm font-medium text-slate-900">Maria R.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-white font-semibold">Coach Pack</h3>
                  <p className="text-sm text-slate-400">Intentional Living Made Actionable</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Transform your life with proven self-coaching tools and structured guidance.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Wheel of Life</a></li>
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
    </div>
  );
};

export default LandingPage;free-wheel"
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
                <Link 
                  to="/pricing"
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                >
                  Get access
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Vision Board</h3>
                <p className="text-slate-600 mb-4">
                  Create a visual representation of your goals across four key life quadrants
                </p>
                <Link 
                  to="/pricing"
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                >
                  Get access
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">12-Week Goals</h3>
                <p className="text-slate-600 mb-4">
                  Turn your vision into actionable 12-week goals with weekly milestones and daily actions
                </p>
                <Link 
                  to="/