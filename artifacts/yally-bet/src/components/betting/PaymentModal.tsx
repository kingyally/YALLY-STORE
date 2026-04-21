import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Shield, CheckCircle, Check, ArrowRight, AlertCircle, Loader2, Zap, XCircle } from 'lucide-react';
import { Tipster } from '@/types/betting';
import { toast } from 'sonner';
import { sonicpesaCreateOrder, sonicpesaCheckStatus } from '@/lib/userService';

interface PaymentModalProps {
  tipster: Tipster;
  onClose: () => void;
  onSuccess: (tipsterId: number) => void;
  paymentNumber: string;
  paymentMethods: string[];
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

type Step = 1 | 2 | 3 | 4;

export const PaymentModal: React.FC<PaymentModalProps> = ({
  tipster, onClose, onSuccess, userPhone
}) => {
  const [phone, setPhone] = useState(userPhone || '');
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const pollRef = useRef<number | null>(null);
  const pollCountRef = useRef(0);

  const price = tipster.prices?.[0];
  const finalPrice = price ? price.p - (price.discount || 0) : 0;

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (oid: string) => {
    pollCountRef.current = 0;
    stopPolling();
    pollRef.current = window.setInterval(async () => {
      pollCountRef.current += 1;
      const r = await sonicpesaCheckStatus(oid);
      const s = String(r.status || '').toUpperCase();

      if (s === 'SUCCESS') {
        stopPolling();
        setStep(4);
        setStatusMsg('Malipo yamefanikiwa! Ticket imefunguliwa.');
        toast.success('Malipo yamefanikiwa! 🎉');
        onSuccess(tipster.id);
      } else if (['CANCELLED', 'USERCANCELLED', 'REJECTED'].includes(s)) {
        stopPolling();
        setErrorMsg(
          s === 'USERCANCELLED' ? 'Umeghairi malipo.' :
          s === 'REJECTED' ? 'Malipo yamekataliwa.' :
          'Malipo yameghairiwa.'
        );
        setStep(3); // stay on waiting screen but with error
      } else if (pollCountRef.current >= 30) {
        // After ~90s give up auto-polling
        stopPolling();
        setErrorMsg('Muda umeisha. Bofya "Angalia tena" kuendelea kusubiri.');
      }
    }, 3000);
  };

  const handleStartPayment = async () => {
    if (!phone.trim()) {
      toast.error('Weka namba ya simu!');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const r = await sonicpesaCreateOrder({
        tipster_id: tipster.id,
        tipster_name: tipster.name,
        amount: finalPrice,
        phone: phone.trim(),
      });
      if (r.error || !r.data) {
        toast.error(r.error || 'Imeshindwa. Jaribu tena.');
        setErrorMsg(r.error || 'Imeshindwa kuanzisha malipo.');
        return;
      }
      setOrderId(r.data.order_id);
      setStatusMsg(r.data.message || 'Push USSD imetumwa kwenye simu yako.');
      setStep(3);
      startPolling(r.data.order_id);
      toast.success('Push USSD imetumwa! Fungua simu na ingiza PIN.');
    } catch {
      toast.error('Tatizo la mtandao. Jaribu tena.');
      setErrorMsg('Tatizo la mtandao.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualRecheck = async () => {
    if (!orderId) return;
    setErrorMsg('');
    setStatusMsg('Inakagua hali ya malipo...');
    const r = await sonicpesaCheckStatus(orderId);
    const s = String(r.status || '').toUpperCase();
    if (s === 'SUCCESS') {
      stopPolling();
      setStep(4);
      onSuccess(tipster.id);
      toast.success('Malipo yamefanikiwa! 🎉');
    } else if (['CANCELLED', 'USERCANCELLED', 'REJECTED'].includes(s)) {
      stopPolling();
      setErrorMsg(s === 'USERCANCELLED' ? 'Umeghairi malipo.' : 'Malipo yameghairiwa.');
    } else {
      setStatusMsg('Bado tunasubiri… fungua simu na ingiza PIN.');
      // restart polling if stopped
      if (!pollRef.current) startPolling(orderId);
    }
  };

  const handleCloseAttempt = () => {
    stopPolling();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/85 backdrop-blur-xl"
        onClick={step === 4 ? undefined : handleCloseAttempt}
      />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="relative w-full max-w-sm glass-strong rounded-t-3xl sm:rounded-3xl p-6 space-y-4 noise-texture"
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-muted-foreground/15 sm:hidden" />

        <div className="flex justify-between items-center pt-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Shield size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">Lipia Tip</h2>
              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Malipo Salama · Otomatiki</p>
            </div>
          </div>
          {step !== 4 && (
            <button onClick={handleCloseAttempt} className="p-2 rounded-lg glass-subtle hover:bg-secondary/50 transition-colors">
              <X size={16} className="text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-black transition-all ${
                step >= (s as Step) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {step > (s as Step) ? <Check size={12} /> : s}
              </div>
              {s < 4 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > (s as Step) ? 'bg-primary' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Tip summary */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 glass-subtle rounded-xl">
                <img src={tipster.avatar} alt={tipster.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-border/30" />
                <div className="flex-1">
                  <p className="text-sm font-bold">{tipster.name}</p>
                  <p className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest">{tipster.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-primary">TSH {finalPrice.toLocaleString()}</p>
                  {price?.discount ? <p className="text-[9px] text-muted-foreground line-through">TSH {price.p.toLocaleString()}</p> : null}
                </div>
              </div>

              <div className="glass-subtle rounded-xl p-3.5 flex items-start gap-2">
                <Zap size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-foreground/80 leading-relaxed">
                  Malipo otomatiki kupitia <span className="font-bold text-primary">M-Pesa, Tigo Pesa, HaloPesa & Airtel Money</span>. Ticket itafunguka mara baada ya kulipa.
                </p>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black rounded-xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
                Endelea <ArrowRight size={14} />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Enter phone */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="glass-subtle rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Tipster</span>
                  <span className="text-xs font-black">{tipster.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Kiasi</span>
                  <span className="text-base font-black text-primary">TSH {finalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Namba ya Simu (M-Pesa/Tigo/Airtel/Halo)</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <input type="tel" placeholder="0712345678" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-card/50 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm focus:border-primary/50 outline-none" />
                </div>
              </div>

              <div className="glass-subtle rounded-xl p-3.5 flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-muted-foreground/70 leading-relaxed">
                  Bonyeza "Lipa Sasa", kisha simu yako italia na ujumbe wa kuingiza PIN. Ukikamilisha, ticket itafunguliwa moja kwa moja.
                </p>
              </div>

              {errorMsg && (
                <div className="glass-subtle border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                  <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-300">{errorMsg}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-border/50 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Rudi
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleStartPayment} disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black rounded-xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                  {isSubmitting ? 'Inatuma...' : 'Lipa Sasa'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Waiting for USSD approval */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center py-3">
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[3px] border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-[3px] border-t-primary animate-spin" />
                  <Phone className="text-primary" size={28} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase">Subiri Ujumbe</h3>
                  <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest mt-1">
                    Fungua simu yako na ingiza PIN
                  </p>
                </div>
              </div>

              <div className="glass-subtle rounded-xl p-4 text-left space-y-2">
                <p className="text-[10px] text-foreground/80">📱 Ujumbe utakuja kwenye <span className="font-bold text-primary">{phone}</span></p>
                <p className="text-[10px] text-foreground/80">🔑 Ingiza PIN ya mobile money kuhalalisha</p>
                <p className="text-[10px] text-foreground/80">⚡ Ticket itafunguliwa otomatiki baada ya kulipa</p>
                {statusMsg && <p className="text-[10px] text-primary/80 pt-1 italic">{statusMsg}</p>}
              </div>

              {errorMsg && (
                <div className="glass-subtle border border-red-500/30 rounded-xl p-3 flex items-start gap-2 text-left">
                  <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-300">{errorMsg}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleCloseAttempt}
                  className="flex-1 py-3 rounded-xl border border-border/50 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Funga
                </button>
                <button onClick={handleManualRecheck}
                  className="flex-1 py-3 bg-primary/15 border border-primary/30 text-primary font-black rounded-xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
                  <Loader2 size={12} className={pollRef.current ? 'animate-spin' : ''} />
                  Angalia Tena
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center py-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
                  <CheckCircle className="text-primary" size={36} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase">Malipo Yamefanikiwa!</h3>
                  <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest mt-1">Ticket imefunguliwa 🎉</p>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black rounded-xl text-[11px] uppercase tracking-widest">
                Fungua Ticket
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
