import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BarChart, PieChart, Activity, TrendingUp } from 'lucide-react';
import { DataSummary, ColumnStats } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface VisualizationPanelProps {
  data: DataSummary;
  columnStats: ColumnStats[];
  correlations: { [key: string]: { [key: string]: number } };
}

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ 
  data, 
  columnStats, 
  correlations 
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'distributions' | 'correlations'>('overview');

  const numericalColumns = columnStats.filter(stat => stat.type === 'numerical');
  const categoricalColumns = columnStats.filter(stat => stat.type === 'categorical');

  const typeDistributionData = {
    labels: ['Numerical', 'Categorical', 'Date', 'Text'],
    datasets: [
      {
        data: [
          data.columns.filter(col => col.type === 'numerical').length,
          data.columns.filter(col => col.type === 'categorical').length,
          data.columns.filter(col => col.type === 'date').length,
          data.columns.filter(col => col.type === 'text').length,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(107, 114, 128, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const missingDataChart = {
    labels: data.columns.map(col => col.name.length > 15 ? col.name.substring(0, 15) + '...' : col.name),
    datasets: [
      {
        label: 'Missing Data %',
        data: data.columns.map(col => (col.missingRate * 100)),
        backgroundColor: data.columns.map(col => 
          col.missingRate > 0.3 ? 'rgba(239, 68, 68, 0.8)' :
          col.missingRate > 0.1 ? 'rgba(245, 158, 11, 0.8)' :
          'rgba(16, 185, 129, 0.8)'
        ),
        borderColor: data.columns.map(col => 
          col.missingRate > 0.3 ? 'rgba(239, 68, 68, 1)' :
          col.missingRate > 0.1 ? 'rgba(245, 158, 11, 1)' :
          'rgba(16, 185, 129, 1)'
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            weight: '500' as const,
          },
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(...data.columns.map(col => col.missingRate * 100)) + 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          }
        }
      }
    },
  };

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }: any) => (
    <button
      onClick={onClick}
      className={`flex items-center px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-xl mr-4">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Data Visualizations</h2>
            <p className="text-gray-600 mt-1">Interactive charts and analysis</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <TabButton
            id="overview"
            icon={PieChart}
            label="Overview"
            isActive={selectedTab === 'overview'}
            onClick={() => setSelectedTab('overview')}
          />
          <TabButton
            id="distributions"
            icon={BarChart}
            label="Distributions"
            isActive={selectedTab === 'distributions'}
            onClick={() => setSelectedTab('distributions')}
          />
          <TabButton
            id="correlations"
            icon={TrendingUp}
            label="Correlations"
            isActive={selectedTab === 'correlations'}
            onClick={() => setSelectedTab('correlations')}
          />
        </div>
      </div>

      <div className="space-y-8">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-600" />
                Column Types Distribution
              </h3>
              <div className="h-64">
                <Doughnut 
                  data={typeDistributionData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                        labels: {
                          padding: 20,
                          font: {
                            size: 12,
                            weight: '500' as const,
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-emerald-600" />
                Missing Data Analysis
              </h3>
              <div className="h-64">
                <Bar data={missingDataChart} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'distributions' && (
          <div className="space-y-8">
            {numericalColumns.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Numerical Columns Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {numericalColumns.slice(0, 6).map((stat) => (
                    <div key={stat.name} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-4 text-lg">{stat.name}</h4>
                      {stat.numerical && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Range</span>
                            <span className="text-sm font-bold text-gray-900">{stat.numerical.min} - {stat.numerical.max}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Mean</span>
                            <span className="text-sm font-bold text-gray-900">{stat.numerical.mean}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">Std Dev</span>
                            <span className="text-sm font-bold text-gray-900">{stat.numerical.std}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {categoricalColumns.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-emerald-600" />
                  Categorical Columns Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoricalColumns.slice(0, 4).map((stat) => (
                    <div key={stat.name} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-4 text-lg">{stat.name}</h4>
                      {stat.categorical && (
                        <div className="space-y-4">
                          <div className="text-center p-3 bg-emerald-50 rounded-lg">
                            <div className="text-2xl font-bold text-emerald-900">{stat.categorical.uniqueCount}</div>
                            <div className="text-sm text-emerald-700 font-medium">unique values</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-gray-700">Top Values</div>
                            {stat.categorical.topValues.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-900 truncate">{item.value}</span>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                                  {item.percentage}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'correlations' && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Correlation Matrix
            </h3>
            {Object.keys(correlations).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Variable</th>
                      {Object.keys(correlations).map(col => (
                        <th key={col} className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          <div className="truncate max-w-24" title={col}>{col}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(correlations).map(([row, correlationRow]) => (
                      <tr key={row} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          <div className="truncate max-w-24" title={row}>{row}</div>
                        </td>
                        {Object.values(correlationRow).map((correlation, index) => (
                          <td key={index} className="px-4 py-3 text-sm">
                            <div
                              className={`text-center rounded-lg px-3 py-2 text-xs font-bold ${
                                Math.abs(correlation) > 0.7 ? 'bg-red-100 text-red-800 border border-red-200' :
                                Math.abs(correlation) > 0.5 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                Math.abs(correlation) > 0.3 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}
                            >
                              {correlation.toFixed(2)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No Numerical Columns Found</p>
                <p className="text-sm">Correlation analysis requires numerical data</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};