import { useState } from 'react';
import { CalendarRange, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DateRange {
  from: string | null;
  to: string | null;
  label: string;
}

interface Props {
  onChange: (range: DateRange) => void;
}

function toISO(d: Date) {
  return d.toISOString().split('T')[0];
}

function getPresets(): { label: string; from: string | null; to: string | null }[] {
  const now = new Date();
  const today = toISO(now);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const fyStart = new Date(
    now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1,
    3,
    1,
  ); // April 1

  return [
    { label: 'All Time', from: null, to: null },
    { label: 'Today', from: today, to: today },
    { label: 'This Week', from: toISO(weekStart), to: today },
    { label: 'This Month', from: toISO(monthStart), to: today },
    { label: 'This FY', from: toISO(fyStart), to: today },
  ];
}

export function DateRangePicker({ onChange }: Props) {
  const presets = getPresets();
  const [selected, setSelected] = useState(presets[0]);
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [open, setOpen] = useState(false);

  const handlePreset = (preset: (typeof presets)[0]) => {
    setSelected(preset);
    setShowCustom(false);
    setOpen(false);
    onChange({ from: preset.from, to: preset.to, label: preset.label });
  };

  const handleCustomApply = () => {
    if (!customFrom || !customTo) return;
    const range = { from: customFrom, to: customTo, label: 'Custom' };
    setSelected(range);
    setOpen(false);
    onChange(range);
  };

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-black text-white hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
      >
        <CalendarRange size={14} className="text-primary" />
        <span className="uppercase tracking-widest">{selected.label}</span>
        {selected.from && (
          <span className="text-muted/60 font-mono text-[10px]">
            {selected.from} → {selected.to}
          </span>
        )}
        <ChevronDown
          size={12}
          className={`text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 z-50 w-72 bg-black/90 border border-white/10 rounded-2xl p-3 backdrop-blur-xl shadow-2xl"
          >
            {/* Preset buttons */}
            <div className="space-y-1 mb-3">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${
                    selected.label === p.label
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{p.label}</span>
                  {p.from && (
                    <span className="font-mono text-[9px] opacity-50">
                      {p.from}
                    </span>
                  )}
                </button>
              ))}

              {/* Custom range toggle */}
              <button
                onClick={() => setShowCustom((s) => !s)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 ${
                  showCustom
                    ? 'bg-secondary/20 text-secondary border border-secondary/30'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                Custom Range…
              </button>
            </div>

            {/* Custom date inputs */}
            <AnimatePresence>
              {showCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">From</p>
                        <input
                          type="date"
                          value={customFrom}
                          onChange={(e) => setCustomFrom(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-primary/40 transition-colors"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">To</p>
                        <input
                          type="date"
                          value={customTo}
                          onChange={(e) => setCustomTo(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-primary/40 transition-colors"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCustomApply}
                      disabled={!customFrom || !customTo}
                      className="w-full py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary text-[10px] font-black tracking-widest uppercase hover:bg-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Apply Range
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
