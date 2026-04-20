import { Tipster, History, Package } from '@/types/betting';
import { api } from './apiClient';

export interface AppSettings {
  id?: string;
  telegramChannel: string;
  whatsappGroup: string;
  whatsappNumber: string;
  supportEmail: string;
  paymentNumber: string;
  paymentMethods: string[];
}

// ===================== TIPSTERS =====================
export const fetchTipsters = async (): Promise<Tipster[]> => {
  try {
    const r = await api<{ items: Tipster[] }>('/content/tipsters');
    return r.items;
  } catch { return []; }
};

export const upsertTipster = async (t: Tipster): Promise<boolean> => {
  try { await api('/content/tipsters', { method: 'POST', body: t }); return true; } catch { return false; }
};

export const deleteTipsterFromDb = async (id: number): Promise<boolean> => {
  try { await api(`/content/tipsters/${id}`, { method: 'DELETE' }); return true; } catch { return false; }
};

export const saveTipsters = async (tipsters: Tipster[]): Promise<boolean> => {
  try { await api('/content/tipsters/bulk', { method: 'PUT', body: { items: tipsters } }); return true; } catch { return false; }
};

// ===================== HISTORY =====================
export const fetchHistory = async (): Promise<History[]> => {
  try {
    const r = await api<{ items: History[] }>('/content/history');
    return r.items;
  } catch { return []; }
};

export const upsertHistory = async (h: History): Promise<boolean> => {
  try { await api('/content/history', { method: 'POST', body: h }); return true; } catch { return false; }
};

export const deleteHistoryFromDb = async (id: number): Promise<boolean> => {
  try { await api(`/content/history/${id}`, { method: 'DELETE' }); return true; } catch { return false; }
};

export const saveHistory = async (history: History[]): Promise<boolean> => {
  try { await api('/content/history/bulk', { method: 'PUT', body: { items: history } }); return true; } catch { return false; }
};

// ===================== PACKAGES =====================
export const fetchPackages = async (): Promise<Package[]> => {
  try {
    const r = await api<{ items: Package[] }>('/content/packages');
    return r.items;
  } catch { return []; }
};

export const upsertPackage = async (p: Package): Promise<boolean> => {
  try { await api('/content/packages', { method: 'POST', body: p }); return true; } catch { return false; }
};

export const deletePackageFromDb = async (id: number): Promise<boolean> => {
  try { await api(`/content/packages/${id}`, { method: 'DELETE' }); return true; } catch { return false; }
};

export const savePackages = async (packages: Package[]): Promise<boolean> => {
  try { await api('/content/packages/bulk', { method: 'PUT', body: { items: packages } }); return true; } catch { return false; }
};

// ===================== APP SETTINGS =====================
export const fetchAppSettings = async (): Promise<AppSettings | null> => {
  try {
    const r = await api<{ settings: AppSettings | null }>('/content/settings');
    return r.settings;
  } catch { return null; }
};

export const updateAppSettings = async (s: AppSettings): Promise<boolean> => {
  try { await api('/content/settings', { method: 'PUT', body: s }); return true; } catch { return false; }
};
