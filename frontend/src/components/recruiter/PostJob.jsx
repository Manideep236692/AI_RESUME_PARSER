import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../services/api';
import { JOB_TYPES } from '../../utils/constants';
import { CheckCircle, AlertCircle } from 'lucide-react';

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    jobType: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const jobData = {
        ...formData
      };

      await createJob(jobData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-600 mt-2">Fill in the details to create a job posting</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Job posted successfully! Redirecting...</span>
          </div>
        )}

        <div className="card">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="input"
                placeholder="e.g. Senior Software Engineer"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="6"
                required
                className="input"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows="4"
                className="input"
                placeholder="List the required skills, experience, and qualifications..."
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="input"
                  placeholder="e.g. New York, NY"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  className="input"
                  value={formData.jobType}
                  onChange={handleChange}
                >
                  <option value="">Select job type</option>
                  {JOB_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Salary
                </label>
                <input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  className="input"
                  placeholder="50000"
                  value={formData.salaryMin}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Salary
                </label>
                <input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  className="input"
                  placeholder="100000"
                  value={formData.salaryMax}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  className="input"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/recruiter/dashboard')}
            className="btn btn-secondary px-8"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-8"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
