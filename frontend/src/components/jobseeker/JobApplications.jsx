import React, { useState, useEffect } from 'react';
import { getApplications } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Briefcase, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { formatDate, formatSalary } from '../../utils/helpers';

const JobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await getApplications();
      setApplications(response.data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      APPLIED: 'bg-blue-100 text-blue-800',
      VIEWED: 'bg-purple-100 text-purple-800',
      SHORTLISTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      INTERVIEW: 'bg-yellow-100 text-yellow-800',
      OFFERED: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredApplications = filter === 'ALL' 
    ? applications 
    : applications.filter(app => app.status === filter);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-2">Track all your job applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2 overflow-x-auto">
        {['ALL', 'APPLIED', 'VIEWED', 'SHORTLISTED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {status}
            {status === 'ALL' && ` (${applications.length})`}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application.id} className="card-hover">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.jobPosting?.title}
                      </h3>
                      <p className="text-gray-600">{application.jobPosting?.recruiter?.companyName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {application.jobPosting?.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {application.jobPosting?.jobType}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Applied {formatDate(application.appliedDate)}
                    </div>
                    {application.aiMatchScore && (
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {Math.round(application.aiMatchScore * 100)}% Match
                      </div>
                    )}
                  </div>

                  {application.jobPosting?.salaryMin && (
                    <p className="text-sm text-gray-600 mt-2">
                      Salary: {formatSalary(application.jobPosting.salaryMin, application.jobPosting.salaryMax)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'ALL' ? 'No applications yet' : `No ${filter.toLowerCase()} applications`}
          </h3>
          <p className="text-gray-600">
            {filter === 'ALL' ? 'Start applying to jobs that match your skills' : 'Try changing the filter'}
          </p>
        </div>
      )}
    </div>
  );
};

export default JobApplications;
