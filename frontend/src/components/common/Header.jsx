import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isJobsPage = location.pathname === '/jobs';
  const isDashboardPage = location.pathname.includes('/dashboard');

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">SmartRecruit</span>
          </Link>

          <nav className="flex items-center space-x-6">
            {isAuthenticated() ? (
              <>
                {!isJobsPage && (
                  <Link to="/jobs" className="text-gray-700 hover:text-primary-600">
                    Browse Jobs
                  </Link>
                )}
                {!isDashboardPage && (
                  <Link 
                    to={user?.role === 'JOB_SEEKER' ? '/jobseeker/dashboard' : '/recruiter/dashboard'}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                  >
                    <User className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {!isJobsPage && (
                  <Link to="/jobs" className="text-gray-700 hover:text-primary-600">
                    Browse Jobs
                  </Link>
                )}
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
