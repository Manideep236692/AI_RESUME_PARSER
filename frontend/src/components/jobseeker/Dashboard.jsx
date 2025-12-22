import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendations, getApplications } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import JobCard from '../jobs/JobCard';
import { Briefcase, FileText, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [recsResponse, appsResponse] = await Promise.all([
        getRecommendations(),
        getApplications()
      ]);
      setRecommendations(recsResponse.data);
      setApplications(appsResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your job search</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{applications.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recommended Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{recommendations.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profile Strength</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">85%</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommended Jobs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">AI Recommended Jobs For You</h2>
          <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
            View all jobs →
          </Link>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 6).map((rec) => (
              <div key={rec.id} className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {Math.round(rec.matchScore * 100)}% Match
                  </span>
                </div>
                <JobCard job={rec.job} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-4">Upload your resume to get personalized job recommendations</p>
            <Link to="/jobseeker/resume" className="btn btn-primary">
              Upload Resume
            </Link>
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Applications</h2>
          <Link to="/jobseeker/applications" className="text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </Link>
        </div>

        {applications.length > 0 ? (
          <div className="card">
            <div className="space-y-4">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{app.jobPosting?.title}</h3>
                    <p className="text-sm text-gray-600">{app.jobPosting?.location}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-800' :
                      app.status === 'VIEWED' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-4">Start applying to jobs that match your skills</p>
            <Link to="/jobs" className="btn btn-primary">
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
