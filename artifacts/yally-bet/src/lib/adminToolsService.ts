import { api, getToken } from './apiClient';

export interface AdminStats {
  users: { total: number; today: number; week: number; banned: number; activeNow: number };
  requests: { total: number; pending: number; approved: number };
  revenue: { total: number; today: number; week: number };
  payments: { success: number; pending: number };
  topTipsters: Array<{ tipster_name: string; unlocks: number; revenue: number }>;
  dailyChart: Array<{ day: string; users: number; revenue: number; requests: number }>;
}

export interface EnhancedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  banned: boolean;
  last_login: string | null;
  login_count: number;
  notes: string;
  created_at: string;
}

export interface UserDetails {
  user: EnhancedUser;
  requests: any[];
  unlocked: any[];
  payments: any[];
  totalSpent: number;
}

export interface Broadcast {
  id: number;
  title: string;
  message: string;
  audience: string;
  sent_by: string;
  sent_count: number;
  created_at: string;
}

export interface ActivityEntry {
  id: number;
  actor_email: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  created_at: string;
}

export interface UserNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export async function fetchAdminStats(): Promise<AdminStats | null> {
  try { return await api<AdminStats>('/admin-tools/stats'); } catch { return null; }
}

export async function fetchEnhancedUsers(search = '', filter: 'all' | 'active' | 'banned' | 'new' = 'all'): Promise<EnhancedUser[]> {
  try {
    const q = new URLSearchParams({ search, filter }).toString();
    const r = await api<{ users: EnhancedUser[] }>(`/admin-tools/users-enhanced?${q}`);
    return r.users;
  } catch { return []; }
}

export async function fetchUserDetails(id: string): Promise<UserDetails | null> {
  try { return await api<UserDetails>(`/admin-tools/users/${encodeURIComponent(id)}/details`); } catch { return null; }
}

export async function setUserBanned(id: string, banned: boolean): Promise<boolean> {
  try { await api(`/admin-tools/users/${encodeURIComponent(id)}/ban`, { method: 'PUT', body: { banned } }); return true; } catch { return false; }
}

export async function setUserNotes(id: string, notes: string): Promise<boolean> {
  try { await api(`/admin-tools/users/${encodeURIComponent(id)}/notes`, { method: 'PUT', body: { notes } }); return true; } catch { return false; }
}

export async function fetchBroadcasts(): Promise<Broadcast[]> {
  try { const r = await api<{ broadcasts: Broadcast[] }>('/admin-tools/broadcasts'); return r.broadcasts; } catch { return []; }
}

export async function sendBroadcast(title: string, message: string, audience: 'all' | 'vip' | 'new'): Promise<{ ok: boolean; sentCount?: number; error?: string }> {
  try {
    const r = await api<{ ok: boolean; sentCount: number }>('/admin-tools/broadcasts', { method: 'POST', body: { title, message, audience } });
    return { ok: true, sentCount: r.sentCount };
  } catch (e: any) { return { ok: false, error: e?.message ?? 'Imeshindikana' }; }
}

export async function deleteBroadcast(id: number): Promise<boolean> {
  try { await api(`/admin-tools/broadcasts/${id}`, { method: 'DELETE' }); return true; } catch { return false; }
}

export async function fetchActivityLog(limit = 100): Promise<ActivityEntry[]> {
  try { const r = await api<{ entries: ActivityEntry[] }>(`/admin-tools/activity-log?limit=${limit}`); return r.entries; } catch { return []; }
}

export async function quickApproveAllPending(): Promise<{ ok: boolean; approved?: number }> {
  try { const r = await api<{ ok: boolean; approved: number }>('/admin-tools/quick/approve-all-pending', { method: 'POST' }); return r; } catch { return { ok: false }; }
}

export async function fetchMyNotifications(): Promise<UserNotification[]> {
  try { const r = await api<{ notifications: UserNotification[] }>('/admin-tools/notifications/me'); return r.notifications; } catch { return []; }
}

export async function markAllNotificationsRead(): Promise<boolean> {
  try { await api('/admin-tools/notifications/me/read', { method: 'POST' }); return true; } catch { return false; }
}

export async function downloadExport(type: 'users' | 'requests' | 'payments' | 'activity'): Promise<void> {
  const token = getToken() || '';
  const res = await fetch(`/api/admin-tools/export/${type}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
