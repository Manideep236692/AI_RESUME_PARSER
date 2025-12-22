import React from 'react';
import { JOB_TYPES } from '../../utils/constants';
import { Search, MapPin, Briefcase, X } from 'lucide-react';

const JobFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const handleChange = (e) => {
    onFilterChange({
      [e.target.name]: e.target.value
    });
  };

  const hasActiveFilters = filters.keyword || filters.location || filters.jobType;

  return (
    <div className="card mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
            <Search className="w-4 h-4 inline mr-1" />
            Keyword
          </label>
          <input
            id="keyword"
            name="keyword"
            type="text"
            className="input"
            placeholder="Job title, skills..."
            value={filters.keyword}
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
            value={filters.location}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
            <Briefcase className="w-4 h-4 inline mr-1" />
            Job Type
          </label>
          <select
            id="jobType"
            name="jobType"
            className="input"
            value={filters.jobType}
            onChange={handleChange}
          >
            <option value="">All Types</option>
            {JOB_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClearFilters}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default JobFilters;
