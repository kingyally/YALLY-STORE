import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoginScreen } from '@/components/betting/LoginScreen';
import { Header } from '@/components/betting/Header';
import { BottomNav } from '@/components/betting/BottomNav';
import { HomeView } from '@/components/betting/HomeView';
import { TicketsView } from '@/components/betting/TicketsView';
import { HistoryView } from '@/components/betting/HistoryView';
import { AccountView } from '@/components/betting/AccountView';
import { PaymentModal } from '@/components/betting/PaymentModal';
import { AdminLoginModal } from '@/components/betting/AdminLoginModal';
import { isAdmin as checkIsAdmin, getAdminEntry, addAdmin, ALL_PERMISSIONS, type AdminEntry } from '@/lib/adminService';
import { AdminPanel } from '@/components/betting/AdminPanel';
import { Tipster, Settings } from '@/types/betting';
import { DEFAULT_SETTINGS } from '@/constants/betting';
import { loginUser, registerUser, loadSession, clearSession, saveUnlockedTicket, loadUnlockedTickets } from '@/lib/userService';
import type { AppUser } from '@/lib/userService';
import { toast } from 'sonner';
import { fetchTipsters, fetchHistory, fetchPackages, fetchAppSettings } from '@/lib/settingsService';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // start true for session check
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'tickets' | 'history' | 'account' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [unlockedTickets, setUnlockedTickets] = useState<number[]>([]);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTipster, setSelectedTipster] = useState<Tipster | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEntry, setAdminEntry] = useState<AdminEntry | null>(null);

  // Load settings from DB
  const loadSettingsFromDb = async () => {
    const [tipsters, history, packages, appSettings] = await Promise.all([
      fetchTipsters(),
      fetchHistory(),
      fetchPackages(),
      fetchAppSettings(),
    ]);
    setSettings(prev => ({
      ...prev,
      tipsters: tipsters.length > 0 ? tipsters : prev.tipsters,
      history: history.length > 0 ? history : prev.history,
      packages: packages.length > 0 ? packages : prev.packages,
      ...(appSettings ? {
        telegramChannel: appSettings.telegramChannel,
        whatsappGroup: appSettings.whatsappGroup,
        whatsappNumber: appSettings.whatsappNumber,
        supportEmail: appSettings.supportEmail,
        paymentNumber: appSettings.paymentNumber,
        paymentMethods: appSettings.paymentMethods,
      } : {}),
    }));
  };

  // Restore session on mount
  useEffect(() => {
    const restored = loadSession();
    if (restored) {
      setCurrentUser(restored);
      setIsLoggedIn(true);
      setLoginName(restored.name);
      setLoginPhone(restored.phone);
      setLoginEmail(restored.email);
      // Check admin & load tickets
      getAdminEntry(restored.email).then(entry => {
        if (entry) { setIsAdmin(true); setAdminEntry(entry); }
      });
      loadUnlockedTickets(restored.id).then(tickets => {
        setUnlockedTickets(tickets);
      });
    }
    setIsLoading(false);
    loadSettingsFromDb();
  }, []);

  const handleLoginSuccess = async (user: AppUser) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setLoginName(user.name);
    setLoginPhone(user.phone);
    setLoginEmail(user.email);
    if (user.email) {
      const entry = await getAdminEntry(user.email);
      if (entry) { setIsAdmin(true); setAdminEntry(entry); }
    }
    // Load unlocked tickets from DB
    const tickets = await loadUnlockedTickets(user.id);
    setUnlockedTickets(tickets);
    toast.success(`Karibu ${user.name}!`);
  };

  const handleLogin = async () => {
    if (!loginPhone.trim() || !loginPassword.trim()) return;
    setIsLoading(true);
    setLoginError('');
    try {
      const result = await loginUser(loginPhone.trim(), loginPassword.trim());
      if (result.user) {
        handleLoginSuccess(result.user);
      } else {
        setLoginError(result.error || 'Kuna tatizo. Jaribu tena.');
      }
    } catch (error) {
      console.error(error);
      setLoginError('Kuna tatizo la mtandao.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!loginName.trim() || !loginPhone.trim() || !loginEmail.trim() || !loginPassword.trim()) return;
    setIsLoading(true);
    setLoginError('');
    try {
      const result = await registerUser(loginName.trim(), loginPhone.trim(), loginEmail.trim(), loginPassword.trim());
      if (result.user) {
        handleLoginSuccess(result.user);
      } else {
        setLoginError(result.error || 'Kuna tatizo. Jaribu tena.');
      }
    } catch (error) {
      console.error(error);
      setLoginError('Kuna tatizo la mtandao.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginName('');
    setLoginPhone('');
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setActiveTab('home');
    setUnlockedTickets([]);
    setIsAdmin(false);
  };

  const handleUnlock = async (t: Tipster) => {
    setSelectedTipster(t);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (tipsterId: number) => {
    setUnlockedTickets(prev => [...prev, tipsterId]);
    setShowPaymentModal(false);
    setSelectedTipster(null);
    toast.success('Malipo yamefanikiwa! Ticket imefunguliwa 🎉');
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setActiveTab('tickets');
  };

  const handleAdminLoginSuccess = async (adminEmail: string) => {
    setShowAdminLogin(false);
    setIsAdmin(true);
    // Get or create super admin entry automatically
    let entry = await getAdminEntry(adminEmail);
    if (!entry) {
      await addAdmin(adminEmail, 'system', ALL_PERMISSIONS);
      entry = await getAdminEntry(adminEmail);
    }
    if (entry) setAdminEntry(entry);
  };

  const handleUpdateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    // Reload from DB to get latest
    loadSettingsFromDb();
  };

  // Show loading while checking session
  if (isLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen
        loginName={loginName}
        loginPhone={loginPhone}
        loginEmail={loginEmail}
        loginPassword={loginPassword}
        setLoginName={setLoginName}
        setLoginPhone={setLoginPhone}
        setLoginEmail={setLoginEmail}
        setLoginPassword={setLoginPassword}
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isLoading}
        loginError={loginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <Header userName={loginName} />

      <main className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeView key="home" settings={settings} unlockedTickets={unlockedTickets}
              onCategorySelect={handleCategorySelect} onUnlock={handleUnlock}
              onViewAll={() => { setSelectedCategory(null); setActiveTab('tickets'); }}
            />
          )}
          {activeTab === 'tickets' && (
            <TicketsView key="tickets" settings={settings} selectedCategory={selectedCategory}
              unlockedTickets={unlockedTickets} onUnlock={handleUnlock} onCategorySelect={setSelectedCategory}
            />
          )}
          {activeTab === 'history' && <HistoryView key="history" settings={settings} />}
          {activeTab === 'account' && (
            <AccountView key="account" userName={loginName} userPhone={loginPhone}
              settings={settings} onLogout={handleLogout} onAdminLogin={() => setShowAdminLogin(true)}
              unlockedCount={unlockedTickets.length}
            />
          )}
          {activeTab === 'admin' && isAdmin && adminEntry && (
            <AdminPanel key="admin" settings={settings} onUpdateSettings={handleUpdateSettings} onExit={() => setActiveTab('home')} adminEntry={adminEntry} />
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />

      <AnimatePresence>
        {showPaymentModal && selectedTipster && (
          <PaymentModal tipster={selectedTipster}
            onClose={() => { setShowPaymentModal(false); setSelectedTipster(null); }}
            onSuccess={handlePaymentSuccess} paymentNumber={settings.paymentNumber} paymentMethods={settings.paymentMethods}
            userId={currentUser?.id} userName={currentUser?.name} userEmail={currentUser?.email} userPhone={currentUser?.phone}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminLogin && (
          <AdminLoginModal onClose={() => setShowAdminLogin(false)} onSuccess={handleAdminLoginSuccess} userEmail={loginEmail} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
