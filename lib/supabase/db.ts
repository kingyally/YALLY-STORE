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

export interface Tipster {
  id: number;
  data: {
    id: number;
    category: string;
    name: string;
    avatar: string;
    odds: string;
    code: string;
    company: string;
    isFree: boolean;
    expiryTime: number;
    expiryDate: string;
    prices: { name: string; p: number; discount: number }[];
  };
  updated_at: string;
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

export interface AppSettings {
  id: string;
  data: {
    telegramChannel?: string;
    whatsappGroup?: string;
    whatsappNumber?: string;
    supportEmail?: string;
    paymentNumber?: string;
    paymentMethods?: string[];
  };
  updated_at: string;
}
