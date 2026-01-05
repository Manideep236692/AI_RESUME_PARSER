import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRecruiterProfile, updateRecruiterProfile } from '../../services/api';
import { User, Building, Mail, Globe, Users, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        companyName: '',
        companyDescription: '',
        companyWebsite: '',
        companySize: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getRecruiterProfile();
            setProfile(response.data);
            setFormData({
                companyName: response.data.companyName || '',
                companyDescription: response.data.companyDescription || '',
                companyWebsite: response.data.companyWebsite || '',
                companySize: response.data.companySize || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await updateRecruiterProfile(formData);
            setProfile(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <User className="mr-3" />
                        Recruiter Profile
                    </h1>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center text-white bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-md transition-colors"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="pl-10 input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Website</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="url"
                                        value={formData.companyWebsite}
                                        onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                                        className="pl-10 input"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company Size</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Users className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            value={formData.companySize}
                                            onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                                            className="pl-10 input"
                                        >
                                            <option value="">Select size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201-500">201-500 employees</option>
                                            <option value="500+">500+ employees</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    rows={4}
                                    value={formData.companyDescription}
                                    onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                                    className="input mt-1"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="btn btn-secondary flex items-center"
                                >
                                    <X className="w-4 h-4 mr-2" /> Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2" /> Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="bg-white p-3 rounded-full shadow-sm">
                                    <Building className="w-8 h-8 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {profile?.companyName || 'Not Provided'}
                                    </h3>
                                    {profile?.companyWebsite && (
                                        <a href={profile.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-sm flex items-center mt-1">
                                            <Globe className="w-3 h-3 mr-1" /> Visit Website
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="bg-white p-3 rounded-full shadow-sm">
                                        <Mail className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {user?.email}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="bg-white p-3 rounded-full shadow-sm">
                                        <Users className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Company Size</p>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {profile?.companySize || 'Not Specified'}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {profile?.companyDescription && (
                                <div className="border-t pt-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">About Company</h4>
                                    <p className="text-gray-600">{profile.companyDescription}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
