import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendations, getApplications } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import JobCard from '../jobs/JobCard';
import SkillAnalysis from './SkillAnalysis';
import { Briefcase, FileText, TrendingUp, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForAnalysis, setSelectedJobForAnalysis] = useState(null);

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
      
      // Auto-select first recommendation for analysis if available
      if (recsResponse.data.length > 0 && recsResponse.data[0].job?.id) {
        setSelectedJobForAnalysis(recsResponse.data[0]);
      }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Skill Analysis */}
          {selectedJobForAnalysis && (
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">AI Career Insights</h2>
              </div>
              <SkillAnalysis 
                jobPostingId={selectedJobForAnalysis.job?.id} 
                jobTitle={selectedJobForAnalysis.job?.title} 
              />
            </section>
          )}

          {/* AI Recommended Jobs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">AI Recommended Jobs For You</h2>
              <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                View all →
              </Link>
            </div>

            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.slice(0, 4).map((rec) => (
                  <div 
                    key={rec.id} 
                    className={`relative cursor-pointer transition-all ${selectedJobForAnalysis?.id === rec.id ? 'ring-2 ring-primary-500 rounded-xl' : ''}`}
                    onClick={() => setSelectedJobForAnalysis(rec)}
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
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
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Recent Applications */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
              <Link to="/jobseeker/applications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>

            {applications.length > 0 ? (
              <div className="card p-0 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{app.jobPosting?.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-800' :
                          app.status === 'VIEWED' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{app.jobPosting?.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card text-center py-8">
                <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No applications yet</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
