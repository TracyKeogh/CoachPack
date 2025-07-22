import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Sparkles, Users, Building2, CheckCircle2, Star, TrendingUp, Award, Clock, BookOpen, Presentation, Mail, Phone } from 'lucide-react';

const CompanyLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Hero Section */}
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
                <p className="text-sm text-slate-600">For Companies</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Individual Plans
              </Link>
              <a 
                href="mailto:hello@spremtlabs.com"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold shadow-lg"
              >
                Contact Us
              </a>
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
                  <Building2 className="w-4 h-4" />
                  <span>Enterprise Solution</span>
                </div>
                
                <h1 className="text-5xl font-bold text-slate-900 mb-6">
                  Transform Your Team's Performance
                </h1>
                <p className="text-xl text-slate-600 mb-8">
                  Empower your employees with proven self-coaching tools through interactive workshops and ongoing self-paced learning. Build a culture of intentional growth and peak performance.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <a 
                    href="mailto:hello@spremtlabs.com?subject=Coach Pack Enterprise Workshop Inquiry"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg shadow-lg flex items-center justify-center"
                  >
                    <span>Schedule a Demo</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                  <Link 
                    to="/pricing"
                    className="px-8 py-4 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium border border-slate-200 flex items-center justify-center"
                  >
                    View Individual Plans
                  </Link>
                </div>

                {/* Social Proof */}
                <div className="flex items-center space-x-6 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span>5.0 rating</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <span>50+ companies trained</span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <span>2,000+ employees empowered</span>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
                  <div className="flex items-center space-x-3 mb-6">
                    <Users className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">Workshop + Tools Package</h3>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-300" />
                      <span>Interactive team workshops</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-300" />
                      <span>Self-paced learning platform access</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-300" />
                      <span>Team progress analytics</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-300" />
                      <span>Ongoing coaching support</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-purple-100 text-sm mb-2">Starting at</p>
                    <p className="text-3xl font-bold">Custom Pricing</p>
                    <p className="text-purple-100 text-sm">Based on team size and needs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workshop Overview */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Complete Employee Development Solution
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Combine the power of interactive workshops with ongoing self-paced learning to create lasting behavioral change in your organization
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Presentation className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Interactive Workshops</h3>
                <p className="text-slate-600 mb-6">
                  Facilitated sessions that bring teams together to explore values, set goals, and create shared vision. 
                  Our expert facilitators guide your team through proven frameworks for intentional living and peak performance.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Half-day or full-day formats</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Expert facilitation included</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Customized to your company culture</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Team building and alignment focus</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Workshop Modules</h4>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h5 className="font-semibold text-purple-900 mb-1">Values Alignment Workshop</h5>
                    <p className="text-sm text-slate-600">Discover individual and team values for better collaboration</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h5 className="font-semibold text-purple-900 mb-1">Life Balance Assessment</h5>
                    <p className="text-sm text-slate-600">Help employees identify areas for growth and balance</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <h5 className="font-semibold text-purple-900 mb-1">Goal Setting Framework</h5>
                    <p className="text-sm text-slate-600">Create aligned personal and professional objectives</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Self-Paced Learning Platform</h4>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-1">Individual Assessments</h5>
                    <p className="text-sm text-slate-600">Personal wheel of life and values clarification tools</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-1">Vision Board Creation</h5>
                    <p className="text-sm text-slate-600">Visual goal-setting across life and career domains</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-1">12-Week Action Plans</h5>
                    <p className="text-sm text-slate-600">Structured goal achievement with progress tracking</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Ongoing Self-Paced Learning</h3>
                <p className="text-slate-600 mb-6">
                  After the workshop, employees continue their development journey with full access to our digital coaching platform. 
                  Track progress, set new goals, and maintain momentum with structured self-coaching tools.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">6-month platform access per employee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Progress tracking and analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Monthly check-in sessions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Team dashboard for managers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Companies Choose Coach Pack</h2>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                Measurable results that impact your bottom line and employee satisfaction
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Increased Productivity</h3>
                <p className="text-purple-100 mb-4">
                  Employees with clear values and goals are 23% more productive and engaged at work.
                </p>
                <div className="text-2xl font-bold text-white">+23%</div>
                <div className="text-sm text-purple-200">Average productivity increase</div>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Better Retention</h3>
                <p className="text-purple-100 mb-4">
                  Teams with aligned values and clear development paths see significantly lower turnover.
                </p>
                <div className="text-2xl font-bold text-white">-35%</div>
                <div className="text-sm text-purple-200">Reduction in turnover</div>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Enhanced Wellbeing</h3>
                <p className="text-purple-100 mb-4">
                  Employees report higher life satisfaction and better work-life balance after our program.
                </p>
                <div className="text-2xl font-bold text-white">4.8/5</div>
                <div className="text-sm text-purple-200">Employee satisfaction score</div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Flexible Packages for Every Team Size
              </h2>
              <p className="text-xl text-slate-600">
                Custom solutions designed to fit your organization's needs and budget
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Starter Package */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Starter Package</h3>
                  <p className="text-slate-600">Perfect for small teams getting started</p>
                  <div className="mt-4">
                    <span className="text-sm text-slate-500">Starting at</span>
                    <div className="text-3xl font-bold text-slate-900">$2,500</div>
                    <span className="text-slate-600">for teams of 10-25</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Half-day workshop session</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">3-month platform access per employee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Basic progress tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700">Email support</span>
                  </div>
                </div>

                <a
                  href="mailto:hello@spremtlabs.com?subject=Coach Pack Starter Package Inquiry"
                  className="w-full block text-center py-3 px-4 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
                >
                  Get Quote
                </a>
              </div>

              {/* Enterprise Package */}
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-lg text-white relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Enterprise Package</h3>
                  <p className="text-purple-100">Comprehensive solution for larger organizations</p>
                  <div className="mt-4">
                    <span className="text-sm text-purple-200">Starting at</span>
                    <div className="text-3xl font-bold">$7,500</div>
                    <span className="text-purple-100">for teams of 25+</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                    <span>Full-day workshop + follow-up sessions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                    <span>6-month platform access per employee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                    <span>Advanced analytics and reporting</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                    <span>Dedicated success manager</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                    <span>Custom integrations available</span>
                  </div>
                </div>

                <a
                  href="mailto:hello@spremtlabs.com?subject=Coach Pack Enterprise Package Inquiry"
                  className="w-full block text-center py-3 px-4 bg-white text-purple-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                >
                  Schedule Demo
                </a>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-slate-600 mb-4">
                Need a custom solution? We work with organizations of all sizes.
              </p>
              <a
                href="mailto:hello@spremtlabs.com?subject=Coach Pack Custom Solution Inquiry"
                className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <Mail className="w-4 h-4" />
                <span>Contact us for custom pricing</span>
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                What Companies Are Saying
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "The workshop transformed how our team thinks about work-life balance. The ongoing platform keeps everyone engaged in their development."
                </p>
                <div>
                  <p className="text-sm font-medium text-slate-900">Sarah Chen</p>
                  <p className="text-xs text-slate-500">HR Director, TechFlow Inc.</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "We saw immediate improvements in team alignment and individual goal clarity. The ROI has been exceptional."
                </p>
                <div>
                  <p className="text-sm font-medium text-slate-900">Michael Rodriguez</p>
                  <p className="text-xs text-slate-500">CEO, Growth Dynamics</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "Our employees love the self-paced tools. It's like having a personal coach available 24/7."
                </p>
                <div>
                  <p className="text-sm font-medium text-slate-900">Jennifer Park</p>
                  <p className="text-xs text-slate-500">VP People, InnovateCorp</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-gradient-to-br from-slate-900 to-purple-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Team?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join forward-thinking companies that invest in their employees' holistic development.
            </p>
            
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Get Started Today</h3>
              <p className="text-slate-200 mb-6">
                Schedule a consultation to discuss your team's needs and see how Coach Pack can drive results in your organization.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:hello@spremtlabs.com?subject=Coach Pack Enterprise Demo Request&body=Hi, I'm interested in learning more about Coach Pack for our company. Please contact me to schedule a demo.%0D%0A%0D%0ACompany: %0D%0ATeam Size: %0D%0AContact Person: %0D%0APhone: %0D%0A%0D%0AThank you!"
                  className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold flex items-center justify-center"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Schedule Demo
                </a>
                <a 
                  href="tel:+1-555-COACH-PACK"
                  className="px-8 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors border border-purple-500 flex items-center justify-center"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Us
                </a>
              </div>
              
              <p className="text-sm text-slate-300 mt-4">
                Response within 24 hours • Free consultation • Custom proposals available
              </p>
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
                  <p className="text-sm text-slate-400">For Companies</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Empowering teams with proven self-coaching tools and expert-led workshops.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Team Workshops</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Self-Paced Learning</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Progress Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Custom Programs</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ROI Calculator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Implementation Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:hello@spremtlabs.com" className="hover:text-white transition-colors flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    hello@spremtlabs.com
                  </a>
                </li>
                <li>
                  <a href="tel:+1-555-COACH-PACK" className="hover:text-white transition-colors flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    1-555-COACH-PACK
                  </a>
                </li>
                <li><Link to="/" className="hover:text-white transition-colors">Individual Plans</Link></li>
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

export default CompanyLandingPage;