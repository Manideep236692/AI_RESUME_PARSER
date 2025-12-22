import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecruiterJobs, deleteJob } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Briefcase, MapPin, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import { formatDate, formatSalary } from '../../utils/helpers';

const ManageJobs = () => {
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

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await deleteJob(jobId);
        setJobs(jobs.filter(job => job.id !== jobId));
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="text-gray-600 mt-2">View and manage all your job postings</p>
        </div>
        <Link to="/recruiter/post-job" className="btn btn-primary">
          Post New Job
        </Link>
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="card-hover">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {job.jobType}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Posted {formatDate(job.postedDate)}
                    </div>
                  </div>

                  {job.salaryMin && (
                    <p className="text-sm text-gray-600 mt-2">
                      Salary: {formatSalary(job.salaryMin, job.salaryMax)}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                  <Link
                    to={`/recruiter/jobs/${job.id}/applications`}
                    className="btn btn-outline flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Applications</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="btn btn-secondary text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
  );
};

export default ManageJobs;
