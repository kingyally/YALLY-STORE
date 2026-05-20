import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TipsterCard } from './TipsterCard';
import { Tipster, Settings } from '@/types/betting';
import { CATEGORIES } from '@/constants/betting';
import { Filter } from 'lucide-react';

interface TicketsViewProps {
  settings: Settings;
  selectedCategory: string | null;
  unlockedTickets: number[];
  onUnlock: (t: Tipster) => void;
  onCategorySelect: (cat: string | null) => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  settings, selectedCategory, unlockedTickets, onUnlock, onCategorySelect
}) => {
  const filtered = selectedCategory
    ? settings.tipsters.filter(t => t.category === selectedCategory)
    : settings.tipsters;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4 pb-28"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-tighter font-display">Tips Zote</h2>
        <div className="flex items-center gap-1.5 text-muted-foreground/40">
          <Filter size={12} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{filtered.length} tips</span>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        <button
          onClick={() => onCategorySelect(null)}
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
            !selectedCategory ? 'btn-primary-premium text-primary-foreground' : 'glass-subtle text-muted-foreground/50 hover:text-muted-foreground'
          }`}
        >
          Zote
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onCategorySelect(cat)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
              selectedCategory === cat ? 'btn-primary-premium text-primary-foreground' : 'glass-subtle text-muted-foreground/50 hover:text-muted-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filtered.map(t => (
            <TipsterCard key={t.id} t={t} unlockedTickets={unlockedTickets} onUnlock={onUnlock} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
