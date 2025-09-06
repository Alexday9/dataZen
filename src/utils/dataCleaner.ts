import { DataSummary, DataColumn } from '../types';

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

export class DataCleaner {
  static cleanData(data: DataSummary): { cleanedData: DataSummary; report: CleaningReport } {
    const cleanedColumns: DataColumn[] = [];
    const columnReports: ColumnCleaningReport[] = [];
    let totalRowsCleaned = 0;
    const rowsModified = new Set<number>();

    // Add cleaning flag column
    const cleaningFlagColumn: DataColumn = {
      name: 'nettoyage_effectue',
      type: 'categorical',
      values: new Array(data.totalRows).fill(false),
      missingCount: 0,
      missingRate: 0
    };

    data.columns.forEach(column => {
      const { cleanedColumn, report } = this.cleanColumn(column, data.totalRows);
      cleanedColumns.push(cleanedColumn);
      columnReports.push(report);

      // Mark rows that were modified
      cleanedColumn.values.forEach((value, index) => {
        if (value !== column.values[index]) {
          rowsModified.add(index);
          cleaningFlagColumn.values[index] = true;
        }
      });
    });

    // Add the cleaning flag column
    cleanedColumns.push(cleaningFlagColumn);
    totalRowsCleaned = rowsModified.size;

    const cleanedData: DataSummary = {
      ...data,
      totalColumns: data.totalColumns + 1,
      columns: cleanedColumns
    };

    const report: CleaningReport = {
      totalRowsCleaned,
      columnReports,
      summary: {
        missingValuesImputed: columnReports.reduce((sum, r) => sum + r.missingValuesImputed, 0),
        erroneousValuesFixed: columnReports.reduce((sum, r) => sum + r.erroneousValuesFixed, 0),
        typesConverted: columnReports.filter(r => r.typeConverted).length
      }
    };

    return { cleanedData, report };
  }

  private static cleanColumn(column: DataColumn, totalRows: number): { cleanedColumn: DataColumn; report: ColumnCleaningReport } {
    const report: ColumnCleaningReport = {
      columnName: column.name,
      originalType: column.type,
      finalType: column.type,
      missingValuesImputed: 0,
      erroneousValuesFixed: 0,
      typeConverted: false
    };

    let cleanedValues = [...column.values];
    
    // Step 1: Fix erroneous values
    const { values: fixedValues, erroneousCount } = this.fixErroneousValues(cleanedValues, column.type);
    cleanedValues = fixedValues;
    report.erroneousValuesFixed = erroneousCount;

    // Step 2: Convert types if needed
    const { values: convertedValues, newType, converted } = this.convertTypes(cleanedValues, column);
    cleanedValues = convertedValues;
    if (converted) {
      report.finalType = newType;
      report.typeConverted = true;
    }

    // Step 3: Impute missing values
    const { values: imputedValues, imputedCount, method } = this.imputeMissingValues(cleanedValues, report.finalType);
    cleanedValues = imputedValues;
    report.missingValuesImputed = imputedCount;
    report.imputationMethod = method;

    // Recalculate missing statistics
    const newMissingCount = cleanedValues.filter(v => this.isMissing(v)).length;
    const newMissingRate = newMissingCount / totalRows;

    const cleanedColumn: DataColumn = {
      ...column,
      type: report.finalType as any,
      values: cleanedValues,
      missingCount: newMissingCount,
      missingRate: newMissingRate
    };

    return { cleanedColumn, report };
  }

  private static fixErroneousValues(values: any[], columnType: string): { values: any[]; erroneousCount: number } {
    let erroneousCount = 0;
    const fixedValues = values.map(value => {
      if (this.isMissing(value)) return value;

      const stringValue = String(value).toLowerCase().trim();
      
      // Convert common missing value representations to null
      if (['n/a', 'na', 'unknown', 'null', 'none', '-', '--', '?', 'missing'].includes(stringValue)) {
        erroneousCount++;
        return null;
      }

      // Fix negative values for price/quantity columns
      if (columnType === 'numerical' && this.isPriceOrQuantityColumn(values)) {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue < 0) {
          erroneousCount++;
          return Math.abs(numValue); // Convert to positive
        }
      }

      return value;
    });

