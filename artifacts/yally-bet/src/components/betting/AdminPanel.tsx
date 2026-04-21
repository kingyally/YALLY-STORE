import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, X, Save, Plus, Trash2, Edit2, UserCog, Image as ImageIcon, Upload,
  History as HistoryIcon, Settings as SettingsIcon, Package, ChevronLeft,
  CheckCircle, XCircle, Crown, Lock, Target, Zap, Users, Eye, Mail, Phone, ShieldCheck, Clock, Ticket,
  Search, MoreVertical, Activity, TrendingUp, AlertCircle, RefreshCw, ToggleLeft, ToggleRight,
  LayoutDashboard, DollarSign, BarChart3, Trophy, ShoppingBag
} from 'lucide-react';
import { fetchBanners, uploadBannerImage, addBanner as addBannerToDb, updateBanner as updateBannerInDb, deleteBanner as deleteBannerFromDb, type Banner } from '@/lib/bannerService';
import { Settings, Tipster, History as HistoryType } from '@/types/betting';
import { CATEGORIES } from '@/constants/betting';
import { fetchAllUsers, deleteUser as deleteUserFromDb, AppUser, fetchAllTicketRequests, updateTicketStatus, TicketRequest } from '@/lib/userService';
import { fetchAdmins, addAdmin, removeAdmin, updateAdminPermissions, AdminEntry, ALL_PERMISSIONS, PERMISSION_LABELS, type AdminPermission } from '@/lib/adminService';
import { fetchTipsters, upsertTipster, deleteTipsterFromDb, fetchHistory, upsertHistory, deleteHistoryFromDb, fetchPackages, upsertPackage, deletePackageFromDb, fetchAppSettings, updateAppSettings, type AppSettings } from '@/lib/settingsService';

interface AdminPanelProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
  onExit: () => void;
  adminEntry: AdminEntry;
}

type AdminTab = 'dashboard' | 'users' | 'requests' | 'buying' | 'tipsters' | 'history' | 'settings' | 'packages' | 'banners' | 'admins';

// Stat card component
const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string | number; color?: string }> = ({ icon: Icon, label, value, color = 'primary' }) => (
  <div className="glass rounded-2xl p-3 flex items-center gap-3 flex-1 min-w-0">
    <div className={`p-2.5 rounded-xl bg-${color}/10 border border-${color}/20`}>
      <Icon size={16} className={`text-${color}`} />
    </div>
    <div className="min-w-0">
      <p className="text-lg font-black tracking-tight">{value}</p>
      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate">{label}</p>
    </div>
  </div>
);

