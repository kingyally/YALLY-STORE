import { Tipster, History, Package } from '@/types/betting';
import { DEFAULT_SETTINGS } from '@/constants/betting';

const TIPSTERS_KEY = 'yallybet_tipsters';
const HISTORY_KEY = 'yallybet_history';
const PACKAGES_KEY = 'yallybet_packages';
const SETTINGS_KEY = 'yallybet_appsettings';

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
    const data = localStorage.getItem(TIPSTERS_KEY);
    if (!data) return [];
    return JSON.parse(data) as Tipster[];
  } catch {
    return [];
  }
};

export const upsertTipster = async (t: Tipster): Promise<boolean> => {
  const tipsters = await fetchTipsters();
  const idx = tipsters.findIndex(x => x.id === t.id);
  if (idx !== -1) tipsters[idx] = t;
  else tipsters.push(t);
  localStorage.setItem(TIPSTERS_KEY, JSON.stringify(tipsters));
  return true;
};

export const deleteTipsterFromDb = async (id: number): Promise<boolean> => {
  const tipsters = await fetchTipsters();
  localStorage.setItem(TIPSTERS_KEY, JSON.stringify(tipsters.filter(t => t.id !== id)));
  return true;
};

export const saveTipsters = async (tipsters: Tipster[]): Promise<boolean> => {
  localStorage.setItem(TIPSTERS_KEY, JSON.stringify(tipsters));
  return true;
};

// ===================== HISTORY =====================

export const fetchHistory = async (): Promise<History[]> => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data) as History[];
  } catch {
    return [];
  }
};

export const upsertHistory = async (h: History): Promise<boolean> => {
  const history = await fetchHistory();
  const idx = history.findIndex(x => x.id === h.id);
  if (idx !== -1) history[idx] = h;
  else history.push(h);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return true;
};

export const deleteHistoryFromDb = async (id: number): Promise<boolean> => {
  const history = await fetchHistory();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.filter(h => h.id !== id)));
  return true;
};

export const saveHistory = async (history: History[]): Promise<boolean> => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return true;
};

// ===================== PACKAGES =====================

export const fetchPackages = async (): Promise<Package[]> => {
  try {
    const data = localStorage.getItem(PACKAGES_KEY);
    if (!data) return [];
    return JSON.parse(data) as Package[];
  } catch {
    return [];
  }
};

export const upsertPackage = async (p: Package): Promise<boolean> => {
  const packages = await fetchPackages();
  const idx = packages.findIndex(x => x.id === p.id);
  if (idx !== -1) packages[idx] = p;
  else packages.push(p);
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
  return true;
};

export const deletePackageFromDb = async (id: number): Promise<boolean> => {
  const packages = await fetchPackages();
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages.filter(p => p.id !== id)));
  return true;
};

export const savePackages = async (packages: Package[]): Promise<boolean> => {
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
  return true;
};

// ===================== APP SETTINGS =====================

export const fetchAppSettings = async (): Promise<AppSettings | null> => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return null;
    return JSON.parse(data) as AppSettings;
  } catch {
    return null;
  }
};

export const updateAppSettings = async (s: AppSettings): Promise<boolean> => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  return true;
};
