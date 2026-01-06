import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Briefcase, FileText, User, PlusCircle, Users } from 'lucide-react';

const Navbar = () => {
  const { isJobSeeker, isRecruiter } = useAuth();
  const location = useLocation();

  const jobSeekerLinks = [
    { to: '/jobseeker/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/jobseeker/profile', icon: User, label: 'Profile' },
    { to: '/jobseeker/resume', icon: FileText, label: 'Resume' },
    { to: '/jobseeker/applications', icon: Briefcase, label: 'Applications' },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/recruiter/profile', icon: User, label: 'Profile' },
    { to: '/recruiter/post-job', icon: PlusCircle, label: 'Post Job' },
    { to: '/recruiter/jobs', icon: Briefcase, label: 'My Jobs' },
    { to: '/recruiter/candidates', icon: Users, label: 'Candidates' },
  ];

  const isJobSeekerPath = location.pathname.startsWith('/jobseeker');
  const isRecruiterPath = location.pathname.startsWith('/recruiter');

  const links = (isJobSeeker() && isJobSeekerPath) ? jobSeekerLinks : (isRecruiter() && isRecruiterPath) ? recruiterLinks : [];

  if (links.length === 0) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
