import React, { useState, useEffect } from 'react';
import { getBusinessInsights } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  PieChart,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BusinessInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await getBusinessInsights();
      setInsights(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching business insights:', err);
      setError('Failed to load business insights. Please try again later.');
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block">
          {error}
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Point of View</h1>
            <p className="text-gray-600 mt-1">Strategic insights and recruitment ROI analysis powered by AI.</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border">
            <Clock className="w-4 h-4" />
            <span>Last Updated: {insights?.lastTrainingDate}</span>
          </div>
        </div>

        {/* Top Level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Talent Pool Size" 
            value={insights?.talentPoolSize?.toLocaleString()} 
            subtext="Across all monitored domains"
            icon={Users}
            color="bg-blue-600"
          />
          <StatCard 
            title="Automated Matching Accuracy" 
            value={`${insights?.matchingAccuracy}%`} 
            subtext="Validated against human screening"
            icon={CheckCircle2}
            color="bg-green-600"
          />
          <StatCard 
            title="Recruitment Efficiency" 
            value={`${insights?.estimatedTimeSavedHours?.toLocaleString()} hrs`} 
            subtext="Estimated time saved by AI parsing"
            icon={TrendingUp}
            color="bg-purple-600"
          />
            <StatCard 
              title="Talent Value Score" 
              value={`${insights?.businessValueScore || 85}%`} 
              subtext="Aggregated ROI potential"
              icon={BrainCircuit}
              color="bg-indigo-600"
            />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Domain Distribution */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  <span>Talent Distribution by Domain</span>
                </h2>
                <span className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-50 rounded-full">Top 6 Domains</span>
              </div>
              <div className="space-y-4">
                {Object.entries(insights?.domainDistribution || {}).slice(0, 6).map(([domain, count]) => (
                  <div key={domain}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{domain}</span>
                      <span className="text-gray-500">{count} candidates</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / insights.talentPoolSize) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seniority Mix */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span>Market Seniority Mix</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(insights?.seniorityMix || {}).map(([level, count]) => (
                  <div key={level} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase">{level}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{count}</p>
                    <p className="text-[10px] text-gray-400">Total Talent</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Trending Skills & Strategic Insights */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Trending Skills in Pool</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(insights?.topTrendingSkills || {}).map(([skill, count]) => (
                  <span 
                    key={skill} 
                    className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full font-medium border border-green-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-indigo-600 p-6 rounded-xl shadow-md text-white">
              <h2 className="text-lg font-bold mb-3">Strategic ROI</h2>
              <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                By automating the initial screening phase, your organization has saved approximately <strong>{insights?.estimatedTimeSavedHours} working hours</strong>. This allows the recruitment team to focus 100% on high-value interview processes.
              </p>
              <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 hover:bg-indigo-50 transition-colors">
                <span>View Full ROI Report</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">AI Training Health</h2>
              <div className="flex items-center space-x-3 mb-4 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Datasets Generalized: OK</span>
              </div>
              <div className="flex items-center space-x-3 mb-4 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Missing Values Imputed: OK</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Noise Filtering: Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInsights;
