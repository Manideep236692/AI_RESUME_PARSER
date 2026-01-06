import React, { useState } from 'react';
import { searchCandidatePool } from '../../services/api';
import { Search, Loader, Zap, Briefcase, GraduationCap, Clock, Award } from 'lucide-react';

const CandidateSourcing = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setHasSearched(true);
        try {
            const response = await searchCandidatePool(query);
            // Backend returns structure { results: [], total_pool_size: N, status: 'success' }
            // or straightforward list depending on controller mapping. 
            // Based on our changes, backend returns `results` which is the JsonNode from AI service.
            // AI Service returns { results: [...], total_pool_size: ... }

            const data = response.data;
            setResults(data.results || []);
        } catch (error) {
            console.error('Error searching candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Zap className="w-8 h-8 text-yellow-500 mr-3" />
                    AI Candidate Sourcing
                </h1>
                <p className="text-gray-600 mt-2">
                    Search our global database of <span className="font-bold text-primary-600">25,000+ candidates</span> using natural language or job descriptions.
                </p>
            </div>

            <div className="card mb-8">
                <form onSubmit={handleSearch}>
                    <div className="flex flex-col space-y-4">
                        <label className="text-sm font-medium text-gray-700">
                            Enter Job Description or Key Requirements
                        </label>
                        <div className="flex gap-4">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ex: Looking for a Senior Java Developer with 5+ years of experience in Microservices, Spring Boot and AWS. Must have leadership skills."
                                className="flex-1 input h-32"
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                                        Searching Big Data...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5 mr-2" />
                                        Sourcing Candidates
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            {hasSearched && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                            Top Matches Found ({results.length})
                        </h2>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            Scanned 25,000+ profiles in milliseconds
                        </span>
                    </div>

                    {results.length > 0 ? (
                        <div className="grid gap-6">
                            {results.map((candidate) => (
                                <div key={candidate.id} className="card hover:shadow-lg transition-all border-l-4 border-l-primary-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">{candidate.role}</h3>
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {candidate.domain}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">{candidate.id}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center text-gray-700">
                                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="text-sm">{candidate.experience} Years Exp.</span>
                                                </div>
                                                <div className="flex items-center text-gray-700">
                                                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="text-sm">{candidate.education}</span>
                                                </div>
                                                <div className="flex items-center text-gray-700">
                                                    {/* Placeholder for seniority or other generic field */}
                                                    <Award className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="text-sm">High Potential</span>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Top Skills</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {candidate.skills && candidate.skills.map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 italic">
                                                "{candidate.preview}"
                                            </div>
                                        </div>

                                        <div className="text-center min-w-[100px]">
                                            <div className={`text-2xl font-bold ${candidate.matchScore >= 80 ? 'text-green-600' :
                                                    candidate.matchScore >= 60 ? 'text-yellow-600' : 'text-gray-600'
                                                }`}>
                                                {candidate.matchScore}%
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">Match Score</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">No high-confidence matches found for this query.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CandidateSourcing;
