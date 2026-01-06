import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecruiterJobs } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Briefcase, Users, Eye, PlusCircle, Zap } from 'lucide-react';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await getRecruiterJobs();
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const activeJobs = jobs.filter(job => job.isActive).length;
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationsCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your job postings and candidates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{jobs.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{activeJobs}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <Link to="/recruiter/post-job" className="card hover:shadow-lg transition-shadow cursor-pointer bg-primary-50 border-2 border-primary-200">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <PlusCircle className="w-12 h-12 text-primary-600 mx-auto mb-2" />
              <p className="text-primary-600 font-semibold">Post New Job</p>
            </div>
          </div>
        </Link>

        {/* New Sourcing Card */}
        <Link to="/recruiter/sourcing" className="card hover:shadow-lg transition-shadow cursor-pointer bg-yellow-50 border-2 border-yellow-200 col-span-1 md:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
              <p className="text-yellow-700 font-semibold">AI Sourcing (25k Candidates)</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Job Postings</h2>
          <Link to="/recruiter/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="card-hover">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{job.location} • {job.jobType}</p>
                  </div>
                  <Link
                    to={`/recruiter/jobs/${job.id}/applications`}
                    className="btn btn-outline"
                  >
                    View Applications
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No job postings yet</h3>
            <p className="text-gray-600 mb-4">Create your first job posting to start receiving applications</p>
            <Link to="/recruiter/post-job" className="btn btn-primary">
              Post a Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
