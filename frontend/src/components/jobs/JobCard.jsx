import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { formatDate, formatSalary, truncateText } from '../../utils/helpers';

const JobCard = ({ job }) => {
  return (
    <Link to={`/jobs/${job.id}`} className="card-hover block h-full">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
          <p className="text-gray-700 font-medium mb-3">{job.companyName}</p>
          
          <p className="text-sm text-gray-600 mb-4">
            {truncateText(job.description, 120)}
          </p>

          <div className="space-y-2 text-sm text-gray-600">
            {job.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{job.location}</span>
              </div>
            )}
            
            {job.jobType && (
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                <span>{job.jobType}</span>
              </div>
            )}
            
            {(job.salaryMin || job.salaryMax) && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Posted {formatDate(job.postedDate)}</span>
          </div>
          <span className="text-primary-600 font-medium">View Details →</span>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
