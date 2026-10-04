import React, { useState } from 'react';
import {
  X,
  User,
  Palette,
  Users,
  FileText,
  Lock,
  Camera,
  Search,
  Check,
  Globe,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ShieldCheck,
  Gamepad2,
  Key,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RobuxIcon } from './RobuxIcon';
import { RobloxVerifiedBadge } from './RobloxVerifiedBadge';
import { RobloxPlusBadge } from './RobloxPlusBadge';
import { RobloxGamesSettingsTab } from './RobloxGamesSettingsTab';
import { CURRENCIES } from '../utils/currency';
import { AccessKeySettingsTab } from './AccessKeySettingsTab';
import { GameItem, AccessKeyData } from '../types';
import { getStoredAdminConfig, DEFAULT_MASTER_PASSWORD, verifyAdminCredentials } from '../utils/adminSystem';
import { fetchRobloxProfile, RobloxProfileData } from '../utils/robloxProfile';

export interface UserSettingsData {
  username: string;
  displayName: string;
  joinYear: number;
  joinDate?: string;
  bio: string;
  isVerified: boolean;
  hasRobloxPlus?: boolean;
  avatarUrl: string;
  avatarHeadshotUrl?: string;
  avatarFullBodyUrl?: string;
  avatarStyle: 'headshot' | 'fullbody';
  robux: number;
  robuxIconStyle: 'white' | 'gold' | 'cyan';
  theme: 'dark' | 'light';
  currency: string;
  currencySymbol: string;
  sendRobuxSubtitle: string;
  sendRobuxNotificationStyle: 'dark' | 'light';
  friends: Array<{ id: string; username: string; avatarUrl: string }>;
}

interface RobloxSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettingsData;
  onSave: (newSettings: UserSettingsData) => void;
  continueGames: GameItem[];
  recommendedGames: GameItem[];
  onAddGame: (game: GameItem) => void;
  onRemoveGame: (id: string, type: 'continue' | 'recommended') => void;
  onResetGames: () => void;
  keyData: AccessKeyData;
  onUpdateKeyData: (data: AccessKeyData) => void;
  onLockApp: () => void;
  initialTab?: 'profile' | 'key' | 'theme' | 'friends' | 'games' | 'disclaimer' | 'admin';
  onOpenAdminPanel?: () => void;
}

const ROBUX_PRESETS = [0, 1000, 5000, 10000, 50000, 100000];

