import { createClient } from "@supabase/supabase-js";

// Admin client for server-side operations (bypasses RLS)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Types for database tables
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  banned: boolean;
  last_login: string | null;
  login_count: number;
  notes: string;
  created_at: string;
}

export interface Session {
  token: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  added_by: string | null;
  created_at: string;
}

export interface TicketRequest {
  id: string;
  user_id: string;
  user_name: string | null;
  user_phone: string | null;
  user_email: string | null;
  tipster_id: number;
  tipster_name: string | null;
  amount: number;
  payment_number: string | null;
  payment_method: string | null;
  status: string;
  created_at: string;
}

export interface Banner {
  id: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

// Database access object
export const db = {
  users: {
    async getAll() {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone, banned, last_login, login_count, notes, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async getById(id: string) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async getByEmail(email: string) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async create(user: { id: string; name: string; email: string; phone: string; password_hash: string }) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<User>) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },

    async delete(id: string) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    async count() {
      const supabase = createAdminClient();
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  },

  sessions: {
    async create(token: string, userId: string, expiresAt: Date) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('sessions')
        .insert({ token, user_id: userId, expires_at: expiresAt.toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async validate(token: string) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async delete(token: string) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('token', token);
      if (error) throw error;
    },

    async deleteByUser(userId: string) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
    }
  },

  admins: {
    async getAll() {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async getByEmail(email: string) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .ilike('email', email)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async create(admin: { email: string; role: string; permissions: string[]; added_by?: string }) {
      const supabase = createAdminClient();
      const id = crypto.randomUUID();
      const { data, error } = await supabase
        .from('admins')
        .insert({ id, ...admin })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(email: string, updates: Partial<Admin>) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('admins')
        .update(updates)
        .ilike('email', email);
      if (error) throw error;
    },

    async delete(email: string) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('admins')
        .delete()
        .ilike('email', email);
      if (error) throw error;
    }
  },

  adminPin: {
    async get() {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('admin_pin')
        .select('pin')
        .eq('id', 'main')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data?.pin || '1234';
    },

    async update(pin: string) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('admin_pin')
        .upsert({ id: 'main', pin });
      if (error) throw error;
    }
  },

  tipsters: {
    async getAll() {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('tipsters')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return (data || []).map(t => t.data);
    },

    async upsert(id: number, tipsterData: object) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('tipsters')
        .upsert({ id, data: tipsterData, updated_at: new Date().toISOString() });
      if (error) throw error;
    },

    async delete(id: number) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('tipsters')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  history: {
    async getAll() {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('history_entries')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return (data || []).map(h => h.data);
    },

    async upsert(id: number, historyData: object) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('history_entries')
        .upsert({ id, data: historyData, updated_at: new Date().toISOString() });
      if (error) throw error;
    },

    async delete(id: number) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('history_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  packages: {
    async getAll() {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return (data || []).map(p => p.data);
    },

    async upsert(id: number, packageData: object) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('packages')
        .upsert({ id, data: packageData, updated_at: new Date().toISOString() });
      if (error) throw error;
    },

    async delete(id: number) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  settings: {
    async get() {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 'main')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data?.data || null;
    },

    async update(settings: object) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('app_settings')
        .upsert({ id: 'main', data: settings, updated_at: new Date().toISOString() });
      if (error) throw error;
    }
  },

  banners: {
    async getAll() {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },

    async create(banner: { id: string; image_url: string; sort_order?: number }) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('banners')
        .insert(banner)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  ticketRequests: {
    async getAll() {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('ticket_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async create(request: Omit<TicketRequest, 'id' | 'created_at'>) {
      const supabase = createAdminClient();
      const id = crypto.randomUUID();
      const { data, error } = await supabase
        .from('ticket_requests')
        .insert({ id, ...request })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateStatus(id: string, status: string) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('ticket_requests')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    }
  },

  unlockedTickets: {
    async getByUser(userId: string) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('unlocked_tickets')
        .select('tipster_id')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []).map(t => t.tipster_id);
    },

    async add(userId: string, tipsterId: number) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('unlocked_tickets')
        .upsert({ user_id: userId, tipster_id: tipsterId });
      if (error) throw error;
    }
  },

  notifications: {
    async getByUser(userId: string) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  }
};
