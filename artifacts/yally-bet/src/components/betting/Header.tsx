import React, { useState, useEffect } from 'react';
import { Bell, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import matrixLogo from '@/assets/yally-logo.svg';

interface HeaderProps {
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ userName }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-strong px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={matrixLogo} alt="YALLY BET" className="w-10 h-10 rounded-xl object-cover border border-primary/20 glow-emerald-sm" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card animate-pulse-dot" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter uppercase font-display">
            YALLY<span className="text-gradient-emerald">.</span>BET
          </h1>
          <div className="flex items-center gap-1.5 -mt-0.5">
            <Wifi size={8} className="text-primary" />
            <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-[0.25em]">Live • {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
      {userName && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2.5 rounded-xl glass-subtle hover:bg-secondary/50 transition-all"
          >
            <Bell size={16} className="text-muted-foreground" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse-dot" />
          </button>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-premium">
            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-[10px] font-display border border-primary/30">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-bold text-foreground">{userName}</span>
          </div>
        </div>
      )}

      {/* Notification dropdown */}
      <AnimatePresence>
        {showNotif && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-4 mt-2 w-72 glass-strong rounded-2xl p-4 space-y-3 z-50"
          >
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Arifa</h3>
            {[
              { text: '🔥 Tips mpya za usiku zimepost!', time: 'Sasa hivi' },
              { text: '✅ Tip yako ya jana imeshinda!', time: 'Masaa 2 yaliyopita' },
              { text: '🎉 Karibu kwenye YALLY BET!', time: 'Leo' },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-medium">{n.text}</p>
                  <p className="text-[8px] text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
