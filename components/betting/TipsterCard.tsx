import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, TrendingUp, Verified, Sparkles, Clock, Copy, Check, AlertTriangle, Timer } from 'lucide-react';
import { Tipster } from '@/types/betting';
import { toast } from 'sonner';

interface TipsterCardProps {
  t: Tipster;
  unlockedTickets: number[];
  onUnlock: (t: Tipster) => void;
}

const getCategoryBadge = (category: string) => {
  switch (category) {
    case 'VIP TICKET': return 'badge-vip';
    case 'FIXED GAME': return 'badge-fixed';
    case 'CORRECT SCORE': return 'badge-cs';
    case 'FREE': return 'badge-free';
    default: return 'badge-free';
  }
};

const getCompanyColor = (company?: string) => {
  switch (company) {
    case 'Dbet': return 'bg-violet-500/15 text-violet-400 border-violet-500/25';
    case 'Sportbety': return 'bg-orange-500/15 text-orange-400 border-orange-500/25';
    case 'BetPawa': return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25';
    case '1win': return 'bg-sky-500/15 text-sky-400 border-sky-500/25';
    case 'Paripesa': return 'bg-lime-500/15 text-lime-400 border-lime-500/25';
    case 'TOPBET': return 'bg-rose-500/15 text-rose-400 border-rose-500/25';
    case 'Betspli': return 'bg-teal-500/15 text-teal-400 border-teal-500/25';
    case 'Sportbet': return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25';
    default: return 'bg-muted/15 text-muted-foreground border-muted/20';
  }
};

const useCountdown = (expiryDate?: string) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; expired: boolean }>({ hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    if (!expiryDate) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: false });
      return;
    }

    const calc = () => {
      const now = new Date().getTime();
      const end = new Date(expiryDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds, expired: false });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  return timeLeft;
};

export const TipsterCard: React.FC<TipsterCardProps> = ({ t, unlockedTickets, onUnlock }) => {
  const isUnlocked = t.isFree || unlockedTickets.includes(t.id);
  const [copied, setCopied] = useState(false);
  const countdown = useCountdown(t.expiryDate);
  const isExpired = countdown.expired && !!t.expiryDate;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(t.code);
      setCopied(true);
      toast.success('Code imekopwa!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Imeshindwa kukopy');
    }
  };

  const formatTime = (n: number) => String(n).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`glass rounded-2xl overflow-hidden card-hover noise-texture ${isExpired ? 'opacity-50' : ''}`}
    >
      <div className="p-4 space-y-3">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-border/50"
                referrerPolicy="no-referrer"
              />
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center ${
                isExpired ? 'bg-destructive' : isUnlocked ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}>
                {isExpired ? (
                  <AlertTriangle size={7} className="text-destructive-foreground" />
                ) : isUnlocked ? (
                  <Eye size={7} className="text-primary-foreground" />
                ) : (
                  <Lock size={7} className="text-foreground" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black uppercase tracking-tight font-display">{t.name}</h3>
                <Verified size={12} className="text-primary" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block text-[7px] px-2 py-0.5 rounded-md ${getCategoryBadge(t.category)}`}>
                  {t.category}
                </span>
                {t.company && (
                  <span className={`inline-block text-[7px] px-2 py-0.5 rounded-md border font-bold ${getCompanyColor(t.company)}`}>
                    {t.company}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <TrendingUp size={11} className="text-primary" />
              <span className="text-lg font-black text-primary font-display">{t.odds}</span>
            </div>
            <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">Total Odds</span>
          </div>
        </div>

        {/* Countdown timer */}
        {t.expiryDate && (
          <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[10px] font-bold ${
            isExpired
              ? 'bg-destructive/10 border border-destructive/20 text-destructive'
              : countdown.hours < 3
                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                : 'bg-primary/8 border border-primary/15 text-primary'
          }`}>
            <div className="flex items-center gap-2">
              <Timer size={12} />
              {isExpired ? (
                <span className="uppercase tracking-widest">Muda Umeisha</span>
              ) : (
                <span className="tracking-wider">Inaisha</span>
              )}
            </div>
            {!isExpired && (
              <div className="flex items-center gap-1 font-display">
                {[
                  { val: countdown.hours, label: 'h' },
                  { val: countdown.minutes, label: 'm' },
                  { val: countdown.seconds, label: 's' },
                ].map((t, i) => (
                  <React.Fragment key={i}>
                    <span className="bg-background/30 px-1.5 py-0.5 rounded text-xs font-black">{formatTime(t.val)}</span>
                    {i < 2 && <span className="text-[8px] opacity-50">:</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action */}
        {isExpired ? (
          <div className="bg-destructive/8 border border-destructive/15 rounded-xl p-3.5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-destructive" />
              <span className="text-[10px] font-black text-destructive uppercase tracking-widest">Code Imeexpire</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Muda wa code hii umeisha, haitumiki tena.</p>
          </div>
        ) : isUnlocked ? (
          <div className="bg-primary/8 border border-primary/15 rounded-xl p-3.5 animate-border-glow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-primary" />
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Code Revealed</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 transition-colors"
              >
                {copied ? (
                  <Check size={11} className="text-primary" />
                ) : (
                  <Copy size={11} className="text-primary" />
                )}
                <span className="text-[8px] font-bold text-primary uppercase">{copied ? 'Imekopwa!' : 'Copy'}</span>
              </motion.button>
            </div>
            <p className="text-xl font-black tracking-[0.15em] text-foreground font-display">{t.code}</p>
            {t.company && (
              <p className="text-[9px] text-muted-foreground mt-2">
                Peleka code hii kwenye <span className="font-bold text-primary">{t.company}</span>
              </p>
            )}
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onUnlock(t)}
            className="w-full py-3.5 btn-primary-premium text-primary-foreground font-black rounded-xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all glow-emerald-sm"
          >
            <Lock size={13} />
            {t.prices && t.prices[0] ? (
              <span>
                Fungua — TSH {t.prices[0].p.toLocaleString()}
                {t.prices[0].discount ? (
                  <span className="ml-1 opacity-70 line-through text-[9px]">
                    {(t.prices[0].p + t.prices[0].discount).toLocaleString()}
                  </span>
                ) : null}
              </span>
            ) : (
              'Fungua'
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
