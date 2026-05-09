import React, { useState } from 'react';
import Papa from 'papaparse';
import { api } from '@/lib/api';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const TradeImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      Papa.parse(selected, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
          setResult(null);
        }
      });
    }
  };

  const handleImport = async () => {
    if (!parsedData.length) return;
    
    setImporting(true);
    
    // Map Zerodha standard tradebook to our backend expectations
    // This assumes the user uploads a somewhat standard CSV, but we do a rough mapping
    const mappedTrades = parsedData.map(row => {
      // Normalizing column names by lowercasing and removing spaces
      const keys = Object.keys(row);
      const getValue = (possibleNames: string[]) => {
        for (const k of keys) {
           const normalizedKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
           for (const name of possibleNames) {
              if (normalizedKey.includes(name)) return row[k];
           }
        }
        return '';
      };

      const rawSegment = getValue(['segment', 'instrument', 'type']);
      let segment = 'equity_delivery';
      if (rawSegment.toLowerCase().includes('intraday') || rawSegment.toLowerCase().includes('mis')) segment = 'equity_intraday';
      if (rawSegment.toLowerCase().includes('opt') || rawSegment.toLowerCase().includes('ce') || rawSegment.toLowerCase().includes('pe')) segment = 'equity_options';
      if (rawSegment.toLowerCase().includes('fut')) segment = 'equity_futures';

      return {
        segment,
        exchange: getValue(['exchange']) || 'NSE',
        buy_price: parseFloat(getValue(['buyprice', 'buyavg', 'price'])) || 0,
        sell_price: parseFloat(getValue(['sellprice', 'sellavg'])) || 0,
        quantity: parseInt(getValue(['quantity', 'qty', 'netqty'])) || 0,
        multiplier: 1, // Defaulting to 1, advanced users might edit this in backend later
      };
    }).filter(t => t.quantity > 0 && (t.buy_price > 0 || t.sell_price > 0));

    try {
      const { data } = await api.post('/import/bulk', { trades: mappedTrades });
      setResult(data);
    } catch (error) {
      console.error("Failed to import", error);
      setResult({ error: "Server error during import" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-2">Bulk Trade Import</h2>
        <p className="text-gray-400 mb-8">Upload your Zerodha Tradebook CSV to instantly analyze your past trades.</p>

        {!result ? (
          <>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-10 text-center hover:bg-white/5 transition-colors relative group">
              <input 
                type="file" 
                accept=".csv" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileUpload}
              />
              <UploadCloud className="mx-auto h-12 w-12 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-medium text-white mb-1">
                {file ? file.name : "Drag and drop your CSV file here"}
              </h3>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>

            {parsedData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-white">
                    <FileText size={18} className="text-blue-400" /> 
                    Found {parsedData.length} rows in CSV
                  </div>
                  <Button onClick={handleImport} disabled={importing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {importing ? "Importing..." : "Process Import"} <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
                
                <div className="bg-black/40 rounded-lg overflow-hidden border border-white/5 max-h-60 overflow-y-auto">
                  <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-500 bg-white/5 sticky top-0">
                      <tr>
                        {Object.keys(parsedData[0] || {}).slice(0, 5).map(key => (
                          <th key={key} className="px-4 py-2">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                          {Object.values(row).slice(0, 5).map((val: any, j) => (
                            <td key={j} className="px-4 py-2">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.length > 5 && (
                    <div className="p-2 text-center text-xs text-gray-500 bg-white/5 border-t border-white/5">
                      Showing 5 of {parsedData.length} rows
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black/30 rounded-xl p-6 border border-white/10">
            {result.error ? (
               <div className="text-center">
                 <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                 <h3 className="text-xl font-bold text-white mb-2">Import Failed</h3>
                 <p className="text-gray-400">{result.error}</p>
                 <Button onClick={() => setResult(null)} variant="outline" className="mt-6">Try Again</Button>
               </div>
            ) : (
               <div className="text-center">
                 <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
                 <h3 className="text-xl font-bold text-white mb-2">Import Complete!</h3>
                 <div className="flex justify-center gap-8 mt-6">
                    <div>
                      <div className="text-3xl font-bold text-white">{result.success}</div>
                      <div className="text-sm text-gray-400">Successfully Imported</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-400">{result.failed}</div>
                      <div className="text-sm text-gray-400">Failed / Skipped</div>
                    </div>
                 </div>
                 <Button onClick={() => { setFile(null); setParsedData([]); setResult(null); }} variant="outline" className="mt-8 border-white/20 hover:bg-white/5 text-white">
                   Import Another File
                 </Button>
               </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
