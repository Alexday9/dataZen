import React, { useState } from 'react';
import { Lightbulb, CheckCircle, AlertTriangle, Info, TrendingUp, Filter, Database } from 'lucide-react';
import { Recommendation } from '../types';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendations }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getRecommendationIcon = (category: Recommendation['category']) => {
    switch (category) {
      case 'data_quality':
        return <Database className="w-5 h-5 text-blue-600" />;
      case 'analysis':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'preprocessing':
        return <Filter className="w-5 h-5 text-purple-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityIcon = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <Info className="w-4 h-4 text-amber-600" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColors = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'medium':
        return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
      case 'low':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const categories = [
    { id: 'all', label: 'All Recommendations', count: recommendations.length },
    { id: 'data_quality', label: 'Data Quality', count: recommendations.filter(r => r.category === 'data_quality').length },
    { id: 'analysis', label: 'Analysis', count: recommendations.filter(r => r.category === 'analysis').length },
    { id: 'preprocessing', label: 'Preprocessing', count: recommendations.filter(r => r.category === 'preprocessing').length },
  ].filter(cat => cat.count > 0);

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === selectedCategory);

  const priorityCounts = recommendations.reduce((acc, rec) => {
    acc[rec.priority] = (acc[rec.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-xl mr-4">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Smart Recommendations</h2>
            <p className="text-gray-600 mt-1">AI-powered insights for your data</p>
          </div>
        </div>
        
        {recommendations.length > 0 && (
          <div className="flex space-x-2">
            {priorityCounts.high && (
              <div className="flex items-center bg-red-100 px-3 py-1 rounded-full">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-sm font-semibold text-red-800">{priorityCounts.high}</span>
              </div>
            )}
            {priorityCounts.medium && (
              <div className="flex items-center bg-amber-100 px-3 py-1 rounded-full">
                <Info className="w-4 h-4 text-amber-600 mr-1" />
                <span className="text-sm font-semibold text-amber-800">{priorityCounts.medium}</span>
              </div>
            )}
            {priorityCounts.low && (
              <div className="flex items-center bg-green-100 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm font-semibold text-green-800">{priorityCounts.low}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="p-4 bg-green-100 rounded-2xl inline-block mb-4">
              <Lightbulb className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Great Data Quality!</h3>
            <p className="text-gray-600">Your dataset looks well-structured with no immediate recommendations.</p>
          </div>
        ) : (
          filteredRecommendations.map((recommendation, index) => (
            <div
              key={index}
              className={`border rounded-xl p-6 transition-all duration-200 ${getPriorityColors(recommendation.priority)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getRecommendationIcon(recommendation.category)}
                  <h3 className="font-semibold text-lg ml-3">{recommendation.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(recommendation.priority)}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    recommendation.priority === 'high' ? 'bg-red-200 text-red-800' :
                    recommendation.priority === 'medium' ? 'bg-amber-200 text-amber-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {recommendation.priority}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{recommendation.description}</p>
              
              {recommendation.action && (
                <div className="bg-white/50 rounded-lg p-4 border border-gray-200/50">
                  <h4 className="font-semibold text-gray-900 mb-2">Recommended Action</h4>
                  <p className="text-sm text-gray-700">{recommendation.action}</p>
                </div>
              )}
              
              {recommendation.impact && (
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="font-medium">Expected Impact:</span>
                  <span className="ml-2">{recommendation.impact}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};