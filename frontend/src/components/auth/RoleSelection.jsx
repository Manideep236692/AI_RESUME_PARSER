import React from 'react';
import { UserCircle, Building } from 'lucide-react';

const RoleSelection = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Join SmartRecruit
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Choose how you want to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <button
            onClick={() => onSelectRole('JOB_SEEKER')}
            className="card-hover text-left p-8 transition-all hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Job Seeker</h3>
              <p className="text-gray-600">
                Find your dream job with AI-powered recommendations tailored to your skills and experience.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 text-left w-full">
                <li>✓ Upload your resume</li>
                <li>✓ Get AI job recommendations</li>
                <li>✓ Apply to multiple jobs</li>
                <li>✓ Track application status</li>
              </ul>
            </div>
          </button>

          <button
            onClick={() => onSelectRole('RECRUITER')}
            className="card-hover text-left p-8 transition-all hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Building className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Recruiter</h3>
              <p className="text-gray-600">
                Find the perfect candidates for your company with AI-powered candidate matching.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 text-left w-full">
                <li>✓ Post unlimited jobs</li>
                <li>✓ AI candidate matching</li>
                <li>✓ Manage applications</li>
                <li>✓ Build your talent pool</li>
              </ul>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
