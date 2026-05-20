export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  loginCount: number;
  lastLogin: string;
  email: string;
}

export interface Ad {
  id: string;
  imageUrl: string;
  title: string;
  link?: string;
}

export interface Package {
  id: number;
  name: string;
  price: number;
  discount?: number;
}

export interface Tipster {
  id: number;
  name: string;
  category: string;
  odds: string;
  company?: string;
  avatar: string;
  code: string;
  isFree: boolean;
  expiryTime: number;
  expiryDate?: string; // ISO date string when code expires
  prices?: { name: string; p: number; discount?: number }[];
}

export interface History {
  id: number;
  title: string;
  date: string;
  result: string;
}

export interface Settings {
  dashboardImages: string[];
  telegramChannel: string;
  whatsappGroup: string;
  whatsappNumber: string;
  supportEmail: string;
  paymentNumber: string;
  paymentMethods: string[];
  packages: Package[];
  tipsters: Tipster[];
  history: History[];
  // Branding
  appName?: string;
  appTagline?: string;
  winRatePct?: string;
  membersCount?: string;
  dailyOddsCount?: string;
  testimonialText?: string;
  testimonialAuthor?: string;
  defaultTipsterAvatar?: string;
  defaultLanguage?: string;
}
