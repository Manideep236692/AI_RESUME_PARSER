import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getJobApplications, updateApplicationStatus } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { User, Mail, Phone, MapPin, FileText, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const ViewCandidates = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      loadApplications();
    } else {
      setLoading(false);
    }
  }, [jobId]);

  const loadApplications = async () => {
    try {
      const response = await getJobApplications(jobId);
      setApplications(response.data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Candidate Applications</h1>
        {jobId ? (
          <p className="text-gray-600 mt-2">{applications.length} applications received</p>
        ) : (
          <p className="text-gray-600 mt-2">Select a job to view applications</p>
        )}
      </div>

      {!jobId ? (
        <div className="card text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Selected</h3>
          <p className="text-gray-600 mb-6">Please go to "My Jobs" and select "View Candidates" for a specific job posting.</p>
          <a href="/recruiter/jobs" className="btn btn-primary">
            Go to My Jobs
          </a>
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-6">
          {applications.map((application) => (
            <div key={application.id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {application.jobSeeker?.firstName} {application.jobSeeker?.lastName}
                      </h3>

                      <div className="mt-3 space-y-2 text-sm text-gray-600">
                        {application.jobSeeker?.user?.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {application.jobSeeker.user.email}
                          </div>
                        )}
                        {application.jobSeeker?.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {application.jobSeeker.phone}
                          </div>
                        )}
                        {application.jobSeeker?.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {application.jobSeeker.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Applied {formatDate(application.appliedDate)}
                        </div>
                      </div>

                      {application.jobSeeker?.summary && (
                        <p className="mt-3 text-sm text-gray-700">
                          {application.jobSeeker.summary}
                        </p>
                      )}

                      {application.coverLetter && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                          <p className="text-sm text-gray-600">{application.coverLetter}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={application.status}
                        onChange={(e) => handleStatusChange(application.id, e.target.value)}
                        className="input"
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="VIEWED">Viewed</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="OFFERED">Offered</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>

                    {application.aiMatchScore && (
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">AI Match Score</p>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(application.aiMatchScore * 100)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600">Applications will appear here once candidates apply</p>
        </div>
      )}
    </div>
  );
};

export default ViewCandidates;
