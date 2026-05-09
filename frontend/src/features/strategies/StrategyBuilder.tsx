import React, { useState, useEffect } from 'react';
import { PayoffChart } from './PayoffChart';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Leg {
  id: string;
  type: 'call' | 'put';
  action: 'buy' | 'sell';
  strike: number;
  premium: number;
  lot_size: number;
  quantity: number;
}

export const StrategyBuilder: React.FC = () => {
  const [currentPrice, setCurrentPrice] = useState<number>(20000);
  const [dte, setDte] = useState<number>(30);
  const [volatility, setVolatility] = useState<number>(20);
  const [legs, setLegs] = useState<Leg[]>([
    { id: '1', type: 'call', action: 'buy', strike: 20000, premium: 150, lot_size: 50, quantity: 1 }
  ]);
  const [result, setResult] = useState<any>(null);
  const [greeksResult, setGreeksResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculatePayoff = async () => {
    setLoading(true);
    try {
      const payload = {
        current_price: currentPrice,
        dte,
        volatility,
        legs: legs.map(({ id, ...rest }) => rest)
      };
      
      const [payoffRes, greeksRes] = await Promise.all([
        api.post('/strategies/payoff', payload),
        api.post('/strategies/greeks', payload)
      ]);
      
      setResult(payoffRes.data);
      setGreeksResult(greeksRes.data);
    } catch (error) {
      console.error("Failed to calculate payoff", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced effect to recalculate on leg changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (legs.length > 0 && currentPrice > 0) {
        calculatePayoff();
      } else {
        setResult(null);
        setGreeksResult(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [legs, currentPrice, dte, volatility]);

  const addLeg = () => {
    setLegs([
      ...legs,
      {
        id: Math.random().toString(36).substring(7),
        type: 'call',
        action: 'sell',
        strike: currentPrice,
        premium: 100,
        lot_size: 50,
        quantity: 1
      }
    ]);
  };

  const removeLeg = (id: string) => {
    setLegs(legs.filter(l => l.id !== id));
  };

  const updateLeg = (id: string, field: keyof Leg, value: any) => {
    setLegs(legs.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Input Builder */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-400" /> Options Strategy Builder
            </h2>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1">Spot Price</label>
                <input 
                  type="number" 
                  value={currentPrice || ''} 
                  onChange={e => setCurrentPrice(parseFloat(e.target.value))}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1">DTE (Days)</label>
                <input 
                  type="number" 
                  value={dte || ''} 
                  onChange={e => setDte(parseInt(e.target.value))}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-1">Volatility (%)</label>
                <input 
                  type="number" 
                  value={volatility || ''} 
                  onChange={e => setVolatility(parseFloat(e.target.value))}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {legs.map((leg, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={leg.id} 
                  className="p-4 rounded-xl bg-black/40 border border-white/5 relative"
                >
                  <div className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-red-400 transition-colors" onClick={() => removeLeg(leg.id)}>
                    <Trash2 size={16} />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Leg {i + 1}</h4>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select 
                      value={leg.action} 
                      onChange={e => updateLeg(leg.id, 'action', e.target.value)}
                      className="bg-gray-800 text-sm text-white rounded-md px-2 py-1 border border-white/10"
                    >
                      <option value="buy">BUY</option>
                      <option value="sell">SELL</option>
                    </select>
                    <select 
                      value={leg.type} 
                      onChange={e => updateLeg(leg.id, 'type', e.target.value)}
                      className="bg-gray-800 text-sm text-white rounded-md px-2 py-1 border border-white/10"
                    >
                      <option value="call">CE (Call)</option>
                      <option value="put">PE (Put)</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500">Strike</label>
                      <input 
                        type="number" value={leg.strike} onChange={e => updateLeg(leg.id, 'strike', parseFloat(e.target.value))}
                        className="w-full bg-gray-900 text-sm text-white rounded-md px-2 py-1 border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Premium</label>
                      <input 
                        type="number" value={leg.premium} onChange={e => updateLeg(leg.id, 'premium', parseFloat(e.target.value))}
                        className="w-full bg-gray-900 text-sm text-white rounded-md px-2 py-1 border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Lot Size</label>
                      <input 
                        type="number" value={leg.lot_size} onChange={e => updateLeg(leg.id, 'lot_size', parseInt(e.target.value))}
                        className="w-full bg-gray-900 text-sm text-white rounded-md px-2 py-1 border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Quantity (Lots)</label>
                      <input 
                        type="number" value={leg.quantity} onChange={e => updateLeg(leg.id, 'quantity', parseInt(e.target.value))}
                        className="w-full bg-gray-900 text-sm text-white rounded-md px-2 py-1 border border-white/10"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button onClick={addLeg} variant="outline" className="w-full mt-4 border-dashed border-white/20 text-emerald-400 hover:bg-emerald-500/10">
              <Plus size={16} className="mr-2" /> Add Leg
            </Button>
          </div>
        </div>

        {/* Right Column: Visualizer & Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chart Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm min-h-[450px]">
             {loading && !result ? (
               <div className="flex justify-center items-center h-full">
                 <div className="w-8 h-8 border-t-2 border-emerald-500 border-solid rounded-full animate-spin"></div>
               </div>
             ) : result ? (
               <>
                 <h3 className="text-lg font-bold text-white mb-4">Payoff Diagram</h3>
                 <PayoffChart data={result.chart_data} currentPrice={currentPrice} />
               </>
             ) : (
                <div className="flex flex-col justify-center items-center h-full text-gray-500">
                  <AlertCircle size={48} className="mb-4 opacity-50" />
                  <p>Add legs to see the payoff diagram</p>
                </div>
             )}
          </div>

          {/* Metrics Card */}
          {result && !loading && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Max Profit</div>
                  <div className={`text-xl font-bold ${result.max_profit > 0 || result.max_profit === 'Infinite' ? 'text-emerald-400' : 'text-white'}`}>
                    {result.max_profit === 'Infinite' ? 'Unlimited' : `₹${result.max_profit}`}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Max Loss</div>
                  <div className={`text-xl font-bold ${result.max_loss < 0 || result.max_loss === 'Infinite' ? 'text-red-400' : 'text-white'}`}>
                    {result.max_loss === 'Infinite' ? 'Unlimited' : `₹${Math.abs(result.max_loss)}`}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 col-span-2">
                  <div className="text-sm text-gray-400">Breakeven Points</div>
                  <div className="text-xl font-bold text-blue-400">
                    {result.breakevens?.length > 0 ? result.breakevens.join(', ') : 'None'}
                  </div>
                </div>
             </div>
          )}

          {/* Greeks Card */}
          {greeksResult && !loading && (
             <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-400">Net Delta</div>
                  <div className="text-lg font-bold text-white">{greeksResult.net_delta}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-400">Net Gamma</div>
                  <div className="text-lg font-bold text-white">{greeksResult.net_gamma}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-400">Net Theta</div>
                  <div className="text-lg font-bold text-red-400">{greeksResult.net_theta}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-400">Net Vega</div>
                  <div className="text-lg font-bold text-blue-400">{greeksResult.net_vega}</div>
                </div>
             </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
