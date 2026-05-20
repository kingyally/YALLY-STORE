import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
export const ADMIN_EMAIL = 'seif83470@gmail.com';

interface AdminLoginModalProps {
  onClose: () => void;
  onSuccess: (email: string) => void;
  userEmail?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onSuccess, userEmail }) => {
  const [email, setEmail] = useState(userEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (email.toLowerCase() === ADMIN_EMAIL && password === 'admin2026') {
      onSuccess(email.toLowerCase());
    } else {
      setError('Email au password si sahihi');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm glass-strong p-6 rounded-3xl space-y-5"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-destructive/10 rounded-xl border border-destructive/20">
              <Shield className="text-destructive" size={22} />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight">Admin Login</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className="w-full bg-card border border-border rounded-2xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none transition-all text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full bg-card border border-border rounded-2xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none transition-all text-sm"
          />
          {error && <p className="text-destructive text-xs font-bold">{error}</p>}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            className="w-full py-3.5 bg-destructive text-destructive-foreground font-black rounded-2xl text-sm uppercase tracking-widest hover:brightness-110 transition-all"
          >
            Ingia Admin
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
