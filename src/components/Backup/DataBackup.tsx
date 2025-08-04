import React, { useState } from 'react';
import { Download, Upload, FileText, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

interface BackupData {
  exportDate: string;
  version: string;
  transactions: any[];
  pettyCashEntries: any[];
  budgets: any[];
  balanceSheetItems: any[];
  categories: any[];
  accounts: any[];
}

const DataBackup: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<BackupData | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const getAllLocalStorageData = (): BackupData => {
    const data: BackupData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      transactions: [],
      pettyCashEntries: [],
      budgets: [],
      balanceSheetItems: [],
      categories: [],
      accounts: []
    };

    // Get all localStorage keys that contain accounting data
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      try {
        if (key.includes('charge24_transactions')) {
          const transactions = JSON.parse(localStorage.getItem(key) || '[]');
          data.transactions.push(...transactions);
        } else if (key.includes('charge24_petty_cash')) {
          const pettyCash = JSON.parse(localStorage.getItem(key) || '[]');
          data.pettyCashEntries.push(...pettyCash);
        } else if (key.includes('charge24_budgets')) {
          const budgets = JSON.parse(localStorage.getItem(key) || '[]');
          data.budgets.push(...budgets);
        } else if (key.includes('charge24_balance_sheet')) {
          const balanceSheet = JSON.parse(localStorage.getItem(key) || '[]');
          data.balanceSheetItems.push(...balanceSheet);
        } else if (key.includes('charge24_categories')) {
          const categories = JSON.parse(localStorage.getItem(key) || '[]');
          data.categories.push(...categories);
        } else if (key.includes('charge24_accounts')) {
          const accounts = JSON.parse(localStorage.getItem(key) || '[]');
          data.accounts.push(...accounts);
        }
      } catch (error) {
        console.error(`Error parsing localStorage key ${key}:`, error);
      }
    });

    return data;
  };

  const handleExportData = () => {
    const backupData = getAllLocalStorageData();
    const filename = `accounting-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreviewData = () => {
    const data = getAllLocalStorageData();
    setPreviewData(data);
    setShowPreview(true);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData: BackupData = JSON.parse(e.target?.result as string);
        
        // Validate backup data structure
        if (!backupData.exportDate || !backupData.version) {
          throw new Error('Invalid backup file format');
        }

        // Store data back to localStorage
        if (backupData.transactions.length > 0) {
          localStorage.setItem('charge24_transactions_imported', JSON.stringify(backupData.transactions));
        }
        if (backupData.pettyCashEntries.length > 0) {
          localStorage.setItem('charge24_petty_cash_imported', JSON.stringify(backupData.pettyCashEntries));
        }
        if (backupData.budgets.length > 0) {
          localStorage.setItem('charge24_budgets_imported', JSON.stringify(backupData.budgets));
        }
        if (backupData.balanceSheetItems.length > 0) {
          localStorage.setItem('charge24_balance_sheet_imported', JSON.stringify(backupData.balanceSheetItems));
        }
        if (backupData.categories.length > 0) {
          localStorage.setItem('charge24_categories_imported', JSON.stringify(backupData.categories));
        }
        if (backupData.accounts.length > 0) {
          localStorage.setItem('charge24_accounts_imported', JSON.stringify(backupData.accounts));
        }

        setImportStatus('success');
        setImportMessage(`Successfully imported data from ${new Date(backupData.exportDate).toLocaleDateString()}`);
        
        // Refresh the page to load the imported data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        setImportStatus('error');
        setImportMessage(`Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const getTotalRecords = (data: BackupData) => {
    return data.transactions.length + 
           data.pettyCashEntries.length + 
           data.budgets.length + 
           data.balanceSheetItems.length + 
           data.categories.length + 
           data.accounts.length;
  };

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
        <h2 className="text-xl font-bold text-red-800">URGENT: Backup Your Data</h2>
      </div>
      
      <p className="text-red-700 mb-6">
        Before setting up Supabase authentication, backup all your existing accounting data to prevent any loss.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handlePreviewData}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Eye className="h-5 w-5 mr-2" />
          Preview Data
        </button>
        
        <button
          onClick={handleExportData}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-bold"
        >
          <Download className="h-5 w-5 mr-2" />
          EXPORT ALL DATA
        </button>
        
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
            id="import-data"
          />
          <label
            htmlFor="import-data"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center cursor-pointer"
          >
            <Upload className="h-5 w-5 mr-2" />
            IMPORT DATA
          </label>
        </div>
      </div>

      {/* Import Status */}
      {importStatus !== 'idle' && (
        <div className={`p-4 rounded-lg mb-4 flex items-center ${
          importStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {importStatus === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 mr-2" />
          )}
          {importMessage}
        </div>
      )}

      {/* Data Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Data Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{previewData.transactions.length}</div>
                  <div className="text-sm text-green-700">Transactions</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{previewData.pettyCashEntries.length}</div>
                  <div className="text-sm text-blue-700">Petty Cash Entries</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{previewData.budgets.length}</div>
                  <div className="text-sm text-purple-700">Budgets</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{previewData.balanceSheetItems.length}</div>
                  <div className="text-sm text-yellow-700">Balance Sheet Items</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{previewData.categories.length}</div>
                  <div className="text-sm text-red-700">Categories</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-600">{previewData.accounts.length}</div>
                  <div className="text-sm text-gray-700">Accounts</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Backup Information:</h4>
                <p><strong>Export Date:</strong> {new Date(previewData.exportDate).toLocaleString()}</p>
                <p><strong>Version:</strong> {previewData.version}</p>
                <p><strong>Total Records:</strong> {getTotalRecords(previewData)}</p>
              </div>

              {/* Sample Data Preview */}
              {previewData.transactions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Sample Transactions (first 3):</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(previewData.transactions.slice(0, 3), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleExportData();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Export This Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataBackup;