import { api } from './apiClient';

export type AdminPermission = 'requests' | 'buying' | 'tipsters' | 'history' | 'settings' | 'all' | 'users' | 'banners' | 'packages' | 'admins' | 'broadcasts' | 'activity';

export const ALL_PERMISSIONS: AdminPermission[] = ['requests', 'buying', 'tipsters', 'history', 'settings', 'users', 'banners', 'packages', 'admins', 'broadcasts', 'activity'];

export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  requests: 'Maombi ya Malipo',
  buying: 'Manunuzi (Buying)',
  tipsters: 'Tipsters',
  history: 'Historia',
  settings: 'Mipangilio',
  all: 'Kila Kitu',
  users: 'Watumiaji',
  banners: 'Mabango',
  packages: 'Mafurushi',
  admins: 'Wasimamizi',
  broadcasts: 'Matangazo',
  activity: 'Activity Log',
};

export interface AdminEntry {
  id: string;
  email: string;
  role: string;
  permissions: AdminPermission[];
  added_by: string;
  created_at: string;
}

export async function fetchAdmins(): Promise<AdminEntry[]> {
  try {
    const r = await api<{ admins: AdminEntry[] }>('/admins');
    return r.admins;
  } catch {
    return [];
  }
}

export async function getAdminEntry(email: string): Promise<AdminEntry | null> {
  const list = await fetchAdmins();
  return list.find(a => a.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function isAdmin(email: string): Promise<boolean> {
  const e = await getAdminEntry(email);
  return !!e;
}

export async function addAdmin(email: string, addedBy: string, permissions: AdminPermission[] = ['requests']): Promise<{ success: boolean; error?: string }> {
  try {
    await api('/admins', { method: 'POST', body: { email, addedBy, permissions } });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Imeshindikana' };
  }
}

export async function updateAdminPermissions(adminId: string, permissions: AdminPermission[]): Promise<boolean> {
  try {
    await api(`/admins/${encodeURIComponent(adminId)}/permissions`, { method: 'PUT', body: { permissions } });
    return true;
  } catch {
    return false;
  }
}

export async function removeAdmin(adminId: string): Promise<boolean> {
  try {
    await api(`/admins/${encodeURIComponent(adminId)}`, { method: 'DELETE' });
    return true;
  } catch {
    return false;
  }
}

let pinCache: string | null = null;

export async function loadAdminPin(): Promise<string> {
  try {
    const r = await api<{ pin: string }>('/admins/pin');
    pinCache = r.pin;
    return r.pin;
  } catch {
    return pinCache ?? '1234';
  }
}

export function getAdminPin(): string {
  return pinCache ?? '1234';
}

export async function setAdminPin(pin: string): Promise<boolean> {
  try {
    await api('/admins/pin', { method: 'PUT', body: { pin } });
    pinCache = pin;
    return true;
  } catch {
    return false;
  }
}

export function verifyAdminPin(pin: string): boolean {
  return (pinCache ?? '1234') === pin;
}
