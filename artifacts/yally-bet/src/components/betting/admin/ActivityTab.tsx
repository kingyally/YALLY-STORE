import { useEffect, useState } from 'react';
import { Activity, RefreshCw, Download } from 'lucide-react';
import { fetchActivityLog, downloadExport, type ActivityEntry } from '@/lib/adminToolsService';

const actionLabels: Record<string, { label: string; color: string }> = {
  user_ban: { label: 'Mtumiaji Amefungwa', color: 'text-destructive bg-destructive/10' },
  user_unban: { label: 'Mtumiaji Amefunguliwa', color: 'text-emerald-400 bg-emerald-500/10' },
  user_notes_update: { label: 'Notes za Mtumiaji', color: 'text-blue-400 bg-blue-500/10' },
  broadcast_send: { label: 'Tangazo Limetumwa', color: 'text-violet-400 bg-violet-500/10' },
  quick_approve_all: { label: 'Maombi Yote Yameidhinishwa', color: 'text-emerald-400 bg-emerald-500/10' },
  export_csv: { label: 'CSV Export', color: 'text-amber-400 bg-amber-500/10' },
};

export function ActivityTab() {
  const [list, setList] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); setList(await fetchActivityLog(200)); setLoading(false); };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity size={14} className="text-primary" />
          <h4 className="text-[11px] font-black uppercase tracking-wider">Activity Log ({list.length})</h4>
        </div>
        <div className="flex gap-1.5">
          <button onClick={load} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-secondary/50 text-[10px] font-bold uppercase">
            <RefreshCw size={11} />
          </button>
          <button onClick={() => downloadExport('activity')} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase">
            <Download size={11} /> CSV
          </button>
        </div>
      </div>

      {loading ? <div className="text-center py-6"><div className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div> :
        list.length === 0 ? <div className="text-center py-6 text-[11px] text-muted-foreground">Hakuna activities bado</div> :
        <div className="space-y-1.5">
          {list.map((e) => {
            const cfg = actionLabels[e.action] || { label: e.action, color: 'text-muted-foreground bg-secondary/30' };
            return (
              <div key={e.id} className="bg-card/40 border border-border/40 rounded-xl p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>
                    <div className="text-[11px] font-bold text-foreground mt-1 truncate">{e.actor_email || 'system'}</div>
                    {e.target_id && <div className="text-[9px] text-muted-foreground/70 mt-0.5">→ {e.target_type}: {e.target_id}</div>}
                    {e.details && Object.keys(e.details).length > 0 && (
                      <div className="text-[9px] text-muted-foreground/60 mt-0.5">
                        {Object.entries(e.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </div>
                    )}
                  </div>
                  <div className="text-[9px] text-muted-foreground/60 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}
