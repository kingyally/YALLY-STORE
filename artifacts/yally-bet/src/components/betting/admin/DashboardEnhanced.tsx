import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Ticket, TrendingUp, Activity, Download, Zap, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fetchAdminStats, quickApproveAllPending, downloadExport, type AdminStats } from '@/lib/adminToolsService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

const fmtTzs = (n: number) => `TSH ${Math.round(n).toLocaleString('en-US')}`;

export function DashboardEnhanced() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    const s = await fetchAdminStats();
    setStats(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleApproveAll = async () => {
    if (!confirm('Idhinisha maombi yote yanayosubiri?')) return;
    setBusy('approve');
    const r = await quickApproveAllPending();
    setBusy(null);
    if (r.ok) { showToast(`Maombi ${r.approved ?? 0} yameidhinishwa`); load(); }
    else showToast('Imeshindikana');
  };

  const handleExport = async (type: 'users' | 'requests' | 'payments' | 'activity') => {
    setBusy(`export-${type}`);
    try { await downloadExport(type); showToast(`${type}.csv imepakuliwa`); }
    catch { showToast('Imeshindikana kupakua'); }
    setBusy(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }
  if (!stats) {
    return <div className="text-center py-8 text-muted-foreground text-xs">Imeshindikana kupakia takwimu</div>;
  }

  const cards = [
    { label: 'Watumiaji', value: stats.users.total, sub: `+${stats.users.today} leo`, icon: Users, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400' },
    { label: 'Mapato', value: fmtTzs(stats.revenue.total), sub: `+${fmtTzs(stats.revenue.today)} leo`, icon: DollarSign, color: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400' },
    { label: 'Maombi', value: stats.requests.total, sub: `${stats.requests.pending} pending`, icon: Ticket, color: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400' },
    { label: 'Active sasa', value: stats.users.activeNow, sub: `${stats.users.banned} banned`, icon: Activity, color: 'from-violet-500/20 to-violet-500/5', text: 'text-violet-400' },
  ];

  return (
    <div className="space-y-4">
      {toast && (
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-primary/10 border border-primary/30 rounded-xl p-2.5 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-primary" />
          <span className="text-[11px] font-bold text-primary">{toast}</span>
        </motion.div>
      )}

      {/* Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Muhtasari wa Sasa</h3>
        <button onClick={load} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/50 text-[10px] font-bold uppercase">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`bg-gradient-to-br ${c.color} border border-border/50 rounded-2xl p-3`}>
            <div className="flex items-start justify-between mb-2">
              <c.icon size={16} className={c.text} />
              <TrendingUp size={11} className="text-muted-foreground/50" />
            </div>
            <div className="text-[18px] font-black text-foreground leading-tight">{c.value}</div>
            <div className="text-[9px] text-muted-foreground/70 font-bold uppercase tracking-wider mt-0.5">{c.label}</div>
            <div className={`text-[9px] ${c.text} font-bold mt-1`}>{c.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Daily chart */}
      <div className="bg-card/40 border border-border/40 rounded-2xl p-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Mapato wiki hii</h4>
        <div style={{ width: '100%', height: 140 }}>
          <ResponsiveContainer>
            <LineChart data={stats.dailyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} />
              <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card/40 border border-border/40 rounded-2xl p-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Watumiaji wapya wiki hii</h4>
        <div style={{ width: '100%', height: 120 }}>
          <ResponsiveContainer>
            <BarChart data={stats.dailyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} />
              <Tooltip contentStyle={{ background: 'rgba(20,20,30,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="users" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top tipsters */}
      <div className="bg-card/40 border border-border/40 rounded-2xl p-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Tipsters Bora (kwa mauzo)</h4>
        {stats.topTipsters.length === 0 ? (
          <div className="text-[10px] text-muted-foreground text-center py-3">Hakuna data bado</div>
        ) : (
          <div className="space-y-1.5">
            {stats.topTipsters.map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-secondary/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center">{i + 1}</div>
                  <span className="text-[11px] font-bold">{t.tipster_name}</span>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-black text-emerald-400">{fmtTzs(t.revenue)}</div>
                  <div className="text-[9px] text-muted-foreground">{t.unlocks} unlocks</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-card/40 border border-border/40 rounded-2xl p-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <Zap size={11} className="text-amber-400" /> Hatua za Haraka
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleApproveAll} disabled={busy === 'approve' || stats.requests.pending === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-40">
            <CheckCircle2 size={12} /> Approve {stats.requests.pending} Pending
          </button>
          <button onClick={() => handleExport('users')} disabled={busy === 'export-users'}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-40">
            <Download size={12} /> Users CSV
          </button>
          <button onClick={() => handleExport('requests')} disabled={busy === 'export-requests'}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-40">
            <Download size={12} /> Maombi CSV
          </button>
          <button onClick={() => handleExport('payments')} disabled={busy === 'export-payments'}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-40">
            <Download size={12} /> Payments CSV
          </button>
        </div>
      </div>

      {stats.requests.pending > 5 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2">
          <AlertCircle size={14} className="text-amber-400" />
          <span className="text-[11px] font-bold text-amber-400">Una maombi {stats.requests.pending} yanayosubiri</span>
        </div>
      )}
    </div>
  );
}
