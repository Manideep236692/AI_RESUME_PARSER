import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, applyForJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MapPin, Briefcase, DollarSign, Calendar, Building, ChevronLeft } from 'lucide-react';
import { formatDate, formatSalary } from '../utils/helpers';
import SkillAnalysis from '../components/jobseeker/SkillAnalysis';

export function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await getJobById(id);
      setJob(response.data);
    } catch (err) {
      setError('Failed to load job details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (user.role !== 'JOB_SEEKER') {
      alert('Only job seekers can apply for jobs.');
      return;
    }

    setApplying(true);
    try {
      await applyForJob({ jobPostingId: id });
      setApplied(true);
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying for job:', err);
      alert(err.response?.data?.message || 'Failed to submit application. Please make sure you have uploaded a resume.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!job) return <div className="text-center py-12">Job not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center text-xl text-gray-600">
                  <Building className="w-5 h-5 mr-2" />
                  {job.recruiter?.companyName || job.companyName}
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-semibold">
                  {job.jobType}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mb-8 text-gray-600 border-b border-gray-100 pb-8">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                {job.location}
              </div>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-primary-500" />
                {formatSalary(job.salaryMin, job.salaryMax)}
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                Posted {formatDate(job.postedDate)}
              </div>
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 whitespace-pre-line mb-8">
                {job.description}
              </p>

              {job.requirements && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-8">
                    {typeof job.requirements === 'string' 
                      ? job.requirements.split('\n').map((req, index) => (
                          <li key={index}>{req}</li>
                        ))
                      : Array.isArray(job.requirements) 
                        ? job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))
                        : <li>{job.requirements}</li>
                    }
                  </ul>
                </>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
              {applied ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-semibold">
                  You have already applied for this position
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${
                    applying ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {isAuthenticated() && user.role === 'JOB_SEEKER' && (
            <div className="sticky top-8">
              <SkillAnalysis jobPostingId={id} />
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
            <h3 className="font-bold text-gray-900 mb-4">Company Information</h3>
            <p className="text-gray-600 text-sm mb-4">
              Learn more about {job.companyName} and their mission.
            </p>
            <button className="text-primary-600 font-semibold hover:underline text-sm">
              View Company Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
