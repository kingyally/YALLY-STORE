export type AdminPermission = 'requests' | 'tipsters' | 'history' | 'settings' | 'all' | 'users' | 'banners' | 'packages' | 'admins';

export const ALL_PERMISSIONS: AdminPermission[] = ['requests', 'tipsters', 'history', 'settings', 'users', 'banners', 'packages', 'admins'];

export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  requests: 'Maombi ya Malipo',
  tipsters: 'Tipsters',
  history: 'Historia',
  settings: 'Mipangilio',
  all: 'Kila Kitu',
  users: 'Watumiaji',
  banners: 'Mabango',
  packages: 'Mafurushi',
  admins: 'Wasimamizi',
};

export interface AdminEntry {
  id: string;
  email: string;
  role: string;
  permissions: AdminPermission[];
  added_by: string;
  created_at: string;
}

const ADMINS_KEY = 'yallybet_admins';
const ADMIN_PIN_KEY = 'yallybet_admin_pin';

function getAdminsLocal(): AdminEntry[] {
  try {
    return JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAdminsLocal(admins: AdminEntry[]) {
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

export async function fetchAdmins(): Promise<AdminEntry[]> {
  return getAdminsLocal();
}

export async function getAdminEntry(email: string): Promise<AdminEntry | null> {
  const admins = getAdminsLocal();
  return admins.find(a => a.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function isAdmin(email: string): Promise<boolean> {
  const entry = await getAdminEntry(email);
  return !!entry;
}

export async function addAdmin(email: string, addedBy: string, permissions: AdminPermission[] = ['requests']): Promise<{ success: boolean; error?: string }> {
  const admins = getAdminsLocal();
  if (admins.find(a => a.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'Email hii ipo tayari!' };
  }
  const entry: AdminEntry = {
    id: `admin_${Date.now()}`,
    email: email.toLowerCase(),
    role: 'admin',
    permissions,
    added_by: addedBy,
    created_at: new Date().toISOString(),
  };
  admins.push(entry);
  saveAdminsLocal(admins);
  return { success: true };
}

export async function updateAdminPermissions(adminId: string, permissions: AdminPermission[]): Promise<boolean> {
  const admins = getAdminsLocal();
  const idx = admins.findIndex(a => a.id === adminId);
  if (idx === -1) return false;
  admins[idx].permissions = permissions;
  saveAdminsLocal(admins);
  return true;
}

export async function removeAdmin(adminId: string): Promise<boolean> {
  const admins = getAdminsLocal();
  saveAdminsLocal(admins.filter(a => a.id !== adminId));
  return true;
}

export function getAdminPin(): string {
  return localStorage.getItem(ADMIN_PIN_KEY) || '1234';
}

export function setAdminPin(pin: string) {
  localStorage.setItem(ADMIN_PIN_KEY, pin);
}

export function verifyAdminPin(pin: string): boolean {
  return getAdminPin() === pin;
}
