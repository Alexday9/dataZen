import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { DataSummary, DataAnalysis } from '../types';
import { CleaningReport } from './dataCleaner';

export class ExportService {
  static async exportToPDF(data: DataSummary, analysis: DataAnalysis, cleaningReport?: CleaningReport): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246);
      pdf.text('DataZen Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Dataset: ${data.fileName}`, pageWidth / 2, yPosition, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition + 5, { align: 'center' });

      yPosition += 20;

      // Dataset Overview
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Dataset Overview', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.text(`Total Rows: ${data.totalRows.toLocaleString()}`, 20, yPosition);
      pdf.text(`Total Columns: ${data.totalColumns}`, 20, yPosition + 5);
      
      const avgMissingRate = data.columns.reduce((sum, col) => sum + col.missingRate, 0) / data.columns.length;
      pdf.text(`Average Missing Data: ${(avgMissingRate * 100).toFixed(1)}%`, 20, yPosition + 10);

      yPosition += 25;

      // Data Cleaning Report (if available)
      if (cleaningReport) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.text('Data Cleaning Report', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.text(`Rows Modified: ${cleaningReport.totalRowsCleaned}`, 20, yPosition);
        pdf.text(`Missing Values Imputed: ${cleaningReport.summary.missingValuesImputed}`, 20, yPosition + 5);
        pdf.text(`Erroneous Values Fixed: ${cleaningReport.summary.erroneousValuesFixed}`, 20, yPosition + 10);
        pdf.text(`Types Converted: ${cleaningReport.summary.typesConverted}`, 20, yPosition + 15);

        yPosition += 30;
      }

      // Column Information
      pdf.setFontSize(16);
      pdf.text('Column Information', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(8);
      const columnHeaders = ['Column Name', 'Type', 'Missing %'];
      const columnData = data.columns.map(col => [
        col.name,
        col.type,
        `${(col.missingRate * 100).toFixed(1)}%`
      ]);

      this.addTable(pdf, columnHeaders, columnData, 20, yPosition, pageWidth - 40);
      yPosition += (columnData.length + 2) * 5 + 10;

      // Anomalies
      if (analysis.anomalies.length > 0) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.text('Detected Anomalies', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(8);
        analysis.anomalies.slice(0, 10).forEach(anomaly => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setTextColor(anomaly.severity === 'high' ? 220 : anomaly.severity === 'medium' ? 245 : 59, 
                          anomaly.severity === 'high' ? 38 : anomaly.severity === 'medium' ? 158 : 130, 
                          anomaly.severity === 'high' ? 38 : anomaly.severity === 'medium' ? 11 : 246);
          pdf.text(`• ${anomaly.title}`, 20, yPosition);
          yPosition += 5;
          
          pdf.setTextColor(107, 114, 128);
          const description = pdf.splitTextToSize(anomaly.description, pageWidth - 50);
          pdf.text(description, 25, yPosition);
          yPosition += description.length * 4 + 5;
        });
      }

      // Recommendations
      if (analysis.recommendations.length > 0) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Recommendations', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(8);
        analysis.recommendations.slice(0, 10).forEach(rec => {
          if (yPosition > pageHeight - 25) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setTextColor(rec.priority === 'high' ? 220 : rec.priority === 'medium' ? 245 : 34, 
                          rec.priority === 'high' ? 38 : rec.priority === 'medium' ? 158 : 197, 
                          rec.priority === 'high' ? 38 : rec.priority === 'medium' ? 11 : 94);
          pdf.text(`• ${rec.title}`, 20, yPosition);
          yPosition += 5;
          
          pdf.setTextColor(107, 114, 128);
          const description = pdf.splitTextToSize(rec.description, pageWidth - 50);
          pdf.text(description, 25, yPosition);
          yPosition += description.length * 4 + 5;
        });
      }

      // Save the PDF
      const fileName = cleaningReport 
        ? `DataZen_Complete_Report_${data.fileName.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.pdf`
        : `DataZen_Report_${data.fileName.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to export PDF report');
    }
  }

  static async exportCleanedData(data: DataSummary, format: 'csv' | 'xlsx' = 'csv', cleaningReport?: CleaningReport): Promise<void> {
    try {
      if (format === 'xlsx') {
        await this.exportToExcel(data, cleaningReport);
      } else {
        await this.exportToCSV(data, cleaningReport);
      }
    } catch (error) {
      console.error('Data export failed:', error);
      throw new Error('Failed to export cleaned data');
    }
  }

  private static async exportToCSV(data: DataSummary, cleaningReport?: CleaningReport): Promise<void> {
    // Create cleaned dataset
    const cleanedData: any[][] = [];
    const headers = data.columns.map(col => col.name);
    cleanedData.push(headers);

    // Add all rows (data is already cleaned if cleaningReport exists)
    for (let i = 0; i < data.totalRows; i++) {
      const row = data.columns.map(col => col.values[i]);
      cleanedData.push(row);
    }

    // Convert to CSV
    const csvContent = cleanedData.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n') 
          ? `"${cellStr.replace(/"/g, '""')}"` 
          : cellStr;
      }).join(',')
    ).join('\n');

    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const fileName = cleaningReport 
      ? `DataZen_Cleaned_${data.fileName.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.csv`
      : `DataZen_Export_${data.fileName.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private static async exportToExcel(data: DataSummary, cleaningReport?: CleaningReport): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Main data sheet
    const worksheetData: any[][] = [];
    const headers = data.columns.map(col => col.name);
    worksheetData.push(headers);

    for (let i = 0; i < data.totalRows; i++) {
      const row = data.columns.map(col => col.values[i]);
      worksheetData.push(row);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Data');

    // Cleaning report sheet (if available)
    if (cleaningReport) {
      const reportData: any[][] = [
        ['DataZen - Cleaning Report'],
        [''],
        ['Summary'],
        ['Total Rows Modified', cleaningReport.totalRowsCleaned],
        ['Missing Values Imputed', cleaningReport.summary.missingValuesImputed],
        ['Erroneous Values Fixed', cleaningReport.summary.erroneousValuesFixed],
        ['Types Converted', cleaningReport.summary.typesConverted],
        [''],
        ['Detailed Report by Column'],
        ['Column Name', 'Original Type', 'Final Type', 'Values Imputed', 'Errors Fixed', 'Method']
      ];

      cleaningReport.columnReports.forEach(report => {
        reportData.push([
          report.columnName,
          report.originalType,
          report.finalType,
          report.missingValuesImputed,
          report.erroneousValuesFixed,
          report.imputationMethod || ''
        ]);
      });

      const reportWorksheet = XLSX.utils.aoa_to_sheet(reportData);
      XLSX.utils.book_append_sheet(workbook, reportWorksheet, 'Cleaning Report');
    }

    // Save the file
    const fileName = cleaningReport 
      ? `DataZen_Cleaned_${data.fileName.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `DataZen_Export_${data.fileName.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  }

  private static addTable(pdf: jsPDF, headers: string[], data: string[][], x: number, y: number, width: number): void {
    const colWidth = width / headers.length;
    const rowHeight = 5;

    // Headers
    pdf.setFillColor(59, 130, 246);
    pdf.rect(x, y, width, rowHeight, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    
    headers.forEach((header, i) => {
      pdf.text(header, x + i * colWidth + 2, y + 3);
    });

    // Data rows
    pdf.setTextColor(0, 0, 0);
    data.forEach((row, rowIndex) => {
      const rowY = y + (rowIndex + 1) * rowHeight;
      
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(x, rowY, width, rowHeight, 'F');
      }
      
      row.forEach((cell, colIndex) => {
        const cellText = pdf.splitTextToSize(cell, colWidth - 4);
        pdf.text(cellText[0] || '', x + colIndex * colWidth + 2, rowY + 3);
      });
    });
  }
}