import { DataSummary, ColumnStats, NumericalStats, CategoricalStats, Anomaly, Recommendation, DataAnalysis } from '../types';

export class DataAnalyzer {
  static analyzeData(data: DataSummary): DataAnalysis {
    const columnStats = this.generateColumnStats(data);
    const correlations = this.calculateCorrelations(data);
    const anomalies = this.detectAnomalies(data, columnStats);
    const recommendations = this.generateRecommendations(data, columnStats, anomalies);
    
    return { columnStats, correlations, anomalies, recommendations };
  }

  private static generateColumnStats(data: DataSummary): ColumnStats[] {
    return data.columns.map(column => {
      const stats: ColumnStats = {
        name: column.name,
        type: column.type
      };

      if (column.type === 'numerical') {
        stats.numerical = this.calculateNumericalStats(column.values);
      } else if (column.type === 'categorical') {
        stats.categorical = this.calculateCategoricalStats(column.values);
      }

      return stats;
    });
  }

  private static calculateNumericalStats(values: any[]): NumericalStats {
    const numericValues = values
      .filter(v => !isNaN(Number(v)) && v !== null && v !== undefined && v !== '')
      .map(v => Number(v));
    
    if (numericValues.length === 0) {
      return {
        mean: 0, median: 0, std: 0, min: 0, max: 0, q1: 0, q3: 0, outliers: []
      };
    }

    const sorted = [...numericValues].sort((a, b) => a - b);
    const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    const median = this.calculateMedian(sorted);
    const std = Math.sqrt(
      numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length
    );
    
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    const outliers = numericValues.filter(val => 
      val < q1 - 1.5 * iqr || val > q3 + 1.5 * iqr
    );

    return {
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      std: Number(std.toFixed(2)),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      q1: Number(q1.toFixed(2)),
      q3: Number(q3.toFixed(2)),
      outliers
    };
  }

