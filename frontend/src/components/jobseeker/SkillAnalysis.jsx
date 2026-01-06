import React, { useState, useEffect } from 'react';
import { getSkillGapAnalysis } from '../../services/api';
import { CheckCircle, XCircle, BookOpen, ChevronRight } from 'lucide-react';

export const SkillAnalysis = ({ jobPostingId, jobTitle }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobPostingId) {
      loadAnalysis();
    }
  }, [jobPostingId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const response = await getSkillGapAnalysis(jobPostingId);
      setAnalysis(response.data);
    } catch (err) {
      console.error('Error loading skill gap analysis:', err);
      setError('Failed to load skill analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-48 bg-gray-100 rounded-xl"></div>;
  if (error) return null;
  if (!analysis) return null;

  return (
    <div className="card overflow-hidden border-l-4 border-primary-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          AI Skill Analysis: <span className="text-primary-600">{jobTitle}</span>
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Match Score</span>
          <div className="w-12 h-12 rounded-full border-4 border-primary-500 flex items-center justify-center text-xs font-bold text-primary-700">
            {Math.round(analysis.overallMatchPercentage * 100)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Skills */}
        <div>
          <h4 className="flex items-center text-sm font-semibold text-green-700 mb-3">
            <CheckCircle className="w-4 h-4 mr-2" />
            Matching Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.matchingSkills.map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md border border-green-200">
                {skill}
              </span>
            ))}
            {analysis.matchingSkills.length === 0 && <p className="text-xs text-gray-500 italic">No matching skills found</p>}
          </div>
        </div>

        {/* Skill Gaps */}
        <div>
          <h4 className="flex items-center text-sm font-semibold text-red-700 mb-3">
            <XCircle className="w-4 h-4 mr-2" />
            Skill Gaps
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md border border-red-200">
                {skill}
              </span>
            ))}
            {analysis.missingSkills.length === 0 && <p className="text-xs text-gray-500 italic">Excellent! No gaps identified.</p>}
          </div>
        </div>
      </div>

      {/* Learning Resources */}
      {analysis.learningResources && analysis.learningResources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="flex items-center text-sm font-semibold text-gray-800 mb-3">
            <BookOpen className="w-4 h-4 mr-2" />
            Recommended Learning
          </h4>
          <div className="space-y-2">
            {analysis.learningResources.slice(0, 2).map((resource, index) => (
              <a 
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg group transition-colors"
              >
                <span className="text-xs text-gray-700 font-medium">{resource.title}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillAnalysis;
