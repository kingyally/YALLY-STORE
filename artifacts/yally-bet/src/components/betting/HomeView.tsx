import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Trophy, Zap, MessageCircle, Send, Crown, Lock, Target, Star, Flame, ArrowRight, Sparkles, BarChart3, Gift, Shield } from 'lucide-react';
import { TipsterCard } from './TipsterCard';
import { Settings, Tipster } from '@/types/betting';
import { CATEGORIES } from '@/constants/betting';
import { fetchActiveBannerUrls } from '@/lib/bannerService';

interface HomeViewProps {
  settings: Settings;
  unlockedTickets: number[];
  onCategorySelect: (cat: string) => void;
  onUnlock: (t: Tipster) => void;
  onViewAll: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings, unlockedTickets, onCategorySelect, onUnlock, onViewAll
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [onlineCount, setOnlineCount] = useState(1423);
  const [dynamicBanners, setDynamicBanners] = useState<string[]>(settings.dashboardImages);

  // Load banners from DB
  useEffect(() => {
    fetchActiveBannerUrls().then(urls => {
      if (urls.length > 0) setDynamicBanners(urls);
    });
  }, []);

  useEffect(() => {
    if (dynamicBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % dynamicBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [dynamicBanners]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'VIP TICKET': return <Crown className="text-amber-400" size={20} />;
      case 'FIXED GAME': return <Lock className="text-primary" size={20} />;
      case 'CORRECT SCORE': return <Target className="text-rose-400" size={20} />;
      case 'FREE ODDS': return <Zap className="text-blue-400" size={20} />;
      default: return <Star className="text-primary" size={20} />;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'VIP TICKET': return { bg: 'from-amber-500/12 to-amber-600/5', border: 'border-amber-500/15 hover:border-amber-500/40', dot: 'bg-amber-400' };
      case 'FIXED GAME': return { bg: 'from-primary/12 to-primary/5', border: 'border-primary/15 hover:border-primary/40', dot: 'bg-primary' };
      case 'CORRECT SCORE': return { bg: 'from-rose-500/12 to-rose-600/5', border: 'border-rose-500/15 hover:border-rose-500/40', dot: 'bg-rose-400' };
      case 'FREE ODDS': return { bg: 'from-blue-500/12 to-blue-600/5', border: 'border-blue-500/15 hover:border-blue-500/40', dot: 'bg-blue-400' };
      default: return { bg: 'from-primary/12 to-primary/5', border: 'border-primary/15', dot: 'bg-primary' };
    }
  };

  const getCategoryCount = (category: string) => {
    return settings.tipsters.filter(t => t.category === category).length;
  };

  const wonCount = settings.history.filter(h => h.result === 'WON').length;
  const winRate = settings.history.length > 0 ? Math.round((wonCount / settings.history.length) * 100) : 98;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 pb-28"
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden h-56 mx-4 rounded-2xl border border-border/30 shadow-lg shadow-primary/5">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={dynamicBanners[currentImageIndex]}
              alt="Banner"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent z-[1]" />

        <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
          <motion.div
            key={`content-${currentImageIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/25 border border-primary/40 text-primary text-[8px] font-black rounded-full mb-3 uppercase tracking-[0.2em] backdrop-blur-md">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse-dot" />
              LIVE NOW
            </div>
            <h3 className="text-2xl font-black tracking-tighter leading-none mb-2 uppercase font-display drop-shadow-lg">
              Tips Mpya <span className="text-gradient-emerald">Zimepost!</span>
            </h3>
            <p className="text-foreground/70 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Users size={11} /> {onlineCount.toLocaleString()} watu online
            </p>
          </motion.div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-3 right-4 flex gap-1.5 z-20">
          {dynamicBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`rounded-full transition-all duration-500 ${
                currentImageIndex === idx
                  ? 'w-6 h-2 bg-primary shadow-md shadow-primary/40'
                  : 'w-2 h-2 bg-foreground/25 hover:bg-foreground/40'
              }`}
            />
          ))}
        </div>

        {dynamicBanners.length > 1 && (
          <div className="absolute top-0 left-0 right-0 h-0.5 z-20">
            <motion.div
              key={`progress-${currentImageIndex}`}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-full bg-primary/60 rounded-full"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-4">
        {[
          { icon: Trophy, label: 'Wins Leo', value: String(wonCount), color: 'text-primary', glow: 'bg-primary/8 border-primary/10' },
          { icon: BarChart3, label: 'Win Rate', value: `${winRate}%`, color: 'text-amber-400', glow: 'bg-amber-500/8 border-amber-500/10' },
          { icon: Users, label: 'Online', value: onlineCount.toLocaleString(), color: 'text-blue-400', glow: 'bg-blue-500/8 border-blue-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className={`glass rounded-xl p-3 flex flex-col items-center text-center noise-texture border ${stat.glow}`}
          >
            <div className="p-1.5 rounded-lg mb-1">
              <stat.icon size={14} className={stat.color} />
            </div>
            <div className="text-base font-black font-display">{stat.value}</div>
            <div className="text-[7px] font-bold text-muted-foreground/60 uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Live Ticker */}
      <div className="mx-4 glass-subtle rounded-xl py-2.5 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card/80 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card/80 to-transparent z-10" />
        <div className="animate-scroll-ticker inline-flex whitespace-nowrap">
          {[
            '🔥 Arsenal 2-1 Chelsea WON +15.50',
            '✅ Man City 3-0 Liverpool CORRECT SCORE',
            '💰 Barcelona FIXED +85.00 WON',
            '🚀 Tips Mpya za Usiku Zimepost!',
            '🏆 Simba vs Yanga VIP WON +22.00',
          ].map((text, i) => (
            <span key={i} className="text-[9px] font-bold text-primary/80 uppercase tracking-wider mx-6">{text} •</span>
          ))}
          {[
            '🔥 Arsenal 2-1 Chelsea WON +15.50',
            '✅ Man City 3-0 Liverpool CORRECT SCORE',
            '💰 Barcelona FIXED +85.00 WON',
            '🚀 Tips Mpya za Usiku Zimepost!',
            '🏆 Simba vs Yanga VIP WON +22.00',
          ].map((text, i) => (
            <span key={`dup-${i}`} className="text-[9px] font-bold text-primary/80 uppercase tracking-wider mx-6">{text} •</span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] font-display">Categories</h2>
          <div className="h-px flex-1 ml-3 bg-border/30" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat, i) => {
            const style = getCategoryStyle(cat);
            return (
              <motion.button
                key={cat}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCategorySelect(cat)}
                className={`relative p-3.5 rounded-xl border bg-gradient-to-br transition-all duration-300 flex items-center gap-3 group noise-texture ${style.bg} ${style.border}`}
              >
                <div className="p-2 bg-card/60 rounded-lg border border-border/30 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat)}
                </div>
                <div className="text-left flex-1">
                  <div className="text-[10px] font-black uppercase tracking-tight leading-tight font-display">{cat}</div>
                  <div className="text-[8px] text-muted-foreground/60 font-bold mt-0.5">{getCategoryCount(cat)} tips</div>
                </div>
                <ArrowRight size={12} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Social Links */}
      <div className="flex gap-2.5 px-4">
        <a
          href={settings.telegramChannel}
          target="_blank"
          rel="noreferrer"
          className="flex-1 glass-subtle rounded-xl p-3.5 flex items-center justify-center gap-2 hover:bg-blue-500/10 transition-all group border border-blue-500/10 hover:border-blue-500/30"
        >
          <Send size={14} className="text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Telegram</span>
        </a>
        <a
          href={`https://wa.me/${settings.whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 glass-subtle rounded-xl p-3.5 flex items-center justify-center gap-2 hover:bg-primary/10 transition-all group border border-primary/10 hover:border-primary/30"
        >
          <MessageCircle size={14} className="text-primary group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-black text-primary uppercase tracking-widest">WhatsApp</span>
        </a>
      </div>

      {/* Featured Tips */}
      <section className="px-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/15">
              <Flame size={13} className="text-amber-400" />
            </div>
            <h2 className="text-[11px] font-black text-foreground uppercase tracking-wider font-display">Hot Tips</h2>
          </div>
          <button onClick={onViewAll} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline underline-offset-4 flex items-center gap-1">
            Zote <ArrowRight size={10} />
          </button>
        </div>
        <div className="space-y-2.5">
          {settings.tipsters.slice(0, 4).map(t => (
            <TipsterCard key={t.id} t={t} unlockedTickets={unlockedTickets} onUnlock={onUnlock} />
          ))}
        </div>
      </section>

      {/* Trust badge */}
      <div className="mx-4 glass-premium rounded-xl p-4 flex items-center gap-3 noise-texture">
        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/15">
          <Sparkles size={16} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-bold">Tips zinapost kila siku 10:00 AM & 6:00 PM</p>
          <p className="text-[9px] text-muted-foreground/60 mt-0.5">Karibu kwa timu ya washindi! 🏆</p>
        </div>
      </div>

      {/* Security badge */}
      <div className="mx-4 flex items-center justify-center gap-4 py-2">
        {[
          { icon: Shield, text: 'Malipo Salama' },
          { icon: Star, text: '98% Win Rate' },
          { icon: Gift, text: 'Free Tips' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1">
            <item.icon size={9} className="text-primary/40" />
            <span className="text-[7px] text-muted-foreground/30 font-bold uppercase tracking-wider">{item.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
