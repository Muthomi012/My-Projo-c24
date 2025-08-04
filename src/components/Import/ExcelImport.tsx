import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Clipboard, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import Papa from 'papaparse';

interface ImportData {
  [key: string]: string | number;
}

interface ExcelImportProps {
  onImport: (data: ImportData[]) => void;
  onClose: () => void;
  templateColumns: string[];
  title: string;
  sampleData?: ImportData[];
}

const ExcelImport: React.FC<ExcelImportProps> = ({ 
  onImport, 
  onClose, 
  templateColumns, 
  title,
  sampleData = []
}) => {
  const [importData, setImportData] = useState<ImportData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateData = (data: ImportData[]): string[] => {
    const validationErrors: string[] = [];
    
    data.forEach((row, index) => {
      // Check required fields based on template
      templateColumns.forEach(column => {
        if (!row[column] || row[column] === '') {
          validationErrors.push(`Row ${index + 1}: Missing ${column}`);
        }
      });

      // Validate amount fields
      if (row.amount && isNaN(Number(row.amount))) {
        validationErrors.push(`Row ${index + 1}: Amount must be a valid number`);
      }

      // Validate date fields
      if (row.date && !isValidDate(row.date as string)) {
        validationErrors.push(`Row ${index + 1}: Invalid date format (use YYYY-MM-DD)`);
      }
    });

    return validationErrors;
  };

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        // Clean up the value by trimming whitespace
        return typeof value === 'string' ? value.trim() : value;
      },
      complete: (results) => {
        console.log('Parsed file data:', results.data);
        const data = results.data.filter(row => {
          // Filter out completely empty rows
          return Object.values(row).some(value => value && value.toString().trim() !== '');
        }) as ImportData[];
        console.log('Filtered data:', data);
        const validationErrors = validateData(data);
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        } else {
          setImportData(data);
        }
        setIsProcessing(false);
      },
      error: (error) => {
        setErrors([`File parsing error: ${error.message}`]);
        setIsProcessing(false);
      }
    });
  };

  const handlePasteData = () => {
    if (!pasteText.trim()) return;

    setIsProcessing(true);
    setErrors([]);

    console.log('Pasted text:', pasteText);
    
    Papa.parse(pasteText, {
      header: true,
      skipEmptyLines: true,
      delimiter: '',  // Auto-detect delimiter
      newline: '',    // Auto-detect line endings
      transform: (value, field) => {
        // Clean up the value by trimming whitespace
        return typeof value === 'string' ? value.trim() : value;
      },
      complete: (results) => {
        console.log('Parsed paste data:', results.data);
        console.log('Parse errors:', results.errors);
        
        const data = results.data.filter(row => {
          // Filter out completely empty rows
          return Object.values(row).some(value => value && value.toString().trim() !== '');
        }) as ImportData[];
        
        console.log('Filtered paste data:', data);
        
        const validationErrors = validateData(data);
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        } else {
          setImportData(data);
        }
        setIsProcessing(false);
      },
      error: (error) => {
        console.error('Parse error:', error);
        setErrors([`Paste parsing error: ${error.message}`]);
        setIsProcessing(false);
      }
    });
  };

  const handleImport = () => {
    if (importData.length > 0) {
      onImport(importData);
      onClose();
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      templateColumns.join(','),
      ...sampleData.map(row => 
        templateColumns.map(col => row[col] || '').join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const clearData = () => {
    setImportData([]);
    setErrors([]);
    setPasteText('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileSpreadsheet className="h-6 w-6 mr-2 text-green-600" />
              Import {title}
            </h2>
            <div className="flex items-center space-x-2">
              {(importData.length > 0 || errors.length > 0) && (
                <button
                  onClick={clearData}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                >
                  Clear
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Step 1: Download Template</h3>
            <p className="text-blue-700 text-sm mb-3">
              Download the CSV template with the correct column headers and sample data.
            </p>
            <button
              onClick={downloadTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Step 2: Upload CSV File</h3>
            <p className="text-gray-600 text-sm mb-3">
              Upload a CSV file with your data. Make sure the column headers match the template.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Choose File'}
            </button>
          </div>

          {/* Paste Data */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Step 3: Or Paste Data</h3>
            <p className="text-gray-600 text-sm mb-3">
              Copy data from Excel/Google Sheets (including headers) and paste it here. Make sure to select all rows and columns with data.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Paste your data here. Example format:\n${templateColumns.join('\t')}\n2024-01-15\tAdvertisements\tDigital ads\t15000\n2024-01-16\tPowerbank Sales\tUnit sales\t8500`}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm font-mono"
            />
            <button
              onClick={handlePasteData}
              disabled={!pasteText.trim() || isProcessing}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm disabled:opacity-50"
            >
              <Clipboard className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Process Pasted Data'}
            </button>
          </div>

          {/* Expected Format */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">Expected Format</h3>
            <p className="text-yellow-700 text-sm mb-2">Your data should have these columns (first row must be headers):</p>
            <div className="bg-white p-2 rounded border text-sm font-mono">
              {templateColumns.join(', ')}
            </div>
            <p className="text-yellow-700 text-sm mt-2">
              <strong>Tip:</strong> In Excel/Google Sheets, select all your data including headers, copy (Ctrl+C), then paste here.
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Validation Errors
              </h3>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {importData.length > 0 && errors.length === 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Preview ({importData.length} records)
              </h3>
              {importData.length > 10 && (
                <p className="text-green-700 text-sm mb-3">
                  Showing first 10 records. Total: {importData.length} records will be imported.
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-green-100">
                      {templateColumns.map(col => (
                        <th key={col} className="px-3 py-2 text-left font-medium text-green-900">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-t border-green-200">
                        {templateColumns.map(col => (
                          <td key={col} className="px-3 py-2 text-green-800">
                            {row[col]?.toString() || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importData.length > 10 && (
                  <p className="text-green-700 text-sm mt-2">
                    ... and {importData.length - 10} more records
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importData.length === 0 || errors.length > 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import {importData.length} Records
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;