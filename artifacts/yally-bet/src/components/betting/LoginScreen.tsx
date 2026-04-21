import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users, Sparkles, ArrowRight, User, Phone, Mail, KeyRound, Shield, Star, Zap } from 'lucide-react';
import loginBg from '@/assets/login-bg.jpg';
import matrixLogo from '@/assets/yally-logo.svg';
import { useT } from '@/lib/i18n';

interface LoginScreenProps {
  loginName: string;
  loginEmail: string;
  loginPhone: string;
  loginPassword: string;
  setLoginName: (val: string) => void;
  setLoginEmail: (val: string) => void;
  setLoginPhone: (val: string) => void;
  setLoginPassword: (val: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  isLoading?: boolean;
  loginError?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  loginName, loginEmail, loginPhone, loginPassword,
  setLoginName, setLoginEmail, setLoginPhone, setLoginPassword,
  onLogin, onRegister, isLoading, loginError
}) => {
  const { t } = useT();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = () => {
    if (isRegisterMode) onRegister();
    else onLogin();
  };

  const isLoginDisabled = !loginEmail.trim() || !loginPassword.trim() || !!isLoading;
  const isRegisterDisabled = !loginName.trim() || !loginEmail.trim() || !loginPassword.trim() || !!isLoading;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden">
      <img src={loginBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background" />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-40 right-0 w-40 h-40 bg-primary/4 rounded-full blur-[60px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm space-y-5"
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, duration: 0.8 }}
            className="relative inline-flex items-center justify-center mx-auto"
          >
            <div className="absolute inset-0 rounded-2xl animate-glow-pulse" />
            <img src={matrixLogo} alt="YALLY BET" className="w-20 h-20 object-cover rounded-2xl border-2 border-primary/30 relative z-10" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase font-display">
              YALLY<span className="text-gradient-emerald">.</span>BET
            </h1>
            <p className="text-muted-foreground/60 text-[9px] font-bold uppercase tracking-[0.35em] mt-1.5">
              {t('app.tagline')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-center gap-2">
          {[
            { icon: Trophy,      value: '98%',   label: t('login.winRate'),   color: 'text-primary',     bg: 'bg-primary/8 border-primary/15' },
            { icon: Users,       value: '14.2k', label: t('login.members'),    color: 'text-blue-400',    bg: 'bg-blue-500/8 border-blue-500/15' },
            { icon: TrendingUp,  value: '450+',  label: t('login.dailyOdds'), color: 'text-amber-400',   bg: 'bg-amber-500/8 border-amber-500/15' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl glass-subtle border ${s.bg}`}
            >
              <s.icon size={14} className={s.color} />
              <span className="text-sm font-black font-display">{s.value}</span>
              <span className="text-[7px] font-bold text-muted-foreground/50 uppercase tracking-wider">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="glass-subtle rounded-xl p-3.5 flex items-start gap-3 border-primary/10"
        >
          <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
            <Sparkles size={12} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-foreground/80 leading-relaxed">
              "Nimepata TSH 2,500,000 wiki hii tu kwa VIP TICKET!"
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={8} className="text-amber-400 fill-amber-400" />)}</div>
              <span className="text-[8px] text-primary font-bold">@boss_kelvin</span>
            </div>
          </div>
        </motion.div>

        {/* Toggle Ingia / Jisajili */}
        <div className="flex rounded-xl glass-strong p-1">
          <button
            onClick={() => setIsRegisterMode(false)}
            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              !isRegisterMode ? 'btn-primary-premium text-primary-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground'
            }`}
          >{t('login.signIn')}</button>
          <button
            onClick={() => setIsRegisterMode(true)}
            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              isRegisterMode ? 'btn-primary-premium text-primary-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground'
            }`}
          >{t('login.signUp')}</button>
        </div>

        {/* Form */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="space-y-2.5">

          {/* Name — register only */}
          {isRegisterMode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative">
              <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
              <input
                type="text"
                placeholder={t('login.namePh')}
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="w-full glass-subtle border-border/30 rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
              />
            </motion.div>
          )}

          {/* Email — login & register */}
          <div className="relative">
            <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input
              type="email"
              placeholder={t('login.emailPh')}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full glass-subtle border-border/30 rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
            />
          </div>

          {/* Phone — register only (optional) */}
          {isRegisterMode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative">
              <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
              <input
                type="tel"
                placeholder={t('login.phonePh')}
                value={loginPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9+]/g, '');
                  if (val.length <= 13) setLoginPhone(val);
                }}
                maxLength={13}
                className="w-full glass-subtle border-border/30 rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
              />
            </motion.div>
          )}

          {/* Password */}
          <div className="relative">
            <KeyRound size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input
              type="password"
              placeholder={t('login.passwordPh')}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full glass-subtle border-border/30 rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
            />
          </div>

          {/* Error */}
          {loginError && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 rounded-xl p-3"
            >
              <p className="text-destructive text-[11px] font-bold text-center">{loginError}</p>
            </motion.div>
          )}

          {/* Submit button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={isRegisterMode ? isRegisterDisabled : isLoginDisabled}
            className="w-full py-4 btn-primary-premium text-primary-foreground font-black rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed text-sm uppercase tracking-widest flex items-center justify-center gap-2 glow-emerald-sm"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>{isRegisterMode ? t('login.signUpNow') : t('login.signInNow')}<ArrowRight size={16} /></>
            )}
          </motion.button>

          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-border/30" />
            <p className="text-muted-foreground/30 text-[9px] font-medium">
              {isRegisterMode ? t('login.haveAccount') : t('login.noAccount')}
            </p>
            <div className="h-px flex-1 bg-border/30" />
          </div>
        </motion.div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {[
            { icon: Shield, text: t('login.safe') },
            { icon: Zap, text: t('login.fast') },
            { icon: Star, text: t('login.freeJoin') },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <item.icon size={9} className="text-primary/50" />
              <span className="text-[7px] text-muted-foreground/30 font-bold uppercase tracking-wider">{item.text}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground/20 text-[8px] font-bold uppercase tracking-[0.2em]">
          YALLY BET © 2026 • v1.0
        </p>
      </motion.div>
    </div>
  );
};
