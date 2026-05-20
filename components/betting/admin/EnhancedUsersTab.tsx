import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserX, UserCheck, Eye, Trash2, Download, X, Mail, Phone, Calendar, Activity, DollarSign, Save } from 'lucide-react';
import { fetchEnhancedUsers, fetchUserDetails, setUserBanned, setUserNotes, downloadExport, type EnhancedUser, type UserDetails } from '@/lib/adminToolsService';

const fmtTzs = (n: number) => `TSH ${Math.round(n).toLocaleString('en-US')}`;

export function EnhancedUsersTab({ onDeleteUser }: { onDeleteUser: (id: string) => Promise<void> }) {
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'banned' | 'new'>('all');
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const load = async () => { setLoading(true); setUsers(await fetchEnhancedUsers(search, filter)); setLoading(false); };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [search]);

  const openDetails = async (id: string) => {
    setDetailsOpen(true); setDetails(null);
    const d = await fetchUserDetails(id);
    setDetails(d);
    if (d) setNotesDraft(d.user.notes || '');
  };

  const handleBan = async (u: EnhancedUser) => {
    const action = u.banned ? 'fungua' : 'funga';
    if (!confirm(`${action.toUpperCase()} ${u.name}?`)) return;
    if (await setUserBanned(u.id, !u.banned)) {
      load();
      if (details?.user.id === u.id) openDetails(u.id);
    }
  };

  const handleSaveNotes = async () => {
    if (!details) return;
    setSavingNotes(true);
    await setUserNotes(details.user.id, notesDraft);
    setSavingNotes(false);
  };

  const handleDeleteFromDetails = async () => {
    if (!details) return;
    await onDeleteUser(details.user.id);
    setDetailsOpen(false);
    load();
  };

  return (
    <div className="space-y-3">
      {/* Search + filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tafuta jina, email au phone..."
            className="w-full bg-secondary/40 border border-border/40 rounded-lg pl-9 pr-3 py-2 text-[12px] text-foreground placeholder:text-muted-foreground/40" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'active', 'banned', 'new'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-muted-foreground'}`}>
              {f === 'all' ? 'Wote' : f === 'active' ? 'Active' : f === 'banned' ? 'Banned' : 'Wapya'}
            </button>
          ))}
          <button onClick={() => downloadExport('users')} className="px-2 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase">
            <Download size={11} />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? <div className="text-center py-6"><div className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> :
        users.length === 0 ? <div className="text-center py-6 text-[11px] text-muted-foreground">Hakuna watumiaji</div> :
        <div className="space-y-1.5">
          <div className="text-[10px] text-muted-foreground/70 px-1">{users.length} watumiaji</div>
          {users.map((u) => (
            <div key={u.id} className={`bg-card/40 border rounded-xl p-2.5 ${u.banned ? 'border-destructive/30 bg-destructive/5' : 'border-border/40'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-black text-foreground truncate">{u.name}</span>
                    {u.banned && <span className="text-[8px] font-black bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">BANNED</span>}
                  </div>
                  <div className="text-[10px] text-muted-foreground/80 truncate">{u.email}</div>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground/60">
                    <span>📞 {u.phone || '-'}</span>
                    <span>·</span>
                    <span>{u.login_count}x logins</span>
                    {u.last_login && <><span>·</span><span>{new Date(u.last_login).toLocaleDateString()}</span></>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => openDetails(u.id)} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <Eye size={11} />
                  </button>
                  <button onClick={() => handleBan(u)} className={`p-1.5 rounded-lg ${u.banned ? 'bg-emerald-500/10 text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
                    {u.banned ? <UserCheck size={11} /> : <UserX size={11} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      }

      {/* Details modal */}
      <AnimatePresence>
        {detailsOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-2"
            onClick={() => setDetailsOpen(false)}>
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }} onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border rounded-2xl max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-card/95 backdrop-blur p-3 border-b border-border flex items-center justify-between">
                <h3 className="text-[13px] font-black">Maelezo ya Mtumiaji</h3>
                <button onClick={() => setDetailsOpen(false)} className="p-1.5 rounded-lg bg-secondary/50">
                  <X size={14} />
                </button>
              </div>
              {!details ? (
                <div className="text-center py-8"><div className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
              ) : (
                <div className="p-3 space-y-3">
                  <div className="bg-secondary/30 rounded-xl p-3 space-y-1.5">
                    <div className="text-[14px] font-black">{details.user.name}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Mail size={11} />{details.user.email}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Phone size={11} />{details.user.phone || '-'}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Calendar size={11} />Joined: {new Date(details.user.created_at).toLocaleDateString()}</div>
                    {details.user.last_login && <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Activity size={11} />Last login: {new Date(details.user.last_login).toLocaleString()}</div>}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2 text-center">
                      <div className="text-[11px] font-black text-emerald-400">{fmtTzs(details.totalSpent)}</div>
                      <div className="text-[8px] text-muted-foreground uppercase mt-0.5">Imetumia</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-2 text-center">
                      <div className="text-[14px] font-black text-blue-400">{details.user.login_count}</div>
                      <div className="text-[8px] text-muted-foreground uppercase mt-0.5">Logins</div>
                    </div>
                    <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-2 text-center">
                      <div className="text-[14px] font-black text-violet-400">{details.unlocked.length}</div>
                      <div className="text-[8px] text-muted-foreground uppercase mt-0.5">Unlocked</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Notes (admin tu)</h4>
                    <textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} rows={2}
                      className="w-full bg-secondary/40 border border-border/40 rounded-lg px-2 py-1.5 text-[11px]" />
                    <button onClick={handleSaveNotes} disabled={savingNotes}
                      className="mt-1.5 flex items-center gap-1 px-2.5 py-1.5 bg-primary/20 text-primary rounded-lg text-[10px] font-black uppercase">
                      <Save size={10} /> {savingNotes ? 'Inahifadhi...' : 'Hifadhi Notes'}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Maombi ({details.requests.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {details.requests.slice(0, 10).map((r: any) => (
                        <div key={r.id} className="bg-secondary/30 rounded-lg p-1.5 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold truncate">{r.tipster_name}</div>
                            <div className="text-[8px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()} · {r.payment_method || '-'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-black">{fmtTzs(Number(r.amount))}</div>
                            <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded ${r.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : r.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 'bg-amber-500/20 text-amber-400'}`}>{r.status}</span>
                          </div>
                        </div>
                      ))}
                      {details.requests.length === 0 && <div className="text-[10px] text-center text-muted-foreground py-2">Hakuna maombi</div>}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button onClick={() => handleBan(details.user)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase ${details.user.banned ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-destructive/10 text-destructive border border-destructive/30'}`}>
                      {details.user.banned ? <><UserCheck size={11} />Fungua</> : <><UserX size={11} />Funga</>}
                    </button>
                    <button onClick={handleDeleteFromDetails}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-destructive text-destructive-foreground text-[10px] font-black uppercase">
                      <Trash2 size={11} />Futa
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
