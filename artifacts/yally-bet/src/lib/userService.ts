import { api, setToken, getToken } from './apiClient';

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface TicketRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  tipster_id: number;
  tipster_name: string;
  amount: number;
  payment_number: string;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const SESSION_KEY = 'yallybet_session';

export function loadSession(): AppUser | null {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  setToken(null);
}

function saveSession(user: AppUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Try to refresh session from server in background
export async function refreshSession(): Promise<AppUser | null> {
  if (!getToken()) return null;
  try {
    const r = await api<{ user: AppUser }>('/auth/me');
    saveSession(r.user);
    return r.user;
  } catch {
    clearSession();
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<{ user?: AppUser; error?: string }> {
  try {
    const r = await api<{ user: AppUser; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setToken(r.token);
    saveSession(r.user);
    return { user: r.user };
  } catch (e: any) {
    return { error: e?.message || 'Imeshindikana kuingia.' };
  }
}

export async function registerUser(name: string, email: string, phone: string, password: string): Promise<{ user?: AppUser; error?: string; isFirstUser?: boolean }> {
  try {
    const r = await api<{ user: AppUser; token: string }>('/auth/register', {
      method: 'POST',
      body: { name, email, phone, password },
    });
    setToken(r.token);
    saveSession(r.user);
    return { user: r.user, isFirstUser: false };
  } catch (e: any) {
    return { error: e?.message || 'Imeshindikana kusajili.' };
  }
}

export async function fetchAllUsers(): Promise<AppUser[]> {
  try {
    const r = await api<{ users: AppUser[] }>('/users');
    return r.users;
  } catch {
    return [];
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    await api(`/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
    return true;
  } catch {
    return false;
  }
}

export async function saveUnlockedTicket(_userId: string, _tipsterId: number) {
  // Server-side: unlocking happens automatically when admin approves request.
  // No-op kept for compatibility.
}

export async function loadUnlockedTickets(_userId: string): Promise<number[]> {
  try {
    const r = await api<{ tipsterIds: number[] }>('/users/me/unlocked');
    return r.tipsterIds;
  } catch {
    return [];
  }
}

export async function fetchAllTicketRequests(): Promise<TicketRequest[]> {
  try {
    const r = await api<{ requests: TicketRequest[] }>('/requests');
    return r.requests.map(x => ({ ...x, amount: Number(x.amount) }));
  } catch {
    return [];
  }
}

export async function createTicketRequest(req: Omit<TicketRequest, 'id' | 'created_at'>): Promise<TicketRequest> {
  const r = await api<{ request: TicketRequest }>('/requests', {
    method: 'POST',
    body: {
      tipster_id: req.tipster_id,
      tipster_name: req.tipster_name,
      amount: req.amount,
      payment_number: req.payment_number,
      payment_method: req.payment_method,
    },
  });
  return { ...r.request, amount: Number(r.request.amount) };
}

export async function updateTicketStatus(requestId: string, status: 'approved' | 'rejected', tipsterId?: number, userId?: string): Promise<boolean> {
  try {
    await api(`/requests/${encodeURIComponent(requestId)}/status`, {
      method: 'PUT',
      body: { status, tipsterId, userId },
    });
    return true;
  } catch {
    return false;
  }
}
