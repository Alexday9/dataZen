import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Database, BarChart3, Shield, Zap, TrendingUp } from 'lucide-react';
import { FileProcessor } from '../utils/fileProcessor';
import { DataSummary } from '../types';

interface LandingPageProps {
  onDataLoaded: (data: DataSummary) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onDataLoaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    await processFile(file);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await processFile(file);
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const data = await FileProcessor.processFile(file);
      onDataLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const features = [
    {
      icon: Database,
      title: "Comprehensive Analysis",
      description: "Get detailed insights about your dataset structure, data types, and quality metrics"
    },
    {
      icon: BarChart3,
      title: "Automatic Visualizations",
      description: "Generate histograms, box plots, correlation matrices, and distribution charts instantly"
    },
    {
      icon: Shield,
      title: "Anomaly Detection",
      description: "Identify outliers, missing values, and data inconsistencies automatically"
    },
    {
      icon: Zap,
      title: "Smart Recommendations",
      description: "Receive actionable insights and data quality recommendations from our AI"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DataZen
                </h1>
                <p className="text-sm text-gray-600 font-medium">Professional Data Analysis Platform</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Secure & Private
              </span>
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Instant Analysis
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Data Into
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Actionable Insights
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            Upload your CSV or Excel files and receive comprehensive data analysis, 
            visualizations, and professional recommendations in seconds.
          </p>
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <Shield className="w-4 h-4 mr-2" />
            Your data never leaves your browser - 100% secure and private
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto mb-20">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-blue-400 bg-blue-50/50 scale-105'
                : 'border-gray-300 bg-white/70 hover:border-gray-400 hover:bg-white/90'
            } backdrop-blur-sm shadow-lg`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />

            <div className="space-y-6">
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">Processing your data...</h3>
                    <p className="text-gray-600">Analyzing structure and generating insights</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl inline-block">
                    <Upload className="w-16 h-16 text-blue-600 mx-auto" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">Drop your file here</h3>
                    <p className="text-gray-600 text-lg">or click to browse files</p>
                  </div>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
                      <FileText className="w-4 h-4 mr-2" />
                      CSV Files
                    </div>
                    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Excel Files
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Supported formats: CSV, Excel (.xlsx, .xls) • Maximum file size: 50MB
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl inline-block mb-6">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* What You'll Get Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-gray-200/50">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">What You'll Get</h3>
            <p className="text-xl text-gray-600">Comprehensive analysis delivered in seconds</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="p-3 bg-blue-100 rounded-xl inline-block">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Dataset Overview</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Row and column counts</li>
                <li>• Data type identification</li>
                <li>• Missing value analysis</li>
                <li>• Data quality assessment</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-emerald-100 rounded-xl inline-block">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Statistical Analysis</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Descriptive statistics</li>
                <li>• Distribution analysis</li>
                <li>• Correlation matrices</li>
                <li>• Outlier detection</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-purple-100 rounded-xl inline-block">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Smart Insights</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Automated recommendations</li>
                <li>• Data quality warnings</li>
                <li>• Pattern recognition</li>
                <li>• Export capabilities</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © 2025 DataZen. Professional data analysis made simple and secure.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};