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

const USERS_KEY = 'yallybet_users';
const SESSION_KEY = 'yallybet_session';
const UNLOCKED_KEY = 'yallybet_unlocked';
const REQUESTS_KEY = 'yallybet_requests';

function getUsersLocal(): AppUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsersLocal(users: AppUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

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
}

export async function loginUser(phone: string, password: string): Promise<{ user?: AppUser; error?: string }> {
  const users = getUsersLocal();
  const user = users.find(u => u.phone === phone);
  if (!user) return { error: 'Nambari hii haijasajiliwa.' };
  const stored = localStorage.getItem(`yallybet_pw_${user.id}`);
  if (stored !== password) return { error: 'Nywila si sahihi.' };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { user };
}

export async function registerUser(name: string, phone: string, email: string, password: string): Promise<{ user?: AppUser; error?: string }> {
  const users = getUsersLocal();
  if (users.find(u => u.phone === phone)) return { error: 'Nambari hii imeshatumika.' };
  const user: AppUser = {
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name, phone, email,
    created_at: new Date().toISOString(),
  };
  users.push(user);
  saveUsersLocal(users);
  localStorage.setItem(`yallybet_pw_${user.id}`, password);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { user };
}

export async function fetchAllUsers(): Promise<AppUser[]> {
  return getUsersLocal();
}

export async function deleteUser(userId: string): Promise<boolean> {
  const users = getUsersLocal();
  saveUsersLocal(users.filter(u => u.id !== userId));
  localStorage.removeItem(`yallybet_pw_${userId}`);
  localStorage.removeItem(`yallybet_unlocked_${userId}`);
  return true;
}

export async function saveUnlockedTicket(userId: string, tipsterId: number) {
  const tickets = await loadUnlockedTickets(userId);
  if (!tickets.includes(tipsterId)) {
    tickets.push(tipsterId);
    localStorage.setItem(`${UNLOCKED_KEY}_${userId}`, JSON.stringify(tickets));
  }
}

export async function loadUnlockedTickets(userId: string): Promise<number[]> {
  try {
    return JSON.parse(localStorage.getItem(`${UNLOCKED_KEY}_${userId}`) || '[]');
  } catch {
    return [];
  }
}

function getRequests(): TicketRequest[] {
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export async function fetchAllTicketRequests(): Promise<TicketRequest[]> {
  return getRequests().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createTicketRequest(req: Omit<TicketRequest, 'id' | 'created_at'>): Promise<TicketRequest> {
  const requests = getRequests();
  const newReq: TicketRequest = {
    ...req,
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    created_at: new Date().toISOString(),
  };
  requests.push(newReq);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  return newReq;
}

export async function updateTicketStatus(requestId: string, status: 'approved' | 'rejected', tipsterId?: number, userId?: string): Promise<boolean> {
  const requests = getRequests();
  const idx = requests.findIndex(r => r.id === requestId);
  if (idx === -1) return false;
  requests[idx].status = status;
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  if (status === 'approved' && tipsterId && userId) {
    await saveUnlockedTicket(userId, tipsterId);
  }
  return true;
}
