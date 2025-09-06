import React, { useMemo, useState } from 'react';
import { DataSummary } from '../types';
import { DataAnalyzer } from '../utils/dataAnalyzer';
import { DataCleaner, CleaningReport } from '../utils/dataCleaner';
import { DataOverview } from './DataOverview';
import { StatisticsPanel } from './StatisticsPanel';
import { VisualizationPanel } from './VisualizationPanel';
import { AnomalyDetection } from './AnomalyDetection';
import { RecommendationsPanel } from './RecommendationsPanel';
import { DataCleaningPanel } from './DataCleaningPanel';
import { ExportPanel } from './ExportPanel';
import { ArrowLeft, TrendingUp } from 'lucide-react';

interface DashboardProps {
  data: DataSummary;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onBack }) => {
  const [cleanedData, setCleanedData] = useState<DataSummary | null>(null);
  const [cleaningReport, setCleaningReport] = useState<CleaningReport | null>(null);

  const currentData = cleanedData || data;
  
  const analysis = useMemo(() => {
    return DataAnalyzer.analyzeData(currentData);
  }, [currentData]);

  const handleCleanedDataReady = (cleaned: DataSummary, report: CleaningReport) => {
    setCleanedData(cleaned);
    setCleaningReport(report);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200 hover:translate-x-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Nouvelle Analyse</span>
            </button>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DataZen Analysis
                </h1>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {data.fileName}
                {cleanedData && <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">Nettoyé</span>}
              </p>
            </div>
            
            <ExportPanel data={currentData} analysis={analysis} cleaningReport={cleaningReport} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Dataset Overview */}
          <DataOverview data={currentData} />
          
          {/* Data Cleaning Panel */}
          {!cleanedData && (
            <DataCleaningPanel 
              originalData={data} 
              onCleanedDataReady={handleCleanedDataReady}
            />
          )}
          
          {/* Main Analysis Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <StatisticsPanel columnStats={analysis.columnStats} />
              <VisualizationPanel 
                data={currentData} 
                columnStats={analysis.columnStats} 
                correlations={analysis.correlations}
              />
            </div>
            
            <div className="space-y-8">
              <AnomalyDetection anomalies={analysis.anomalies} />
              <RecommendationsPanel recommendations={analysis.recommendations} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};