// Section header component
const SectionHeader: React.FC<{ title: string; count?: number; onAction?: () => void; actionLabel?: string; actionIcon?: React.ElementType; loading?: boolean; onRefresh?: () => void }> = ({
  title, count, onAction, actionLabel, actionIcon: ActionIcon, loading, onRefresh
}) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <h2 className="text-base font-black uppercase tracking-tight">{title}</h2>
      {count !== undefined && (
        <span className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
    <div className="flex items-center gap-2">
      {onRefresh && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <RefreshCw size={14} className={`text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      )}
      {onAction && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-primary/15 transition-colors border border-primary/20"
        >
          {ActionIcon && <ActionIcon size={12} />}
          {actionLabel}
        </motion.button>
      )}
    </div>
  </div>
);

// Empty state component
const EmptyState: React.FC<{ icon: React.ElementType; message: string }> = ({ icon: Icon, message }) => (
  <div className="glass rounded-2xl p-10 text-center space-y-3">
    <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto">
      <Icon size={24} className="text-muted-foreground/50" />
    </div>
    <p className="text-sm text-muted-foreground/70 font-medium">{message}</p>
  </div>
);

const Loader = () => (
  <div className="flex justify-center py-12">
    <div className="w-7 h-7 border-[2.5px] border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

export const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onUpdateSettings, onExit, adminEntry }) => {
  const isSuperAdmin = adminEntry.role === 'super_admin';
  const myPermissions = isSuperAdmin ? [...ALL_PERMISSIONS] : adminEntry.permissions;
  const firstTab = (isSuperAdmin ? 'dashboard' : myPermissions[0] || 'requests') as AdminTab;
  const [activeTab, setActiveTab] = useState<AdminTab>(firstTab);
  const [localSettings, setLocalSettings] = useState<Settings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [editingTipster, setEditingTipster] = useState<Tipster | null>(null);
  const [editingHistory, setEditingHistory] = useState<HistoryType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [adminList, setAdminList] = useState<AdminEntry[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [ticketRequests, setTicketRequests] = useState<TicketRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerList, setBannerList] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [loadingTipsters, setLoadingTipsters] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [dbAppSettings, setDbAppSettings] = useState<AppSettings | null>(null);
  const bannerFileRef = React.useRef<HTMLInputElement>(null);

  const loadTipstersFromDb = async () => {
    setLoadingTipsters(true);
    const tips = await fetchTipsters();
    setLocalSettings(prev => ({ ...prev, tipsters: tips }));
    setLoadingTipsters(false);
  };

  const loadHistoryFromDb = async () => {
    setLoadingHistory(true);
    const hist = await fetchHistory();
    setLocalSettings(prev => ({ ...prev, history: hist }));
    setLoadingHistory(false);
  };

  const loadPackagesFromDb = async () => {
    setLoadingPackages(true);
    const pkgs = await fetchPackages();
    setLocalSettings(prev => ({ ...prev, packages: pkgs }));
    setLoadingPackages(false);
  };

  const loadAppSettings = async () => {
    const s = await fetchAppSettings();
    if (s) {
      setDbAppSettings(s);
      setLocalSettings(prev => ({
        ...prev,
        telegramChannel: s.telegramChannel,
        whatsappGroup: s.whatsappGroup,
        whatsappNumber: s.whatsappNumber,
        supportEmail: s.supportEmail,
        paymentNumber: s.paymentNumber,
        paymentMethods: s.paymentMethods,
      }));
    }
  };

  useEffect(() => {
    loadUsers();
    loadAdmins();
    loadRequests();
    loadBanners();
    loadTipstersFromDb();
    loadHistoryFromDb();
    loadPackagesFromDb();
    loadAppSettings();
  }, []);


  const loadUsers = async () => { setLoadingUsers(true); setAllUsers(await fetchAllUsers()); setLoadingUsers(false); };
  const loadRequests = async () => { setLoadingRequests(true); setTicketRequests(await fetchAllTicketRequests()); setLoadingRequests(false); };
  const loadAdmins = async () => { setLoadingAdmins(true); setAdminList(await fetchAdmins()); setLoadingAdmins(false); };
  const loadBanners = async () => { setLoadingBanners(true); setBannerList(await fetchBanners()); setLoadingBanners(false); };

  const getBannerPublicUrl = (banner: Banner) => {
    if (!banner.image_url || banner.image_url.startsWith('default_')) return '';
    return banner.image_url;
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    const path = await uploadBannerImage(file);
    if (path) {
      await addBannerToDb(path, bannerList.length);
      await loadBanners();
    }
    setUploadingBanner(false);
    if (bannerFileRef.current) bannerFileRef.current.value = '';
  };

  const handleAddBannerUrl = async () => {
    const url = prompt('Weka URL ya picha:');
    if (url?.trim()) {
      await addBannerToDb(url.trim(), bannerList.length);
      await loadBanners();
    }
  };

  const handleToggleBanner = async (banner: Banner) => {
    await updateBannerInDb(banner.id, { active: !banner.active });
    await loadBanners();
  };

  const handleDeleteBanner = async (banner: Banner) => {
    if (!confirm('Futa banner hii?')) return;
    await deleteBannerFromDb(banner.id, banner.image_url);
    await loadBanners();
  };

  const handleApprove = async (ticketId: string) => {
    if (await updateTicketStatus(ticketId, 'approved'))
      setTicketRequests(prev => prev.map(r => r.id === ticketId ? { ...r, status: 'approved' } : r));
  };
  const handleReject = async (ticketId: string) => {
    if (await updateTicketStatus(ticketId, 'rejected'))
      setTicketRequests(prev => prev.map(r => r.id === ticketId ? { ...r, status: 'rejected' } : r));
  };

  const [newAdminPermissions, setNewAdminPermissions] = useState<AdminPermission[]>(['requests']);

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setAddingAdmin(true);
    const result = await addAdmin(newAdminEmail.trim(), adminEntry.email, newAdminPermissions);
    if (result.success) { setNewAdminEmail(''); setNewAdminPermissions(['requests']); await loadAdmins(); }
    setAddingAdmin(false);
  };

  const handleRemoveAdmin = async (adminId: string, email: string) => {
    if (!confirm(`Ondoa ${email} kama admin?`)) return;
    if (await removeAdmin(adminId)) setAdminList(prev => prev.filter(a => a.id !== adminId));
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Futa ${userName}?`)) return;
    if (await deleteUserFromDb(userId)) setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Save settings to DB
    if (dbAppSettings?.id) {
      await updateAppSettings({
        id: dbAppSettings.id,
        telegramChannel: localSettings.telegramChannel,
        whatsappGroup: localSettings.whatsappGroup,
        whatsappNumber: localSettings.whatsappNumber,
        supportEmail: localSettings.supportEmail,
        paymentNumber: localSettings.paymentNumber,
        paymentMethods: localSettings.paymentMethods,
      });
    }
    onUpdateSettings(localSettings);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const allTabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Watumiaji', icon: Users },
    { id: 'requests', label: 'Maombi', icon: Ticket },
    { id: 'buying', label: 'Manunuzi', icon: ShoppingBag },
    { id: 'admins', label: 'Admins', icon: ShieldCheck },
    { id: 'tipsters', label: 'Tipsters', icon: UserCog },
    { id: 'history', label: 'Historia', icon: HistoryIcon },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const tabs = allTabs.filter(tab =>
    tab.id === 'dashboard' ? isSuperAdmin : myPermissions.includes(tab.id as AdminPermission)
  );

  // Tipster helpers
  const addTipster = () => {
    const newId = Math.max(0, ...localSettings.tipsters.map(t => t.id)) + 1;
    setEditingTipster({
      id: newId, name: 'Tipster Mpya', category: 'VIP TICKET', odds: '10.00',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      code: `TIP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      isFree: false, expiryTime: 12000,
      prices: [{ name: 'Siku 1', p: 2000, discount: 0 }],
    });
  };

  const saveTipster = async (t: Tipster) => {
    await upsertTipster(t);
    const tips = await fetchTipsters();
    setLocalSettings(prev => ({ ...prev, tipsters: tips }));
    onUpdateSettings({ ...localSettings, tipsters: tips });
    setEditingTipster(null);
  };

  const deleteTipster = async (id: number) => {
    await deleteTipsterFromDb(id);
    const tips = await fetchTipsters();
    setLocalSettings(prev => ({ ...prev, tipsters: tips }));
    onUpdateSettings({ ...localSettings, tipsters: tips });
  };

  const addHistory = () => {
    const newId = Math.max(0, ...localSettings.history.map(h => h.id)) + 1;
    setEditingHistory({ id: newId, title: '', date: new Date().toISOString().split('T')[0], result: 'WON' });
  };

  const saveHistory = async (h: HistoryType) => {
    await upsertHistory(h);
    const hist = await fetchHistory();
    setLocalSettings(prev => ({ ...prev, history: hist }));
    onUpdateSettings({ ...localSettings, history: hist });
    setEditingHistory(null);
  };

  const deleteHistory = async (id: number) => {
    await deleteHistoryFromDb(id);
    const hist = await fetchHistory();
    setLocalSettings(prev => ({ ...prev, history: hist }));
    onUpdateSettings({ ...localSettings, history: hist });
  };

  const addPackage = async () => {
    const newId = Math.max(0, ...localSettings.packages.map(p => p.id)) + 1;
    const pkg = { id: newId, name: 'Package Mpya', price: 5000, discount: 0 };
    await upsertPackage(pkg);
    const pkgs = await fetchPackages();
    setLocalSettings(prev => ({ ...prev, packages: pkgs }));
    onUpdateSettings({ ...localSettings, packages: pkgs });
  };

  const handleUpdatePackage = async (id: number, field: string, value: string | number) => {
    const pkg = localSettings.packages.find(p => p.id === id);
    if (!pkg) return;
    const updated = { ...pkg, [field]: value };
    const newPkgs = localSettings.packages.map(p => p.id === id ? updated : p);
    setLocalSettings(prev => ({ ...prev, packages: newPkgs }));
    await upsertPackage(updated);
    onUpdateSettings({ ...localSettings, packages: newPkgs });
  };

  const deletePackage = async (id: number) => {
    await deletePackageFromDb(id);
    const pkgs = await fetchPackages();
    setLocalSettings(prev => ({ ...prev, packages: pkgs }));
    onUpdateSettings({ ...localSettings, packages: pkgs });
  };

  // Banner functions moved to bannerService.ts

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'VIP TICKET': return <Crown size={14} className="text-amber-400" />;
      case 'FIXED GAME': return <Lock size={14} className="text-primary" />;
      case 'CORRECT SCORE': return <Target size={14} className="text-rose-400" />;
      case 'FREE ODDS': return <Zap size={14} className="text-blue-400" />;
      default: return null;
    }
  };

  const pendingCount = ticketRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/30">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={onExit} className="p-2 rounded-xl hover:bg-secondary/80 transition-colors">
              <ChevronLeft size={20} className="text-muted-foreground" />
            </motion.button>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-xl border border-destructive/20">
                <Shield className="text-destructive" size={18} />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-tight">Admin Panel</h1>
                <p className="text-[8px] text-muted-foreground/60 font-bold uppercase tracking-[0.2em]">Yally Control</p>
              </div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black rounded-xl text-[10px] uppercase tracking-wider disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </motion.button>
        </div>

        {/* Tab bar */}
        <div className="px-3 py-2 flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
                {tab.id === 'requests' && pendingCount > 0 && (
                  <span className={`ml-0.5 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center ${
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </header>

      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            className="absolute top-[120px] left-4 right-4 z-50 bg-primary/10 border border-primary/20 rounded-2xl p-3.5 flex items-center gap-2.5 backdrop-blur-xl"
          >
            <CheckCircle size={18} className="text-primary" />
            <span className="text-xs font-bold text-primary">Imehifadhiwa vizuri!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-1">
        <AnimatePresence mode="wait">
          {/* =================== DASHBOARD TAB =================== */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Stats Grid 2x3 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-black">{allUsers.length}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Watumiaji</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Activity size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-black">{allUsers.filter(u => new Date(u.last_login).toDateString() === new Date().toDateString()).length}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Leo Online</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-black">{allUsers.reduce((sum, u) => sum + (u.login_count || 0), 0)}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Logins</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <Trophy size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-black">
                      {localSettings.history.length > 0
                        ? Math.round((localSettings.history.filter(h => h.result === 'WON').length / localSettings.history.length) * 100)
                        : 0}%
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Win Rate</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                    <UserCog size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-black">{localSettings.tipsters.length}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Tipsters</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Package size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-black">{localSettings.packages.length}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Vifurushi</p>
                  </div>
                </div>
              </div>

              {/* Malipo ya Leo */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <DollarSign size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Malipo ya Leo</h3>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      {new Date().toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                {(() => {
                  const today = new Date().toDateString();
                  const todayPayments = ticketRequests.filter(r => r.status === 'approved' && new Date(r.unlocked_at).toDateString() === today);
                  const todayPending = ticketRequests.filter(r => r.status === 'pending' && new Date(r.unlocked_at).toDateString() === today);
                  return (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-green-400">{todayPayments.length}</p>
                          <p className="text-[8px] font-bold text-green-400/70 uppercase">Yaliyolipwa</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-amber-400">{todayPending.length}</p>
                          <p className="text-[8px] font-bold text-amber-400/70 uppercase">Yanasubiri</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-blue-400">{todayPayments.length + todayPending.length}</p>
                          <p className="text-[8px] font-bold text-blue-400/70 uppercase">Jumla</p>
                        </div>
                      </div>
                      {todayPayments.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {todayPayments.slice(0, 5).map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-secondary/30 rounded-xl px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400 text-[10px] font-black">
                                  {(p.user_name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold">{p.user_name}</p>
                                  <p className="text-[9px] text-muted-foreground">{p.user_phone}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle size={12} className="text-green-400" />
                                <span className="text-[9px] font-bold text-green-400">Limelipwa</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {todayPayments.length === 0 && todayPending.length === 0 && (
                        <p className="text-xs text-muted-foreground/50 text-center py-2">Hakuna malipo ya leo bado</p>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Watumiaji wa Hivi Karibuni */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <Users size={14} className="text-primary" /> Watumiaji wa Hivi Karibuni
                </h3>
                {allUsers.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center text-primary font-black text-xs border border-primary/15">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold">{u.name}</p>
                        <p className="text-[9px] text-muted-foreground">{new Date(u.last_login).toLocaleDateString('sw-TZ')}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                      {u.login_count}x
                    </span>
                  </div>
                ))}
                {allUsers.length === 0 && <p className="text-xs text-muted-foreground/50 text-center py-2">Hakuna watumiaji</p>}
              </div>

              {/* Matokeo ya Hivi Karibuni */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <BarChart3 size={14} className="text-primary" /> Matokeo ya Hivi Karibuni
                </h3>
                {localSettings.history.slice(0, 5).map(h => (
                  <div key={h.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${h.result === 'WON' ? 'bg-green-400' : h.result === 'LOST' ? 'bg-red-400' : 'bg-amber-400'}`} />
                      <div>
                        <p className="text-[11px] font-bold">{h.title}</p>
                        <p className="text-[9px] text-muted-foreground">{h.date}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      h.result === 'WON' ? 'bg-green-500/10 text-green-400' :
                      h.result === 'LOST' ? 'bg-red-500/10 text-red-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>{h.result}</span>
                  </div>
                ))}
                {localSettings.history.length === 0 && <p className="text-xs text-muted-foreground/50 text-center py-2">Hakuna matokeo</p>}
              </div>

              {/* Tipsters kwa Category */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <UserCog size={14} className="text-primary" /> Tipsters kwa Category
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['VIP TICKET', 'FIXED GAME', 'CORRECT SCORE', 'FREE ODDS'].map(cat => {
                    const count = localSettings.tipsters.filter(t => t.category === cat).length;
                    const icons: Record<string, React.ReactNode> = {
                      'VIP TICKET': <Crown size={14} className="text-amber-400" />,
                      'FIXED GAME': <Lock size={14} className="text-primary" />,
                      'CORRECT SCORE': <Target size={14} className="text-rose-400" />,
                      'FREE ODDS': <Zap size={14} className="text-blue-400" />,
                    };
                    return (
                      <div key={cat} className="bg-secondary/30 rounded-xl p-3 flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">{icons[cat]}</div>
                        <div>
                          <p className="text-lg font-black">{count}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{cat}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* =================== USERS TAB =================== */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {/* Stats */}
              <div className="flex gap-2">
                <StatCard icon={Users} label="Jumla" value={allUsers.length} />
                <StatCard icon={Activity} label="Leo" value={allUsers.filter(u => new Date(u.last_login).toDateString() === new Date().toDateString()).length} color="amber-400" />
              </div>

              <SectionHeader title="Watumiaji" count={allUsers.length} onRefresh={loadUsers} loading={loadingUsers} />

              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tafuta mtumiaji..."
                  className="w-full bg-card/50 border border-border/50 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-all"
                />
              </div>

              {loadingUsers ? <Loader /> : allUsers.length === 0 ? (
                <EmptyState icon={Users} message="Hakuna watumiaji bado" />
              ) : (
                allUsers
                  .filter(u => !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass rounded-2xl p-4 space-y-3 hover:border-border/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center text-primary font-black text-base border border-primary/15">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold flex items-center gap-1.5">
                            {u.name}
                            {u.login_count > 5 && <Crown size={12} className="text-amber-400" />}
                          </p>
                          <div className="flex items-center gap-2.5">
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                              <Phone size={10} /> {u.phone}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                            <Mail size={10} /> {u.email}
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-2 bg-destructive/8 text-destructive/70 rounded-xl hover:bg-destructive/15 hover:text-destructive transition-all"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 bg-card/30 rounded-xl px-3 py-2">
                      <span className="flex items-center gap-1">
                        <Eye size={10} /> Logins: <span className="text-primary font-bold">{u.login_count}</span>
                      </span>
                      <span className="w-px h-3 bg-border/50" />
                      <span>Mwisho: {new Date(u.last_login).toLocaleDateString()}</span>
                      <span className="w-px h-3 bg-border/50" />
                      <span>Joined: {new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* =================== REQUESTS TAB =================== */}
          {activeTab === 'requests' && (
            <motion.div key="requests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex gap-2">
                <StatCard icon={Clock} label="Pending" value={pendingCount} color="amber-400" />
                <StatCard icon={CheckCircle} label="Approved" value={ticketRequests.filter(r => r.status === 'approved').length} />
              </div>

              <SectionHeader title="Maombi ya Tips" count={pendingCount} onRefresh={loadRequests} loading={loadingRequests} />

              {loadingRequests ? <Loader /> : ticketRequests.length === 0 ? (
                <EmptyState icon={Ticket} message="Hakuna maombi bado" />
              ) : (
                <>
                  {ticketRequests.filter(r => r.status === 'pending').map((req, i) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl p-4 space-y-3 border border-amber-500/15"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-xl flex items-center justify-center border border-amber-500/15">
                            <Clock size={18} className="text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{req.user_name}</p>
                            <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                              <Phone size={10} /> {req.user_phone}
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/15">
                          Pending
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 bg-card/30 rounded-xl px-3 py-2">
                        Tip ID: <span className="font-bold text-foreground">{req.tipster_id}</span> • {new Date(req.unlocked_at).toLocaleString()}
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(req.id)}
                          className="flex-1 py-2.5 bg-primary/10 text-primary font-black rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors border border-primary/15"
                        >
                          <CheckCircle size={14} /> Kubali
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(req.id)}
                          className="flex-1 py-2.5 bg-destructive/10 text-destructive font-black rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-destructive/20 transition-colors border border-destructive/15"
                        >
                          <XCircle size={14} /> Kataa
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}

                  {ticketRequests.filter(r => r.status !== 'pending').length > 0 && (
                    <div className="pt-2">
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-3">Zilizokwisha</p>
                      {ticketRequests.filter(r => r.status !== 'pending').map(req => (
                        <div key={req.id} className="glass rounded-2xl p-3.5 space-y-1 opacity-50 mb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                                req.status === 'approved' ? 'bg-primary/10 border-primary/15' : 'bg-destructive/10 border-destructive/15'
                              }`}>
                                {req.status === 'approved' ? <CheckCircle size={16} className="text-primary" /> : <XCircle size={16} className="text-destructive" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold">{req.user_name}</p>
                                <p className="text-[9px] text-muted-foreground/50">Tip ID: {req.tipster_id}</p>
                              </div>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
                              req.status === 'approved' ? 'text-primary bg-primary/10' : 'text-destructive bg-destructive/10'
                            }`}>{req.status === 'approved' ? 'Imekubaliwa' : 'Imekataliwa'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* =================== BUYING TAB =================== */}
          {activeTab === 'buying' && (() => {
            const purchases = ticketRequests.filter(r => r.status === 'approved');
            const totalRevenue = purchases.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
            const tipsterStats = purchases.reduce((acc, r) => {
              const key = r.tipster_name || `Tip #${r.tipster_id}`;
              if (!acc[key]) acc[key] = { count: 0, revenue: 0 };
              acc[key].count += 1;
              acc[key].revenue += Number(r.amount) || 0;
              return acc;
            }, {} as Record<string, { count: number; revenue: number }>);
            const topTipsters = Object.entries(tipsterStats)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 5);

            return (
              <motion.div key="buying" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {/* Stats summary */}
                <div className="flex gap-2">
                  <StatCard icon={ShoppingBag} label="Manunuzi" value={purchases.length} />
                  <StatCard icon={DollarSign} label="Mapato (TZS)" value={totalRevenue.toLocaleString()} color="amber-400" />
                </div>

                {/* Top tipsters card */}
                {topTipsters.length > 0 && (
                  <div className="glass rounded-2xl p-4 border border-primary/15">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy size={14} className="text-amber-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Tips Zinazonunuliwa Zaidi</p>
                    </div>
                    <div className="space-y-2">
                      {topTipsters.map(([name, stats], idx) => (
                        <div key={name} className="flex items-center justify-between bg-card/30 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-[10px] font-black w-5 h-5 rounded-md flex items-center justify-center ${
                              idx === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-primary/10 text-primary'
                            }`}>{idx + 1}</span>
                            <p className="text-xs font-bold truncate">{name}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-[10px] text-muted-foreground/70">{stats.count}x</span>
                            <span className="text-[10px] font-black text-amber-400">{stats.revenue.toLocaleString()} TZS</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <SectionHeader title="Tips Zilizonunuliwa" count={purchases.length} onRefresh={loadRequests} loading={loadingRequests} />

                {loadingRequests ? <Loader /> : purchases.length === 0 ? (
                  <EmptyState icon={ShoppingBag} message="Hakuna manunuzi bado" />
                ) : (
                  <div className="space-y-2">
                    {purchases
                      .slice()
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((req, i) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.3) }}
                        className="glass rounded-2xl p-4 space-y-3 border border-primary/15"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 bg-gradient-to-br from-primary/20 to-amber-500/10 rounded-xl flex items-center justify-center border border-primary/15 flex-shrink-0">
                              <ShoppingBag size={18} className="text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">{req.tipster_name || `Tipster #${req.tipster_id}`}</p>
                              <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 truncate">
                                <Users size={10} /> {req.user_name}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/15 flex-shrink-0">
                            {Number(req.amount).toLocaleString()} TZS
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="bg-card/30 rounded-xl px-3 py-2">
                            <p className="text-muted-foreground/50 mb-0.5">Simu</p>
                            <p className="font-bold flex items-center gap-1"><Phone size={10} /> {req.user_phone}</p>
                          </div>
                          <div className="bg-card/30 rounded-xl px-3 py-2">
                            <p className="text-muted-foreground/50 mb-0.5">Malipo</p>
                            <p className="font-bold uppercase">{req.payment_method || '—'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-muted-foreground/60 pt-1">
                          <span className="flex items-center gap-1"><Clock size={10} /> {new Date(req.created_at).toLocaleString()}</span>
                          <span className="text-primary font-black uppercase tracking-wider">Imekamilika</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* =================== ADMINS TAB =================== */}
          {activeTab === 'admins' && (
            <motion.div key="admins" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex gap-2">
                <StatCard icon={ShieldCheck} label="Admins" value={adminList.length} />
                <StatCard icon={Crown} label="Super" value={adminList.filter(a => a.role === 'super_admin').length} color="amber-400" />
              </div>

              <SectionHeader title="Timu ya Admin" count={adminList.length} onRefresh={loadAdmins} loading={loadingAdmins} />

              {/* Add new admin */}
              {isSuperAdmin && (
                <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Plus size={14} className="text-primary" />
                    <p className="text-[11px] font-black text-primary uppercase tracking-wider">Ongeza Admin Mpya</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
                      placeholder="Email ya admin mpya"
                      className="flex-1 bg-card/80 border border-border/50 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-all"
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleAddAdmin}
                      disabled={addingAdmin || !newAdminEmail.trim()}
                      className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase disabled:opacity-40 transition-all shadow-md shadow-primary/20"
                    >
                      {addingAdmin ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <Plus size={16} />
                      )}
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">Ruhusa za admin mpya:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_PERMISSIONS.filter(p => p !== 'admins').map(perm => (
                        <motion.button
                          key={perm}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setNewAdminPermissions(prev =>
                            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
                          )}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                            newAdminPermissions.includes(perm)
                              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                              : 'bg-card/60 text-muted-foreground/50 border border-border/40 hover:border-border/60'
                          }`}
                        >
                          {PERMISSION_LABELS[perm]}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin list */}
              {loadingAdmins ? <Loader /> : (
                <div className="space-y-3">
                  {adminList.map((admin, i) => (
                    <motion.div
                      key={admin.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-2xl p-4 space-y-3 transition-all ${
                        admin.role === 'super_admin'
                          ? 'glass border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent'
                          : 'glass hover:border-border/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                            admin.role === 'super_admin'
                              ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/20'
                              : 'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/15'
                          }`}>
                            {admin.role === 'super_admin'
                              ? <Crown size={20} className="text-amber-400" />
                              : <ShieldCheck size={20} className="text-primary" />
                            }
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold truncate max-w-[180px]">{admin.email}</p>
                              {admin.role === 'super_admin' && (
                                <span className="text-[8px] font-black text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md uppercase border border-amber-500/20">
                                  Super Admin
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
                              <Clock size={10} />
                              <span>Ameongezwa: {new Date(admin.created_at).toLocaleDateString('sw-TZ', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                            {admin.added_by && (
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground/40">
                                <span>Na: {admin.added_by}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {isSuperAdmin && admin.role !== 'super_admin' && (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                            className="p-2.5 bg-destructive/8 text-destructive/60 rounded-xl hover:bg-destructive/15 hover:text-destructive transition-all"
                          >
                            <Trash2 size={15} />
                          </motion.button>
                        )}
                      </div>

                      {/* Permissions */}
                      {admin.role !== 'super_admin' && (
                        <div className="space-y-2 pt-1 border-t border-border/30">
                          <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider pt-2">Ruhusa:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {ALL_PERMISSIONS.filter(p => p !== 'admins').map(perm => {
                              const hasPerm = admin.permissions?.includes(perm);
                              return (
                                <motion.button
                                  key={perm}
                                  whileTap={isSuperAdmin ? { scale: 0.95 } : undefined}
                                  disabled={!isSuperAdmin}
                                  onClick={async () => {
                                    if (!isSuperAdmin) return;
                                    const newPerms = hasPerm
                                      ? admin.permissions.filter(p => p !== perm)
                                      : [...(admin.permissions || []), perm];
                                    const success = await updateAdminPermissions(admin.id, newPerms);
                                    if (success) {
                                      setAdminList(prev => prev.map(a => a.id === admin.id ? { ...a, permissions: newPerms } : a));
                                    }
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                                    hasPerm
                                      ? 'bg-primary/15 text-primary border border-primary/20'
                                      : 'bg-card/40 text-muted-foreground/30 border border-border/20'
                                  } ${isSuperAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                >
                                  {PERMISSION_LABELS[perm]}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Super admin gets all access badge */}
                      {admin.role === 'super_admin' && (
                        <div className="flex items-center gap-2 pt-1 border-t border-amber-500/15">
                          <div className="flex items-center gap-1.5 text-[10px] text-amber-400/70 bg-amber-500/8 rounded-lg px-3 py-2 mt-1">
                            <Zap size={12} />
                            <span className="font-bold">Ruhusa zote — Full Access</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* =================== TIPSTERS TAB =================== */}
          {activeTab === 'tipsters' && (
            <motion.div key="tipsters" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <SectionHeader title="Tipsters" count={localSettings.tipsters.length} onAction={addTipster} actionLabel="Ongeza" actionIcon={Plus} onRefresh={loadTipstersFromDb} loading={loadingTipsters} />

              {loadingTipsters ? <Loader /> : localSettings.tipsters.length === 0 ? (
                <EmptyState icon={UserCog} message="Hakuna tips bado. Ongeza moja!" />
              ) : (
                localSettings.tipsters.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass rounded-2xl p-3.5 flex items-center justify-between hover:border-border/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/30">
                        <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(t.category)}
                          <p className="text-xs font-bold">{t.name}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/50">{t.category} • Odds: {t.odds} {t.company ? `• ${t.company}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditingTipster(t)} className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors">
                        <Edit2 size={13} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { if (confirm('Futa tipster?')) deleteTipster(t.id); }}
                        className="p-2 bg-destructive/8 text-destructive/60 rounded-xl hover:bg-destructive/15 transition-colors"
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* =================== HISTORY TAB =================== */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <SectionHeader title="Historia" count={localSettings.history.length} onAction={addHistory} actionLabel="Ongeza" actionIcon={Plus} onRefresh={loadHistoryFromDb} loading={loadingHistory} />

              {loadingHistory ? <Loader /> : localSettings.history.length === 0 ? (
                <EmptyState icon={HistoryIcon} message="Hakuna historia bado" />
              ) : localSettings.history.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass rounded-2xl p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      h.result === 'WON' ? 'bg-primary/10 border-primary/15' : 'bg-destructive/10 border-destructive/15'
                    }`}>
                      {h.result === 'WON' ? <CheckCircle size={16} className="text-primary" /> : <XCircle size={16} className="text-destructive" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{h.title || 'Hakuna jina'}</p>
                      <p className="text-[10px] text-muted-foreground/50">{h.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditingHistory(h)} className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors">
                      <Edit2 size={13} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { if (confirm('Futa hii?')) deleteHistory(h.id); }}
                      className="p-2 bg-destructive/8 text-destructive/60 rounded-xl hover:bg-destructive/15 transition-colors"
                    >
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* =================== BANNERS TAB =================== */}
          {activeTab === 'banners' && (
            <motion.div key="banners" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex gap-2 mb-2">
                <StatCard icon={ImageIcon} label="Jumla" value={bannerList.length} />
                <StatCard icon={Eye} label="Active" value={bannerList.filter(b => b.active).length} color="primary" />
              </div>

              <SectionHeader
                title="Banner Images"
                count={bannerList.length}
                onRefresh={loadBanners}
                loading={loadingBanners}
              />

              {/* Upload buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => bannerFileRef.current?.click()}
                  disabled={uploadingBanner}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-primary/15 transition-colors border border-primary/20 disabled:opacity-50"
                >
                  {uploadingBanner ? (
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  Pakia Picha
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddBannerUrl}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary/50 text-foreground rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-secondary/70 transition-colors border border-border/30"
                >
                  <Plus size={14} />
                  URL ya Picha
                </motion.button>
              </div>
              <input ref={bannerFileRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />

              {loadingBanners ? <Loader /> : bannerList.length === 0 ? (
                <EmptyState icon={ImageIcon} message="Hakuna banners bado. Ongeza moja!" />
              ) : (
                <div className="space-y-3">
                  {bannerList.map((banner, i) => {
                    const url = getBannerPublicUrl(banner);
                    return (
                      <motion.div
                        key={banner.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`glass rounded-2xl overflow-hidden border ${banner.active ? 'border-primary/20' : 'border-border/10 opacity-60'}`}
                      >
                        {/* Banner preview */}
                        {url ? (
                          <img src={url} alt={`Banner ${i + 1}`} className="w-full h-36 object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-36 bg-muted/30 flex items-center justify-center">
                            <ImageIcon size={32} className="text-muted-foreground/30" />
                          </div>
                        )}

                        {/* Banner controls */}
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase">Banner {i + 1}</span>
                            {banner.active ? (
                              <span className="text-[8px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase">Active</span>
                            ) : (
                              <span className="text-[8px] font-black text-muted-foreground/50 bg-muted/20 border border-border/20 px-2 py-0.5 rounded-full uppercase">Hidden</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleToggleBanner(banner)}
                              className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
                              title={banner.active ? 'Ficha' : 'Onyesha'}
                            >
                              {banner.active ? <ToggleRight size={16} className="text-primary" /> : <ToggleLeft size={16} className="text-muted-foreground/50" />}
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteBanner(banner)}
                              className="p-2 rounded-xl hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 size={14} className="text-destructive/60" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* =================== PACKAGES TAB =================== */}
          {activeTab === 'packages' && (
            <motion.div key="packages" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <SectionHeader title="Packages" count={localSettings.packages.length} onAction={addPackage} actionLabel="Ongeza" actionIcon={Plus} />

              {localSettings.packages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass rounded-2xl p-4 space-y-3"
                >
                  <div className="flex gap-2.5">
                    <div className="flex-1">
                      <label className="text-[9px] font-bold text-muted-foreground/50 uppercase mb-1.5 block">Jina</label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => handleUpdatePackage(pkg.id, 'name', e.target.value)}
                        className="w-full bg-card/50 border border-border/50 rounded-xl px-3 py-2.5 text-xs focus:border-primary/50 outline-none transition-all"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-[9px] font-bold text-muted-foreground/50 uppercase mb-1.5 block">Bei (TSH)</label>
                      <input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => handleUpdatePackage(pkg.id, 'price', parseInt(e.target.value) || 0)}
                        className="w-full bg-card/50 border border-border/50 rounded-xl px-3 py-2.5 text-xs focus:border-primary/50 outline-none transition-all"
                      />
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { if (confirm('Futa package?')) deletePackage(pkg.id); }}
                      className="self-end p-2.5 bg-destructive/8 text-destructive/60 rounded-xl hover:bg-destructive/15 transition-colors"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* =================== SETTINGS TAB =================== */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <SectionHeader title="App Settings" />

              {[
                { key: 'paymentNumber', label: 'Namba ya Malipo', type: 'text', icon: Phone },
                { key: 'supportEmail', label: 'Support Email', type: 'email', icon: Mail },
                { key: 'whatsappNumber', label: 'WhatsApp Number', type: 'text', icon: Phone },
                { key: 'telegramChannel', label: 'Telegram Link', type: 'url', icon: Target },
                { key: 'whatsappGroup', label: 'WhatsApp Group Link', type: 'url', icon: Users },
              ].map(field => (
                <div key={field.key} className="glass rounded-2xl p-4 space-y-2">
                  <label className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1.5">
                    <field.icon size={10} />
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={(localSettings as any)[field.key]}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-card/50 border border-border/50 rounded-xl px-3.5 py-2.5 text-sm focus:border-primary/50 outline-none transition-all"
                  />
                </div>
              ))}
              <div className="glass rounded-2xl p-4 space-y-3">
                <label className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Njia za Malipo</label>
                <div className="flex flex-wrap gap-2">
                  {['M-PESA', 'TIGO PESA', 'AIRTEL MONEY', 'HALOPESA'].map(method => (
                    <motion.button
                      key={method}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setLocalSettings(prev => ({
                          ...prev,
                          paymentMethods: prev.paymentMethods.includes(method)
                            ? prev.paymentMethods.filter(m => m !== method)
                            : [...prev.paymentMethods, method],
                        }));
                      }}
                      className={`px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all ${
                        localSettings.paymentMethods.includes(method)
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                          : 'bg-card/50 border border-border/50 text-muted-foreground/60 hover:border-border'
                      }`}
                    >
                      {method}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* EDIT TIPSTER MODAL */}
      <AnimatePresence>
        {editingTipster && (
          <TipsterEditModal tipster={editingTipster} onSave={saveTipster} onClose={() => setEditingTipster(null)} />
        )}
      </AnimatePresence>

      {/* EDIT HISTORY MODAL */}
      <AnimatePresence>
        {editingHistory && (
          <HistoryEditModal history={editingHistory} onSave={saveHistory} onClose={() => setEditingHistory(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Tipster Edit Modal
const TipsterEditModal: React.FC<{ tipster: Tipster; onSave: (t: Tipster) => void; onClose: () => void }> = ({
  tipster, onSave, onClose
}) => {
  const [local, setLocal] = useState<Tipster>({ ...tipster });

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="relative w-full max-w-sm glass-strong rounded-3xl p-5 space-y-3 max-h-[85vh] overflow-y-auto border border-border/30"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black uppercase">Edit Tipster</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X size={16} className="text-muted-foreground" /></button>
        </div>

        <div className="space-y-2.5">
          <Field label="Jina" value={local.name} onChange={v => setLocal(p => ({ ...p, name: v }))} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-muted-foreground/50 uppercase mb-1 block">Category</label>
              <select
                value={local.category}
                onChange={e => setLocal(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-card/50 border border-border/50 rounded-xl px-3 py-2 text-xs focus:border-primary/50 outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Field label="Odds" value={local.odds} onChange={v => setLocal(p => ({ ...p, odds: v }))} />
          </div>
          <Field label="Code" value={local.code} onChange={v => setLocal(p => ({ ...p, code: v }))} />
          <Field label="Avatar URL" value={local.avatar} onChange={v => setLocal(p => ({ ...p, avatar: v }))} />

          <div>
            <label className="text-[9px] font-bold text-muted-foreground/50 uppercase mb-1 block">Kampuni</label>
            <select
              value={local.company || ''}
              onChange={e => setLocal(p => ({ ...p, company: e.target.value }))}
              className="w-full bg-card/50 border border-border/50 rounded-xl px-3 py-2 text-xs focus:border-primary/50 outline-none"
            >
              <option value="">Chagua Kampuni</option>
              {['Dbet', 'Sportbety', 'BetPawa', '1win', 'Paripesa', 'TOPBET', 'Betspli', 'Sportbet'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] font-bold text-muted-foreground/50 uppercase mb-1 block">Muda wa Kuisha (Expiry)</label>
            <input
              type="datetime-local"
              value={local.expiryDate || ''}
              onChange={e => setLocal(p => ({ ...p, expiryDate: e.target.value }))}
              className="w-full bg-card/50 border border-border/50 rounded-xl px-3 py-2 text-xs focus:border-primary/50 outline-none"
            />
            {local.expiryDate && (
              <p className="text-[8px] text-muted-foreground/50 mt-1">
                Inaisha: {new Date(local.expiryDate).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[9px] font-bold text-muted-foreground/50 uppercase">Free?</label>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocal(p => ({ ...p, isFree: !p.isFree }))}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                local.isFree ? 'bg-primary text-primary-foreground' : 'bg-card/50 border border-border/50 text-muted-foreground/60'
              }`}
            >
              {local.isFree ? 'Ndiyo' : 'Hapana'}
            </motion.button>
          </div>

          {!local.isFree && (
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Bei (TSH)"
                value={String(local.prices?.[0]?.p || 0)}
                onChange={v => setLocal(p => ({
                  ...p,
                  prices: [{ name: p.prices?.[0]?.name || 'Siku 1', p: parseInt(v) || 0, discount: p.prices?.[0]?.discount || 0 }],
                }))}
              />
              <Field
                label="Discount"
                value={String(local.prices?.[0]?.discount || 0)}
                onChange={v => setLocal(p => ({
                  ...p,
                  prices: [{ name: p.prices?.[0]?.name || 'Siku 1', p: p.prices?.[0]?.p || 0, discount: parseInt(v) || 0 }],
                }))}
              />
            </div>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onSave(local)}
          className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          Hifadhi
        </motion.button>
      </motion.div>
    </div>
  );
};

// History Edit Modal
const HistoryEditModal: React.FC<{ history: HistoryType; onSave: (h: HistoryType) => void; onClose: () => void }> = ({
  history, onSave, onClose
}) => {
  const [local, setLocal] = useState<HistoryType>({ ...history });

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="relative w-full max-w-sm glass-strong rounded-3xl p-5 space-y-3 border border-border/30"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black uppercase">Edit Matokeo</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary"><X size={16} className="text-muted-foreground" /></button>
        </div>

        <div className="space-y-2.5">
          <Field label="Mechi / Jina" value={local.title} onChange={v => setLocal(p => ({ ...p, title: v }))} placeholder="mf: Arsenal vs Chelsea" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Tarehe" value={local.date} onChange={v => setLocal(p => ({ ...p, date: v }))} type="date" />
            <div>
              <label className="text-[9px] font-bold text-muted-foreground/50 uppercase mb-1 block">Matokeo</label>
              <select
                value={local.result}
                onChange={e => setLocal(p => ({ ...p, result: e.target.value }))}
                className="w-full bg-card/50 border border-border/50 rounded-xl px-3 py-2 text-xs focus:border-primary/50 outline-none"
              >
                <option value="WON">WON ✅</option>
                <option value="LOST">LOST ❌</option>
              </select>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onSave(local)}
          className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          Hifadhi
        </motion.button>
      </motion.div>
    </div>
  );
};

// Reusable field component
const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label className="text-[9px] font-bold text-muted-foreground/50 uppercase mb-1 block">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-card/50 border border-border/50 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 outline-none transition-all"
    />
  </div>
);
