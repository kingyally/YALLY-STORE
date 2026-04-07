import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Shield, CheckCircle, Check, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Tipster } from '@/types/betting';
import { toast } from 'sonner';
import { createTicketRequest } from '@/lib/userService';

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

export const PaymentModal: React.FC<PaymentModalProps> = ({
  tipster, onClose, onSuccess, paymentNumber, paymentMethods, userId, userName, userEmail, userPhone
}) => {
  const [phone, setPhone] = useState(userPhone || '');
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0] || 'M-PESA');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const price = tipster.prices?.[0];
  const finalPrice = price ? price.p - (price.discount || 0) : 0;

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'M-PESA': return 'border-red-500/30 bg-red-500/8 text-red-400';
      case 'TIGO PESA': return 'border-blue-500/30 bg-blue-500/8 text-blue-400';
      case 'AIRTEL MONEY': return 'border-rose-500/30 bg-rose-500/8 text-rose-400';
      case 'HALOPESA': return 'border-amber-500/30 bg-amber-500/8 text-amber-400';
      default: return 'border-primary/30 bg-primary/8 text-primary';
    }
  };

  const handleSubmitPayment = async () => {
    if (!phone.trim()) {
      toast.error('Weka namba ya simu!');
      return;
    }
    setIsSubmitting(true);
    try {
      await createTicketRequest({
        user_id: userId || '',
        user_name: userName || '',
        user_phone: userPhone || phone,
        user_email: userEmail || '',
        tipster_id: tipster.id,
        tipster_name: tipster.name,
        amount: finalPrice,
        payment_number: paymentNumber,
        payment_method: selectedMethod,
        status: 'pending',
      });
      setStep(3);
      toast.success('Ombi limetumwa! Subiri uthibitisho.');
    } catch (err) {
      toast.error('Kuna tatizo. Jaribu tena.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    if (step === 3) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/85 backdrop-blur-xl"
        onClick={step === 3 ? undefined : onClose}
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
              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Malipo Salama</p>
            </div>
          </div>
          {step !== 3 && (
            <button onClick={onClose} className="p-2 rounded-lg glass-subtle hover:bg-secondary/50 transition-colors">
              <X size={16} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-black transition-all ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {step > s ? <Check size={12} /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? 'bg-primary' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select method & see info */}
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

              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Njia ya Malipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map(method => (
                    <button key={method} onClick={() => setSelectedMethod(method)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                        selectedMethod === method ? `${getMethodColor(method)} ring-1 ring-current/20` : 'border-border/20 bg-secondary/30 text-muted-foreground/50'
                      }`}>
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black rounded-xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
                Endelea <ArrowRight size={14} />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Enter phone & confirm */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="glass-subtle rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Njia</span>
                  <span className="text-xs font-black">{selectedMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Kiasi</span>
                  <span className="text-base font-black text-primary">TSH {finalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/20 pt-3">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Tuma kwa</span>
                  <span className="text-xs font-black text-primary">{paymentNumber}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Namba ya Simu Yako</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <input type="tel" placeholder="e.g. 0712345678" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-card/50 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-sm focus:border-primary/50 outline-none" />
                </div>
              </div>

              <div className="glass-subtle rounded-xl p-3.5 flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-muted-foreground/70 leading-relaxed">
                  Baada ya kutuma ombi, admin atakithibitisha na kukufungulia ticket. Tafadhali subiri hadi saa 24.
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-border/50 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Rudi
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmitPayment} disabled={isSubmitting}
                  className="flex-2 flex-1 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black rounded-xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  {isSubmitting ? 'Inatuma...' : 'Tuma Ombi'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center py-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
                  <CheckCircle className="text-primary" size={36} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase">Ombi Limetumwa!</h3>
                  <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest mt-1">Subiri uthibitisho wa admin</p>
                </div>
              </div>
              <div className="glass-subtle rounded-xl p-4 text-left space-y-2">
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest font-bold">Hatua Zinazofuata:</p>
                <p className="text-[10px] text-foreground/80">1. Tuma TSH {finalPrice.toLocaleString()} kwa namba <span className="text-primary font-bold">{paymentNumber}</span></p>
                <p className="text-[10px] text-foreground/80">2. Admin atakithibitisha ombi lako</p>
                <p className="text-[10px] text-foreground/80">3. Ticket itafunguliwa hadi saa 24</p>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleDone}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black rounded-xl text-[11px] uppercase tracking-widest">
                Sawa, Imefahamika
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
