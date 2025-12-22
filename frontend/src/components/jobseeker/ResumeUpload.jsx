import React, { useState, useEffect } from 'react';
import { uploadResume, getResumes } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const ResumeUpload = () => {
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const response = await getResumes();
      setResumes(response.data);
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setError('');
    setSuccess('');

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      await uploadResume(file);
      setSuccess('Resume uploaded successfully!');
      loadResumes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resume Management</h1>
        <p className="text-gray-600 mt-2">Upload and manage your resumes</p>
      </div>

      {/* Upload Section */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Resume</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between mb-4">
            <span>{error}</span>
            <button onClick={() => setError('')}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center mb-4">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>{success}</span>
          </div>
        )}

        <div
          className={`dropzone rounded-lg p-12 text-center ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {uploading ? 'Uploading...' : 'Drag and drop your resume here'}
          </p>
          <p className="text-sm text-gray-600 mb-4">or</p>
          <label className="btn btn-primary cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={uploading}
            />
            Choose File
          </label>
          <p className="text-xs text-gray-500 mt-4">
            Supported formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>
      </div>

      {/* Uploaded Resumes */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Resumes</h2>

        {resumes.length > 0 ? (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{resume.fileName}</h3>
                    <p className="text-sm text-gray-600">
                      Uploaded on {formatDate(resume.uploadDate)}
                    </p>
                  </div>
                </div>
                {resume.isPrimary && (
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p>No resumes uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