    return { values: fixedValues, erroneousCount };
  }

  private static convertTypes(values: any[], column: DataColumn): { values: any[]; newType: string; converted: boolean } {
    const columnName = column.name.toLowerCase();
    
    // Detect if column should be converted based on name patterns
    if (this.isPriceColumn(columnName)) {
      return this.convertToFloat(values, 'price');
    } else if (this.isQuantityColumn(columnName)) {
      return this.convertToInteger(values, 'quantity');
    } else if (this.isDateColumn(columnName) || column.type === 'date') {
      return this.convertToDate(values);
    }

    return { values, newType: column.type, converted: false };
  }

  private static convertToFloat(values: any[], context: string): { values: any[]; newType: string; converted: boolean } {
    const convertedValues = values.map(value => {
      if (this.isMissing(value)) return value;
      
      const stringValue = String(value).replace(/[,$€£¥]/g, '').trim();
      const numValue = parseFloat(stringValue);
      
      return isNaN(numValue) ? null : numValue;
    });

    return { values: convertedValues, newType: 'numerical', converted: true };
  }

  private static convertToInteger(values: any[], context: string): { values: any[]; newType: string; converted: boolean } {
    const convertedValues = values.map(value => {
      if (this.isMissing(value)) return value;
      
      const numValue = parseInt(String(value).replace(/[,]/g, ''));
      return isNaN(numValue) ? null : numValue;
    });

    return { values: convertedValues, newType: 'numerical', converted: true };
  }

  private static convertToDate(values: any[]): { values: any[]; newType: string; converted: boolean } {
    const convertedValues = values.map(value => {
      if (this.isMissing(value)) return value;
      
      const dateValue = new Date(value);
      return isNaN(dateValue.getTime()) ? null : dateValue.toISOString().split('T')[0];
    });

    return { values: convertedValues, newType: 'date', converted: true };
  }

  private static imputeMissingValues(values: any[], columnType: string): { values: any[]; imputedCount: number; method: string } {
    const nonMissingValues = values.filter(v => !this.isMissing(v));
    let imputedCount = 0;
    let method = '';

    if (nonMissingValues.length === 0) {
      return { values, imputedCount: 0, method: 'no_imputation_possible' };
    }

    let imputationValue: any;

    switch (columnType) {
      case 'numerical':
        // Use median for numerical columns (more robust to outliers)
        const sortedValues = nonMissingValues.map(v => Number(v)).sort((a, b) => a - b);
        const median = sortedValues.length % 2 === 0
          ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
          : sortedValues[Math.floor(sortedValues.length / 2)];
        imputationValue = median;
        method = 'median';
        break;

      case 'categorical':
        // Use mode (most frequent value) for categorical columns
        const frequency = new Map<any, number>();
        nonMissingValues.forEach(value => {
          frequency.set(value, (frequency.get(value) || 0) + 1);
        });
        imputationValue = Array.from(frequency.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        method = 'mode';
        break;

      case 'date':
        // Use most frequent date for date columns
        const dateFrequency = new Map<string, number>();
        nonMissingValues.forEach(value => {
          const dateStr = String(value);
          dateFrequency.set(dateStr, (dateFrequency.get(dateStr) || 0) + 1);
        });
        imputationValue = Array.from(dateFrequency.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        method = 'most_frequent_date';
        break;

      default:
        // For text columns, use most frequent value
        const textFrequency = new Map<string, number>();
        nonMissingValues.forEach(value => {
          const textStr = String(value);
          textFrequency.set(textStr, (textFrequency.get(textStr) || 0) + 1);
        });
        imputationValue = Array.from(textFrequency.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        method = 'most_frequent_text';
        break;
    }

    const imputedValues = values.map(value => {
      if (this.isMissing(value)) {
        imputedCount++;
        return imputationValue;
      }
      return value;
    });

    return { values: imputedValues, imputedCount, method };
  }

  private static isMissing(value: any): boolean {
    return value === null || value === undefined || value === '' || 
           (typeof value === 'string' && value.trim() === '');
  }

  private static isPriceColumn(columnName: string): boolean {
    const priceKeywords = ['price', 'cost', 'amount', 'value', 'fee', 'charge', 'rate', 'salary', 'wage', 'revenue', 'income'];
    return priceKeywords.some(keyword => columnName.includes(keyword));
  }

  private static isQuantityColumn(columnName: string): boolean {
    const quantityKeywords = ['quantity', 'count', 'number', 'qty', 'amount', 'total', 'sum', 'volume', 'size', 'length', 'width', 'height'];
    return quantityKeywords.some(keyword => columnName.includes(keyword));
  }

  private static isDateColumn(columnName: string): boolean {
    const dateKeywords = ['date', 'time', 'created', 'updated', 'modified', 'timestamp', 'year', 'month', 'day'];
    return dateKeywords.some(keyword => columnName.includes(keyword));
  }

  private static isPriceOrQuantityColumn(values: any[]): boolean {
    // Simple heuristic: if most non-missing values are positive numbers, it might be price/quantity
    const numericValues = values.filter(v => !isNaN(Number(v)) && v !== null && v !== undefined && v !== '');
    const positiveValues = numericValues.filter(v => Number(v) >= 0);
    return positiveValues.length / numericValues.length > 0.8;
  }
}