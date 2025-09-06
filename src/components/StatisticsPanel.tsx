import React, { useState } from 'react';
import { BarChart3, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { ColumnStats } from '../types';

interface StatisticsPanelProps {
  columnStats: ColumnStats[];
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ columnStats }) => {
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());

  const toggleColumn = (columnName: string) => {
    const newExpanded = new Set(expandedColumns);
    if (newExpanded.has(columnName)) {
      newExpanded.delete(columnName);
    } else {
      newExpanded.add(columnName);
    }
    setExpandedColumns(newExpanded);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'numerical': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'categorical': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'date': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-emerald-100 rounded-xl mr-4">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistical Analysis</h2>
          <p className="text-gray-600 mt-1">Detailed statistics for each column</p>
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {columnStats.map((stat) => (
          <div key={stat.name} className="border border-gray-200/50 rounded-xl bg-white/50 backdrop-blur-sm">
            <button
              onClick={() => toggleColumn(stat.name)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-all duration-200 rounded-xl"
            >
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-gray-400 mr-3" />
                <span className="font-semibold text-gray-900 text-lg">{stat.name}</span>
                <span className={`ml-3 px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(stat.type)}`}>
                  {stat.type}
                </span>
              </div>
              <div className="flex items-center">
                {expandedColumns.has(stat.name) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
            
            {expandedColumns.has(stat.name) && (
              <div className="px-6 pb-6 border-t border-gray-100/50">
                {stat.numerical && (
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Mean</span>
                        <span className="text-sm font-bold text-gray-900">{stat.numerical.mean}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Median</span>
                        <span className="text-sm font-bold text-gray-900">{stat.numerical.median}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Std Deviation</span>
                        <span className="text-sm font-bold text-gray-900">{stat.numerical.std}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Outliers</span>
                        <span className="text-sm font-bold text-red-600">{stat.numerical.outliers.length}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Minimum</span>
                        <span className="text-sm font-bold text-gray-900">{stat.numerical.min}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Maximum</span>
                        <span className="text-sm font-bold text-gray-900">{stat.numerical.max}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Q1 (25%)</span>
                        <span className="text-sm font-bold text-gray-900">{stat.numerical.q1}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">Q3 (75%)</span>
                        <span className="text-sm font-bold text-gray-900">{stat.numerical.q3}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {stat.categorical && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-semibold text-gray-700">Unique Values</span>
                      <span className="text-lg font-bold text-gray-900">{stat.categorical.uniqueCount}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-gray-700 mb-3">Most Frequent Values</div>
                      {stat.categorical.topValues.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-900 truncate mr-4">{item.value}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{item.count}</span>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};