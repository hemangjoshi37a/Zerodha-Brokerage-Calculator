import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculatorForm } from './features/calculator/CalculatorForm';
import { ResultsDisplay } from './features/calculator/ResultsDisplay';
import { HistoryList } from './features/history/HistoryList';
import type { Trade } from './types';
import { useCalculate, useStats } from './hooks/useTrade';
import { Wallet, ShieldCheck, Zap, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

function App() {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const calculateMutation = useCalculate();
  const { query: statsQuery } = useStats();
  const { data: stats } = useQuery(statsQuery);

  // Update selected trade when a new calculation is made
  useEffect(() => {
    if (calculateMutation.data) {
      setSelectedTrade(calculateMutation.data);
    }
  }, [calculateMutation.data]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <header className="mb-12 text-center relative">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 border border-primary/20"
        >
          <ShieldCheck size={14} />
          <span>INSTITUTIONAL GRADE TRADING ANALYTICS</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl lg:text-6xl font-black bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-4"
        >
          BROKERAGE QUANT
        </motion.h1>
        <p className="text-muted max-w-lg mx-auto">
          High-precision fee engine for Zerodha trades. Advanced projections, tax analysis, and historical tracking.
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6"
        >
          <CalculatorForm />
          
          <div className="hidden lg:block glass-panel p-6 space-y-4">
            <div className="flex items-center gap-3 text-sm font-bold">
              <Activity className="text-primary animate-pulse" size={18} />
              <span>LIVE SYSTEM METRICS</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MetricBox label="TRADES TODAY" value={stats?.today_trades?.toString() || '0'} />
              <MetricBox label="TOTAL ANALYZED" value={stats?.total_trades?.toString() || '0'} />
            </div>
          </div>
        </motion.div>

        {/* Center: Results */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTrade?.id || 'empty'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ResultsDisplay trade={selectedTrade} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Right: History */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <HistoryList onSelect={setSelectedTrade} />
        </motion.div>
      </main>

      <footer className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-muted font-bold tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <Wallet size={14} />
          <span>QUANTUM FORGE ANALYTICS v2.0</span>
        </div>
        <div>© 2024 HJ ZERODHA PRO. ALL CALCULATIONS ARE ESTIMATES.</div>
      </footer>
    </div>
  );
}

function MetricBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-black/20 rounded-xl p-3 border border-border group hover:border-primary/30 transition-colors">
      <p className="text-[10px] text-muted mb-1 group-hover:text-primary/70 transition-colors">{label}</p>
      <p className="font-mono text-primary text-lg">{value}</p>
    </div>
  );
}

export default App;
