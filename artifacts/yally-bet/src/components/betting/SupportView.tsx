import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, Mail, Copy, BadgeCheck, Link as LinkIcon,
  CreditCard, ExternalLink, Check, Headphones, Sparkles, Clock, ShieldCheck,
} from 'lucide-react';
import { Settings } from '@/types/betting';

interface SupportViewProps {
  settings: Settings;
}

export const SupportView: React.FC<SupportViewProps> = ({ settings }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const items: {
    key: string;
    icon: any;
    label: string;
    value: string;
    href?: string;
    color: string;
    glow: string;
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
      glow: 'from-amber-400/20 to-amber-500/5',
      ring: 'ring-amber-400/25',
      copyable: !!settings.paymentNumber,
    },
    {
      key: 'email',
      icon: Mail,
      label: 'Barua Pepe ya Msaada',
      value: settings.supportEmail || '—',
      href: settings.supportEmail ? `mailto:${settings.supportEmail}` : undefined,
      color: 'text-rose-300',
      glow: 'from-rose-400/20 to-rose-500/5',
      ring: 'ring-rose-400/25',
      copyable: !!settings.supportEmail,
    },
    {
      key: 'wa',
      icon: MessageCircle,
      label: 'WhatsApp ya Msaada',
      value: settings.whatsappNumber || '—',
      href: waNumber ? waLink : undefined,
      color: 'text-emerald-300',
      glow: 'from-emerald-400/20 to-emerald-500/5',
      ring: 'ring-emerald-400/25',
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
      glow: 'from-sky-400/20 to-sky-500/5',
      ring: 'ring-sky-400/25',
      external: true,
    },
    {
      key: 'group',
      icon: LinkIcon,
      label: 'Group la WhatsApp',
      value: settings.whatsappGroup || '—',
      href: settings.whatsappGroup || undefined,
      color: 'text-violet-300',
      glow: 'from-violet-400/20 to-violet-500/5',
      ring: 'ring-violet-400/25',
      external: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-5 pb-28"
    >
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative glass-premium rounded-3xl p-5 overflow-hidden noise-texture"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-emerald-500/10 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="relative flex items-start gap-3.5">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 flex items-center justify-center glow-emerald-sm">
              <Headphones size={24} className="text-primary" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center"
            >
              <BadgeCheck size={12} className="text-white" />
            </motion.div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black uppercase tracking-tight font-display">
                Mawasiliano &amp; Msaada
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground/70 font-medium mt-1 leading-relaxed">
              Wasiliana nasi muda wowote — timu yetu ipo tayari kukusaidia.
            </p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-400/10 border border-emerald-400/25 px-2 py-1 rounded-md">
                <ShieldCheck size={9} /> Msaada Rasmi
              </span>
              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-amber-300 bg-amber-400/10 border border-amber-400/25 px-2 py-1 rounded-md">
                <Clock size={9} /> 24/7
              </span>
              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/25 px-2 py-1 rounded-md">
                <Sparkles size={9} /> Verified
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Wasiliana Sasa primary CTA */}
      {waNumber && (
        <motion.a
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileTap={{ scale: 0.97 }}
          href={waMessageLink}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] text-white bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/50 transition-shadow overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
          <MessageCircle size={18} />
          Wasiliana Sasa
        </motion.a>
      )}

      {/* Contact cards */}
      <div className="space-y-2.5">
        {items.map((item, i) => {
          const hasValue = item.value && item.value !== '—';
          const Wrapper: any = item.href && hasValue ? 'a' : 'div';
          const wrapperProps = item.href && hasValue
            ? { href: item.href, target: item.external ? '_blank' : undefined, rel: 'noopener noreferrer' }
            : {};

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i + 0.2, duration: 0.35 }}
            >
              <Wrapper
                {...wrapperProps}
                className={`relative block glass rounded-2xl p-3.5 noise-texture overflow-hidden group transition-all ${
                  item.href && hasValue
                    ? 'hover:bg-secondary/30 active:scale-[0.98] cursor-pointer'
                    : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.glow} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                <div className="relative flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.glow} ring-1 ${item.ring} group-hover:scale-110 transition-transform shrink-0`}>
                    <item.icon size={18} className={item.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
                      {item.label}
                    </p>
                    <p className={`text-[13px] font-bold mt-0.5 truncate ${hasValue ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                      {item.value}
                    </p>
                  </div>

                  {item.copyable && hasValue && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); copy(item.key, item.value); }}
                      className="p-2.5 rounded-xl bg-secondary/40 hover:bg-secondary active:scale-90 transition-all shrink-0"
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
                            <Check size={14} className="text-emerald-300" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="block"
                          >
                            <Copy size={14} className="text-muted-foreground/70" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  )}

                  {item.external && hasValue && (
                    <ExternalLink size={14} className="text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                  )}
                </div>
              </Wrapper>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center pt-2"
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
          {settings.appName || 'YALLY BET'} · Customer Care
        </p>
      </motion.div>
    </motion.div>
  );
};
