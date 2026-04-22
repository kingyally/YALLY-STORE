import React from 'react';
import { motion } from 'framer-motion';
import { Home, Ticket, History, UserCircle, Shield, Headphones } from 'lucide-react';
import { useT } from '@/lib/i18n';

type TabType = 'home' | 'tickets' | 'history' | 'support' | 'account' | 'admin';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, isAdmin }) => {
  const { t } = useT();
  const shorten = (s: string, max = 7) => (s.length > max ? s.slice(0, max) : s);
  const tabs: { id: TabType; icon: React.ElementType; label: string; adminOnly?: boolean }[] = [
    { id: 'home', icon: Home, label: shorten(t('nav.home')) },
    { id: 'tickets', icon: Ticket, label: shorten(t('nav.tickets')) },
    { id: 'history', icon: History, label: shorten(t('nav.history')) },
    { id: 'support', icon: Headphones, label: 'C/M' },
    { id: 'account', icon: UserCircle, label: shorten(t('nav.account')) },
    { id: 'admin', icon: Shield, label: shorten(t('nav.admin')), adminOnly: true },
  ];
  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-md mx-auto px-3 pb-3 pt-1">
        <div className="glass-strong rounded-2xl px-1 py-1.5 flex items-stretch relative overflow-hidden">
          {/* Animated background indicator */}
          {visibleTabs.map((tab, index) => {
            if (activeTab !== tab.id) return null;
            const isAdminTab = tab.id === 'admin';
            return (
              <motion.div
                key="bg-indicator"
                layoutId="navBg"
                className={`absolute top-1 bottom-1 rounded-xl ${
                  isAdminTab ? 'bg-destructive/15 border border-destructive/20' : 'bg-primary/15 border border-primary/20'
                }`}
                style={{
                  width: `calc((100% - 8px) / ${visibleTabs.length})`,
                  left: `calc(4px + (100% - 8px) * ${index} / ${visibleTabs.length})`,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            );
          })}

          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isAdminTab = tab.id === 'admin';
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.85 }}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 px-1 py-2.5 rounded-xl transition-all duration-300 z-10"
              >
                <tab.icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-all duration-300 ${
                    isAdminTab
                      ? isActive ? 'text-destructive drop-shadow-[0_0_8px_hsl(var(--destructive)/0.5)]' : 'text-destructive/40'
                      : isActive ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]' : 'text-muted-foreground/60'
                  }`}
                />
                <span className={`text-[8px] font-black uppercase tracking-wider truncate max-w-full transition-all duration-300 ${
                  isAdminTab
                    ? isActive ? 'text-destructive' : 'text-destructive/40'
                    : isActive ? 'text-primary' : 'text-muted-foreground/50'
                }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navDot"
                    className={`absolute -bottom-0 w-1 h-1 rounded-full ${
                      isAdminTab ? 'bg-destructive' : 'bg-primary'
                    }`}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
