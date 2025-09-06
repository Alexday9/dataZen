export interface DataColumn {
  name: string;
  type: 'numerical' | 'categorical' | 'date' | 'text';
  values: any[];
  missingCount: number;
  missingRate: number;
}

export interface DataSummary {
  totalRows: number;
  totalColumns: number;
  columns: DataColumn[];
  fileName: string;
}

export interface NumericalStats {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  outliers: number[];
}

export interface CategoricalStats {
  uniqueCount: number;
  topValues: { value: string; count: number; percentage: number }[];
}

export interface ColumnStats {
  name: string;
  type: string;
  numerical?: NumericalStats;
  categorical?: CategoricalStats;
}

export interface Anomaly {
  type: 'outlier' | 'missing_values' | 'inconsistent_format' | 'duplicate_values' | 'invalid_values';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  column: string;
  affectedRows?: number[];
  value?: any;
  count?: number;
}

export interface Recommendation {
  category: 'data_quality' | 'analysis' | 'preprocessing';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action?: string;
  impact?: string;
}

export interface DataAnalysis {
  columnStats: ColumnStats[];
  correlations: { [key: string]: { [key: string]: number } };
  anomalies: Anomaly[];
  recommendations: Recommendation[];
}

export interface CleaningReport {
  totalRowsCleaned: number;
  columnReports: ColumnCleaningReport[];
  summary: {
    missingValuesImputed: number;
    erroneousValuesFixed: number;
    typesConverted: number;
  };
}

export interface ColumnCleaningReport {
  columnName: string;
  originalType: string;
  finalType: string;
  missingValuesImputed: number;
  erroneousValuesFixed: number;
  typeConverted: boolean;
  imputationMethod?: string;
}
