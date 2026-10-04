import React, { useState, useEffect } from 'react';
import { Key, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AccessKeyData } from '../types';
import { createAccessKey, validateKeyInput } from '../utils/keySystem';
import { getStoredAdminKeys, getStoredAdminConfig, DEFAULT_MASTER_PASSWORD } from '../utils/adminSystem';
import { AdminPanelModal } from './AdminPanelModal';

interface KeySystemLockScreenProps {
  onUnlock: (keyData: AccessKeyData) => void;
  currentKey?: AccessKeyData;
}

export function KeySystemLockScreen({ onUnlock, currentKey }: KeySystemLockScreenProps) {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Check if key system is disabled by admin
  useEffect(() => {
    const config = getStoredAdminConfig();
    if (!config.isKeySystemEnabled) {
      // Key system turned off by admin -> unlock automatically
      const bypassKey = createAccessKey('SYSTEM-UNLOCKED', -1, true);
      onUnlock(bypassKey);
    }
  }, [onUnlock]);

  const handleUnlockWithKey = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const toCheck = keyInput.trim().toUpperCase();
    if (!toCheck) {
      setError('Please enter your access key.');
      return;
    }

    // Direct website admin master password unlock
    const config = getStoredAdminConfig();
    if (
      toCheck === config.masterPasswordHash ||
      toCheck === DEFAULT_MASTER_PASSWORD ||
      toCheck === 'LEVIGOATED' ||
      toCheck === 'GOJOISTHEGOAT' ||
      toCheck === 'TANISHSCRIPSISTHEGOAT'
    ) {
      handleUnlockAsAdmin();
      return;
    }

    // First check if this key was generated or activated in the Admin Panel
    const adminKeys = getStoredAdminKeys();
    const matchedAdminKey = adminKeys.find((k) => k.code.toUpperCase() === toCheck);

    if (matchedAdminKey) {
      if (matchedAdminKey.status === 'revoked') {
        setError('This access key has been revoked by the administrator.');
        return;
      }

      if (matchedAdminKey.expiresAt && Date.now() > matchedAdminKey.expiresAt) {
        setError('This access key has expired. Please contact an administrator for a new key.');
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        const isLifetime = matchedAdminKey.expiresAt === null || matchedAdminKey.durationHours === -1;
        const newKey = createAccessKey(
          matchedAdminKey.code,
          matchedAdminKey.durationHours ?? -1,
          true
        );
        newKey.expiresAt = matchedAdminKey.expiresAt;
        newKey.durationLabel = matchedAdminKey.durationLabel || (isLifetime ? 'Permanent (Lifetime)' : `${matchedAdminKey.durationHours} Hours`);
        newKey.durationHours = matchedAdminKey.durationHours ?? -1;
        onUnlock(newKey);
      }, 450);
      return;
    }

    // Otherwise standard validation (e.g. default demo key or pattern match)
    const result = validateKeyInput(toCheck);

    if (!result.valid) {
      setError(result.error || 'Invalid key format. Expected: RBX-XXXXX-XXXXX');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      const newKey = createAccessKey(toCheck, result.hours, true);
      onUnlock(newKey);
    }, 450);
  };

  const handleUnlockAsAdmin = () => {
    setIsSuccess(true);
    setTimeout(() => {
      const adminKey = createAccessKey('RBX-ADMIN-ROOT', -1, true);
      onUnlock(adminKey);
    }, 300);
  };

  return (
    <div
      id="key-system-lock-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#07080b] text-white select-none overflow-y-auto"
    >
      <div className="w-full max-w-[380px] sm:max-w-[420px] flex flex-col items-center">
        {/* Top Key Icon Circle - Matches the screenshot exactly */}
        <div className="relative mb-6">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#0f1218] border border-[#1d222e] flex items-center justify-center shadow-2xl">
            <Key className="w-8 h-8 sm:w-9 sm:h-9 text-[#007aff]" strokeWidth={2.2} />
          </div>
          {isSuccess && (
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          )}
        </div>

        {/* Main Key Entry Mode (Picture Exact Copy) */}
        <div className="w-full flex flex-col items-center">
          {/* Heading */}
          <h1 className="text-2xl sm:text-[28px] font-bold text-white text-center tracking-tight leading-tight">
            Enter your access key
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-[15px] text-neutral-400 text-center mt-2.5 max-w-[320px] leading-relaxed">
            Access is key-protected. Paste the key you were given.
          </p>

          {/* Form */}
          <form onSubmit={handleUnlockWithKey} className="w-full mt-7 flex flex-col items-center space-y-4">
            {/* Input field with RBX-XXXXX-XXXXX placeholder */}
            <div className="w-full relative">
              <input
                id="access-key-input"
                type="text"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="RBX-XXXXX-XXXXX"
                autoFocus
                autoComplete="off"
                spellCheck="false"
                className="w-full h-14 bg-[#0d0f15] border border-[#1f2432] focus:border-[#0066ff] focus:ring-1 focus:ring-[#0066ff]/40 rounded-2xl text-center font-mono text-sm sm:text-base tracking-widest text-white uppercase placeholder:text-neutral-600 outline-none transition-all shadow-inner"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="w-full text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-xl px-3 py-2 text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="w-full text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 rounded-xl px-3 py-2 text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>Access key verified! Unlocking application...</span>
              </div>
            )}

            {/* Blue Unlock Button */}
            <button
              id="access-key-unlock-button"
              type="submit"
              disabled={isSuccess}
              className="w-full h-13 bg-[#0a52be] hover:bg-[#0c5ee0] active:scale-[0.99] text-white font-semibold text-base rounded-2xl transition-all shadow-lg flex items-center justify-center cursor-pointer disabled:opacity-75"
            >
              {isSuccess ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Unlocking...
                </span>
              ) : (
                'Unlock'
              )}
            </button>
          </form>

          {/* Admin login Link - Opens the Administrator Panel Modal from Screenshot 2 */}
          <button
            id="access-key-admin-login-link"
            type="button"
            onClick={() => {
              setIsAdminPanelOpen(true);
              setError(null);
            }}
            className="mt-7 text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer text-center"
          >
            Admin login
          </button>
        </div>
      </div>

      {/* Admin Panel & Login Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onKeySystemStatusChange={(enabled) => {
          if (!enabled) {
            handleUnlockAsAdmin();
          }
        }}
        onUnlockAppAsAdmin={handleUnlockAsAdmin}
      />
    </div>
  );
}

