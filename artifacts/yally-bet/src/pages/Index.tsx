import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoginScreen } from '@/components/betting/LoginScreen';
import { Header } from '@/components/betting/Header';
import { BottomNav } from '@/components/betting/BottomNav';
import { HomeView } from '@/components/betting/HomeView';
import { TicketsView } from '@/components/betting/TicketsView';
import { HistoryView } from '@/components/betting/HistoryView';
import { AccountView } from '@/components/betting/AccountView';

// Lazy-load heavy components to keep first paint snappy
const PaymentModal = lazy(() => import('@/components/betting/PaymentModal').then(m => ({ default: m.PaymentModal })));
const AdminPanel = lazy(() => import('@/components/betting/AdminPanel').then(m => ({ default: m.AdminPanel })));

const LazyFallback = () => (
  <div className="flex items-center justify-center py-10">
    <div className="w-6 h-6 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);
import { getAdminEntry, addAdmin, ALL_PERMISSIONS, type AdminEntry } from '@/lib/adminService';
import { Tipster, Settings } from '@/types/betting';
import { DEFAULT_SETTINGS } from '@/constants/betting';
import { loginUser, registerUser, loadSession, clearSession, loadUnlockedTickets } from '@/lib/userService';
import type { AppUser } from '@/lib/userService';
import { toast } from 'sonner';
import { fetchTipsters, fetchHistory, fetchPackages, fetchAppSettings } from '@/lib/settingsService';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // Form fields
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'home' | 'tickets' | 'history' | 'account' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [unlockedTickets, setUnlockedTickets] = useState<number[]>([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTipster, setSelectedTipster] = useState<Tipster | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEntry, setAdminEntry] = useState<AdminEntry | null>(null);

  // Load remote settings
  const loadSettingsFromDb = async () => {
    const [tipsters, history, packages, appSettings] = await Promise.all([
      fetchTipsters(), fetchHistory(), fetchPackages(), fetchAppSettings(),
    ]);
    setSettings(prev => {
      const merged: Settings = {
        ...prev,
        tipsters: tipsters.length > 0 ? tipsters : prev.tipsters,
        history: history.length > 0 ? history : prev.history,
        packages: packages.length > 0 ? packages : prev.packages,
      };
      if (appSettings) {
        // Only overwrite when the DB returned a defined value, so we never wipe defaults.
        if (appSettings.telegramChannel) merged.telegramChannel = appSettings.telegramChannel;
        if (appSettings.whatsappGroup) merged.whatsappGroup = appSettings.whatsappGroup;
        if (appSettings.whatsappNumber) merged.whatsappNumber = appSettings.whatsappNumber;
        if (appSettings.supportEmail) merged.supportEmail = appSettings.supportEmail;
        if (appSettings.paymentNumber) merged.paymentNumber = appSettings.paymentNumber;
        if (Array.isArray(appSettings.paymentMethods) && appSettings.paymentMethods.length > 0) {
          merged.paymentMethods = appSettings.paymentMethods;
        }
        // Branding fields
        if (appSettings.appName) merged.appName = appSettings.appName;
        if (appSettings.appTagline) merged.appTagline = appSettings.appTagline;
        if (appSettings.winRatePct) merged.winRatePct = appSettings.winRatePct;
        if (appSettings.membersCount) merged.membersCount = appSettings.membersCount;
        if (appSettings.dailyOddsCount) merged.dailyOddsCount = appSettings.dailyOddsCount;
        if (appSettings.testimonialText) merged.testimonialText = appSettings.testimonialText;
        if (appSettings.testimonialAuthor) merged.testimonialAuthor = appSettings.testimonialAuthor;
        if (appSettings.defaultTipsterAvatar) merged.defaultTipsterAvatar = appSettings.defaultTipsterAvatar;
        if (appSettings.defaultLanguage) merged.defaultLanguage = appSettings.defaultLanguage;
      }
      return merged;
    });
  };

  // Check and set admin status for a user
  const checkAndSetAdmin = async (user: AppUser) => {
    const entry = await getAdminEntry(user.email);
    if (entry) {
      setIsAdmin(true);
      setAdminEntry(entry);
    }
  };

  // Restore session on mount
  useEffect(() => {
    const restored = loadSession();
    if (restored) {
      setCurrentUser(restored);
      setIsLoggedIn(true);
      setLoginName(restored.name);
      setLoginEmail(restored.email);
      setLoginPhone(restored.phone);
      checkAndSetAdmin(restored);
      loadUnlockedTickets(restored.id).then(setUnlockedTickets);
    }
    setIsLoading(false);
    loadSettingsFromDb();
  }, []);

  // Auto-refresh: poll every 20s and refetch when tab/app becomes visible,
  // so admin changes propagate to all devices without manual reload.
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadSettingsFromDb();
        if (currentUser) {
          loadUnlockedTickets(currentUser.id).then(setUnlockedTickets);
        }
      }
    }, 5000);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadSettingsFromDb();
        if (currentUser) {
          loadUnlockedTickets(currentUser.id).then(setUnlockedTickets);
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
    };
  }, [isLoggedIn, currentUser]);

  const handleLoginSuccess = async (user: AppUser, isFirstUser = false) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setLoginName(user.name);
    setLoginEmail(user.email);
    setLoginPhone(user.phone);

    // First user ever registered = automatic super admin
    if (isFirstUser) {
      await addAdmin(user.email, 'system', ALL_PERMISSIONS);
    }

    // Load admin status
    const entry = await getAdminEntry(user.email);
    if (entry) {
      setIsAdmin(true);
      setAdminEntry(entry);
    }

    // Load tickets
    const tickets = await loadUnlockedTickets(user.id);
    setUnlockedTickets(tickets);
    toast.success(`Karibu ${user.name}! 🎉`);
  };

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    setIsLoading(true);
    setLoginError('');
    try {
      const result = await loginUser(loginEmail.trim(), loginPassword.trim());
      if (result.user) {
        await handleLoginSuccess(result.user);
      } else {
        setLoginError(result.error || 'Kuna tatizo. Jaribu tena.');
      }
    } catch {
      setLoginError('Kuna tatizo la mtandao.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!loginName.trim() || !loginEmail.trim() || !loginPassword.trim()) return;
    setIsLoading(true);
    setLoginError('');
    try {
      const result = await registerUser(
        loginName.trim(), loginEmail.trim(), loginPhone.trim(), loginPassword.trim()
      );
      if (result.user) {
        await handleLoginSuccess(result.user, result.isFirstUser);
      } else {
        setLoginError(result.error || 'Kuna tatizo. Jaribu tena.');
      }
    } catch {
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
    setLoginEmail('');
    setLoginPhone('');
    setLoginPassword('');
    setLoginError('');
    setActiveTab('home');
    setUnlockedTickets([]);
    setIsAdmin(false);
    setAdminEntry(null);
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

  const handleUpdateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    loadSettingsFromDb();
  };

  // Loading screen
  if (isLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Login / Register screen
  if (!isLoggedIn) {
    return (
      <LoginScreen
        loginName={loginName}
        loginEmail={loginEmail}
        loginPhone={loginPhone}
        loginPassword={loginPassword}
        setLoginName={setLoginName}
        setLoginEmail={setLoginEmail}
        setLoginPhone={setLoginPhone}
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
              settings={settings} onLogout={handleLogout}
              unlockedCount={unlockedTickets.length}
            />
          )}
          {activeTab === 'admin' && isAdmin && adminEntry && (
            <Suspense key="admin" fallback={<LazyFallback />}>
              <AdminPanel settings={settings} onUpdateSettings={handleUpdateSettings}
                onExit={() => { setActiveTab('home'); loadSettingsFromDb(); }} adminEntry={adminEntry}
              />
            </Suspense>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />

      <AnimatePresence>
        {showPaymentModal && selectedTipster && (
          <Suspense fallback={<LazyFallback />}>
          <PaymentModal tipster={selectedTipster}
            onClose={() => { setShowPaymentModal(false); setSelectedTipster(null); }}
            onSuccess={handlePaymentSuccess}
            paymentNumber={settings.paymentNumber}
            paymentMethods={settings.paymentMethods}
            userId={currentUser?.id}
            userName={currentUser?.name}
            userEmail={currentUser?.email}
            userPhone={currentUser?.phone}
          />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
