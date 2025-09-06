import * as XLSX from 'xlsx';
import { DataSummary, DataColumn } from '../types';

export class FileProcessor {
  static async processFile(file: File): Promise<DataSummary> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      return this.processCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      return this.processExcel(file);
    } else {
      throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
    }
  }

  private static async processCSV(file: File): Promise<DataSummary> {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row.');
    }

    const headers = this.parseCSVLine(lines[0]);
    const data: any[][] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCSVLine(lines[i]);
      if (row.length === headers.length) {
        data.push(row);
      }
    }

    return this.createDataSummary(headers, data, file.name);
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private static async processExcel(file: File): Promise<DataSummary> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    
    if (jsonData.length < 2) {
      throw new Error('File must contain at least a header row and one data row.');
    }

    const headers = jsonData[0] as string[];
    const data = jsonData.slice(1) as any[][];
    
    return this.createDataSummary(headers, data, file.name);
  }

  private static createDataSummary(headers: string[], data: any[][], fileName: string): DataSummary {
    const columns: DataColumn[] = headers.map((header, index) => {
      const values = data.map(row => row[index]);
      const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
      const missingCount = values.length - nonNullValues.length;
      
      return {
        name: header,
        type: this.detectColumnType(nonNullValues),
        values: values,
        missingCount,
        missingRate: missingCount / values.length
      };
    });

    return {
      totalRows: data.length,
      totalColumns: headers.length,
      columns,
      fileName
    };
  }

  private static detectColumnType(values: any[]): 'numerical' | 'categorical' | 'date' | 'text' {
    if (values.length === 0) return 'text';
    
    const numericValues = values.filter(v => !isNaN(Number(v)) && v !== '');
    const numericRatio = numericValues.length / values.length;
    
    if (numericRatio > 0.8) return 'numerical';
    
    const dateValues = values.filter(v => !isNaN(Date.parse(v)));
    const dateRatio = dateValues.length / values.length;
    
    if (dateRatio > 0.8) return 'date';
    
    const uniqueValues = new Set(values).size;
    const uniqueRatio = uniqueValues / values.length;
    
    if (uniqueRatio < 0.5 && uniqueValues < 20) return 'categorical';
    
    return 'text';
  }
}