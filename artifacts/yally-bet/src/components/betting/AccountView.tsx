import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MessageCircle, Send, Mail, Phone, LogOut, ExternalLink, Crown, Star, Ticket, Globe, Check, Copy, BadgeCheck, Link as LinkIcon, CreditCard } from 'lucide-react';
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {}
  };

  const waNumber = (settings.whatsappNumber || '').replace(/[^0-9]/g, '');
  const waLink = waNumber ? `https://wa.me/${waNumber}` : '#';
  const waMessageLink = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent('Habari, nahitaji msaada kuhusu YALLY BET')}`
    : '#';

  const contactItems: {
    key: string;
    icon: any;
    label: string;
    value: string;
    href?: string;
    color: string;
    bg: string;
    ring: string;
    copyable?: boolean;
    external?: boolean;
  }[] = [
    {
      key: 'pay',
      icon: CreditCard,
      label: 'Namba ya Malipo',
      value: settings.paymentNumber || '—',
      color: 'text-amber-300',
      bg: 'bg-amber-400/10',
      ring: 'ring-amber-400/20',
      copyable: !!settings.paymentNumber,
    },
    {
      key: 'email',
      icon: Mail,
      label: 'Barua Pepe ya Msaada',
      value: settings.supportEmail || '—',
      href: settings.supportEmail ? `mailto:${settings.supportEmail}` : undefined,
      color: 'text-rose-300',
      bg: 'bg-rose-400/10',
      ring: 'ring-rose-400/20',
      copyable: !!settings.supportEmail,
    },
    {
      key: 'wa',
      icon: MessageCircle,
      label: 'WhatsApp ya Msaada',
      value: settings.whatsappNumber || '—',
      href: waNumber ? waLink : undefined,
      color: 'text-emerald-300',
      bg: 'bg-emerald-400/10',
      ring: 'ring-emerald-400/20',
      copyable: !!settings.whatsappNumber,
      external: true,
    },
    {
      key: 'channel',
      icon: Send,
      label: 'Kiungo cha Channel',
      value: settings.telegramChannel || '—',
      href: settings.telegramChannel || undefined,
      color: 'text-sky-300',
      bg: 'bg-sky-400/10',
      ring: 'ring-sky-400/20',
      external: true,
    },
    {
      key: 'group',
      icon: LinkIcon,
      label: 'Group la WhatsApp',
      value: settings.whatsappGroup || '—',
      href: settings.whatsappGroup || undefined,
      color: 'text-violet-300',
      bg: 'bg-violet-400/10',
      ring: 'ring-violet-400/20',
      external: true,
    },
  ];

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

      {/* Mawasiliano & Msaada */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between ml-1">
          <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.25em] font-display">
            Mawasiliano &amp; Msaada
          </h3>
          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-md">
            <BadgeCheck size={10} />
            Msaada Rasmi
          </span>
        </div>

        <div className="glass-premium rounded-2xl overflow-hidden noise-texture relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {contactItems.map((item, i) => {
            const isLast = i === contactItems.length - 1;
            const hasValue = item.value && item.value !== '—';
            const Wrapper: any = item.href && hasValue ? 'a' : 'div';
            const wrapperProps = item.href && hasValue
              ? { href: item.href, target: item.external ? '_blank' : undefined, rel: 'noopener noreferrer' }
              : {};

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
                className={`relative ${!isLast ? 'border-b border-border/15' : ''}`}
              >
                <Wrapper
                  {...wrapperProps}
                  className={`flex items-center gap-3 p-3.5 transition-all group ${
                    item.href && hasValue ? 'hover:bg-secondary/40 active:bg-secondary/60 cursor-pointer' : ''
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${item.bg} ring-1 ${item.ring} group-hover:scale-110 transition-transform shrink-0`}>
                    <item.icon size={16} className={item.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className={`text-[12px] font-bold mt-0.5 truncate ${hasValue ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                      {item.value}
                    </p>
                  </div>

                  {item.copyable && hasValue && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); copy(item.key, item.value); }}
                      className="p-2 rounded-lg bg-secondary/40 hover:bg-secondary active:scale-90 transition-all shrink-0"
                      aria-label="Nakili"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {copiedKey === item.key ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            className="block"
                          >
                            <Check size={12} className="text-emerald-300" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="block"
                          >
                            <Copy size={12} className="text-muted-foreground/60" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  )}

                  {item.external && hasValue && (
                    <ExternalLink size={12} className="text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                  )}
                </Wrapper>
              </motion.div>
            );
          })}
        </div>

        {/* Wasiliana Sasa CTA */}
        {waNumber && (
          <motion.a
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.97 }}
            href={waMessageLink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-black uppercase tracking-widest text-[11px] text-emerald-50 bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
            <MessageCircle size={16} />
            Wasiliana Sasa
          </motion.a>
        )}
      </motion.section>

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
