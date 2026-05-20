import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Calendar, Trophy, Filter } from 'lucide-react';
import { Settings } from '@/types/betting';

interface HistoryViewProps {
  settings: Settings;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ settings }) => {
  const [filter, setFilter] = useState<'all' | 'won' | 'lost'>('all');

  const filtered = filter === 'all' ? settings.history
    : settings.history.filter(h => filter === 'won' ? h.result === 'WON' : h.result !== 'WON');

  const wonCount = settings.history.filter(h => h.result === 'WON').length;
  const lostCount = settings.history.filter(h => h.result !== 'WON').length;
  const totalCount = settings.history.length;
  const winRate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4 pb-28"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-tighter font-display">Matokeo</h2>
        <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Last 30 days</span>
      </div>

      {/* Win rate hero - Enhanced */}
      <div className="glass-premium rounded-2xl p-5 noise-texture relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-[0.03]">
          <Trophy size={100} />
        </div>
        <div className="flex items-center gap-5">
          <div className="relative">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
              <motion.circle
                cx="18" cy="18" r="15.5" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 100' }}
                animate={{ strokeDasharray: `${winRate} ${100 - winRate}` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-black text-primary font-display">{winRate}%</span>
                <p className="text-[6px] text-muted-foreground uppercase tracking-widest">Win Rate</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {[
              { label: 'Won', value: wonCount, color: 'bg-primary', textColor: 'text-primary' },
              { label: 'Lost', value: lostCount, color: 'bg-destructive/60', textColor: 'text-destructive' },
              { label: 'Total', value: totalCount, color: 'bg-muted-foreground/30', textColor: 'text-muted-foreground' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-[10px] font-bold text-muted-foreground flex-1">{item.label}</span>
                <span className={`text-sm font-black font-display ${item.textColor}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2">
        {[
          { id: 'all' as const, label: `Zote (${totalCount})` },
          { id: 'won' as const, label: `Won (${wonCount})` },
          { id: 'lost' as const, label: `Lost (${lostCount})` },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
              filter === f.id ? 'btn-primary-premium text-primary-foreground' : 'glass-subtle text-muted-foreground/50 hover:text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* History list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((h, i) => (
            <motion.div
              key={h.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: 0.03 * i }}
              className="glass rounded-xl p-3.5 flex items-center justify-between noise-texture"
            >
              <div className="flex items-center gap-3">
                {h.result === 'WON' ? (
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/10">
                    <CheckCircle size={15} className="text-primary" />
                  </div>
                ) : (
                  <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/10">
                    <XCircle size={15} className="text-destructive" />
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-bold">{h.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Calendar size={8} className="text-muted-foreground/40" />
                    <p className="text-[9px] text-muted-foreground/50 font-medium">{h.date}</p>
                  </div>
                </div>
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                h.result === 'WON'
                  ? 'bg-primary/10 text-primary border border-primary/10'
                  : 'bg-destructive/10 text-destructive border border-destructive/10'
              }`}>
                {h.result}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
