import React, { useState, useEffect } from 'react';
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Clock,
  Lock,
} from 'lucide-react';
import { AccessKeyData } from '../types';
import {
  formatTimeRemaining,
  formatTimestamp,
} from '../utils/keySystem';

interface AccessKeySettingsTabProps {
  keyData: AccessKeyData;
  onUpdateKeyData?: (data: AccessKeyData) => void;
  onLockApp: () => void;
}

export function AccessKeySettingsTab({
  keyData,
  onLockApp,
}: AccessKeySettingsTabProps) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(() =>
    formatTimeRemaining(keyData.expiresAt)
  );

  // Live timer countdown ticker
  useEffect(() => {
    const updateCountdown = () => {
      setTimeRemaining(formatTimeRemaining(keyData.expiresAt));
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [keyData.expiresAt]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(keyData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = keyData.code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maskedCode = keyData.code
    ? keyData.code
        .split('-')
        .map((part, idx) => (idx === 0 ? part : '•••••'))
        .join('-')
    : 'RBX-•••••-•••••';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-[#141822] to-[#16181d] border border-[#2b3345] rounded-xl flex items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#007aff]/15 border border-[#007aff]/35 flex items-center justify-center text-[#007aff] shrink-0 shadow-sm">
            <Key className="w-6 h-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Access Key & Duration Status
              </h4>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
              Inspect the access key currently in use and review the active validity duration.
            </p>
          </div>
        </div>

        {/* Lock App Test Button */}
        <button
          type="button"
          id="btn-lock-app-from-settings"
          onClick={onLockApp}
          className="px-3.5 py-2 rounded-xl bg-[#1c212c] hover:bg-[#252c3b] border border-[#313a4d] text-neutral-200 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
          title="Lock app to view and test the login screen"
        >
          <Lock className="w-3.5 h-3.5 text-[#007aff]" />
          <span>Lock App</span>
        </button>
      </div>

      {/* Primary Key Details: Code & Duration Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: KEY CODE */}
        <div className="p-4 bg-[#16181d] border border-[#252830] rounded-xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#007aff]" />
              Key You Used
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#232731] transition-colors cursor-pointer"
                title={showCode ? 'Mask Key' : 'Reveal Key'}
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#202531] hover:bg-[#293040] text-neutral-200 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Monospace Code Display */}
          <div className="p-3.5 bg-[#0d0f14] border border-[#1f2432] rounded-xl flex items-center justify-between shadow-inner">
            <span className="font-mono text-base font-bold text-white tracking-wider select-all">
              {showCode ? keyData.code : maskedCode}
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#007aff]/15 text-[#007aff] border border-[#007aff]/30">
              SHA-256
            </span>
          </div>

          <div className="text-[11px] text-neutral-400 flex items-center justify-between pt-1">
            <span>Activated:</span>
            <span className="text-neutral-300 font-mono font-medium">
              {formatTimestamp(keyData.activatedAt)}
            </span>
          </div>
        </div>

        {/* CARD 2: KEY DURATION & COUNTDOWN */}
        <div className="p-4 bg-[#16181d] border border-[#252830] rounded-xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#007aff]" />
              Duration of the Key
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-950/70 border border-blue-500/30 text-blue-300">
              {keyData.durationLabel}
            </span>
          </div>

          {/* Live countdown badge */}
          <div className="p-3 bg-[#0d0f14] border border-[#1f2432] rounded-xl space-y-1 shadow-inner">
            <div className="text-[11px] text-neutral-400 font-medium">Remaining Time:</div>
            <div className="font-mono text-base font-bold text-emerald-400 tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin text-emerald-400" />
              <span>{timeRemaining}</span>
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 flex items-center justify-between pt-1">
            <span>Expires On:</span>
            <span className="text-neutral-300 font-mono font-medium">
              {formatTimestamp(keyData.expiresAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
