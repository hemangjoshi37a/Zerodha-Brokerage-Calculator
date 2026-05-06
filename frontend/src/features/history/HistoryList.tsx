import { useQuery } from '@tanstack/react-query';
import { useHistory, useDeleteTrade } from '../../hooks/useTrade';
import { History, Trash2, Clock, Calendar, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export function HistoryList({ onSelect }: { onSelect: (trade: any) => void }) {
  const { query } = useHistory();
  const { data: history, isLoading } = useQuery(query);
  const deleteMutation = useDeleteTrade();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
            <History size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Recent Trades</h2>
            <p className="text-[10px] text-muted font-bold tracking-widest uppercase">Your analytical history</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {history?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                <Clock className="text-muted/20" size={32} />
              </div>
              <p className="text-sm text-muted font-medium">Empty History</p>
              <p className="text-[10px] text-muted/50 uppercase mt-1">Calculations will appear here</p>
            </motion.div>
          ) : (
            history?.map((trade, index) => (
              <motion.div 
                key={trade.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div 
                  className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 rounded-2xl p-4 transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-between"
                  onClick={() => onSelect(trade)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-1 h-10 rounded-full ${trade.results.net_profit >= 0 ? 'bg-accent' : 'bg-red-500'}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted/60 bg-white/5 px-1.5 py-0.5 rounded">
                          {trade.segment.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-muted/40">
                          <Calendar size={10} />
                          {new Date(trade.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <p className={`text-lg font-bold ${trade.results.net_profit >= 0 ? 'text-accent' : 'text-red-500'}`}>
                        <span className="text-sm opacity-50 mr-1">₹</span>
                        {trade.results.net_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(trade.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-muted/40 hover:text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={16} className="text-muted/20 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
