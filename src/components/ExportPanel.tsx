import React, { useState } from 'react';
import { Download, FileText, Database, Loader, FileSpreadsheet } from 'lucide-react';
import { DataSummary, DataAnalysis } from '../types';
import { ExportService } from '../utils/exportService';
import { CleaningReport } from '../utils/dataCleaner';

interface ExportPanelProps {
  data: DataSummary;
  analysis: DataAnalysis;
  cleaningReport?: CleaningReport;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ data, analysis, cleaningReport }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'csv' | 'xlsx' | null>(null);

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    try {
      await ExportService.exportToPDF(data, analysis, cleaningReport);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportData = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    setExportType(format);
    try {
      await ExportService.exportCleanedData(data, format, cleaningReport);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleExportPDF}
        disabled={isExporting}
        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {isExporting && exportType === 'pdf' ? (
          <Loader className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 mr-2" />
        )}
        <span className="font-medium">
          {cleaningReport ? 'Rapport Complet' : 'Export Rapport'}
        </span>
      </button>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleExportData('csv')}
          disabled={isExporting}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isExporting && exportType === 'csv' ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Database className="w-4 h-4 mr-2" />
          )}
          <span className="font-medium">CSV</span>
        </button>
        
        <button
          onClick={() => handleExportData('xlsx')}
          disabled={isExporting}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isExporting && exportType === 'xlsx' ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4 mr-2" />
          )}
          <span className="font-medium">Excel</span>
        </button>
      </div>
    </div>
  );
};