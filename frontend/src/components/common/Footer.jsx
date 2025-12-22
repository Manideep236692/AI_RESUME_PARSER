import React from 'react';
import { Briefcase } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Briefcase className="w-6 h-6" />
              <span className="text-lg font-bold">SmartRecruit</span>
            </div>
            <p className="text-gray-400 text-sm">
              AI-powered recruitment platform connecting talented job seekers with top employers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/jobs" className="hover:text-white">Browse Jobs</a></li>
              <li><a href="/register" className="hover:text-white">Create Profile</a></li>
              <li><a href="#" className="hover:text-white">Upload Resume</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/register" className="hover:text-white">Post a Job</a></li>
              <li><a href="#" className="hover:text-white">Find Candidates</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 SmartRecruit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
