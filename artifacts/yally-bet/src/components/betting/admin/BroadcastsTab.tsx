import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Send, Trash2, Users, Star, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { fetchBroadcasts, sendBroadcast, deleteBroadcast, type Broadcast } from '@/lib/adminToolsService';

const audienceLabels: Record<string, { label: string; icon: any; color: string }> = {
  all: { label: 'Wote', icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  vip: { label: 'VIP', icon: Star, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  new: { label: 'Wapya', icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
};

export function BroadcastsTab() {
  const [list, setList] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'all' | 'vip' | 'new'>('all');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const load = async () => { setLoading(true); setList(await fetchBroadcasts()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const showToast = (type: 'ok' | 'err', msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { showToast('err', 'Jaza title na ujumbe'); return; }
    setSending(true);
    const r = await sendBroadcast(title.trim(), message.trim(), audience);
    setSending(false);
    if (r.ok) {
      showToast('ok', `Imetumwa kwa watumiaji ${r.sentCount ?? 0}`);
      setTitle(''); setMessage('');
      load();
    } else showToast('err', r.error ?? 'Imeshindikana');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Futa broadcast hii?')) return;
    if (await deleteBroadcast(id)) load();
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className={`flex items-center gap-2 rounded-xl p-2.5 border ${toast.type === 'ok' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
            {toast.type === 'ok' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            <span className="text-[11px] font-bold">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose */}
      <div className="bg-card/40 border border-border/40 rounded-2xl p-3 space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Megaphone size={14} className="text-primary" />
          <h4 className="text-[11px] font-black uppercase tracking-wider">Tuma Tangazo Jipya</h4>
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (mfano: Tip Mpya Leo!)"
          className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/40" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ujumbe wako..." rows={3}
          className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/40 resize-none" />
        <div className="grid grid-cols-3 gap-1.5">
          {(['all', 'vip', 'new'] as const).map((a) => {
            const cfg = audienceLabels[a]; const Ic = cfg.icon; const active = audience === a;
            return (
              <button key={a} onClick={() => setAudience(a)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-[10px] font-black uppercase ${active ? cfg.color : 'bg-secondary/30 border-border/40 text-muted-foreground'}`}>
                <Ic size={14} />
                {cfg.label}
              </button>
            );
          })}
        </div>
        <button onClick={handleSend} disabled={sending}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-[11px] font-black uppercase tracking-wider disabled:opacity-50">
          {sending ? <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Send size={13} />}
          Tuma
        </button>
      </div>

      {/* History */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-1">Historia ({list.length})</h4>
        {loading ? <div className="text-center py-4"><div className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> :
          list.length === 0 ? <div className="text-center py-6 text-[11px] text-muted-foreground">Hakuna matangazo bado</div> :
          list.map((b) => {
            const cfg = audienceLabels[b.audience] || audienceLabels.all;
            return (
              <div key={b.id} className="bg-card/40 border border-border/40 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-black truncate">{b.title}</div>
                    <div className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-2">{b.message}</div>
                  </div>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-[9px] text-muted-foreground">→ {b.sent_count} watumiaji</span>
                  <span className="text-[9px] text-muted-foreground/60 ml-auto">{new Date(b.created_at).toLocaleString()}</span>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