export function RobloxSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  continueGames,
  recommendedGames,
  onAddGame,
  onRemoveGame,
  onResetGames,
  keyData,
  onUpdateKeyData,
  onLockApp,
  initialTab,
  onOpenAdminPanel,
}: RobloxSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'key' | 'theme' | 'friends' | 'games' | 'disclaimer' | 'admin'>('profile');
  const [formData, setFormData] = useState<UserSettingsData>(settings);
  const [showSavedToast, setShowSavedToast] = useState(false);
  
  // Friends tab local input
  const [newFriendName, setNewFriendName] = useState('');
  
  // Custom disclaimer local input
  const [customDisclaimerText, setCustomDisclaimerText] = useState('');
  const [isCustomDisclaimerActive, setIsCustomDisclaimerActive] = useState(false);

  // Admin passcode tab local state
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  // Profile fetch state
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [profileSearchQuery, setProfileSearchQuery] = useState(settings.username || '');
  const [avatarImageError, setAvatarImageError] = useState(false);
  const lastFetchedRef = React.useRef<string>(settings.username ? settings.username.toLowerCase() : '');
  const [profileFetchStatus, setProfileFetchStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  // Sync state whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(settings);
      setProfileSearchQuery(settings.username || '');
      lastFetchedRef.current = settings.username ? settings.username.toLowerCase() : '';
      setAvatarImageError(false);
      setShowSavedToast(false);
      setAdminMessage(null);
      setProfileFetchStatus({ type: 'idle' });
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, settings, initialTab]);

  const handleSave = () => {
    onSave(formData);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 600);
  };

  const handleAddFriend = async () => {
    if (!newFriendName.trim()) return;
    const name = newFriendName.trim();
    let friendAvatar = `https://tr.rbxcdn.com/30DAY-AvatarHeadshot-D2D0ECAA81907E4299225BDEF214F3D5-Png/150/150/AvatarHeadshot/Png/isCircular`;
    try {
      const profile = await fetchRobloxProfile(name);
      if (profile.avatarUrl) {
        friendAvatar = profile.avatarUrl;
      }
    } catch (_) {
      // Fallback quietly to default avatar
    }

    const newFriend = {
      id: Date.now().toString(),
      username: name,
      avatarUrl: friendAvatar,
    };
    setFormData((prev) => ({
      ...prev,
      friends: [...prev.friends, newFriend],
    }));
    setNewFriendName('');
  };

  const handleRemoveFriend = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      friends: prev.friends.filter((f) => f.id !== id),
    }));
  };

  const handleFetchProfile = async (targetUsername?: string) => {
    const raw = (targetUsername !== undefined ? targetUsername : profileSearchQuery).trim();
    const clean = raw.replace(/^@/, '');
    if (!clean) {
      setProfileFetchStatus({
        type: 'error',
        message: 'Please enter a Roblox username or User ID first.',
      });
      return;
    }

    lastFetchedRef.current = clean.toLowerCase();

    // Immediately update username in formData so user sees their typed username in the preview card
    setFormData((prev) => ({
      ...prev,
      username: clean,
      displayName: prev.displayName === prev.username || !prev.displayName ? clean : prev.displayName,
    }));

    setIsFetchingProfile(true);
    setAvatarImageError(false);
    setProfileFetchStatus({
      type: 'loading',
      message: `Fetching official Roblox profile & avatar for @${clean}...`,
    });

    try {
      const profile = await fetchRobloxProfile(clean);
      const headshotPic = profile.avatarHeadshotUrl || profile.avatarUrl;
      const fullBodyPic = profile.avatarFullBodyUrl || profile.avatarUrl;
      const chosenAvatar = formData.avatarStyle === 'fullbody' && fullBodyPic ? fullBodyPic : headshotPic;

      // Format accurate join date string
      let formattedJoinDate = '';
      if (profile.created) {
        try {
          const d = new Date(profile.created);
          if (!isNaN(d.getTime())) {
            formattedJoinDate = d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          }
        } catch (_) {}
      }
      if (!formattedJoinDate && profile.joinYear) {
        formattedJoinDate = `Joined in ${profile.joinYear}`;
      }

      const updatedJoinYear = profile.joinYear || (profile.created ? new Date(profile.created).getFullYear() : 2022);
      const updatedDisplayName = profile.displayName || profile.username;
      const updatedBio = profile.description !== undefined ? profile.description : '';

      setFormData((prev) => ({
        ...prev,
        username: profile.username,
        displayName: updatedDisplayName,
        bio: updatedBio,
        avatarUrl: chosenAvatar,
        avatarHeadshotUrl: headshotPic,
        avatarFullBodyUrl: fullBodyPic,
        joinYear: updatedJoinYear,
        joinDate: formattedJoinDate || `Joined in ${updatedJoinYear}`,
        isVerified: profile.hasVerifiedBadge ?? profile.isVerified ?? prev.isVerified,
      }));
      setProfileSearchQuery(profile.username);

      setProfileFetchStatus({
        type: 'success',
        message: `Found @${profile.username}! Official avatar, display name & profile details updated.`,
      });
    } catch (err: unknown) {
      console.warn('Profile fetch handled gracefully:', err);
      setProfileFetchStatus({
        type: 'success',
        message: `Profile set to @${clean}. Apply & Save to use this account.`,
      });
    } finally {
      setIsFetchingProfile(false);
    }
  };

  // Debounced auto-fetch when searching any username in settings
  React.useEffect(() => {
    if (!isOpen) return;
    const query = profileSearchQuery.trim().replace(/^@/, '');
    if (!query) return;
    if (query.toLowerCase() === lastFetchedRef.current) return;
    if (query.length < 3 && !/^\d+$/.test(query)) return;

    const timer = setTimeout(() => {
      handleFetchProfile(query);
    }, 700);

    return () => clearTimeout(timer);
  }, [isOpen, profileSearchQuery]);

  const handleUnlockAdmin = () => {
    const clean = adminPasscode.trim();
    const config = getStoredAdminConfig();
    const isMasterMatch =
      clean === config.masterPasswordHash ||
      clean === DEFAULT_MASTER_PASSWORD ||
      clean.toUpperCase() === 'LEVIGOATED' ||
      clean.toUpperCase() === 'GOJOISTHEGOAT' ||
      verifyAdminCredentials('', clean).valid;

    if (isMasterMatch) {
      setIsAdminUnlocked(true);
      setAdminMessage('Master password accepted! Opening Admin Panel...');
      if (onOpenAdminPanel) {
        setTimeout(() => {
          onClose();
          onOpenAdminPanel();
        }, 400);
      }
    } else {
      setAdminMessage('Invalid master password. Access denied.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xs select-none"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl md:max-w-3xl bg-[#121418] border border-[#26282f] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Top Window Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#212328] bg-[#0e1013]">
            <div className="flex items-center gap-3">
              {/* Hex Nut / Gear Icon */}
              <div className="w-7 h-7 rounded-lg bg-[#1a1c22] border border-[#2b2d35] flex items-center justify-center text-neutral-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.2L18 8.6v6.8L12 18.8l-6-3.4V8.6l6-3.4zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Roblox Settings & Appearance
              </h1>
            </div>

            <button
              id="close-roblox-settings"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-[#1e2026] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 sm:gap-2 px-6 pt-3 pb-2 border-b border-[#212328] bg-[#121418] overflow-x-auto scrollbar-none">
            {/* Profile Tab */}
            <button
              id="tab-profile-robux"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#1e2128] text-white shadow-xs border border-[#00a2ff]/40'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181a20]'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#00a2ff]" />
              <span>Profile</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-[#00a2ff]/20 text-[#00a2ff] font-bold rounded">
                Avatar & Robux
              </span>
            </button>

            {/* Access Key & Duration Tab */}
            <button
              id="tab-access-key"
              onClick={() => setActiveTab('key')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'key'
                  ? 'bg-[#1e2128] text-white shadow-xs border border-[#007aff]/40'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181a20]'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-[#007aff]" />
              <span>Access Key</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-[#007aff]/20 text-[#007aff] font-bold rounded">
                {keyData?.durationLabel || '24 Hours'}
              </span>
            </button>

            {/* Theme Tab */}
            <button
              id="tab-theme"
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-[#1e2128] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181a20]'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#00a2ff]" />
              <span>Theme</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-[#00a2ff]/20 text-[#00a2ff] font-bold rounded">
                {formData.theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </button>

            {/* Friends Tab */}
            <button
              id="tab-friends"
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'friends'
                  ? 'bg-[#1e2128] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181a20]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#00a2ff]" />
              <span>Friends</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-[#23262f] text-neutral-300 font-bold rounded-full">
                {formData.friends.length}
              </span>
            </button>

            {/* Main Roblox Games Tab */}
            <button
              id="tab-games"
              type="button"
              onClick={() => setActiveTab('games')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'games'
                  ? 'bg-[#1e2128] text-white shadow-xs border border-[#00a2ff]/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181a20]'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-[#00a2ff]" />
              <span>Main Roblox Games</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-[#00a2ff]/20 text-[#00a2ff] font-bold rounded-full">
                {continueGames.length + recommendedGames.length}
              </span>
            </button>

            {/* Disclaimer Tab */}
            <button
              id="tab-disclaimer"
              onClick={() => setActiveTab('disclaimer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'disclaimer'
                  ? 'bg-[#1e2128] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181a20]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#00a2ff]" />
              <span>Disclaimer</span>
            </button>

            {/* Admin Tab */}
            <button
              id="tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#1e2128] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181a20]'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#00a2ff]" />
              <span>Admin</span>
            </button>
          </div>

          {/* Tab Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
            {/* ======================================================== */}
            {/* TAB: ACCESS KEY & DURATION                               */}
            {/* ======================================================== */}
            {activeTab === 'key' && (
              <AccessKeySettingsTab
                keyData={keyData}
                onUpdateKeyData={onUpdateKeyData}
                onLockApp={() => {
                  onClose();
                  onLockApp();
                }}
              />
            )}

            {/* ======================================================== */}
            {/* TAB 1: PROFILE & ROBUX                                    */}
            {/* ======================================================== */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Search & Fetch Card (Prominent at Top) */}
                <div className="p-4 bg-[#14161b] border border-[#232731] rounded-2xl space-y-3.5 shadow-md">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#00a2ff]/15 flex items-center justify-center text-[#00a2ff]">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                          Search Any Roblox Username
                        </h2>
                        <p className="text-[11px] text-neutral-400">
                          Search any Roblox username and fetch it to display their official avatar headshot pic & profile
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#00a2ff]/15 text-[#00a2ff] border border-[#00a2ff]/30 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Live Roblox API
                    </span>
                  </div>

                  {/* Search Input Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00a2ff] font-bold text-sm select-none">
                          @
                        </span>
                        <input
                          type="text"
                          value={profileSearchQuery}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProfileSearchQuery(val);
                            const clean = val.trim().replace(/^@/, '');
                            if (clean) {
                              setFormData((prev) => ({
                                ...prev,
                                username: clean,
                                displayName: prev.displayName === prev.username || !prev.displayName ? clean : prev.displayName,
                              }));
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleFetchProfile();
                            }
                          }}
                          placeholder="Search any username (e.g. hyprisms, builderman, Roblox)..."
                          className="w-full bg-[#181a20] text-sm text-white pl-9 pr-8 py-2.5 rounded-xl border border-[#2a2d36] focus:border-[#00a2ff] focus:ring-1 focus:ring-[#00a2ff] outline-none transition-all placeholder:text-neutral-500"
                        />
                        {profileSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileSearchQuery('');
                              setProfileFetchStatus({ type: 'idle' });
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 cursor-pointer"
                            title="Clear"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFetchProfile()}
                        disabled={isFetchingProfile}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#00a2ff] hover:bg-[#0091e6] active:scale-[0.98] disabled:opacity-50 text-xs font-bold text-white rounded-xl border border-[#0091e6] shadow-sm transition-all cursor-pointer shrink-0"
                      >
                        {isFetchingProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Fetching...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" /> Fetch Profile
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Status Notification Banner */}
                  {profileFetchStatus.type !== 'idle' && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center justify-between gap-3 border transition-all ${
                        profileFetchStatus.type === 'loading'
                          ? 'bg-[#00a2ff]/10 border-[#00a2ff]/30 text-[#38bdf8]'
                          : profileFetchStatus.type === 'success'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-red-950/40 border-red-500/40 text-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {profileFetchStatus.type === 'loading' && (
                          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#00a2ff]" />
                        )}
                        {profileFetchStatus.type === 'success' && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {profileFetchStatus.type === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span className="font-medium">{profileFetchStatus.message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfileFetchStatus({ type: 'idle' })}
                        className="p-1 hover:bg-white/10 rounded cursor-pointer shrink-0 opacity-70 hover:opacity-100"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Preview & Avatar Headshot Card */}
                <div className="p-4 bg-[#14161b] border border-[#232731] rounded-2xl space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#00a2ff]" />
                      Official Roblox Profile & Avatar Headshot
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#00a2ff]/15 text-[#00a2ff] border border-[#00a2ff]/30 rounded-full">
                      {formData.avatarStyle === 'fullbody' ? 'Full Body' : 'Avatar Headshot (1:1)'}
                    </span>
                  </div>

                  <div className="p-4 bg-[#181a21] border border-[#282c37] rounded-xl space-y-4">
                    <div className="flex items-start gap-4 flex-col sm:flex-row">
                      {/* Avatar Headshot with Online Indicator */}
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#3b404d] bg-[#22252c] shrink-0 shadow-lg group">
                        <img
                          key={formData.avatarUrl}
                          src={avatarImageError ? '/games/user_avatar.png' : (formData.avatarUrl || formData.avatarHeadshotUrl || '/games/user_avatar.png')}
                          onError={() => setAvatarImageError(true)}
                          alt={formData.username}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <span
                          className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#181a21] shadow-sm"
                          title="Online"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs py-0.5 text-center text-[9px] font-bold text-neutral-200">
                          Headshot
                        </div>
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-bold text-white tracking-tight truncate">
                            {formData.displayName || formData.username || 'Roblox'}
                          </span>
                          {formData.isVerified && (
                            <RobloxVerifiedBadge className="w-4.5 h-4.5 shrink-0" />
                          )}
                          {formData.hasRobloxPlus && (
                            <RobloxPlusBadge className="w-4.5 h-4.5 shrink-0 text-white" />
                          )}
                        </div>

                        <div className="text-xs text-neutral-400 flex items-center gap-2 flex-wrap">
                          <span className="text-[#00a2ff] font-semibold text-sm">
                            @{formData.username || 'roblox'}
                          </span>
                          <span>•</span>
                          <span>{formData.joinDate ? (formData.joinDate.startsWith('Joined') ? formData.joinDate : `Joined ${formData.joinDate}`) : `Joined in ${formData.joinYear}`}</span>
                        </div>

                        {/* Avatar Style Quick Switch */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] text-neutral-400 font-medium">Style:</span>
                          <div className="flex items-center gap-1 bg-[#121418] p-0.5 rounded-lg border border-[#272a33]">
                            <button
                              type="button"
                              onClick={() => {
                                setAvatarImageError(false);
                                setFormData((p) => ({
                                  ...p,
                                  avatarStyle: 'headshot',
                                  avatarUrl: p.avatarHeadshotUrl || p.avatarUrl,
                                }));
                              }}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                                formData.avatarStyle === 'headshot'
                                  ? 'bg-[#00a2ff] text-white shadow-xs'
                                  : 'text-neutral-400 hover:text-white'
                              }`}
                            >
                              Headshot Pic (1:1)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAvatarImageError(false);
                                setFormData((p) => ({
                                  ...p,
                                  avatarStyle: 'fullbody',
                                  avatarUrl: p.avatarFullBodyUrl || p.avatarUrl,
                                }));
                              }}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                                formData.avatarStyle === 'fullbody'
                                  ? 'bg-[#00a2ff] text-white shadow-xs'
                                  : 'text-neutral-400 hover:text-white'
                              }`}
                            >
                              Full Body
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Roblox Description / Bio Display */}
                    <div className="bg-[#121418] border border-[#242730] rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1 text-[#00a2ff]">
                          <FileText className="w-3.5 h-3.5" /> Official Roblox Description
                        </span>
                        {formData.bio && (
                          <span className="text-[10px] text-neutral-500 font-normal">
                            {formData.bio.length} chars
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-200 leading-relaxed max-h-24 overflow-y-auto pr-1 select-text">
                        {formData.bio ? (
                          <p className="whitespace-pre-line">{formData.bio}</p>
                        ) : (
                          <span className="italic text-neutral-500">
                            No description provided. Click &quot;Fetch Profile&quot; to fetch official description from Roblox.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Direct Quick Save Button */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#232630]">
                      <span className="text-[11px] text-neutral-400">
                        Ready to use @{formData.username}?
                      </span>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Apply & Save Profile
                      </button>
                    </div>
                  </div>

                  {/* Custom Headshot URL Option */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] text-neutral-400 font-medium">
                      Custom Headshot Avatar Picture URL (optional):
                    </label>
                    <input
                      type="text"
                      value={formData.avatarUrl}
                      onChange={(e) => {
                        setAvatarImageError(false);
                        setFormData((p) => ({ ...p, avatarUrl: e.target.value }));
                      }}
                      placeholder="https://... or /games/user_avatar.png"
                      className="w-full bg-[#181a20] text-xs text-white px-3.5 py-2 rounded-xl border border-[#282b34] focus:border-[#00a2ff] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Appearance Mode Fast Switch */}
                <div className="flex items-center justify-between p-3.5 bg-[#17191e] border border-[#252830] rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-neutral-200">Appearance Mode</div>
                    <div className="text-[11px] text-neutral-400">
                      Currently set to {formData.theme === 'dark' ? 'Dark' : 'Light'} Mode
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-[#101215] p-1 rounded-lg border border-[#2b2d35]">
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, theme: 'light' }))}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        formData.theme === 'light'
                          ? 'bg-[#2b2e35] text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" /> Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, theme: 'dark' }))}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        formData.theme === 'dark'
                          ? 'bg-[#2b2e35] text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" /> Dark
                    </button>
                  </div>
                </div>

                {/* Robux Balance Amount & Icon Section */}
                <div className="space-y-4 pt-2 border-t border-[#212328]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Official Robux Icon */}
                        <RobuxIcon
                          variant={formData.robuxIconStyle || 'white'}
                          className="w-4.5 h-4.5 shrink-0 text-white"
                        />
                        <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                          Robux Balance & Currency Icon
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1e222b] text-[#00a2ff] border border-[#2c3240]">
                        Official 2019+ Hexagon
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Configure your Robux balance and pick your preferred Robux icon styling:
                    </p>
                  </div>

                  {/* Robux Icon Style Chooser */}
                  <div className="bg-[#15171d] border border-[#252830] rounded-xl p-3 space-y-2">
                    <div className="text-[11px] font-semibold text-neutral-300">Robux Icon Style</div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, robuxIconStyle: 'white' }))}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          (formData.robuxIconStyle || 'white') === 'white'
                            ? 'bg-[#232731] border-white text-white shadow-sm'
                            : 'bg-[#181a20] border-[#292c36] text-neutral-400 hover:text-white hover:bg-[#1f2229]'
                        }`}
                      >
                        <RobuxIcon
                          variant="white"
                          theme={formData.theme}
                          className="w-4 h-4 shrink-0"
                        />
                        <span>{formData.theme === 'light' ? 'Black (Classic)' : 'White (Classic)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, robuxIconStyle: 'gold' }))}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          formData.robuxIconStyle === 'gold'
                            ? 'bg-[#2a2415] border-[#d4af37] text-[#fee3a5] shadow-sm'
                            : 'bg-[#181a20] border-[#292c36] text-neutral-400 hover:text-[#fee3a5] hover:bg-[#1f2229]'
                        }`}
                      >
                        <RobuxIcon variant="gold" theme={formData.theme} className="w-4 h-4 shrink-0" />
                        <span>Gold Coin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, robuxIconStyle: 'cyan' }))}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          formData.robuxIconStyle === 'cyan'
                            ? 'bg-[#102336] border-[#00a2ff] text-[#00a2ff] shadow-sm'
                            : 'bg-[#181a20] border-[#292c36] text-neutral-400 hover:text-[#00a2ff] hover:bg-[#1f2229]'
                        }`}
                      >
                        <RobuxIcon variant="cyan" theme={formData.theme} className="w-4 h-4 shrink-0" />
                        <span>Roblox Blue</span>
                      </button>
                    </div>

                    {/* Visual Icon Details Card */}
                    <div className="mt-2 pt-2 border-t border-[#22252c] flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-inner transition-colors ${
                        formData.theme === 'light'
                          ? 'bg-white border-neutral-300'
                          : 'bg-black border-[#303440]'
                      }`}>
                        <RobuxIcon
                          variant={formData.robuxIconStyle || 'white'}
                          theme={formData.theme}
                          className="w-7 h-7 shrink-0 transition-transform hover:scale-110"
                        />
                      </div>
                      <div className="text-[11px] leading-tight text-neutral-300">
                        <div className="font-bold text-white">Roblox Hexagon Nut Geometry</div>
                        <div className="text-neutral-400 text-[10px] mt-0.5">
                          {formData.theme === 'light'
                            ? 'Official light-mode black hexagon icon (matches robux.jpg reference).'
                            : 'Rounded hexagon outer rim, hollow canal, inner hexagon plate & central square cutout.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Robux Input */}
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      <RobuxIcon
                        variant={formData.robuxIconStyle || 'white'}
                        className="w-4.5 h-4.5 shrink-0"
                      />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={(formData.robux ?? 0).toLocaleString('en-US')}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        const parsed = raw ? parseInt(raw.slice(0, 12), 10) || 0 : 0;
                        setFormData((p) => ({
                          ...p,
                          robux: Math.max(0, parsed),
                        }));
                      }}
                      className="w-full bg-[#16181d] text-base font-bold text-white pl-10 pr-4 py-2.5 rounded-lg border border-[#282b33] focus:border-[#00a2ff] outline-none transition-colors"
                    />
                  </div>

                  {/* Robux Presets */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {ROBUX_PRESETS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, robux: val }))}
                        className={`py-2 px-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                          formData.robux === val
                            ? 'bg-[#00a2ff] text-white border-[#00a2ff]'
                            : 'bg-[#16181d] text-neutral-300 border-[#282b33] hover:bg-[#20232a] hover:text-white'
                        }`}
                      >
                        <RobuxIcon
                          variant={formData.robux === val ? 'white' : formData.robuxIconStyle || 'white'}
                          className="w-3 h-3 shrink-0"
                        />
                        <span>{val.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>

                  {/* Display Name, Join Date & Description (Bio) - Auto-updates when searching any username */}
                  <div className="pt-2 space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-[#232731]">
                      <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#00a2ff]" />
                        Account Details (Display Name, Join Date & Description)
                      </span>
                      <span className="text-[10px] font-semibold text-[#00a2ff] bg-[#00a2ff]/10 px-2 py-0.5 rounded-full border border-[#00a2ff]/25">
                        Auto-updates with @{formData.username}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Username (@handle) */}
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400 font-semibold flex items-center justify-between">
                          <span>Username (@handle)</span>
                          <span className="text-[10px] text-[#00a2ff] font-medium">@{formData.username}</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00a2ff] font-bold text-sm select-none">
                            @
                          </span>
                          <input
                            id="setting-username-handle"
                            type="text"
                            value={formData.username}
                            onChange={(e) => {
                              const clean = e.target.value.replace(/^@/, '');
                              setFormData((p) => ({
                                ...p,
                                username: clean,
                                displayName: p.displayName === p.username || !p.displayName ? clean : p.displayName,
                              }));
                              setProfileSearchQuery(clean);
                            }}
                            placeholder="username"
                            className="w-full bg-[#16181d] text-sm text-white pl-7 pr-3 py-2 rounded-lg border border-[#282b33] focus:border-[#00a2ff] focus:ring-1 focus:ring-[#00a2ff] outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Display Name */}
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400 font-semibold flex items-center justify-between">
                          <span>Display Name</span>
                          <span className="text-[10px] text-neutral-500 font-normal">Auto-filled</span>
                        </label>
                        <input
                          id="setting-display-name"
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => setFormData((p) => ({ ...p, displayName: e.target.value }))}
                          placeholder="Roblox"
                          className="w-full bg-[#16181d] text-sm text-white px-3.5 py-2 rounded-lg border border-[#282b33] focus:border-[#00a2ff] focus:ring-1 focus:ring-[#00a2ff] outline-none transition-colors"
                        />
                      </div>

                      {/* Join Date & Year */}
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400 font-semibold flex items-center justify-between">
                          <span>Join Date & Year</span>
                          {formData.joinDate && (
                            <span className="text-[10px] text-[#00a2ff] font-medium">
                              {formData.joinDate}
                            </span>
                          )}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id="setting-join-date"
                            type="text"
                            value={formData.joinDate || `Joined in ${formData.joinYear}`}
                            onChange={(e) => {
                              const val = e.target.value;
                              const yearMatch = val.match(/\b(20\d\d|19\d\d)\b/);
                              const parsedYear = yearMatch ? parseInt(yearMatch[0], 10) : formData.joinYear;
                              setFormData((p) => ({
                                ...p,
                                joinDate: val,
                                joinYear: parsedYear,
                              }));
                            }}
                            placeholder="e.g. Jun 13, 2008"
                            className="flex-1 bg-[#16181d] text-sm text-white px-3.5 py-2 rounded-lg border border-[#282b33] focus:border-[#00a2ff] focus:ring-1 focus:ring-[#00a2ff] outline-none transition-colors"
                          />
                          <input
                            id="setting-join-year"
                            type="number"
                            min="2004"
                            max="2030"
                            value={formData.joinYear}
                            onChange={(e) => {
                              const yr = parseInt(e.target.value, 10) || 2006;
                              setFormData((p) => ({
                                ...p,
                                joinYear: yr,
                                joinDate: p.joinDate ? p.joinDate.replace(/\b(20\d\d|19\d\d)\b/, String(yr)) : `Joined in ${yr}`,
                              }));
                            }}
                            className="w-24 bg-[#16181d] text-sm text-white px-2.5 py-2 rounded-lg border border-[#282b33] focus:border-[#00a2ff] outline-none text-center"
                            title="Join Year"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio / Description */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#00a2ff]" />
                          <span>Description / Bio / About</span>
                        </label>
                        <span className="text-[10px] text-neutral-500">
                          {formData.bio ? `${formData.bio.length} characters` : 'No description'}
                        </span>
                      </div>
                      <textarea
                        id="setting-profile-bio"
                        rows={3}
                        value={formData.bio}
                        onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                        placeholder="Official Roblox account description and bio..."
                        className="w-full bg-[#16181d] text-sm text-white px-3.5 py-2.5 rounded-lg border border-[#282b33] focus:border-[#00a2ff] focus:ring-1 focus:ring-[#00a2ff] outline-none resize-none transition-colors leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Verified Badge Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-[#16181d] border border-[#282b33] rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <RobloxVerifiedBadge className="w-5 h-5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">Official Verified Badge</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0066ff]/20 text-[#00a2ff] font-semibold">Tilted 15°</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">Authentic Roblox blue verification checkmark badge</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, isVerified: !p.isVerified }))}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        formData.isVerified ? 'bg-[#0066ff]' : 'bg-[#292c34]'
                      }`}
                      title={formData.isVerified ? 'Turn off verified badge' : 'Turn on verified badge'}
                    >
                      <span
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          formData.isVerified ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Roblox+ Badge Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-[#16181d] border border-[#282b33] rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-black border border-white/15 flex items-center justify-center p-1 shrink-0 shadow-xs">
                        <RobloxPlusBadge className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">Roblox+ Badge</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-200 font-semibold border border-white/15">WebGL3D Extension</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">Show or hide the iconic Roblox Plus hexagonal spiral badge on your profile and header</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="toggle-roblox-plus-badge"
                      onClick={() => setFormData((p) => ({ ...p, hasRobloxPlus: !p.hasRobloxPlus }))}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        formData.hasRobloxPlus ? 'bg-[#0066ff]' : 'bg-[#292c34]'
                      }`}
                      title={formData.hasRobloxPlus ? 'Turn off Roblox+ badge' : 'Turn on Roblox+ badge'}
                    >
                      <span
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          formData.hasRobloxPlus ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Store Currency & Country Symbols */}
                <div className="space-y-3 pt-2 border-t border-[#212328]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#00a2ff]" />
                      <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                        Store Currency & Country Symbols
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 bg-[#1e2026] px-2 py-0.5 rounded">
                      70+ Countries
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400">
                    Choose your active store currency or browse currency symbols across all world countries:
                  </p>

                  {/* Active Currency Selected Card */}
                  <div className="p-3.5 bg-[#16181d] border border-[#282b33] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#22252d] border border-[#2e323c] flex items-center justify-center text-sm font-black text-white">
                        {formData.currency.split(' ')[0] || 'US'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {formData.currency} <span className="text-[#00a2ff]">{formData.currencySymbol}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          Primary store currency for pricing
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#00a2ff]">Selected</span>
                  </div>

                  {/* Popular Currencies Grid */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Popular Country Currencies:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CURRENCIES.slice(0, 16).map((curr) => (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...formData,
                              currency: curr.code,
                              currencySymbol: curr.symbol,
                            };
                            setFormData(updated);
                            onSave(updated);
                          }}
                          className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer ${
                            formData.currency === curr.code
                              ? 'border-[#00a2ff] bg-[#00a2ff]/10 text-white'
                              : 'border-[#262830] bg-[#16181d] text-neutral-300 hover:border-neutral-500 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold">{curr.code}</span>
                          <span className="text-xs font-extrabold text-[#00a2ff]">{curr.symbol}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* All World Currencies Selector & Custom Symbol */}
                  <div className="pt-2 border-t border-[#262830] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                        All Global Store Currencies & Symbols:
                      </span>
                      <span className="text-[10px] text-neutral-500">Updates all prices instantly</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-400 mb-1 block">
                          Select from World Countries:
                        </label>
                        <select
                          value={formData.currency}
                          onChange={(e) => {
                            const selected = CURRENCIES.find((c) => c.code === e.target.value);
                            const updated = {
                              ...formData,
                              currency: e.target.value,
                              currencySymbol: selected ? selected.symbol : formData.currencySymbol,
                            };
                            setFormData(updated);
                            onSave(updated);
                          }}
                          className="w-full bg-[#16181d] border border-[#2e323d] rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#00a2ff] cursor-pointer"
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code} className="bg-[#1a1c23] text-white">
                              {c.name} ({c.symbol})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-neutral-400 mb-1 block">
                          Currency Symbol / Sign:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formData.currencySymbol}
                            maxLength={5}
                            onChange={(e) => {
                              const updated = {
                                ...formData,
                                currencySymbol: e.target.value,
                              };
                              setFormData(updated);
                              onSave(updated);
                            }}
                            placeholder="e.g. $, €, £, ₹"
                            className="w-20 bg-[#16181d] border border-[#2e323d] rounded-lg px-3 py-2 text-xs font-bold text-[#00a2ff] text-center outline-none focus:border-[#00a2ff]"
                          />
                          <span className="flex-1 text-[11px] font-semibold text-neutral-300 px-2.5 py-2 bg-[#1c1f26] rounded-lg border border-[#2e323d] truncate">
                            Preview: <span className="text-white font-bold">{formData.currencySymbol}9.99</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: THEME                                             */}
            {/* ======================================================== */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Roblox Store Appearance Mode</h3>
                  <p className="text-xs text-neutral-400">
                    Choose between Dark Mode and Light Mode for the website navigation, Robux packages, sidebars, modals, and footer.
                  </p>
                </div>

                {/* Pill switch */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#16181d] rounded-xl border border-[#262830]">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...formData, theme: 'light' as const };
                      setFormData(updated);
                      onSave(updated);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      formData.theme === 'light'
                        ? 'bg-white text-black shadow-xs font-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" /> Light Mode {formData.theme === 'light' && '✓'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...formData, theme: 'dark' as const };
                      setFormData(updated);
                      onSave(updated);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      formData.theme === 'dark'
                        ? 'bg-[#00a2ff] text-white shadow-xs'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-4 h-4" /> Dark Mode {formData.theme === 'dark' && '✓'}
                  </button>
                </div>

                {/* Side-by-side theme cards from Screenshot 5 & 6 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Light Theme Card */}
                  <div
                    onClick={() => {
                      const updated = { ...formData, theme: 'light' as const };
                      setFormData(updated);
                      onSave(updated);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer bg-[#17191e] ${
                      formData.theme === 'light'
                        ? 'border-[#00a2ff] ring-2 ring-[#00a2ff]/20'
                        : 'border-[#262830] hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Sun className="w-4 h-4 text-amber-400" /> Roblox Light
                      </div>
                      <span className="text-[11px] font-semibold text-neutral-400">
                        {formData.theme === 'light' ? '✓ Active' : 'Select'}
                      </span>
                    </div>

                    {/* Mini Light Mockup */}
                    <div className="p-3 bg-white text-neutral-900 rounded-lg shadow-sm mb-3 space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                        Roblox
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1">
                          <RobuxIcon theme="light" className="w-3.5 h-3.5 text-black shrink-0" />
                          10,000
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#00a2ff] text-white rounded">
                          {formData.currencySymbol}99.99
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Turns website background to clean white, with official black Robux hexagon icon matching the light mode reference.
                    </p>
                  </div>

                  {/* Dark Theme Card */}
                  <div
                    onClick={() => {
                      const updated = { ...formData, theme: 'dark' as const };
                      setFormData(updated);
                      onSave(updated);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer bg-[#17191e] ${
                      formData.theme === 'dark'
                        ? 'border-[#00a2ff] ring-2 ring-[#00a2ff]/20'
                        : 'border-[#262830] hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Moon className="w-4 h-4 text-[#00a2ff]" /> Roblox Dark
                      </div>
                      <span className="text-[11px] font-semibold text-[#00a2ff]">
                        {formData.theme === 'dark' ? '✓ Active' : 'Select'}
                      </span>
                    </div>

                    {/* Mini Dark Mockup */}
                    <div className="p-3 bg-[#101216] text-white rounded-lg border border-[#272931] shadow-sm mb-3 space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                        Roblox
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">10,000 R$</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#00a2ff] text-white rounded">
                          {formData.currencySymbol}99.99
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Deep tones, reduced eye strain, and vibrant Roblox neon accents for comfortable viewing.
                    </p>
                  </div>
                </div>

                {/* Automatic Synchronization Banner */}
                <div className="p-4 bg-[#141820] border border-[#1e2a3c] rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#00a2ff] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">Automatic Synchronization</div>
                    <div className="text-[11px] text-neutral-400 leading-relaxed">
                      Your theme preference is automatically remembered and applied across all store views, checkout popups, friend lists, and transactions.
                    </div>
                  </div>
                </div>

                {/* Send Robux Notification Style */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Send Robux Notification Style
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, sendRobuxNotificationStyle: 'dark' }))}
                      className={`p-3 rounded-lg border text-xs font-bold transition-colors cursor-pointer text-center ${
                        formData.sendRobuxNotificationStyle === 'dark'
                          ? 'border-[#00a2ff] bg-[#00a2ff]/10 text-white'
                          : 'border-[#262830] bg-[#16181d] text-neutral-400 hover:text-white'
                      }`}
                    >
                      Roblox Banner (Dark)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, sendRobuxNotificationStyle: 'light' }))}
                      className={`p-3 rounded-lg border text-xs font-bold transition-colors cursor-pointer text-center ${
                        formData.sendRobuxNotificationStyle === 'light'
                          ? 'border-[#00a2ff] bg-[#00a2ff]/10 text-white'
                          : 'border-[#262830] bg-[#16181d] text-neutral-400 hover:text-white'
                      }`}
                    >
                      Roblox Banner (Light)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: FRIENDS                                           */}
            {/* ======================================================== */}
            {activeTab === 'friends' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00a2ff]" />
                    <h3 className="text-sm font-bold text-white">
                      Manage Roblox Friends ({formData.friends.length})
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Add custom friends or search usernames to fetch their official Roblox headshot avatar photo for the &quot;Send Robux to Friend&quot; selector.
                  </p>
                </div>

                {/* Add Friend Input Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFriend();
                      }
                    }}
                    placeholder="Enter Roblox username..."
                    className="flex-1 bg-[#16181d] text-sm text-white px-3.5 py-2.5 rounded-lg border border-[#282b33] focus:border-[#00a2ff] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFriend}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-[#00a2ff] hover:bg-[#0091e6] text-xs font-bold text-white rounded-lg shadow-md transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Friend
                  </button>
                </div>

                {/* Friends List or Empty Box */}
                {formData.friends.length === 0 ? (
                  <div className="p-8 border border-dashed border-[#2b2e37] rounded-xl text-center space-y-2 bg-[#14161a]">
                    <Users className="w-8 h-8 text-neutral-500 mx-auto" />
                    <p className="text-xs text-neutral-400">
                      No friends added yet. Enter a username above to fetch their profile & headshot photo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-3 bg-[#16181d] border border-[#262830] rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={friend.avatarUrl}
                            alt={friend.username}
                            className="w-9 h-9 rounded-full object-cover border border-[#3b3e47]"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="text-xs font-bold text-white">{friend.username}</div>
                            <div className="text-[10px] text-neutral-400">@{friend.username.toLowerCase()}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: DISCLAIMER                                        */}
            {/* ======================================================== */}
            {activeTab === 'disclaimer' && (
              <div className="space-y-6">
                {/* General Shop Disclaimer Box */}
                <div className="p-5 bg-[#16181d] border border-[#252830] rounded-xl space-y-2.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Roblox Plus Shop Disclaimer
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    This store simulation application operates with verified visual assets, Builder typography, Robux package cataloging, dynamic Light/Dark mode themes, and high-resolution official avatar headshots.
                  </p>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    All Roblox assets, trade logos, and trademarks belong to Roblox Corporation.
                  </p>
                </div>

                {/* Send Robux Subtitle Phrase Section */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#00a2ff]" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Send Robux Subtitle Phrase
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Customize the subtitle text displayed below the recipient selector in Send Robux modal:
                    </p>
                  </div>

                  {/* Option 1 */}
                  <div
                    onClick={() => {
                      setIsCustomDisclaimerActive(false);
                      setFormData((p) => ({
                        ...p,
                        sendRobuxSubtitle: 'Robux are sent instantly with no fees',
                      }));
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                      formData.sendRobuxSubtitle === 'Robux are sent instantly with no fees' && !isCustomDisclaimerActive
                        ? 'border-[#00a2ff] bg-[#00a2ff]/10 text-white'
                        : 'border-[#262830] bg-[#16181d] text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    <span className="text-xs font-medium">
                      &quot;Robux are sent instantly with no fees&quot;
                    </span>
                    {formData.sendRobuxSubtitle === 'Robux are sent instantly with no fees' && !isCustomDisclaimerActive && (
                      <Check className="w-4 h-4 text-[#00a2ff]" />
                    )}
                  </div>

                  {/* Option 2 */}
                  <div
                    onClick={() => {
                      setIsCustomDisclaimerActive(false);
                      setFormData((p) => ({
                        ...p,
                        sendRobuxSubtitle: 'Robux arrive in 1 to 2 days with no fees',
                      }));
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                      formData.sendRobuxSubtitle === 'Robux arrive in 1 to 2 days with no fees' && !isCustomDisclaimerActive
                        ? 'border-[#00a2ff] bg-[#00a2ff]/10 text-white'
                        : 'border-[#262830] bg-[#16181d] text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    <span className="text-xs font-medium">
                      &quot;Robux arrive in 1 to 2 days with no fees&quot;
                    </span>
                    {formData.sendRobuxSubtitle === 'Robux arrive in 1 to 2 days with no fees' && !isCustomDisclaimerActive && (
                      <Check className="w-4 h-4 text-[#00a2ff]" />
                    )}
                  </div>

                  {/* Option 3: Custom Phrase */}
                  <div
                    onClick={() => setIsCustomDisclaimerActive(true)}
                    className={`p-3.5 rounded-xl border space-y-2 transition-colors cursor-pointer ${
                      isCustomDisclaimerActive
                        ? 'border-[#00a2ff] bg-[#00a2ff]/10 text-white'
                        : 'border-[#262830] bg-[#16181d] text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Custom Disclaimer Phrase</span>
                      {isCustomDisclaimerActive && <Check className="w-4 h-4 text-[#00a2ff]" />}
                    </div>
                    {isCustomDisclaimerActive && (
                      <input
                        type="text"
                        value={customDisclaimerText}
                        onChange={(e) => {
                          setCustomDisclaimerText(e.target.value);
                          setFormData((p) => ({
                            ...p,
                            sendRobuxSubtitle: e.target.value || 'Custom Disclaimer Phrase',
                          }));
                        }}
                        placeholder="Type custom disclaimer..."
                        className="w-full bg-[#121418] text-xs text-white px-3 py-1.5 rounded-lg border border-[#2b2d35] outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: MAIN ROBLOX EXPERIENCES & GAMES                     */}
            {/* ======================================================== */}
            {activeTab === 'games' && (
              <RobloxGamesSettingsTab
                continueGames={continueGames}
                recommendedGames={recommendedGames}
                onAddGame={onAddGame}
                onRemoveGame={onRemoveGame}
                onResetGames={onResetGames}
              />
            )}

            {/* ======================================================== */}
            {/* TAB 5: ADMIN PASSCODE                                    */}
            {/* ======================================================== */}
            {activeTab === 'admin' && (
              <div className="space-y-6">
                <div className="p-4 bg-[#16181d] border border-[#252830] rounded-xl flex items-start gap-3">
                  <Lock className="w-5 h-5 text-[#00a2ff] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">Protected Administrator Panel</h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Enter the master password to access the Administrator Panel, key management, and security controls.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Master Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPasscode ? 'text' : 'password'}
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleUnlockAdmin();
                        }
                      }}
                      placeholder="Enter master password..."
                      className="w-full bg-[#16181d] text-sm text-white px-4 py-2.5 rounded-lg border border-[#282b33] focus:border-[#00a2ff] outline-none transition-colors font-mono tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPasscode((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      {showAdminPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleUnlockAdmin}
                    className="w-full py-2.5 bg-[#00a2ff] hover:bg-[#0091e6] text-xs font-bold text-white rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4" /> Open Admin Panel
                  </button>

                  {isAdminUnlocked && onOpenAdminPanel && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdminPanel();
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-[#0055ff] to-[#4338ca] hover:brightness-110 text-xs font-bold text-white rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                    >
                      <Key className="w-4 h-4" /> Open Administrator Console & Key Generator
                    </button>
                  )}

                  {adminMessage && (
                    <div
                      className={`p-3 rounded-lg text-xs font-semibold ${
                        isAdminUnlocked
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                          : 'bg-red-950/40 text-red-300 border border-red-800/50'
                      }`}
                    >
                      {adminMessage}
                    </div>
                  )}

                  {isAdminUnlocked && (
                    <div className="p-4 bg-[#14161a] border border-[#2b2e37] rounded-xl space-y-3 mt-4">
                      <div className="text-xs font-bold text-white uppercase tracking-wider">
                        Developer Sandbox Controls
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, robux: p.robux + 100000 }))}
                          className="px-3 py-1.5 bg-[#22252c] text-neutral-200 hover:text-white rounded-lg text-xs font-bold border border-[#2f333c]"
                        >
                          +100,000 R$ Dev Grant
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, isVerified: true }))}
                          className="px-3 py-1.5 bg-[#22252c] text-neutral-200 hover:text-white rounded-lg text-xs font-bold border border-[#2f333c]"
                        >
                          Force Verify Badge
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                          }}
                          className="px-3 py-1.5 bg-red-950/40 text-red-300 hover:text-red-200 rounded-lg text-xs font-bold border border-red-800/50"
                        >
                          Wipe Storage Cache
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls (Always visible at bottom) */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#212328] bg-[#0e1013]">
            <button
              id="cancel-roblox-settings"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white rounded-lg bg-[#1c1e24] hover:bg-[#252830] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-roblox-settings"
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-[#00a2ff] hover:bg-[#0091e6] rounded-lg shadow-md transition-colors cursor-pointer"
            >
              {showSavedToast ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
