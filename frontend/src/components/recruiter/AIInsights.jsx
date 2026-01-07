import React, { useState, useEffect } from 'react';
import { getAdvancedMatch, predictFit } from '../../services/api';

export function AIInsights({ jobId, candidateId, candidateName }) {
  const [matchingResults, setMatchingResults] = useState(null);
  const [fitData, setFitData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchAIInsights();
    }
  }, [jobId, candidateId]);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const [bertRes, tfidfRes] = await Promise.all([
        getAdvancedMatch(jobId, 'bert'),
        getAdvancedMatch(jobId, 'tfidf')
      ]);
      
      setMatchingResults({
        bert: bertRes.data.matches,
        tfidf: tfidfRes.data.matches
      });

      if (candidateId) {
        const fitRes = await predictFit(candidateId);
        setFitData(fitRes.data);
      }
    } catch (err) {
      setError('Failed to load AI insights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading AI Insights...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">🤖</span> AI Advanced Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model 1 & 2: Vector Matching */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-800 mb-2">BERT / Transformer Embeddings</h4>
            <p className="text-sm text-blue-600 mb-2">Captures deep semantic context and skill meaning.</p>
            {matchingResults?.bert && (
              <div className="text-2xl font-bold text-blue-700">
                {Math.round((matchingResults.bert[0]?.score || 0) * 100)}% Match
              </div>
            )}
          </div>

          <div className="p-4 bg-green-50 rounded-md">
            <h4 className="font-semibold text-green-800 mb-2">TF-IDF with Cosine Similarity</h4>
            <p className="text-sm text-green-600 mb-2">Classical keyword and frequency-based vector ranking.</p>
            {matchingResults?.tfidf && (
              <div className="text-2xl font-bold text-green-700">
                {Math.round((matchingResults.tfidf[0]?.score || 0) * 100)}% Similarity
              </div>
            )}
          </div>
        </div>

        {/* Model 3: Supervised Fit Prediction */}
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-md h-full">
            <h4 className="font-semibold text-purple-800 mb-2">Supervised ML: Fit Predictor</h4>
            <p className="text-sm text-purple-600 mb-4">Predicts application success likelihood based on historical patterns.</p>
            {fitData ? (
              <div className="text-center">
                <div className={`text-3xl font-extrabold mb-1 ${fitData.fit_likelihood > 0.6 ? 'text-purple-700' : 'text-gray-600'}`}>
                  {Math.round(fitData.fit_likelihood * 100)}%
                </div>
                <div className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full inline-block text-sm font-medium">
                  Recommendation: {fitData.recommendation}
                </div>
              </div>
            ) : (
              <p className="text-sm italic text-purple-400">Select a candidate to see fit likelihood.</p>
            )}
          </div>
        </div>
      </div>

      {/* Model 4: Clustering Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">Clustering Analysis (KMeans)</h4>
        <p className="text-sm text-gray-600">Candidates are automatically grouped into talent clusters based on skills and experience archetypes to help you find specialized talent quickly.</p>
      </div>
    </div>
  );
}
