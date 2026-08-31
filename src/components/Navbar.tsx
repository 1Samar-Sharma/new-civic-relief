import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Shield,
  HeartHandshake,
  Bot,
  MapPin,
  Volume2,
  VolumeX,
  Compass,
  Sparkles,
  Scale,
  Crown,
  User,
  LogOut,
  Lock,
  Bell,
  BellRing,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { soundPlayer } from '../utils/audio';
import { useAuth } from '../context/AuthContext';
import { notificationService, NotificationPermissionStatus } from '../utils/notifications';

interface NavbarProps {
  activeTab: string;
  onTabChange?: (tab: 'map' | 'weather_gpt' | 'women_safety' | 'forest_fire' | 'early_warning' | 'mutual_aid' | 'community') => void;
  setActiveTab?: (tab: any) => void;
  onOpenAIAdvisor: () => void;
  onTriggerGlobalSOS?: () => void;
  onOpenSOSModal?: () => void;
  onOpenBroadcastModal?: () => void;
  userAddress?: string;
  isGpsLocked?: boolean;
  onRefreshLocation?: () => void;
  activeAlertCount?: number;
  openHelpRequestCount?: number;
  activeSOSCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  setActiveTab,
  onOpenAIAdvisor,
  onTriggerGlobalSOS,
  onOpenSOSModal,
  onOpenBroadcastModal,
  userAddress = 'Your Current Area',
  isGpsLocked = false,
  onRefreshLocation,
  activeAlertCount = 0,
  openHelpRequestCount = 0,
  activeSOSCount = 0,
}) => {
  const {
    currentUser,
    isAdmin,
    isMasterAdmin,
    logout,
    setIsAuthModalOpen,
    setIsAdminModalOpen,
    setIsProfileModalOpen,
    setIsRulesModalOpen,
  } = useAuth();

  const [isSirenOn, setIsSirenOn] = useState(false);
  const [notifStatus, setNotifStatus] = useState<NotificationPermissionStatus>('default');
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    setNotifStatus(notificationService.getPermissionStatus());
  }, []);

  const handleEnablePush = async () => {
    const granted = await notificationService.requestPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
    if (granted) {
      soundPlayer.playBeep(880, 0.2);
    }
  };

  const changeTab = (
    tab: 'map' | 'weather_gpt' | 'women_safety' | 'forest_fire' | 'early_warning' | 'mutual_aid' | 'community'
  ) => {
    if (onTabChange) onTabChange(tab);
    if (setActiveTab) setActiveTab(tab);
  };

  const triggerSOS = () => {
    if (onTriggerGlobalSOS) onTriggerGlobalSOS();
    if (onOpenSOSModal) onOpenSOSModal();
  };

  // Real, transparent dynamic ticker messages based on active live system state
  const tickerItems = [
    `📡 Live Area: ${userAddress} • 5km Emergency Mesh Active`,
    notifStatus === 'granted'
      ? '🔔 Area Push Alerts Enabled: Instant alerts when neighbors request aid'
      : '🔔 Click "Enable Push" to receive instant alerts when someone nearby needs help',
    openHelpRequestCount > 0
      ? `🤝 ${openHelpRequestCount} Community Aid Request(s) active in the database`
      : '🤝 Community Aid Board: Real-time resident assistance without fake records',
    activeSOSCount > 0
      ? `🚨 ${activeSOSCount} Active SOS Distress Beacon(s) broadcasting`
      : '🛡️ Unified Crisis Hub: Direct response & emergency services dispatch',
    '⚖️ Statutory Rule: False alarms and fraudulent reports are punishable by law',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [tickerItems.length]);

  const toggleSiren = () => {
    if (isSirenOn) {
      soundPlayer.stopSiren();
      setIsSirenOn(false);
    } else {
      soundPlayer.playSiren();
      setIsSirenOn(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050810]/90 backdrop-blur-xl border-b border-white/10 transition-all shadow-xl">
      {/* Dynamic Real-Time Ticker Bar */}
      <div className="w-full px-4 py-1.5 text-xs transition-colors flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
            Live Net
          </span>
          <p className="truncate text-xs font-medium text-slate-300">
            {tickerItems[tickerIndex]}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-[11px]">
          {/* Push Notification Toggle */}
          <button
            onClick={handleEnablePush}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-[11px] font-semibold ${
              notifStatus === 'granted'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
            }`}
            title="Toggle Instant Push Alerts for nearby help requests"
          >
            {notifStatus === 'granted' ? (
              <BellRing className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">
              {notifStatus === 'granted' ? 'Push Alerts: ON' : 'Enable Push Alerts'}
            </span>
          </button>

          {/* Rules / Penalties */}
          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-slate-200 transition-all"
            title="Read Rules & Penalties"
          >
            <Scale className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Rules</span>
          </button>

          {/* Live GPS Area Button */}
          <button
            onClick={onRefreshLocation}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 transition-all"
            title="Click to detect or switch zone"
          >
            <MapPin className={`w-3.5 h-3.5 ${isGpsLocked ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="font-semibold text-white max-w-[130px] sm:max-w-[200px] truncate">
              {userAddress}
            </span>
          </button>
        </div>
      </div>

      {/* Main Streamlined Navigation Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-3">
        {/* Brand & Back Button */}
        <div className="flex items-center gap-3">
          {activeTab !== 'map' ? (
            <button
              onClick={() => changeTab('map')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 shadow-md"
              title="Return to Interactive Live Map"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Map</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => changeTab('map')}>
              <div className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30 flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
                  CIVIC<span className="text-red-500">RELIEF</span>
                </h1>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                  Emergency Defense Net
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4 Core Simplified Tabs (Clean & Clear) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => changeTab('map')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'map'
                ? 'bg-white text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-4 h-4 text-blue-500" />
            <span>Live Map</span>
          </button>

          <button
            onClick={() => changeTab('women_safety')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all relative ${
              activeTab === 'women_safety'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Women SOS</span>
            {activeSOSCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500/30 text-rose-200 border border-rose-500/50 animate-pulse">
                {activeSOSCount}
              </span>
            )}
          </button>

          <button
            onClick={() => changeTab('mutual_aid')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all relative ${
              activeTab === 'mutual_aid'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Mutual Aid</span>
            {openHelpRequestCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                activeTab === 'mutual_aid' ? 'bg-black text-emerald-300' : 'bg-emerald-500/30 text-emerald-300'
              }`}>
                {openHelpRequestCount}
              </span>
            )}
          </button>

          <button
            onClick={() => changeTab('forest_fire')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all relative ${
              activeTab === 'forest_fire'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'bg-orange-500/10 text-orange-300 border border-orange-500/30 hover:bg-orange-500/20'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Wildfire Watch</span>
          </button>

          <button
            onClick={() => changeTab('weather_gpt')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'weather_gpt'
                ? 'bg-sky-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Weather & Hazards</span>
          </button>
        </nav>

        {/* Action Controls (Right) */}
        <div className="flex items-center gap-2">
          {/* Admin Badge */}
          {isAdmin && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-all"
              title="Open Admin Authority Portal"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* User Account / Login */}
          {currentUser ? (
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-1 rounded-lg transition-all"
                title="Your Profile"
              >
                <div className="w-5 h-5 rounded-md bg-blue-600/40 flex items-center justify-center text-[10px] font-bold text-white">
                  {isMasterAdmin ? '👑' : <User className="w-3 h-3 text-blue-300" />}
                </div>
                <span className="font-bold text-white max-w-[90px] truncate hidden sm:inline">
                  {currentUser.displayName}
                </span>
              </button>
              <button
                onClick={logout}
                className="p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-slate-300" />
              <span>Login</span>
            </button>
          )}

          {/* AI Advisor Button */}
          <button
            onClick={onOpenAIAdvisor}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-semibold transition-all"
            title="Ask AI Crisis Advisor"
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">AI Advice</span>
          </button>

          {/* Siren Test Button */}
          <button
            onClick={toggleSiren}
            className={`p-2 rounded-xl text-xs font-semibold transition-all border ${
              isSirenOn
                ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-lg'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title={isSirenOn ? 'Stop Emergency Siren' : 'Test Emergency Siren'}
          >
            {isSirenOn ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Big SOS Beacon Button */}
          <button
            id="emergency-sos-header-btn"
            onClick={triggerSOS}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold tracking-wide uppercase shadow-lg shadow-red-600/30 border border-red-400/40 transition-all hover:scale-105 active:scale-95 animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>SOS</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Strip (5 Clean Touch Tabs) */}
      <div className="md:hidden grid grid-cols-5 px-1.5 py-1.5 bg-black/60 border-t border-white/10 text-[10px] gap-1">
        <button
          onClick={() => changeTab('map')}
          className={`flex flex-col items-center py-1 rounded-lg font-bold transition-all ${
            activeTab === 'map' ? 'bg-white text-black' : 'text-slate-400'
          }`}
        >
          <Compass className="w-3.5 h-3.5 mb-0.5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => changeTab('women_safety')}
          className={`flex flex-col items-center py-1 rounded-lg font-bold transition-all relative ${
            activeTab === 'women_safety' ? 'bg-rose-600 text-white' : 'text-rose-400'
          }`}
        >
          <Shield className="w-3.5 h-3.5 mb-0.5" />
          <span>Women</span>
          {activeSOSCount > 0 && (
            <span className="absolute top-1 right-2 h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => changeTab('mutual_aid')}
          className={`flex flex-col items-center py-1 rounded-lg font-bold transition-all relative ${
            activeTab === 'mutual_aid' ? 'bg-emerald-500 text-black' : 'text-slate-400'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5 mb-0.5" />
          <span>Mutual Aid</span>
          {openHelpRequestCount > 0 && (
            <span className="absolute top-1 right-2 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => changeTab('forest_fire')}
          className={`flex flex-col items-center py-1 rounded-lg font-bold transition-all relative ${
            activeTab === 'forest_fire' ? 'bg-orange-600 text-white' : 'text-orange-400'
          }`}
        >
          <Flame className="w-3.5 h-3.5 mb-0.5" />
          <span>Wildfire</span>
        </button>

        <button
          onClick={() => changeTab('weather_gpt')}
          className={`flex flex-col items-center py-1 rounded-lg font-bold transition-all ${
            activeTab === 'weather_gpt' ? 'bg-sky-500 text-black' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 mb-0.5" />
          <span>Weather</span>
        </button>
      </div>
    </header>
  );
};
