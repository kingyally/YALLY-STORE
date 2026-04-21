import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, MessageCircle, Send, Mail, Phone, LogOut, ExternalLink, Crown, Star, Ticket, Globe, Check } from 'lucide-react';
import { Settings } from '@/types/betting';
import { useT, LANGUAGES } from '@/lib/i18n';

interface AccountViewProps {
  userName: string;
  userPhone: string;
  settings: Settings;
  onLogout: () => void;
  unlockedCount?: number;
}

export const AccountView: React.FC<AccountViewProps> = ({
  userName, userPhone, settings, onLogout, unlockedCount = 0
}) => {
  const { lang, setLang, t } = useT();
  const [showLangPicker, setShowLangPicker] = useState(false);
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4 pb-28"
    >
      {/* Profile Card */}
      <div className="glass-premium rounded-2xl p-5 relative overflow-hidden noise-texture">
        <div className="absolute top-0 right-0 opacity-[0.02]">
          <Shield size={120} />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 border-2 border-primary/20 flex items-center justify-center glow-emerald-sm">
              <span className="text-2xl font-black text-primary font-display">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-card flex items-center justify-center">
              <Crown size={10} className="text-primary-foreground" />
            </div>
          </div>
          <div className="relative z-10 flex-1">
            <h2 className="text-lg font-black uppercase tracking-tight font-display">{userName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-muted-foreground/60 bg-secondary/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Phone size={8} /> {userPhone}
              </span>
            </div>
            <span className="inline-block mt-2 text-[7px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md border border-primary/15">
              ⭐ {t('profile.activeMember')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { icon: Ticket, label: t('profile.unlocked'), value: String(unlockedCount), color: 'text-primary' },
            { icon: Star, label: t('profile.level'), value: 'VIP', color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-secondary/30 rounded-xl p-2.5 text-center">
              <stat.icon size={12} className={`${stat.color} mx-auto mb-1`} />
              <p className="text-sm font-black font-display">{stat.value}</p>
              <p className="text-[7px] text-muted-foreground/50 font-bold uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support Links */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.25em] ml-1 font-display">{t('profile.support')}</h3>
        <div className="glass rounded-2xl overflow-hidden noise-texture">
          {[
            { href: settings.whatsappGroup || '#', icon: MessageCircle, label: t('profile.whatsappGroup'), color: 'text-primary', bg: 'bg-primary/8' },
            { href: settings.telegramChannel || '#', icon: Send, label: t('profile.telegram'), color: 'text-blue-400', bg: 'bg-blue-500/8' },
            { href: `https://wa.me/${(settings.whatsappNumber || '').replace(/[^0-9]/g, '')}`, icon: Phone, label: t('profile.adminWhatsapp'), sub: settings.whatsappNumber || '', color: 'text-primary', bg: 'bg-primary/8' },
            { href: `mailto:${settings.supportEmail || ''}`, icon: Mail, label: t('profile.supportEmail'), sub: settings.supportEmail || '', color: 'text-rose-400', bg: 'bg-rose-500/8' },
          ].map((item, i, arr) => (
            <a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3.5 p-4 hover:bg-secondary/30 transition-all group ${
                i < arr.length - 1 ? 'border-b border-border/20' : ''
              }`}
            >
              <div className={`p-2.5 rounded-lg ${item.bg} group-hover:scale-110 transition-transform`}>
                <item.icon size={16} className={item.color} />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold">{item.label}</p>
                {item.sub && <p className="text-[9px] text-muted-foreground/40 font-medium mt-0.5">{item.sub}</p>}
              </div>
              <ExternalLink size={12} className="text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
            </a>
          ))}
        </div>
      </section>

      {/* Language Selector */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.25em] ml-1 font-display">{t('profile.language')} · Language</h3>
        <div className="glass rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowLangPicker(v => !v)}
            className="w-full flex items-center gap-3.5 p-4 hover:bg-secondary/30 transition-all"
          >
            <div className="p-2.5 rounded-lg bg-primary/8">
              <Globe size={16} className="text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[12px] font-bold">{t('profile.chooseLanguage')}</p>
              <p className="text-[10px] text-muted-foreground/60 font-medium mt-0.5">
                {currentLang.flag} {currentLang.native}
              </p>
            </div>
            <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
              {showLangPicker ? t('profile.close') : t('profile.change')}
            </span>
          </button>

          {showLangPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border/20"
            >
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setShowLangPicker(false); }}
                  className={`w-full flex items-center gap-3 p-3.5 hover:bg-secondary/30 transition-all ${
                    lang === l.code ? 'bg-primary/8' : ''
                  }`}
                >
                  <span className="text-xl">{l.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-[12px] font-bold">{l.native}</p>
                    <p className="text-[9px] text-muted-foreground/50 font-medium">{l.name}</p>
                  </div>
                  {lang === l.code && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Logout */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onLogout}
        className="w-full py-3.5 text-destructive font-black glass border-destructive/15 rounded-xl hover:bg-destructive/10 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
      >
        <LogOut size={14} />
        {t('profile.logout')}
      </motion.button>
    </motion.div>
  );
};
