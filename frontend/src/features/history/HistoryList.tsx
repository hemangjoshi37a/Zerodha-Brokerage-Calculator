import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHistory, useDeleteTrade } from '../../hooks/useTrade';
import { History, Trash2, Clock, Calendar, ChevronRight, Tag, MessageSquare, Star, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import api from '../../lib/api';
import { cn } from '../../components/ui/Base';

export function HistoryList({ onSelect }: { onSelect: (trade: any) => void }) {
  const { query } = useHistory();
  const { data: history, isLoading } = useQuery(query);
  const deleteMutation = useDeleteTrade();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editRating, setEditRating] = useState(0);

  const updateJournalMutation = useMutation({
    mutationFn: async ({ id, notes, rating }: { id: number; notes: string; rating: number }) => {
      const response = await api.patch(`/history/${id}`, { notes, rating });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      setEditingId(null);
    },
  });

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
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Trade Journal</h2>
            <p className="text-[10px] text-muted font-bold tracking-widest uppercase">History & Analysis</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
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
              <p className="text-sm text-muted font-medium">No Entries</p>
              <p className="text-[10px] text-muted/50 uppercase mt-1">Your journey starts with the first calculation</p>
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
                  className={cn(
                    "bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 rounded-2xl p-4 transition-all duration-300 cursor-pointer overflow-hidden",
                    editingId === trade.id && "ring-2 ring-primary/50 bg-white/10"
                  )}
                  onClick={() => onSelect(trade)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full ${trade.results.net_profit >= 0 ? 'bg-accent' : 'bg-red-500'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black uppercase tracking-widest text-muted/60 bg-white/5 px-1.5 py-0.5 rounded">
                            {trade.segment.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-1 text-[9px] text-muted/40">
                            <Calendar size={10} />
                            {new Date(trade.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            size={10} 
                            className={cn(
                              "transition-colors",
                              s <= (trade.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-muted/20"
                            )} 
                          />
                        ))}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(trade.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-muted/40 hover:text-red-500 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={`text-xl font-black font-mono ${trade.results.net_profit >= 0 ? 'text-accent' : 'text-red-500'}`}>
                      <span className="text-xs opacity-50 mr-1">₹</span>
                      {trade.results.net_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center gap-3">
                       {trade.notes && <MessageSquare size={14} className="text-primary/60" />}
                       {trade.tags?.length > 0 && <Tag size={14} className="text-secondary/60" />}
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           setEditingId(trade.id);
                           setEditNotes(trade.notes || '');
                           setEditRating(trade.rating || 0);
                         }}
                         className="text-[9px] font-black text-muted hover:text-primary uppercase tracking-widest transition-colors"
                       >
                         Edit Journal
                       </button>
                       <ChevronRight size={16} className="text-muted/20 group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  {/* Inline Journal Editor */}
                  <AnimatePresence>
                    {editingId === trade.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/5 space-y-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star size={12} className="text-muted" />
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setEditRating(s)}
                                  className={cn(
                                    "p-0.5 transition-all hover:scale-125",
                                    s <= editRating ? "text-yellow-400 fill-yellow-400" : "text-muted/20"
                                  )}
                                >
                                  <Star size={14} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEditingId(null)}
                              className="p-1.5 hover:bg-white/5 rounded-lg text-muted transition-colors"
                            >
                              <X size={14} />
                            </button>
                            <button 
                              onClick={() => updateJournalMutation.mutate({ id: trade.id, notes: editNotes, rating: editRating })}
                              disabled={updateJournalMutation.isPending}
                              className="p-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                            >
                              {updateJournalMutation.isPending ? "..." : <Save size={14} />}
                              Save
                            </button>
                          </div>
                        </div>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="What did you learn from this trade?"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-muted/30 focus:outline-none focus:border-primary/50 transition-all min-h-[80px] resize-none"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
