import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Button({ 
  className, 
  variant = 'primary', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }) {
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] overflow-hidden relative group',
    outline: 'bg-transparent border border-border hover:bg-white/5 text-white',
    ghost: 'bg-transparent hover:bg-white/5 text-muted hover:text-white',
  };

  return (
    <button 
      className={cn(
        'px-6 py-4 rounded-xl transition-all duration-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === 'primary' && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {props.children}
      </span>
    </button>
  );
}

export function Input({ className, icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: any }) {
  return (
    <div className="relative group">
      {Icon && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-all duration-300 z-20">
          <Icon size={18} />
        </div>
      )}
      <input 
        className={cn(
          'glass-input w-full bg-black/40 border border-white/5 focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-500 outline-none shadow-inner',
          Icon ? 'pl-14' : 'pl-4',
          className
        )}
        {...props}
      />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
    </div>
  );
}

export function CustomSelect({ 
  value, 
  onChange, 
  options, 
  icon: Icon,
  placeholder = 'Select option'
}: { 
  value: string, 
  onChange: (val: string) => void, 
  options: { value: string, label: string }[],
  icon?: any,
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'glass-input w-full bg-black/40 border border-white/5 px-4 py-3 cursor-pointer flex items-center justify-between group hover:border-primary/30 transition-all duration-300',
          isOpen && 'border-primary/50 ring-4 ring-primary/5'
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className="text-muted group-hover:text-primary transition-colors" />}
          <span className={selectedOption ? 'text-white' : 'text-muted'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <div className={cn('transition-transform duration-300', isOpen && 'rotate-180')}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 w-full z-50 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1"
            >
              {options.map((opt) => (
                <div 
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between',
                    value === opt.value ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-muted hover:text-white'
                  )}
                >
                  {opt.label}
                  {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <label className={cn('text-[10px] font-black text-muted uppercase tracking-widest mb-1.5 block', className)}>
      {children}
    </label>
  );
}

export function Card({ className, children, glow = false }: { className?: string, children: React.ReactNode, glow?: boolean }) {
  return (
    <div className={cn(
      'glass-panel p-6 relative overflow-hidden',
      glow && 'before:absolute before:inset-0 before:bg-primary/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity',
      className
    )}>
      {children}
    </div>
  );
}
