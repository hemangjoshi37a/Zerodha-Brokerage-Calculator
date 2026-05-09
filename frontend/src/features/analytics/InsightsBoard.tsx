import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const InsightsBoard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await api.get('/insights');
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch insights", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'positive': return <TrendingUp className="text-emerald-400" size={24} />;
      case 'warning': return <AlertTriangle className="text-amber-400" size={24} />;
      case 'negative': return <TrendingUp className="text-red-400 rotate-180" size={24} />;
      default: return <Info className="text-blue-400" size={24} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'negative': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-t-2 border-emerald-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || !data.insights || data.insights.length === 0) {
    return (
       <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10">
         <Lightbulb className="mx-auto h-12 w-12 text-gray-500 mb-4" />
         <h3 className="text-xl font-bold text-white mb-2">No Insights Available</h3>
         <p className="text-gray-400">Add more trades to your journal to generate AI-driven insights.</p>
       </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="text-yellow-400" /> Trading Insights
          </h2>
          <p className="text-gray-400 text-sm mt-1">AI-generated analysis of your trading patterns</p>
        </div>
        <Button onClick={fetchInsights} variant="outline" size="sm" className="bg-black/30 text-white border-white/10 hover:bg-white/10">
          <RefreshCw size={14} className="mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
         <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-sm text-gray-400">Win Rate</div>
            <div className="text-2xl font-bold text-white">{data.metrics?.win_rate || 0}%</div>
         </div>
         <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-sm text-gray-400">Total Analyzed Trades</div>
            <div className="text-2xl font-bold text-white">{data.metrics?.total_trades || 0}</div>
         </div>
         <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center col-span-2 md:col-span-1">
            <div className="text-sm text-gray-400">Top Segment</div>
            <div className="text-xl font-bold text-emerald-400 truncate mt-1">
              {data.metrics?.best_segment ? data.metrics.best_segment.replace('_', ' ').toUpperCase() : 'N/A'}
            </div>
         </div>
      </div>

      <div className="space-y-4">
        {data.insights.map((insight: any, index: number) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index}
            className={`p-6 rounded-2xl border ${getBgColor(insight.type)} flex items-start gap-4 backdrop-blur-sm`}
          >
            <div className="p-3 bg-black/30 rounded-xl shrink-0">
               {getIcon(insight.type)}
            </div>
            <div>
              <p className="text-white text-lg leading-relaxed">{insight.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
