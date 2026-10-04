import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  Key,
  X,
  Maximize2,
  Minimize2,
  LogOut,
  Power,
  Clock,
  Sparkles,
  Users,
  Settings as SettingsIcon,
  Search,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  Zap,
  Sliders,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  AdminUser,
  GeneratedKeyRecord,
  AdminSystemConfig,
  AdminTextureStyle,
  DEFAULT_MASTER_PASSWORD,
  DEFAULT_ADMIN_EMAIL,
  getStoredAdminConfig,
  saveAdminConfig,
  getStoredAdminUsers,
  saveAdminUsers,
  getStoredAdminKeys,
  saveAdminKeys,
  verifyAdminCredentials,
  createDedicatedKeyRecord,
  createBulkKeyRecords,
  toggleKeyStatus,
  deleteKeyRecord,
  purgeExpiredKeyRecords,
  addNewAdminUser,
  removeAdminUser,
} from '../utils/adminSystem';
import { formatTimestamp } from '../utils/keySystem';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySystemStatusChange?: (isEnabled: boolean) => void;
  onUnlockAppAsAdmin?: () => void;
}

export function AdminPanelModal({
  isOpen,
  onClose,
  onKeySystemStatusChange,
  onUnlockAppAsAdmin,
}: AdminPanelModalProps) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Login form states
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Layout & Styling state
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'keys' | 'generate' | 'admins' | 'settings'>('keys');

  // Core Data
  const [config, setConfig] = useState<AdminSystemConfig>(getStoredAdminConfig);
  const [keysList, setKeysList] = useState<GeneratedKeyRecord[]>(getStoredAdminKeys);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(getStoredAdminUsers);

  // Tab 1: Keys filter & search
  const [keySearch, setKeySearch] = useState('');
  const [keyFilter, setKeyFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Tab 2: Single Key Form
  const [singleCustomCode, setSingleCustomCode] = useState('');
  const [singleDiscordUser, setSingleDiscordUser] = useState('');
  const [singleDeviceLimit, setSingleDeviceLimit] = useState(2);
  const [singleUnlimitedDevices, setSingleUnlimitedDevices] = useState(false);
  const [singleIsLifetime, setSingleIsLifetime] = useState(false);
  const [singleDurationAmount, setSingleDurationAmount] = useState<number | string>(4);
  const [singleDurationUnit, setSingleDurationUnit] = useState<'hours' | 'days' | 'weeks' | 'months'>('days');
  const [singleSuccessMsg, setSingleSuccessMsg] = useState<string | null>(null);

  // Tab 2: Bulk Key Form
  const [bulkCount, setBulkCount] = useState(1);
  const [bulkUnlimitedDevices, setBulkUnlimitedDevices] = useState(false);
  const [bulkIsLifetime, setBulkIsLifetime] = useState(false);
  const [bulkDurationAmount, setBulkDurationAmount] = useState<number | string>(4);
  const [bulkDurationUnit, setBulkDurationUnit] = useState<'hours' | 'days' | 'weeks' | 'months'>('days');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // Tab 3: Admin Access Form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Administrator' | 'Superadmin' | 'Key Manager'>('Administrator');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);

  // Tab 4: Settings Form
  const [settingsPrefix, setSettingsPrefix] = useState(config.defaultPrefix);
  const [settingsPattern, setSettingsPattern] = useState(config.keyStructurePattern);
  const [settingsDeviceLimit, setSettingsDeviceLimit] = useState(config.defaultDeviceLimit);
  const [settingsRobuxAmount, setSettingsRobuxAmount] = useState(config.robuxAmountToDisplay);
  const [settingsAdminEmail, setSettingsAdminEmail] = useState(config.adminEmail);
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);
  const [keyActionFeedback, setKeyActionFeedback] = useState<string | null>(null);

  // Synchronize config and data on open
  useEffect(() => {
    if (isOpen) {
      const conf = getStoredAdminConfig();
      setConfig(conf);
      setKeysList(getStoredAdminKeys());
      setAdminUsers(getStoredAdminUsers());
      setSettingsPrefix(conf.defaultPrefix);
      setSettingsPattern(conf.keyStructurePattern);
      setSettingsDeviceLimit(conf.defaultDeviceLimit);
      setSettingsRobuxAmount(conf.robuxAmountToDisplay);
      setSettingsAdminEmail(conf.adminEmail || '');
      setLoginPassword('');
      setLoginError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const pass = loginPassword.trim();

    if (!pass) {
      setLoginError('Please enter the master password.');
      return;
    }

    const verification = verifyAdminCredentials('', pass);
    if (verification.valid && verification.user) {
      setIsAuthenticated(true);
      setCurrentUser(verification.user);
      setLoginError(null);
      // NOTE: Open Admin Panel only, do not directly unlock the website app!
    } else {
      setLoginError('Incorrect master password. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginPassword('');
  };

  // Key system toggle ON/OFF
  const handleToggleKeySystem = () => {
    const updatedStatus = !config.isKeySystemEnabled;
    const updated = { ...config, isKeySystemEnabled: updatedStatus };
    setConfig(updated);
    saveAdminConfig(updated);
    if (onKeySystemStatusChange) {
      onKeySystemStatusChange(updatedStatus);
    }
  };

  // Copy key helper
  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    }
  };

  // Helper to calculate duration in hours and format label
  const calculateKeyDuration = (
    amountRaw: number | string,
    unit: 'hours' | 'days' | 'weeks' | 'months'
  ): { hours: number; label: string; previewTimestamp: number } => {
    const num = typeof amountRaw === 'string' ? parseFloat(amountRaw) : amountRaw;
    const safeAmount = isNaN(num) || num <= 0 ? 1 : num;
    let hours = safeAmount;
    let unitName = safeAmount === 1 ? 'Hour' : 'Hours';

    if (unit === 'days') {
      hours = safeAmount * 24;
      unitName = safeAmount === 1 ? 'Day' : 'Days';
    } else if (unit === 'weeks') {
      hours = safeAmount * 168;
      unitName = safeAmount === 1 ? 'Week' : 'Weeks';
    } else if (unit === 'months') {
      hours = safeAmount * 720;
      unitName = safeAmount === 1 ? 'Month' : 'Months';
    }

    const label = `${safeAmount} ${unitName}`;
    const previewTimestamp = Date.now() + hours * 60 * 60 * 1000;
    return { hours, label, previewTimestamp };
  };

  // Create single key
  const handleCreateSingleKey = (e: React.FormEvent) => {
    e.preventDefault();
    const durationInfo = calculateKeyDuration(singleDurationAmount, singleDurationUnit);
    const created = createDedicatedKeyRecord({
      customCode: singleCustomCode || undefined,
      discordUser: singleDiscordUser || undefined,
      deviceLimit: singleUnlimitedDevices ? 'unlimited' : singleDeviceLimit,
      isLifetime: singleIsLifetime,
      durationHours: singleIsLifetime ? -1 : durationInfo.hours,
      durationLabel: singleIsLifetime ? 'Lifetime (Permanent)' : durationInfo.label,
    });

    setKeysList(getStoredAdminKeys());
    setSingleSuccessMsg(`Key created: ${created.code} (${singleIsLifetime ? 'Lifetime' : durationInfo.label})`);
    setSingleCustomCode('');
    setSingleDiscordUser('');
    setTimeout(() => setSingleSuccessMsg(null), 4000);
  };

  // Create bulk keys
  const handleCreateBulkKeys = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Math.min(Math.max(1, bulkCount), 50);
    const durationInfo = calculateKeyDuration(bulkDurationAmount, bulkDurationUnit);
    const generated = createBulkKeyRecords({
      count,
      isUnlimitedDevices: bulkUnlimitedDevices,
      isLifetime: bulkIsLifetime,
      durationHours: bulkIsLifetime ? -1 : durationInfo.hours,
      durationLabel: bulkIsLifetime ? 'Lifetime (Permanent)' : durationInfo.label,
    });

    setKeysList(getStoredAdminKeys());
    setBulkSuccessMsg(`Generated ${generated.length} keys successfully! (${bulkIsLifetime ? 'Lifetime' : durationInfo.label})`);
    setTimeout(() => setBulkSuccessMsg(null), 4000);
  };

  // Add new admin
  const handleAddNewAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      setAdminFeedback('Please enter a valid administrator email.');
      return;
    }

    const updated = addNewAdminUser({
      email: newAdminEmail.trim(),
      customPassword: newAdminPassword.trim() || undefined,
      role: newAdminRole,
      addedBy: currentUser?.email || 'System Owner',
    });

    setAdminUsers(updated);
    setNewAdminEmail('');
    setNewAdminPassword('');
    setAdminFeedback('Administrator added successfully!');
    setTimeout(() => setAdminFeedback(null), 3500);
  };

  // Save settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdminSystemConfig = {
      ...config,
      defaultPrefix: settingsPrefix.trim().toUpperCase() || 'RBX',
      keyStructurePattern: settingsPattern.trim().toUpperCase() || 'PREFIX-XXXX-XXXX',
      defaultDeviceLimit: Number(settingsDeviceLimit) || 2,
      robuxAmountToDisplay: Number(settingsRobuxAmount) || 10000,
      adminEmail: settingsAdminEmail.trim() || DEFAULT_ADMIN_EMAIL,
      masterPasswordHash: settingsNewPassword.trim() ? settingsNewPassword.trim() : config.masterPasswordHash,
    };
    setConfig(updated);
    saveAdminConfig(updated);
    setSettingsSavedMsg('System parameters updated successfully!');
    setSettingsNewPassword('');
    setTimeout(() => setSettingsSavedMsg(null), 3500);
  };

  // Texture selector helper
  const handleSetTexture = (style: AdminTextureStyle) => {
    const updated = { ...config, texture: style };
    setConfig(updated);
    saveAdminConfig(updated);
  };

  // Purge expired keys
  const handlePurgeExpired = () => {
    const updated = purgeExpiredKeyRecords();
    setKeysList(updated);
  };

  // Filter keys
  const now = Date.now();
  const filteredKeys = keysList.filter((k) => {
    const query = keySearch.trim().toLowerCase();
    const matchesQuery =
      !query ||
      k.code.toLowerCase().includes(query) ||
      k.discordUser.toLowerCase().includes(query);

    if (!matchesQuery) return false;

    if (keyFilter === 'active') {
      return k.status === 'active';
    }
    if (keyFilter === 'expired') {
      return k.status !== 'active' && k.expiresAt !== null && k.expiresAt <= now;
    }
    if (keyFilter === 'revoked') {
      return k.status === 'revoked';
    }
    return true;
  });

  // Filter admins
  const filteredAdmins = adminUsers.filter((a) => {
    const q = adminSearch.trim().toLowerCase();
    return !q || a.email.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
  });

  // Texture visual background classes
  const getTextureBgClass = () => {
    switch (config.texture) {
      case 'carbon':
        return 'bg-[#0b0e14] bg-[radial-gradient(#142822_1px,transparent_1px)] [background-size:16px_16px] border-[#183a30] shadow-[0_0_50px_rgba(16,185,129,0.06)]';
      case 'cyber':
        return 'bg-[#080d16] bg-[radial-gradient(#0c2a4a_1px,transparent_1px)] [background-size:20px_20px] border-[#143b66] shadow-[0_0_50px_rgba(14,165,233,0.08)]';
      case 'stealth':
        return 'bg-[#090a0f] border-[#222530] shadow-[0_0_50px_rgba(0,0,0,0.8)]';
      case 'obsidian':
      default:
        return 'bg-[#080a10] bg-[radial-gradient(#151b2e_1px,transparent_1px)] [background-size:18px_18px] border-[#1b2234] shadow-[0_0_60px_rgba(0,85,255,0.08)]';
    }
  };

  return (
    <div
      id="admin-panel-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
    >
      <div
        id="admin-panel-modal-window"
        className={`w-full transition-all duration-200 rounded-3xl border text-white flex flex-col overflow-hidden ${
          isExpanded
            ? 'fixed inset-2 sm:inset-4 w-auto h-auto max-w-none max-h-none z-50'
            : 'max-w-4xl max-h-[92vh]'
        } ${getTextureBgClass()}`}
      >
        {/* ========================================================================= */}
        {/* MODAL HEADER (Shared across login and authenticated states) */}
        {/* ========================================================================= */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-[#0a0d16]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0055ff]/15 border border-[#0055ff]/35 flex items-center justify-center text-[#007aff] shrink-0 shadow-sm">
              <Shield className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                Administrator Panel & Key Management
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400 leading-tight">
                Advanced permission control, security parameters, and key generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Texture switcher pill on Settings/Header */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#121622] border border-[#20273c] rounded-xl text-[11px]">
                <span className="text-neutral-400 font-medium">Texture:</span>
                <button
                  type="button"
                  onClick={() => handleSetTexture('obsidian')}
                  className={`px-1.5 py-0.5 rounded font-bold uppercase transition-colors ${
                    config.texture === 'obsidian' ? 'bg-[#0055ff] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Obsidian
                </button>
                <button
                  type="button"
                  onClick={() => handleSetTexture('carbon')}
                  className={`px-1.5 py-0.5 rounded font-bold uppercase transition-colors ${
                    config.texture === 'carbon' ? 'bg-[#10b981] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Carbon
                </button>
                <button
                  type="button"
                  onClick={() => handleSetTexture('cyber')}
                  className={`px-1.5 py-0.5 rounded font-bold uppercase transition-colors ${
                    config.texture === 'cyber' ? 'bg-[#0ea5e9] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Cyber
                </button>
                <button
                  type="button"
                  onClick={() => handleSetTexture('stealth')}
                  className={`px-1.5 py-0.5 rounded font-bold uppercase transition-colors ${
                    config.texture === 'stealth' ? 'bg-neutral-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Stealth
                </button>
              </div>
            )}

            {/* Logout button (only if authenticated) */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-[#181d28] hover:bg-[#232b3b] border border-[#283248] text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                title="Log out of admin session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            {/* Expand / Minimize button */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1.5 rounded-xl bg-[#181d28] hover:bg-[#232b3b] border border-[#283248] text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              title={isExpanded ? 'Collapse' : 'Expand full screen'}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Collapse</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Expand</span>
                </>
              )}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#181d28] hover:bg-[#232b3b] border border-[#283248] text-neutral-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW A: NOT AUTHENTICATED -> ADMINISTRATOR PORTAL LOGIN (Screenshot 2) */}
        {/* ========================================================================= */}
        {!isAuthenticated ? (
          <div className="flex-1 p-6 sm:p-12 flex flex-col items-center justify-center overflow-y-auto">
            <div className="w-full max-w-md flex flex-col items-center">
              {/* Blue lock icon in rounded badge */}
              <div className="w-16 h-16 rounded-2xl bg-[#0c1424] border border-[#1d2942] flex items-center justify-center text-[#007aff] shadow-xl shadow-blue-500/10 mb-5">
                <Lock className="w-8 h-8" strokeWidth={2.2} />
              </div>

              <h3 className="text-2xl sm:text-[26px] font-black text-white tracking-tight text-center leading-tight">
                Administrator Portal
              </h3>

              <p className="text-xs sm:text-sm text-neutral-400 text-center mt-2 max-w-[340px] leading-relaxed">
                Enter your master password to access system control.
              </p>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="w-full mt-7 space-y-4">
                {/* Master Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#007aff]" />
                    <span>Master Password</span>
                  </label>
                  <input
                    type="password"
                    id="admin-portal-password-input"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="••••••••••••"
                    autoFocus
                    autoComplete="current-password"
                    className="w-full bg-[#0b0e14] border border-[#1e2434] focus:border-[#007aff] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-600 shadow-inner tracking-wider font-mono"
                  />
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800/70 rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Access Button */}
                <button
                  id="admin-portal-submit-button"
                  type="submit"
                  className="w-full py-3.5 bg-[#0055ff] hover:bg-[#0047e0] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Access Admin Panel</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW B: AUTHENTICATED -> FULL ADMINISTRATOR MANAGEMENT CONSOLE (Pics 3-6) */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Top Green/Teal Status Banner (Screenshots 3-6) */}
            <div className="bg-[#0b1816] border border-[#12382e] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#0d2a23] border border-[#14483b] flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                    {config.isKeySystemEnabled ? (
                      <Lock className="w-5 h-5" strokeWidth={2.2} />
                    ) : (
                      <Unlock className="w-5 h-5 text-amber-400" strokeWidth={2.2} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-white tracking-wide">
                        Key Access System:
                      </span>
                      {config.isKeySystemEnabled ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE & LOCKED
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/40 text-rose-300 flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          DISABLED & OPEN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      {config.isKeySystemEnabled
                        ? 'All website visitors must enter a valid access key before accessing the application.'
                        : 'Key protection is disabled. Visitors can freely enter without entering an access key.'}
                    </p>
                  </div>
                </div>

                {/* Turn Key System OFF / ON Button */}
                <button
                  type="button"
                  id="admin-toggle-key-system-btn"
                  onClick={handleToggleKeySystem}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-sm active:scale-95 ${
                    config.isKeySystemEnabled
                      ? 'bg-[#3b1218] hover:bg-[#521722] border border-[#6b1e2a] text-red-200'
                      : 'bg-[#103a27] hover:bg-[#185338] border border-[#1e6b48] text-emerald-200'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{config.isKeySystemEnabled ? 'Turn Key System OFF' : 'Turn Key System ON'}</span>
                </button>
              </div>

              {/* Persistent Configuration Info Bar */}
              <div className="pt-2 border-t border-[#12382e]/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-neutral-300">
                    <strong className="text-emerald-300 font-semibold">Permanent Persistence:</strong> Settings and activated keys remain in the system until you delete or modify them.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onUnlockAppAsAdmin && (
                    <button
                      type="button"
                      id="admin-unlock-app-btn"
                      onClick={() => {
                        onUnlockAppAsAdmin();
                        setKeyActionFeedback('Website app unlocked with administrator access!');
                        setTimeout(() => setKeyActionFeedback(null), 3000);
                      }}
                      className="bg-[#007aff]/20 hover:bg-[#007aff]/30 border border-[#007aff]/40 text-[#60a5fa] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Unlock the website application directly"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock Website App</span>
                    </button>
                  )}
                </div>
              </div>

              {keyActionFeedback && (
                <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>{keyActionFeedback}</span>
                </div>
              )}
            </div>

            {/* Navigation Tabs (4 Tabs matching screenshots 3-6) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0c101a] border border-[#1c2438] p-1.5 rounded-2xl">
              {/* Tab 1: Keys */}
              <button
                type="button"
                id="admin-nav-tab-keys"
                onClick={() => setActiveTab('keys')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'keys'
                    ? 'bg-gradient-to-r from-[#0055ff] to-[#4338ca] text-white shadow-md shadow-blue-600/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Keys ({keysList.length})</span>
              </button>

              {/* Tab 2: + Generate */}
              <button
                type="button"
                id="admin-nav-tab-generate"
                onClick={() => setActiveTab('generate')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'generate'
                    ? 'bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white shadow-md shadow-purple-600/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Generate</span>
              </button>

              {/* Tab 3: Admin Access */}
              <button
                type="button"
                id="admin-nav-tab-admins"
                onClick={() => setActiveTab('admins')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'admins'
                    ? 'bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white shadow-md shadow-orange-600/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Admin Access ({adminUsers.length})</span>
              </button>

              {/* Tab 4: Settings */}
              <button
                type="button"
                id="admin-nav-tab-settings"
                onClick={() => setActiveTab('settings')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-md shadow-sky-600/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* TAB CONTENT 1: KEYS LIST (Screenshot 3) */}
            {/* ========================================================================= */}
            {activeTab === 'keys' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d101a] border border-[#1c2234] p-3 rounded-2xl">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="admin-keys-search-input"
                      value={keySearch}
                      onChange={(e) => setKeySearch(e.target.value)}
                      placeholder="Search by Discord User (@username) or Key Code..."
                      className="w-full bg-[#080b12] border border-[#1b2234] focus:border-[#007aff] rounded-xl pl-10 pr-3 py-2 text-xs font-medium text-white outline-none placeholder:text-neutral-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 self-stretch sm:self-auto justify-between">
                    <div className="flex items-center gap-1 bg-[#080b12] border border-[#1b2234] p-1 rounded-xl">
                      {(['all', 'active', 'expired', 'revoked'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setKeyFilter(tab)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                            keyFilter === tab
                              ? 'bg-[#0055ff] text-white'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setKeysList(getStoredAdminKeys())}
                      className="p-2 rounded-xl bg-[#080b12] border border-[#1b2234] text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Refresh key list"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Keys Table */}
                <div className="bg-[#0b0e17] border border-[#1c2234] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#1c2234] bg-[#0e121d] text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                          <th className="py-3 px-4">Key Code</th>
                          <th className="py-3 px-4">Discord User</th>
                          <th className="py-3 px-4">Device Limit</th>
                          <th className="py-3 px-4">Validity / Expiration</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions & Edit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#171c2b]">
                        {filteredKeys.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-16 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2 text-neutral-500">
                                <Key className="w-8 h-8 opacity-40 text-neutral-400" />
                                <span className="text-xs font-bold text-neutral-400">
                                  No keys found matching your filters.
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('generate')}
                                  className="text-xs text-[#007aff] hover:underline font-semibold mt-1 cursor-pointer"
                                >
                                  + Generate your first key now
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredKeys.map((k) => {
                            const isRevoked = k.status === 'revoked';
                            const isExpired = !isRevoked && k.status !== 'active' && k.expiresAt !== null && now > k.expiresAt;

                            return (
                              <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                                {/* Key Code */}
                                <td className="py-3 px-4 font-mono font-bold text-white tracking-wider select-all">
                                  <div className="flex items-center gap-2">
                                    <span>{k.code}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCode(k.code, k.id)}
                                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                                      title="Copy code"
                                    >
                                      {copiedKeyId === k.id ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </td>

                                {/* Discord User */}
                                <td className="py-3 px-4 text-neutral-300 font-medium">
                                  {k.discordUser}
                                </td>

                                {/* Device Limit */}
                                <td className="py-3 px-4 text-neutral-300">
                                  {k.deviceLimit === 'unlimited' ? (
                                    <span className="text-purple-400 font-semibold">∞ Unlimited</span>
                                  ) : (
                                    <span>{k.deviceLimit} Devices</span>
                                  )}
                                </td>

                                {/* Expiration */}
                                <td className="py-3 px-4 text-neutral-300">
                                  {k.expiresAt === null ? (
                                    <span className="text-emerald-400 font-bold">Lifetime (Permanent)</span>
                                  ) : (
                                    <div className="space-y-0.5">
                                      <div className="font-semibold text-neutral-200">{k.durationLabel}</div>
                                      <div className="text-[10px] text-neutral-500 font-mono">
                                        Exp: {formatTimestamp(k.expiresAt)}
                                      </div>
                                    </div>
                                  )}
                                </td>

                                {/* Status */}
                                <td className="py-3 px-4">
                                  {isRevoked ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300">
                                      Revoked
                                    </span>
                                  ) : isExpired ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 border border-neutral-700 text-neutral-400">
                                      Expired
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center gap-1 w-fit">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      Active (Until Deleted)
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {onUnlockAppAsAdmin && k.status === 'active' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onUnlockAppAsAdmin();
                                          setKeyActionFeedback(`App unlocked with key ${k.code}!`);
                                          setTimeout(() => setKeyActionFeedback(null), 3000);
                                        }}
                                        className="px-2 py-1 rounded-lg text-[10px] font-bold border border-[#007aff]/50 bg-[#007aff]/15 text-[#60a5fa] hover:bg-[#007aff]/25 transition-colors cursor-pointer"
                                        title="Apply this key to unlock the main application"
                                      >
                                        Apply to App
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => setKeysList(toggleKeyStatus(k.id))}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                        k.status === 'revoked'
                                          ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60'
                                          : 'bg-amber-950/60 border-amber-700 text-amber-300 hover:bg-amber-900/60'
                                      }`}
                                    >
                                      {k.status === 'revoked' ? 'Activate' : 'Revoke'}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setKeysList(deleteKeyRecord(k.id))}
                                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                      title="Delete key permanently"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB CONTENT 2: GENERATE KEYS (Screenshot 4) */}
            {/* ========================================================================= */}
            {activeTab === 'generate' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Card 1: Single & Dedicated Key */}
                <div className="bg-[#0b0e17] border border-[#1d2336] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0055ff]/15 border border-[#0055ff]/35 flex items-center justify-center text-[#007aff] shrink-0">
                      <Zap className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Single & Dedicated Key</h4>
                      <p className="text-[11px] text-neutral-400">
                        Custom code, Discord username, and device limits
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateSingleKey} className="space-y-4 pt-1">
                    {/* Custom Key Code */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300">
                        Custom Key Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={singleCustomCode}
                        onChange={(e) => setSingleCustomCode(e.target.value.toUpperCase())}
                        placeholder="E.G. RBX-VIP-SPECIAL"
                        className="w-full bg-[#080a11] border border-[#1c2234] focus:border-[#007aff] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase outline-none placeholder:text-neutral-600"
                      />
                    </div>

                    {/* Discord User */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Discord User (Assign Owner)</span>
                      </label>
                      <input
                        type="text"
                        value={singleDiscordUser}
                        onChange={(e) => setSingleDiscordUser(e.target.value)}
                        placeholder="e.g. @username or discord_id"
                        className="w-full bg-[#080a11] border border-[#1c2234] focus:border-[#007aff] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-neutral-600"
                      />
                    </div>

                    {/* Device Limit Slider & Unlimited Checkbox */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Device Limit</span>
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer text-purple-300 font-semibold">
                          <input
                            type="checkbox"
                            checked={singleUnlimitedDevices}
                            onChange={(e) => setSingleUnlimitedDevices(e.target.checked)}
                            className="rounded border-[#1c2234] accent-purple-600 cursor-pointer"
                          />
                          <span>∞ Unlimited Devices (∞)</span>
                        </label>
                      </div>

                      {!singleUnlimitedDevices && (
                        <div className="flex items-center gap-3 bg-[#080a11] border border-[#1c2234] rounded-xl px-3.5 py-2">
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={singleDeviceLimit}
                            onChange={(e) => setSingleDeviceLimit(Number(e.target.value))}
                            className="flex-1 accent-[#007aff] cursor-pointer"
                          />
                          <span className="font-mono font-bold text-xs text-white w-6 text-right">
                            {singleDeviceLimit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Duration & Validity Mode */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-neutral-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>Key Validity & Duration</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSingleIsLifetime(false)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              !singleIsLifetime
                                ? 'bg-[#0055ff] text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-400'
                                : 'text-neutral-400 hover:text-white bg-[#080a11] border border-[#1c2234]'
                            }`}
                          >
                            Timed Duration
                          </button>
                          <button
                            type="button"
                            onClick={() => setSingleIsLifetime(true)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              singleIsLifetime
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 ring-1 ring-emerald-400'
                                : 'text-neutral-400 hover:text-white bg-[#080a11] border border-[#1c2234]'
                            }`}
                          >
                            ∞ Lifetime
                          </button>
                        </div>
                      </div>

                      {singleIsLifetime ? (
                        <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                          <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                          <span>Key will never expire (Permanent lifetime access until manually deleted).</span>
                        </div>
                      ) : (
                        <div className="space-y-3 bg-[#080a11] border border-[#1c2234] p-3.5 rounded-xl">
                          {/* Quick Duration Presets Chips */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                              Quick Duration Presets:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { amount: 1, unit: 'hours', label: '1 Hour' },
                                { amount: 12, unit: 'hours', label: '12 Hours' },
                                { amount: 1, unit: 'days', label: '1 Day' },
                                { amount: 3, unit: 'days', label: '3 Days' },
                                { amount: 4, unit: 'days', label: '4 Days' },
                                { amount: 7, unit: 'days', label: '7 Days (1 Wk)' },
                                { amount: 14, unit: 'days', label: '14 Days (2 Wks)' },
                                { amount: 30, unit: 'days', label: '30 Days (1 Mo)' },
                              ].map((preset) => {
                                const isSelected =
                                  Number(singleDurationAmount) === preset.amount &&
                                  singleDurationUnit === preset.unit;
                                return (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => {
                                      setSingleDurationAmount(preset.amount);
                                      setSingleDurationUnit(preset.unit as any);
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#0055ff] text-white font-bold shadow-sm shadow-blue-500/30 ring-1 ring-blue-400'
                                        : 'bg-[#101420] text-neutral-300 hover:text-white hover:bg-[#181f32] border border-[#1e263d]'
                                    }`}
                                  >
                                    {preset.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Enter Custom Amount & Time Unit */}
                          <div className="space-y-1.5 pt-1">
                            <label className="text-[11px] font-bold text-neutral-300 flex items-center justify-between">
                              <span>Enter Custom Amount & Time:</span>
                              <span className="text-[10px] text-blue-400 font-mono">e.g. 4 Days, 2 Weeks, 12 Hours</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* Amount input */}
                              <div className="relative">
                                <input
                                  type="number"
                                  min={1}
                                  max={9999}
                                  step={1}
                                  value={singleDurationAmount}
                                  onChange={(e) => setSingleDurationAmount(e.target.value)}
                                  placeholder="e.g. 4"
                                  className="w-full bg-[#0d101a] border border-[#21293e] focus:border-[#007aff] rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 font-medium">
                                  Amount
                                </span>
                              </div>

                              {/* Unit selector */}
                              <select
                                value={singleDurationUnit}
                                onChange={(e) => setSingleDurationUnit(e.target.value as any)}
                                className="w-full bg-[#0d101a] border border-[#21293e] focus:border-[#007aff] rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none cursor-pointer"
                              >
                                <option value="hours">Hours</option>
                                <option value="days">Days (24 Hours each)</option>
                                <option value="weeks">Weeks (7 Days each)</option>
                                <option value="months">Months (30 Days each)</option>
                              </select>
                            </div>
                          </div>

                          {/* Live preview */}
                          <div className="p-2.5 bg-[#0d111c] border border-[#1e273e] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="text-neutral-300 font-medium">
                                Active For:{' '}
                                <span className="text-white font-bold font-mono">
                                  {calculateKeyDuration(singleDurationAmount, singleDurationUnit).label}
                                </span>{' '}
                                <span className="text-neutral-500 text-[11px]">
                                  ({calculateKeyDuration(singleDurationAmount, singleDurationUnit).hours} total hours)
                                </span>
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              Expires: {formatTimestamp(calculateKeyDuration(singleDurationAmount, singleDurationUnit).previewTimestamp)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {singleSuccessMsg && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{singleSuccessMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      id="admin-create-single-key-btn"
                      className="w-full py-3 bg-[#0055ff] hover:bg-[#0047e0] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>+ Create Dedicated Key</span>
                    </button>
                  </form>
                </div>

                {/* Card 2: Bulk Key Generator */}
                <div className="bg-[#0b0e17] border border-[#1d2336] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/35 flex items-center justify-center text-[#9333ea] shrink-0">
                      <Layers className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Bulk Key Generator</h4>
                      <p className="text-[11px] text-neutral-400">
                        Generate batches of up to 50 keys simultaneously
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateBulkKeys} className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300">
                        Quantity of Keys to Generate
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={bulkCount}
                        onChange={(e) => setBulkCount(Number(e.target.value) || 1)}
                        className="w-full bg-[#080a11] border border-[#1c2234] focus:border-[#7c3aed] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-purple-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bulkUnlimitedDevices}
                          onChange={(e) => setBulkUnlimitedDevices(e.target.checked)}
                          className="rounded border-[#1c2234] accent-purple-600 cursor-pointer"
                        />
                        <span>∞ Unlimited Devices (∞) per Key</span>
                      </label>
                    </div>

                    {/* Bulk Keys Duration & Validity Mode */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-neutral-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>Bulk Keys Validity & Duration</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setBulkIsLifetime(false)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              !bulkIsLifetime
                                ? 'bg-[#7c3aed] text-white shadow-sm shadow-purple-500/25 ring-1 ring-purple-400'
                                : 'text-neutral-400 hover:text-white bg-[#080a11] border border-[#1c2234]'
                            }`}
                          >
                            Timed Duration
                          </button>
                          <button
                            type="button"
                            onClick={() => setBulkIsLifetime(true)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              bulkIsLifetime
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 ring-1 ring-emerald-400'
                                : 'text-neutral-400 hover:text-white bg-[#080a11] border border-[#1c2234]'
                            }`}
                          >
                            ∞ Lifetime
                          </button>
                        </div>
                      </div>

                      {bulkIsLifetime ? (
                        <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                          <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                          <span>All {bulkCount} generated keys will never expire (Permanent lifetime access).</span>
                        </div>
                      ) : (
                        <div className="space-y-3 bg-[#080a11] border border-[#1c2234] p-3.5 rounded-xl">
                          {/* Quick Duration Presets Chips for Bulk */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                              Quick Duration Presets:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { amount: 1, unit: 'hours', label: '1 Hour' },
                                { amount: 12, unit: 'hours', label: '12 Hours' },
                                { amount: 1, unit: 'days', label: '1 Day' },
                                { amount: 3, unit: 'days', label: '3 Days' },
                                { amount: 4, unit: 'days', label: '4 Days' },
                                { amount: 7, unit: 'days', label: '7 Days (1 Wk)' },
                                { amount: 14, unit: 'days', label: '14 Days (2 Wks)' },
                                { amount: 30, unit: 'days', label: '30 Days (1 Mo)' },
                              ].map((preset) => {
                                const isSelected =
                                  Number(bulkDurationAmount) === preset.amount &&
                                  bulkDurationUnit === preset.unit;
                                return (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => {
                                      setBulkDurationAmount(preset.amount);
                                      setBulkDurationUnit(preset.unit as any);
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#7c3aed] text-white font-bold shadow-sm shadow-purple-500/30 ring-1 ring-purple-400'
                                        : 'bg-[#101420] text-neutral-300 hover:text-white hover:bg-[#181f32] border border-[#1e263d]'
                                    }`}
                                  >
                                    {preset.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Enter Custom Amount & Time Unit for Bulk */}
                          <div className="space-y-1.5 pt-1">
                            <label className="text-[11px] font-bold text-neutral-300 flex items-center justify-between">
                              <span>Enter Custom Amount & Time for All {bulkCount} Keys:</span>
                              <span className="text-[10px] text-purple-400 font-mono">e.g. 4 Days, 2 Weeks, 12 Hours</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* Amount input */}
                              <div className="relative">
                                <input
                                  type="number"
                                  min={1}
                                  max={9999}
                                  step={1}
                                  value={bulkDurationAmount}
                                  onChange={(e) => setBulkDurationAmount(e.target.value)}
                                  placeholder="e.g. 4"
                                  className="w-full bg-[#0d101a] border border-[#21293e] focus:border-[#7c3aed] rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 font-medium">
                                  Amount
                                </span>
                              </div>

                              {/* Unit selector */}
                              <select
                                value={bulkDurationUnit}
                                onChange={(e) => setBulkDurationUnit(e.target.value as any)}
                                className="w-full bg-[#0d101a] border border-[#21293e] focus:border-[#7c3aed] rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none cursor-pointer"
                              >
                                <option value="hours">Hours</option>
                                <option value="days">Days (24 Hours each)</option>
                                <option value="weeks">Weeks (7 Days each)</option>
                                <option value="months">Months (30 Days each)</option>
                              </select>
                            </div>
                          </div>

                          {/* Live preview for bulk */}
                          <div className="p-2.5 bg-[#0d111c] border border-[#1e273e] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span className="text-neutral-300 font-medium">
                                Batch Duration:{' '}
                                <span className="text-white font-bold font-mono">
                                  {calculateKeyDuration(bulkDurationAmount, bulkDurationUnit).label}
                                </span>{' '}
                                <span className="text-neutral-500 text-[11px]">
                                  ({calculateKeyDuration(bulkDurationAmount, bulkDurationUnit).hours} total hours)
                                </span>
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              Expires: {formatTimestamp(calculateKeyDuration(bulkDurationAmount, bulkDurationUnit).previewTimestamp)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-[#080a11] border border-[#1c2234] rounded-xl flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-medium">
                        Key Prefix: <span className="text-white font-bold">{config.defaultPrefix}</span>
                      </span>
                      <span className="text-neutral-400 font-medium">
                        Device Limit per Key:{' '}
                        <span className="text-emerald-400 font-bold">
                          {bulkUnlimitedDevices ? '∞ Unlimited' : `${config.defaultDeviceLimit} Devices`}
                        </span>
                      </span>
                    </div>

                    {bulkSuccessMsg && (
                      <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/50 text-purple-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-purple-400" />
                        <span>{bulkSuccessMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      id="admin-create-bulk-keys-btn"
                      className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#9333ea] hover:brightness-110 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate {bulkCount} Keys</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB CONTENT 3: ADMIN ACCESS MANAGEMENT (Screenshot 5) */}
            {/* ========================================================================= */}
            {activeTab === 'admins' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Banner 1: Summary */}
                <div className="bg-[#140f0a] border border-[#3b220d] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#2b1809] border border-[#4d2c12] flex items-center justify-center text-amber-400 shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white">
                          Authorized Administrator Management
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/40 text-amber-400">
                          {adminUsers.length} Authorized
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                        Add new administrator emails to grant them access to this admin panel.
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-neutral-400 text-[11px]">Signed in as:</span>
                    <div className="font-bold text-amber-400 truncate max-w-[220px]">
                      {currentUser?.email || DEFAULT_ADMIN_EMAIL}
                    </div>
                  </div>
                </div>

                {/* Card 1: Grant New Admin Access */}
                <div className="bg-[#0b0e17] border border-[#1d2336] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      <span>Grant New Admin Access</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                      Admin only privilege
                    </span>
                  </div>

                  <form onSubmit={handleAddNewAdmin} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300">
                          Administrator Email *
                        </label>
                        <input
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="colleague@example.com"
                          className="w-full bg-[#080a11] border border-[#1c2234] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-neutral-600"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300">
                          Password (or uses master default)
                        </label>
                        <input
                          type="password"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="Custom password (optional)"
                          className="w-full bg-[#080a11] border border-[#1c2234] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-neutral-600"
                        />
                      </div>

                      {/* Role */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300">Access Level / Role</label>
                        <select
                          value={newAdminRole}
                          onChange={(e) => setNewAdminRole(e.target.value as any)}
                          className="w-full bg-[#080a11] border border-[#1c2234] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                        >
                          <option value="Administrator">Administrator (Standard)</option>
                          <option value="Superadmin">Superadmin</option>
                          <option value="Key Manager">Key Manager</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>The added user will immediately be able to log in to the admin panel.</span>
                      </div>

                      <button
                        type="submit"
                        id="admin-grant-access-btn"
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] active:scale-[0.99] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Grant Admin Access</span>
                      </button>
                    </div>

                    {adminFeedback && (
                      <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs font-bold">
                        {adminFeedback}
                      </div>
                    )}
                  </form>
                </div>

                {/* Card 2: Authorized Administrators List */}
                <div className="bg-[#0b0e17] border border-[#1d2336] rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-neutral-400" />
                      <span>Authorized Administrators ({adminUsers.length})</span>
                    </h4>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          placeholder="Filter admins by email..."
                          className="bg-[#080a11] border border-[#1c2234] focus:border-amber-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none placeholder:text-neutral-600 w-48"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setAdminUsers(getStoredAdminUsers())}
                        className="p-1.5 rounded-lg bg-[#080a11] border border-[#1c2234] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* List items */}
                  <div className="space-y-2.5">
                    {filteredAdmins.map((admin) => (
                      <div
                        key={admin.id}
                        className="p-3.5 bg-[#080a11] border border-[#1c2234] rounded-xl flex items-center justify-between gap-3 hover:border-neutral-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                            {admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-white">{admin.email}</span>
                              {admin.email.toLowerCase() === (currentUser?.email || DEFAULT_ADMIN_EMAIL).toLowerCase() && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300">
                                  You
                                </span>
                              )}
                              {admin.isRoot && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">
                                  Root Owner
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                              <span>🛡️ {admin.role}</span>
                              <span>• Added {admin.addedAt}</span>
                              <span>• By {admin.addedBy}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#141822] border border-[#232a3c] text-amber-300">
                            ⭐ {admin.role}
                          </span>

                          {!admin.isRoot && (
                            <button
                              type="button"
                              onClick={() => setAdminUsers(removeAdminUser(admin.id))}
                              className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Revoke access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB CONTENT 4: SETTINGS & PARAMETERS (Screenshot 6) */}
            {/* ========================================================================= */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Card 1: Website Key Access Security Gate */}
                <div className="bg-[#0b0e17] border border-[#1d2336] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>Website Key Access Security Gate</span>
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Control website lock gate, toggle key requirement on or off, and schedule auto-lock timers.
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        config.isKeySystemEnabled
                          ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-400'
                          : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {config.isKeySystemEnabled ? 'System ON (Locked)' : 'System OFF (Open)'}
                    </span>
                  </div>

                  {/* Inner item 1: Master Enforcer */}
                  <div className="p-3.5 bg-[#080a11] border border-[#1c2234] rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Power className="w-3.5 h-3.5 text-rose-400" />
                        <span>Master Key System Enforcer</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Turn OFF to temporarily make the website open to everyone without requiring access keys.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleKeySystem}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm ${
                        config.isKeySystemEnabled
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      }`}
                    >
                      {config.isKeySystemEnabled ? 'Turn OFF Key System' : 'Turn ON Key System'}
                    </button>
                  </div>

                  {/* Inner item 2: Permanent state persistence guarantee */}
                  <div className="p-3.5 bg-[#080a11] border border-[#1c2234] rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-white">Permanent Persistence Active</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      All admin settings, key system toggles, and activated access keys stay active permanently in your system until you manually delete or change them. No automatic reset or background timer will alter your configuration.
                    </p>
                  </div>
                </div>

                {/* Card 2: Admin Panel Texture & Surface Style */}
                <div className="bg-[#0b0e17] border border-[#1d2336] rounded-2xl p-5 space-y-3">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Admin Panel Texture & Surface Style</span>
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Select the visual material texture and backdrop styling for this management console.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                    {/* Obsidian */}
                    <div
                      onClick={() => handleSetTexture('obsidian')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        config.texture === 'obsidian'
                          ? 'bg-[#0d1424] border-[#0055ff] ring-1 ring-[#0055ff] shadow-md shadow-blue-600/20'
                          : 'bg-[#080a11] border-[#1c2234] hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0055ff]" />
                          Obsidian Weave
                        </span>
                        {config.texture === 'obsidian' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-600/40">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Dark obsidian matrix with sapphire cyber glow
                      </p>
                    </div>

                    {/* Carbon */}
                    <div
                      onClick={() => handleSetTexture('carbon')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        config.texture === 'carbon'
                          ? 'bg-[#0d1f1a] border-[#10b981] ring-1 ring-[#10b981] shadow-md shadow-emerald-600/20'
                          : 'bg-[#080a11] border-[#1c2234] hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                          Carbon Matrix
                        </span>
                        {config.texture === 'carbon' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Tactile carbon-fiber weave with emerald edge
                      </p>
                    </div>

                    {/* Cyber */}
                    <div
                      onClick={() => handleSetTexture('cyber')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        config.texture === 'cyber'
                          ? 'bg-[#0a1828] border-[#0ea5e9] ring-1 ring-[#0ea5e9] shadow-md shadow-sky-600/20'
                          : 'bg-[#080a11] border-[#1c2234] hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                          Cybernetic Grid
                        </span>
                        {config.texture === 'cyber' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-600/40">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Neon cyan tech matrix and dot grid
                      </p>
                    </div>

                    {/* Stealth */}
                    <div
                      onClick={() => handleSetTexture('stealth')}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        config.texture === 'stealth'
                          ? 'bg-[#14151b] border-neutral-400 ring-1 ring-neutral-400 shadow-md shadow-neutral-800/30'
                          : 'bg-[#080a11] border-[#1c2234] hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-neutral-400" />
                          Stealth Titanium
                        </span>
                        {config.texture === 'stealth' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-200 border border-neutral-600">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Deep titanium matte with refined gradients
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3: System Parameter Configuration */}
                <div className="bg-[#0b0e17] border border-[#1d2336] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#007aff]" />
                        <span>System Parameter Configuration</span>
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Customize prefixes, default device limits, and application parameters.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePurgeExpired}
                      className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900/80 border border-rose-700/60 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Purge all expired keys"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge Expired Keys</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Default Key Prefix */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300">Default Key Prefix</label>
                        <input
                          type="text"
                          value={settingsPrefix}
                          onChange={(e) => setSettingsPrefix(e.target.value.toUpperCase())}
                          placeholder="RBX"
                          className="w-full bg-[#080a11] border border-[#1c2234] focus:border-[#007aff] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase outline-none"
                        />
                      </div>

                      {/* Key Structure Pattern */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300">Key Structure Pattern</label>
                        <input
                          type="text"
                          value={settingsPattern}
                          onChange={(e) => setSettingsPattern(e.target.value)}
                          placeholder="PREFIX-XXXX-XXXX"
                          className="w-full bg-[#080a11] border border-[#1c2234] focus:border-[#007aff] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                        />
                      </div>

                      {/* Default Device Limit */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300">
                          Default Device Limit for New Keys
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={settingsDeviceLimit}
                          onChange={(e) => setSettingsDeviceLimit(Number(e.target.value))}
                          placeholder="2"
                          className="w-full bg-[#080a11] border border-[#1c2234] focus:border-[#007aff] rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none"
                        />
                        <span className="text-[10px] text-neutral-500">Default: 2 devices per key</span>
                      </div>

                      {/* Robux Amount To Display */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300">Robux Amount to Display</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={Number(settingsRobuxAmount || 0).toLocaleString('en-US')}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, '');
                            setSettingsRobuxAmount(Number(raw) || 0);
                          }}
                          placeholder="10,000"
                          className="w-full bg-[#080a11] border border-[#1c2234] focus:border-[#007aff] rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none"
                        />
                      </div>

                      {/* Administrator Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300">Administrator Email</label>
                        <input
                          type="email"
                          value={settingsAdminEmail}
                          onChange={(e) => setSettingsAdminEmail(e.target.value)}
                          placeholder="admin@system.local"
                          autoComplete="off"
                          className="w-full bg-[#080a11] border border-[#1c2234] focus:border-[#007aff] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                        />
                      </div>

                      {/* New Master Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-300">
                          New Master Password (Leave blank to keep)
                        </label>
                        <input
                          type="password"
                          value={settingsNewPassword}
                          onChange={(e) => setSettingsNewPassword(e.target.value)}
                          placeholder="Enter new master password..."
                          className="w-full bg-[#080a11] border border-[#1c2234] focus:border-[#007aff] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                        />
                      </div>
                    </div>

                    {settingsSavedMsg && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{settingsSavedMsg}</span>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        id="admin-save-settings-btn"
                        className="px-6 py-3 bg-[#0055ff] hover:bg-[#0047e0] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Settings</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
