import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SkillAnalysis = ({ matchScore, matchingSkills = [], missingSkills = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">AI Skill Analysis</h3>
        <div className="flex items-center">
          <div className="text-2xl font-bold text-primary-600 mr-2">{Math.round(matchScore * 100)}%</div>
          <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Match</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Matching Skills */}
        <div>
          <div className="flex items-center text-green-700 font-semibold text-sm mb-3">
            <CheckCircle className="w-4 h-4 mr-2" />
            Matching Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {matchingSkills.length > 0 ? (
              matchingSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs italic">No direct matches found</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div>
          <div className="flex items-center text-amber-700 font-semibold text-sm mb-3">
            <AlertCircle className="w-4 h-4 mr-2" />
            Skill Gaps
          </div>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs italic">Perfect match! No gaps identified.</span>
            )}
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
          <p className="text-xs text-primary-700 leading-relaxed">
            <span className="font-bold">AI Insight:</span> Your background in {matchingSkills[0] || 'software development'} strongly matches this role's requirements. 
            {missingSkills.length > 0 ? ` Strengthening your skills in ${missingSkills.slice(0, 2).join(', ')} could increase your chances.` : ' You are an ideal candidate for this position based on your current skill set.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillAnalysis;
