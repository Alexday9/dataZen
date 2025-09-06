import React from 'react';
import { Database, FileText, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { DataSummary } from '../types';

interface DataOverviewProps {
  data: DataSummary;
}

export const DataOverview: React.FC<DataOverviewProps> = ({ data }) => {
  const typeDistribution = data.columns.reduce((acc, col) => {
    acc[col.type] = (acc[col.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageMissingRate = data.columns.reduce((sum, col) => sum + col.missingRate, 0) / data.columns.length;

  const getQualityStatus = (rate: number) => {
    if (rate < 0.05) return { label: 'Excellent', color: 'emerald', icon: CheckCircle };
    if (rate < 0.15) return { label: 'Good', color: 'blue', icon: CheckCircle };
    return { label: 'Fair', color: 'amber', icon: AlertTriangle };
  };

  const qualityStatus = getQualityStatus(averageMissingRate);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-blue-100 rounded-xl mr-4">
          <Database className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dataset Overview</h2>
          <p className="text-gray-600 mt-1">Comprehensive analysis of your data structure</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Rows</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{data.totalRows.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-200/50 rounded-lg">
              <Database className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Columns</p>
              <p className="text-3xl font-bold text-emerald-900 mt-2">{data.totalColumns}</p>
            </div>
            <div className="p-3 bg-emerald-200/50 rounded-lg">
              <FileText className="w-6 h-6 text-emerald-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Missing Data</p>
              <p className="text-3xl font-bold text-amber-900 mt-2">{(averageMissingRate * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-amber-200/50 rounded-lg">
              {averageMissingRate > 0.1 ? (
                <AlertTriangle className="w-6 h-6 text-amber-700" />
              ) : (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              )}
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br from-${qualityStatus.color}-50 to-${qualityStatus.color}-100 rounded-xl p-6 border border-${qualityStatus.color}-200/50`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold text-${qualityStatus.color}-700 uppercase tracking-wide`}>Data Quality</p>
              <p className={`text-3xl font-bold text-${qualityStatus.color}-900 mt-2`}>{qualityStatus.label}</p>
            </div>
            <div className={`p-3 bg-${qualityStatus.color}-200/50 rounded-lg`}>
              <qualityStatus.icon className={`w-6 h-6 text-${qualityStatus.color}-700`} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-200/50">
        <div className="flex items-center mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Column Type Distribution</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.entries(typeDistribution).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
              <div className="text-sm font-medium text-gray-600 capitalize mb-1">{type}</div>
              <div className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-1">
                {((count / data.totalColumns) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};