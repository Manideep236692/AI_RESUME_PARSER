import React, { useState, useEffect } from 'react';
import { getJobSeekerProfile, updateJobSeekerProfile } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { User, MapPin, Phone, Briefcase, CheckCircle } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    totalExperience: '',
    summary: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getJobSeekerProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await updateJobSeekerProfile(profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="input"
                value={profile.firstName || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="input"
                value={profile.lastName || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input"
                value={profile.phone || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className="input"
                placeholder="City, State"
                value={profile.location || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="totalExperience" className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Total Experience (years)
              </label>
              <input
                id="totalExperience"
                name="totalExperience"
                type="number"
                min="0"
                className="input"
                value={profile.totalExperience || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
              Professional Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              rows="4"
              className="input"
              placeholder="Tell us about your professional background, skills, and career goals..."
              value={profile.summary || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary px-8"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
