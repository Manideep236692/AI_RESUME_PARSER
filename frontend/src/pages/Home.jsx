import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, TrendingUp, Users, Zap } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Find Your Dream Job with AI-Powered Matching
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              SmartRecruit uses advanced AI to connect talented professionals with their perfect opportunities
            </p>
            <div className="flex justify-center space-x-4">
              {!isAuthenticated() ? (
                <>
                  <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Get Started
                  </Link>
                  <Link to="/jobs" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                    Browse Jobs
                  </Link>
                </>
              ) : (
                <Link to="/jobs" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Browse Jobs
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose SmartRecruit?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
            <p className="text-gray-600">
              Our advanced AI analyzes your resume and matches you with the perfect opportunities
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
            <p className="text-gray-600">
              Get personalized job recommendations based on your skills and experience
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Top Companies</h3>
            <p className="text-gray-600">
              Connect with leading companies actively looking for talented professionals
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Application</h3>
            <p className="text-gray-600">
              Apply to multiple jobs with a single click using your uploaded resume
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Take the Next Step in Your Career?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of professionals who found their dream jobs through SmartRecruit
            </p>
            {!isAuthenticated() && (
              <Link to="/register" className="btn btn-primary px-8 py-3 text-lg">
                Create Your Free Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