  private static calculateMedian(sortedValues: number[]): number {
    const mid = Math.floor(sortedValues.length / 2);
    return sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];
  }

  private static calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) return sortedValues[lower];
    
    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  private static calculateCategoricalStats(values: any[]): CategoricalStats {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const counts = new Map<string, number>();
    
    nonNullValues.forEach(value => {
      const key = String(value);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const topValues = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({
        value,
        count,
        percentage: Number(((count / nonNullValues.length) * 100).toFixed(1))
      }));

    return {
      uniqueCount: counts.size,
      topValues
    };
  }

  private static calculateCorrelations(data: DataSummary): { [key: string]: { [key: string]: number } } {
    const numericalColumns = data.columns.filter(col => col.type === 'numerical');
    const correlations: { [key: string]: { [key: string]: number } } = {};

    numericalColumns.forEach(col1 => {
      correlations[col1.name] = {};
      numericalColumns.forEach(col2 => {
        if (col1.name === col2.name) {
          correlations[col1.name][col2.name] = 1;
        } else {
          const correlation = this.calculatePearsonCorrelation(col1.values, col2.values);
          correlations[col1.name][col2.name] = correlation;
        }
      });
    });

    return correlations;
  }

  private static calculatePearsonCorrelation(x: any[], y: any[]): number {
    const pairs = x.map((val, i) => [Number(val), Number(y[i])])
      .filter(([a, b]) => !isNaN(a) && !isNaN(b));
    
    if (pairs.length < 2) return 0;

    const n = pairs.length;
    const sumX = pairs.reduce((sum, [a]) => sum + a, 0);
    const sumY = pairs.reduce((sum, [, b]) => sum + b, 0);
    const sumXY = pairs.reduce((sum, [a, b]) => sum + a * b, 0);
    const sumX2 = pairs.reduce((sum, [a]) => sum + a * a, 0);
    const sumY2 = pairs.reduce((sum, [, b]) => sum + b * b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return Number((numerator / denominator).toFixed(3));
  }

  private static detectAnomalies(data: DataSummary, columnStats: ColumnStats[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Check for high missing value rates
    data.columns.forEach(column => {
      if (column.missingRate > 0.3) {
        anomalies.push({
          type: 'missing_values',
          severity: column.missingRate > 0.5 ? 'high' : 'medium',
          title: `High Missing Value Rate in ${column.name}`,
          description: `Column "${column.name}" has ${(column.missingRate * 100).toFixed(1)}% missing values, which may impact analysis quality.`,
          column: column.name,
          count: column.missingCount
        });
      }
    });

    // Check for outliers in numerical columns
    columnStats.forEach(stat => {
      if (stat.numerical && stat.numerical.outliers.length > 0) {
        const outlierRate = stat.numerical.outliers.length / data.totalRows;
        anomalies.push({
          type: 'outlier',
          severity: outlierRate > 0.1 ? 'high' : outlierRate > 0.05 ? 'medium' : 'low',
          title: `Outliers Detected in ${stat.name}`,
          description: `Found ${stat.numerical.outliers.length} outliers in "${stat.name}" (${(outlierRate * 100).toFixed(1)}% of data).`,
          column: stat.name,
          count: stat.numerical.outliers.length
        });
      }
    });

    // Check for duplicate values
    data.columns.forEach(column => {
      const values = column.values.filter(v => v !== null && v !== undefined && v !== '');
      const uniqueValues = new Set(values);
      const duplicateRate = 1 - (uniqueValues.size / values.length);
      
      if (duplicateRate > 0.8 && column.type !== 'categorical') {
        anomalies.push({
          type: 'duplicate_values',
          severity: 'medium',
          title: `High Duplicate Rate in ${column.name}`,
          description: `Column "${column.name}" has ${(duplicateRate * 100).toFixed(1)}% duplicate values.`,
          column: column.name
        });
      }
    });

    return anomalies;
  }

  private static generateRecommendations(data: DataSummary, columnStats: ColumnStats[], anomalies: Anomaly[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Data quality recommendations
    const highMissingColumns = data.columns.filter(col => col.missingRate > 0.2);
    if (highMissingColumns.length > 0) {
      recommendations.push({
        category: 'data_quality',
        priority: 'high',
        title: 'Address Missing Values',
        description: `${highMissingColumns.length} columns have significant missing values (>20%). This could impact analysis accuracy.`,
        action: 'Consider imputation strategies, removal of incomplete records, or collection of additional data.',
        impact: 'Improved data completeness and analysis reliability'
      });
    }

    // Analysis recommendations
    const numericalColumns = columnStats.filter(stat => stat.type === 'numerical');
    if (numericalColumns.length >= 2) {
      const strongCorrelations = Object.entries(this.calculateCorrelations(data))
        .flatMap(([col1, correlations]) => 
          Object.entries(correlations)
            .filter(([col2, corr]) => col1 !== col2 && Math.abs(corr) > 0.7)
            .map(([col2, corr]) => ({ col1, col2, correlation: corr }))
        );

      if (strongCorrelations.length > 0) {
        recommendations.push({
          category: 'analysis',
          priority: 'medium',
          title: 'Strong Correlations Detected',
          description: `Found ${strongCorrelations.length} pairs of strongly correlated variables. This could indicate multicollinearity.`,
          action: 'Consider feature selection or dimensionality reduction techniques for modeling.',
          impact: 'Reduced model complexity and improved interpretability'
        });
      }
    }

    // Preprocessing recommendations
    const outlierColumns = anomalies.filter(a => a.type === 'outlier' && a.severity === 'high');
    if (outlierColumns.length > 0) {
      recommendations.push({
        category: 'preprocessing',
        priority: 'medium',
        title: 'Handle Outliers',
        description: `${outlierColumns.length} columns contain significant outliers that may skew analysis results.`,
        action: 'Consider outlier removal, transformation, or robust statistical methods.',
        impact: 'More reliable statistical measures and model performance'
      });
    }

    // Categorical data recommendations
    const categoricalColumns = columnStats.filter(stat => stat.type === 'categorical');
    categoricalColumns.forEach(stat => {
      if (stat.categorical && stat.categorical.uniqueCount > data.totalRows * 0.8) {
        recommendations.push({
          category: 'preprocessing',
          priority: 'low',
          title: `High Cardinality in ${stat.name}`,
          description: `Column "${stat.name}" has very high cardinality (${stat.categorical.uniqueCount} unique values).`,
          action: 'Consider grouping rare categories or using encoding techniques for modeling.',
          impact: 'Reduced dimensionality and improved model efficiency'
        });
      }
    });

    return recommendations;
  }
}
