import { AccessKeyData } from '../types';

export const STORAGE_KEY = 'roblox_access_key_system_v1';

export function generateRandomCode(prefix = 'RBX'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${part1}-${part2}`;
}

export function createAccessKey(code: string, hours: number, isUnlocked = true): AccessKeyData {
  const now = Date.now();
  let durationLabel = '24 Hours';
  if (hours === 1) durationLabel = '1 Hour';
  else if (hours === 24) durationLabel = '24 Hours';
  else if (hours === 72) durationLabel = '3 Days';
  else if (hours === 168) durationLabel = '7 Days';
  else if (hours === 720) durationLabel = '30 Days';
  else if (hours === -1) durationLabel = 'Permanent (Lifetime)';

  const expiresAt = hours === -1 ? null : now + hours * 60 * 60 * 1000;

  return {
    isUnlocked,
    code: code.trim().toUpperCase(),
    durationLabel,
    durationHours: hours,
    activatedAt: now,
    expiresAt,
  };
}

export function getInitialKeyData(): AccessKeyData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: AccessKeyData = JSON.parse(saved);
      if (parsed && typeof parsed.code === 'string') {
        if (parsed.code === 'GOJO-8821-X49B') {
          parsed.code = 'RBX-8821-X49B';
        }
        // Preserves unlocked state permanently until user or admin explicitly locks/deletes it
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading stored key data:', err);
  }

  // Default: Pre-seeded key with lifetime permanent duration until deleted
  return {
    isUnlocked: false,
    code: 'RBX-8821-X49B',
    durationLabel: 'Permanent (Active until deleted)',
    durationHours: -1,
    activatedAt: Date.now(),
    expiresAt: null,
  };
}

export function saveKeyData(keyData: AccessKeyData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keyData));
  } catch (err) {
    console.error('Error saving key data:', err);
  }
}

export function validateKeyInput(rawInput: string): { valid: boolean; hours: number; label: string; error?: string } {
  const cleaned = rawInput.trim().toUpperCase();
  if (!cleaned) {
    return { valid: false, hours: 0, label: '', error: 'Please enter an access key.' };
  }

  // Accept any key in format RBX-... or legacy GOJO-...
  if (cleaned.startsWith('RBX') || cleaned.startsWith('GOJO')) {
    if (cleaned.includes('LIFE') || cleaned.includes('PERM')) {
      return { valid: true, hours: -1, label: 'Permanent (Lifetime)' };
    }
    if (cleaned.includes('7D') || cleaned.includes('WEEK')) {
      return { valid: true, hours: 168, label: '7 Days' };
    }
    if (cleaned.includes('1H') || cleaned.includes('HOUR')) {
      return { valid: true, hours: 1, label: '1 Hour' };
    }
    // Standard 24h key
    return { valid: true, hours: 24, label: '24 Hours' };
  }

  // Accept keys of at least 6 characters formatted with hyphens or alphanumeric
  if (cleaned.length >= 6) {
    return { valid: true, hours: 24, label: '24 Hours' };
  }

  return {
    valid: false,
    hours: 0,
    label: '',
    error: 'Invalid key format. Expected format: RBX-XXXXX-XXXXX',
  };
}

export function formatTimeRemaining(expiresAt: number | null): string {
  if (expiresAt === null) {
    return 'Unlimited (Lifetime Access)';
  }

  const diffMs = expiresAt - Date.now();
  if (diffMs <= 0) {
    return 'Expired';
  }

  const totalSecs = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSecs / (3600 * 24));
  const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s remaining`;
  }
  return `${minutes}m ${seconds}s remaining`;
}

export function formatTimestamp(ts: number | null): string {
  if (!ts) return 'Never (Permanent)';
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
