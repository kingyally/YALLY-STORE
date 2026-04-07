import { Tipster } from '@/types/betting';
import heroBanner from '@/assets/hero-banner.jpg';
import banner2 from '@/assets/banner-2.jpg';
import banner3 from '@/assets/banner-3.jpg';
import tipster1 from '@/assets/tipster-1.jpg';
import tipster2 from '@/assets/tipster-2.jpg';

export const ADMIN_USERNAME = "etmmax2536";

export const CATEGORIES = ['VIP TICKET', 'FIXED GAME', 'CORRECT SCORE'];

export const TIPSTERS: Tipster[] = [
  { id: 1, category: "VIP TICKET", name: "Coach Mwamba", avatar: tipster1, odds: "15.50", code: "BET-7X9K2", company: "Dbet", isFree: false, expiryTime: 11000, expiryDate: "2026-04-04T23:59:00", prices: [{name: "Siku 1", p: 1500, discount: 0}] },
  { id: 2, category: "VIP TICKET", name: "Boss Kelvin", avatar: tipster2, odds: "18.20", code: "BET-M4P8L", company: "Sportbety", isFree: false, expiryTime: 12000, expiryDate: "2026-04-04T23:59:00", prices: [{name: "Siku 1", p: 2000, discount: 0}] },
  { id: 3, category: "VIP TICKET", name: "Pro Danny", avatar: tipster1, odds: "22.00", code: "BET-R6T3W", company: "BetPawa", isFree: false, expiryTime: 13000, expiryDate: "2026-04-05T18:00:00", prices: [{name: "Siku 1", p: 2500, discount: 0}] },
  { id: 4, category: "VIP TICKET", name: "King Amos", avatar: tipster2, odds: "25.00", code: "BET-N1Y5H", company: "1win", isFree: false, expiryTime: 14000, expiryDate: "2026-04-05T20:00:00", prices: [{name: "Siku 1", p: 3000, discount: 0}] },
  { id: 5, category: "FIXED GAME", name: "Fixed Master", avatar: tipster1, odds: "85.00", code: "FIX-Q8J2V", company: "Paripesa", isFree: false, expiryTime: 10500, expiryDate: "2026-04-04T22:00:00", prices: [{name: "Siku 1", p: 3000, discount: 500}] },
  { id: 6, category: "FIXED GAME", name: "Sure Bet Pro", avatar: tipster2, odds: "95.00", code: "FIX-D5K9M", company: "TOPBET", isFree: false, expiryTime: 11500, expiryDate: "2026-04-05T15:00:00", prices: [{name: "Siku 1", p: 3500, discount: 500}] },
  { id: 7, category: "FIXED GAME", name: "Golden Tips", avatar: tipster1, odds: "110.0", code: "FIX-A7P4R", company: "Dbet", isFree: false, expiryTime: 12500, expiryDate: "2026-04-06T12:00:00", prices: [{name: "Siku 1", p: 4000, discount: 500}] },
  { id: 8, category: "FIXED GAME", name: "Mega Win", avatar: tipster2, odds: "150.0", code: "FIX-C3X8Z", company: "Sportbety", isFree: false, expiryTime: 13500, expiryDate: "2026-04-06T18:00:00", prices: [{name: "Siku 1", p: 5000, discount: 500}] },
  { id: 9, category: "CORRECT SCORE", name: "CS King", avatar: tipster1, odds: "250.0", code: "CS-B6N2F", company: "BetPawa", isFree: false, expiryTime: 10000, expiryDate: "2026-04-04T21:00:00", prices: [{name: "Siku 1", p: 25000, discount: 2000}] },
  { id: 10, category: "CORRECT SCORE", name: "Score Expert", avatar: tipster2, odds: "300.0", code: "CS-H4W7T", company: "1win", isFree: false, expiryTime: 11000, expiryDate: "2026-04-05T19:00:00", prices: [{name: "Siku 1", p: 28000, discount: 2000}] },
  { id: 11, category: "CORRECT SCORE", name: "Predict Pro", avatar: tipster1, odds: "350.0", code: "CS-L9E5G", company: "Paripesa", isFree: false, expiryTime: 12000, expiryDate: "2026-04-06T16:00:00", prices: [{name: "Siku 1", p: 30000, discount: 2000}] },
  { id: 12, category: "CORRECT SCORE", name: "Yally CS", avatar: tipster2, odds: "400.0", code: "CS-U2R8K", company: "TOPBET", isFree: false, expiryTime: 13000, expiryDate: "2026-04-07T14:00:00", prices: [{name: "Siku 1", p: 35000, discount: 2000}] },
  
];

export const DEFAULT_SETTINGS = {
  dashboardImages: [heroBanner, banner2, banner3],
  telegramChannel: "https://t.me/yallybetting",
  whatsappGroup: "https://chat.whatsapp.com/yallyvip",
  whatsappNumber: "255765902829",
  supportEmail: "support@yallybet.co.tz",
  paymentNumber: "0765 902 829",
  paymentMethods: ["M-PESA", "TIGO PESA", "AIRTEL MONEY"],
  packages: [
    { id: 1, name: "Daily VIP", price: 5000 },
    { id: 2, name: "Weekly VIP", price: 25000, discount: 5000 },
    { id: 3, name: "Monthly VIP", price: 80000, discount: 20000 },
  ],
  tipsters: TIPSTERS,
  history: [
    { id: 1, title: "Arsenal vs Chelsea - VIP TICKET", date: "2026-04-02", result: "WON" },
    { id: 2, title: "Man City vs Liverpool - FIXED", date: "2026-04-02", result: "WON" },
    { id: 3, title: "Barcelona 2:1 Real Madrid", date: "2026-04-01", result: "WON" },
    { id: 4, title: "PSG vs Bayern - VIP TICKET", date: "2026-04-01", result: "WON" },
    { id: 5, title: "Inter vs Juventus - FIXED", date: "2026-03-31", result: "WON" },
    { id: 6, title: "Napoli vs Roma - Free Odds", date: "2026-03-31", result: "LOST" },
    { id: 7, title: "Simba vs Yanga - VIP TICKET", date: "2026-03-30", result: "WON" },
    { id: 8, title: "Dortmund 3:1 Leverkusen", date: "2026-03-30", result: "WON" },
  ],
};
