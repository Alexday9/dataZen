import React, { useState } from 'react';
import { Sparkles, CheckCircle, AlertTriangle, Info, Download, FileText, BarChart3 } from 'lucide-react';
import { DataSummary } from '../types';
import { DataCleaner, CleaningReport } from '../utils/dataCleaner';

interface DataCleaningPanelProps {
  originalData: DataSummary;
  onCleanedDataReady: (cleanedData: DataSummary, report: CleaningReport) => void;
}

export const DataCleaningPanel: React.FC<DataCleaningPanelProps> = ({ 
  originalData, 
  onCleanedDataReady 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleaningReport, setCleaningReport] = useState<CleaningReport | null>(null);
  const [cleanedData, setCleanedData] = useState<DataSummary | null>(null);

  const handleCleanData = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { cleanedData: cleaned, report } = DataCleaner.cleanData(originalData);
      
      setCleanedData(cleaned);
      setCleaningReport(report);
      onCleanedDataReady(cleaned, report);
    } catch (error) {
      console.error('Data cleaning failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'median': return 'Médiane';
      case 'mode': return 'Mode (plus fréquent)';
      case 'most_frequent_date': return 'Date la plus fréquente';
      case 'most_frequent_text': return 'Texte le plus fréquent';
      default: return method;
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl mr-4">
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nettoyage des Données</h2>
            <p className="text-gray-600 mt-1">Correction automatique des valeurs manquantes et erronées</p>
          </div>
        </div>
        
        {!cleaningReport && (
          <button
            onClick={handleCleanData}
            disabled={isProcessing}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                <span className="font-medium">Nettoyage en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-3" />
                <span className="font-medium">Nettoyer les Données</span>
              </>
            )}
          </button>
        )}
      </div>

      {!cleaningReport && !isProcessing && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border border-emerald-200/50">
          <div className="text-center">
            <div className="p-4 bg-emerald-100 rounded-2xl inline-block mb-6">
              <Sparkles className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Prêt pour le Nettoyage</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Le nettoyage automatique va corriger les valeurs manquantes, 
              les erreurs de format et optimiser les types de données.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white/80 rounded-lg p-4 border border-emerald-200/50">
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Valeurs Manquantes</h4>
                <p className="text-gray-600">Imputation par médiane, mode ou valeur fréquente</p>
              </div>
              
              <div className="bg-white/80 rounded-lg p-4 border border-emerald-200/50">
                <div className="flex items-center justify-center mb-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Valeurs Erronées</h4>
                <p className="text-gray-600">Correction des valeurs négatives et formats invalides</p>
              </div>
              
              <div className="bg-white/80 rounded-lg p-4 border border-emerald-200/50">
                <div className="flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Types de Données</h4>
                <p className="text-gray-600">Conversion automatique des prix, quantités et dates</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200/50">
          <div className="text-center">
            <div className="animate-pulse p-4 bg-blue-100 rounded-2xl inline-block mb-6">
              <Sparkles className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nettoyage en Cours</h3>
            <div className="space-y-3 text-gray-600">
              <p>🔍 Analyse des valeurs manquantes...</p>
              <p>🔧 Correction des valeurs erronées...</p>
              <p>📊 Conversion des types de données...</p>
              <p>✨ Finalisation du nettoyage...</p>
            </div>
          </div>
        </div>
      )}

      {cleaningReport && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Lignes Modifiées</p>
                  <p className="text-3xl font-bold text-emerald-900 mt-2">{cleaningReport.totalRowsCleaned}</p>
                </div>
                <div className="p-3 bg-emerald-200/50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Valeurs Imputées</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">{cleaningReport.summary.missingValuesImputed}</p>
                </div>
                <div className="p-3 bg-blue-200/50 rounded-lg">
                  <Info className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Erreurs Corrigées</p>
                  <p className="text-3xl font-bold text-amber-900 mt-2">{cleaningReport.summary.erroneousValuesFixed}</p>
                </div>
                <div className="p-3 bg-amber-200/50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Types Convertis</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">{cleaningReport.summary.typesConverted}</p>
                </div>
                <div className="p-3 bg-purple-200/50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Report */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-600" />
              Rapport Détaillé par Colonne
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Colonne</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type Original</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type Final</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Valeurs Imputées</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Erreurs Corrigées</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Méthode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cleaningReport.columnReports.map((report, index) => (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.columnName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">
                          {report.originalType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          report.typeConverted 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.finalType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {report.missingValuesImputed}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {report.erroneousValuesFixed}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.imputationMethod && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                            {getMethodLabel(report.imputationMethod)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200/50">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg mr-4">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Nettoyage Terminé avec Succès</h4>
                <p className="text-gray-600 mt-1">
                  Vos données ont été nettoyées et sont maintenant prêtes pour l'analyse. 
                  Une colonne "nettoyage_effectue" a été ajoutée pour tracer les modifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};