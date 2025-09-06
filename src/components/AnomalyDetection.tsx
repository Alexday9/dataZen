import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, AlertCircle, Info, XCircle } from 'lucide-react';
import { Anomaly } from '../types';

interface AnomalyDetectionProps {
  anomalies: Anomaly[];
}

export const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({ anomalies }) => {
  const [expandedAnomalies, setExpandedAnomalies] = useState<Set<number>>(new Set());

  const toggleAnomaly = (index: number) => {
    const newExpanded = new Set(expandedAnomalies);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedAnomalies(newExpanded);
  };

  const getAnomalyIcon = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'high':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAnomalyColors = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const severityCounts = anomalies.reduce((acc, anomaly) => {
    acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-red-100 rounded-xl mr-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Anomaly Detection</h2>
            <p className="text-gray-600 mt-1">Identified data quality issues</p>
          </div>
        </div>
        
        {anomalies.length > 0 && (
          <div className="flex space-x-3">
            {severityCounts.high && (
              <div className="flex items-center bg-red-100 px-3 py-1 rounded-full">
                <XCircle className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-sm font-semibold text-red-800">{severityCounts.high}</span>
              </div>
            )}
            {severityCounts.medium && (
              <div className="flex items-center bg-amber-100 px-3 py-1 rounded-full">
                <AlertTriangle className="w-4 h-4 text-amber-600 mr-1" />
                <span className="text-sm font-semibold text-amber-800">{severityCounts.medium}</span>
              </div>
            )}
            {severityCounts.low && (
              <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                <Info className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-sm font-semibold text-blue-800">{severityCounts.low}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {anomalies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="p-4 bg-green-100 rounded-2xl inline-block mb-4">
              <AlertTriangle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Anomalies Detected</h3>
            <p className="text-gray-600">Your data appears to be clean and consistent!</p>
          </div>
        ) : (
          anomalies.map((anomaly, index) => (
            <div
              key={index}
              className={`border rounded-xl ${getAnomalyColors(anomaly.severity)} transition-all duration-200`}
            >
              <button
                onClick={() => toggleAnomaly(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-black/5 transition-all duration-200 rounded-xl"
              >
                <div className="flex items-center">
                  {getAnomalyIcon(anomaly.severity)}
                  <div className="ml-4">
                    <h3 className="font-semibold text-lg">{anomaly.title}</h3>
                    <p className="text-sm opacity-80 mt-1">{anomaly.column}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    anomaly.severity === 'high' ? 'bg-red-200 text-red-800' :
                    anomaly.severity === 'medium' ? 'bg-amber-200 text-amber-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {anomaly.severity}
                  </span>
                  {expandedAnomalies.has(index) ? (
                    <EyeOff className="w-5 h-5 opacity-60" />
                  ) : (
                    <Eye className="w-5 h-5 opacity-60" />
                  )}
                </div>
              </button>
              
              {expandedAnomalies.has(index) && (
                <div className="px-6 pb-6 border-t border-black/10">
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm opacity-90">{anomaly.description}</p>
                    </div>
                    
                    {anomaly.affectedRows && anomaly.affectedRows.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Affected Rows</h4>
                        <div className="bg-black/10 rounded-lg p-3">
                          <p className="text-sm font-mono">
                            Rows: {anomaly.affectedRows.slice(0, 10).join(', ')}
                            {anomaly.affectedRows.length > 10 && ` ... and ${anomaly.affectedRows.length - 10} more`}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {anomaly.value !== undefined && (
                      <div>
                        <h4 className="font-semibold mb-2">Value</h4>
                        <div className="bg-black/10 rounded-lg p-3">
                          <p className="text-sm font-mono">{String(anomaly.value)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
