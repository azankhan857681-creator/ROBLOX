export interface AdminUser {
  id: string;
  email: string;
  role: 'Superadmin' | 'Administrator' | 'Key Manager';
  customPassword?: string;
  addedAt: string;
  addedBy: string;
  isRoot?: boolean;
}

export interface GeneratedKeyRecord {
  id: string;
  code: string;
  discordUser: string;
  deviceLimit: number | 'unlimited';
  durationHours: number; // -1 for lifetime
  durationLabel: string;
  createdAt: number;
  expiresAt: number | null;
  status: 'active' | 'expired' | 'revoked';
}

export type AdminTextureStyle = 'obsidian' | 'carbon' | 'cyber' | 'stealth';

export interface AdminSystemConfig {
  isKeySystemEnabled: boolean; // Controls whether key is required for users
  texture: AdminTextureStyle;
  defaultPrefix: string;
  keyStructurePattern: string;
  defaultDeviceLimit: number;
  robuxAmountToDisplay: number;
  adminEmail: string;
  masterPasswordHash: string; // Plaintext or stored for verification
}

const STORAGE_ADMIN_CONFIG = 'roblox_admin_config_v2';
const STORAGE_ADMIN_USERS = 'roblox_admin_users_v2';
const STORAGE_ADMIN_KEYS = 'roblox_admin_keys_v2';

export const DEFAULT_MASTER_PASSWORD = 'LEVIGOATED';
export const DEFAULT_ADMIN_EMAIL = '';

export function getStoredAdminConfig(): AdminSystemConfig {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure personal email is never stored or leaked
      if (parsed.adminEmail && parsed.adminEmail.toLowerCase().includes('devansh')) {
        parsed.adminEmail = '';
      }
      // Migrate prefix and update master password to LEVIGOATED
      if (parsed.defaultPrefix === 'GOJO') {
        parsed.defaultPrefix = 'RBX';
      }
      if (
        parsed.masterPasswordHash === 'TANISHSCRIPSISTHEGOAT' ||
        parsed.masterPasswordHash === 'GOJOISTHEGOAT'
      ) {
        parsed.masterPasswordHash = DEFAULT_MASTER_PASSWORD;
      }
      // Clean any stale autoLock properties so settings never mutate by themselves
      delete parsed.autoLockActiveUntil;
      delete parsed.autoLockTimerMinutes;

      return { ...defaultConfig(), ...parsed, masterPasswordHash: parsed.masterPasswordHash || DEFAULT_MASTER_PASSWORD };
    }
  } catch (e) {
    console.error('Failed to load admin config', e);
  }
  return defaultConfig();
}

function defaultConfig(): AdminSystemConfig {
  return {
    isKeySystemEnabled: true,
    texture: 'obsidian',
    defaultPrefix: 'RBX',
    keyStructurePattern: 'PREFIX-XXXX-XXXX',
    defaultDeviceLimit: 2,
    robuxAmountToDisplay: 10000,
    adminEmail: DEFAULT_ADMIN_EMAIL,
    masterPasswordHash: DEFAULT_MASTER_PASSWORD,
  };
}

export function saveAdminConfig(config: AdminSystemConfig) {
  try {
    localStorage.setItem(STORAGE_ADMIN_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save admin config', e);
  }
}

export function getStoredAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip any personal email references
        return parsed.map((u: AdminUser) => ({
          ...u,
          email: u.email && u.email.toLowerCase().includes('devansh') ? 'admin@system.local' : u.email,
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load admin users', e);
  }
  return [
    {
      id: 'root-admin',
      email: 'admin@system.local',
      role: 'Superadmin',
      addedAt: '9/14/2026',
      addedBy: 'System Owner',
      isRoot: true,
    },
  ];
}

export function saveAdminUsers(users: AdminUser[]) {
  try {
    localStorage.setItem(STORAGE_ADMIN_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save admin users', e);
  }
}

export function getStoredAdminKeys(): GeneratedKeyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_KEYS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load admin keys', e);
  }
  return [];
}

export function saveAdminKeys(keys: GeneratedKeyRecord[]) {
  try {
    localStorage.setItem(STORAGE_ADMIN_KEYS, JSON.stringify(keys));
  } catch (e) {
    console.error('Failed to save admin keys', e);
  }
}

export function verifyAdminCredentials(email = '', password: string): { valid: boolean; user?: AdminUser } {
  const config = getStoredAdminConfig();
  const users = getStoredAdminUsers();

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanPass) return { valid: false };

  // Master password match allows root admin access directly (no email required)
  if (
    cleanPass === config.masterPasswordHash ||
    cleanPass === DEFAULT_MASTER_PASSWORD ||
    cleanPass.toUpperCase() === 'LEVIGOATED' ||
    cleanPass.toUpperCase() === 'GOJOISTHEGOAT' ||
    cleanPass.toUpperCase() === 'TANISHSCRIPSISTHEGOAT'
  ) {
    const existing = users.find((u) => cleanEmail && u.email.toLowerCase() === cleanEmail);
    return {
      valid: true,
      user: existing || {
        id: 'root-admin',
        email: cleanEmail || 'admin@system.local',
        role: 'Superadmin',
        addedAt: '9/14/2026',
        addedBy: 'System Owner',
        isRoot: true,
      },
    };
  }

  // Check matching user
  const found = users.find((u) => (cleanEmail ? u.email.toLowerCase() === cleanEmail : u.customPassword === cleanPass));
  if (found) {
    if (found.customPassword && found.customPassword === cleanPass) {
      return { valid: true, user: found };
    }
  }

  return { valid: false };
}

function generateRandomKeyString(prefix = 'RBX'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${part1}-${part2}`;
}

export function createDedicatedKeyRecord(params: {
  customCode?: string;
  discordUser?: string;
  deviceLimit?: number | 'unlimited';
  isLifetime?: boolean;
  durationHours?: number;
  durationLabel?: string;
}): GeneratedKeyRecord {
  const config = getStoredAdminConfig();
  const code = params.customCode?.trim().toUpperCase() || generateRandomKeyString(config.defaultPrefix);
  const now = Date.now();
  // Keys stay permanent until deleted by default
  const isLifetime = params.isLifetime !== undefined ? params.isLifetime : true;
  const durationHours = isLifetime ? -1 : params.durationHours || -1;
  const expiresAt = isLifetime ? null : (params.durationHours && params.durationHours > 0 ? now + params.durationHours * 60 * 60 * 1000 : null);

  const newKey: GeneratedKeyRecord = {
    id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    code,
    discordUser: params.discordUser?.trim() || '@unassigned',
    deviceLimit: params.deviceLimit ?? config.defaultDeviceLimit,
    durationHours,
    durationLabel: isLifetime || expiresAt === null ? 'Permanent (Active until deleted)' : params.durationLabel || `${durationHours} Hours`,
    createdAt: now,
    expiresAt,
    status: 'active',
  };

  const existing = getStoredAdminKeys();
  const updated = [newKey, ...existing];
  saveAdminKeys(updated);
  return newKey;
}

export function createBulkKeyRecords(params: {
  count: number;
  isUnlimitedDevices?: boolean;
  isLifetime?: boolean;
  durationHours?: number;
  durationLabel?: string;
}): GeneratedKeyRecord[] {
  const config = getStoredAdminConfig();
  const now = Date.now();
  const count = Math.min(Math.max(1, params.count), 50);
  const isLifetime = params.isLifetime !== undefined ? params.isLifetime : true;
  const durationHours = isLifetime ? -1 : params.durationHours || -1;
  const expiresAt = isLifetime ? null : (params.durationHours && params.durationHours > 0 ? now + params.durationHours * 60 * 60 * 1000 : null);

  const generated: GeneratedKeyRecord[] = [];
  for (let i = 0; i < count; i++) {
    generated.push({
      id: `bulk_${now}_${i}_${Math.random().toString(36).substr(2, 6)}`,
      code: generateRandomKeyString(config.defaultPrefix),
      discordUser: '@bulk_batch',
      deviceLimit: params.isUnlimitedDevices ? 'unlimited' : config.defaultDeviceLimit,
      durationHours,
      durationLabel: isLifetime || expiresAt === null ? 'Permanent (Active until deleted)' : params.durationLabel || `${durationHours} Hours`,
      createdAt: now,
      expiresAt,
      status: 'active',
    });
  }

  const existing = getStoredAdminKeys();
  const updated = [...generated, ...existing];
  saveAdminKeys(updated);
  return generated;
}

export function toggleKeyStatus(id: string): GeneratedKeyRecord[] {
  const keys = getStoredAdminKeys();
  const updated = keys.map((k) => {
    if (k.id === id) {
      const willBeActive = k.status !== 'active';
      return {
        ...k,
        status: (willBeActive ? 'active' : 'revoked') as 'active' | 'revoked',
        // When activated in the admin panel, it stays permanent until deleted
        expiresAt: willBeActive ? null : k.expiresAt,
        durationHours: willBeActive ? -1 : k.durationHours,
        durationLabel: willBeActive ? 'Permanent (Active until deleted)' : k.durationLabel,
      };
    }
    return k;
  });
  saveAdminKeys(updated);
  return updated;
}

export function activateKeyPermanently(id: string): GeneratedKeyRecord[] {
  const keys = getStoredAdminKeys();
  const updated = keys.map((k) => {
    if (k.id === id) {
      return {
        ...k,
        status: 'active' as const,
        expiresAt: null,
        durationHours: -1,
        durationLabel: 'Permanent (Active until deleted)',
      };
    }
    return k;
  });
  saveAdminKeys(updated);
  return updated;
}

export function deleteKeyRecord(id: string): GeneratedKeyRecord[] {
  const keys = getStoredAdminKeys();
  const updated = keys.filter((k) => k.id !== id);
  saveAdminKeys(updated);
  return updated;
}

export function purgeExpiredKeyRecords(): GeneratedKeyRecord[] {
  const keys = getStoredAdminKeys();
  const now = Date.now();
  const updated = keys.filter((k) => {
    if (k.expiresAt && now > k.expiresAt) return false;
    return true;
  });
  saveAdminKeys(updated);
  return updated;
}

export function addNewAdminUser(user: Omit<AdminUser, 'id' | 'addedAt'>): AdminUser[] {
  const users = getStoredAdminUsers();
  const newUser: AdminUser = {
    ...user,
    id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    addedAt: '9/14/2026',
  };
  const updated = [...users, newUser];
  saveAdminUsers(updated);
  return updated;
}

export function removeAdminUser(id: string): AdminUser[] {
  const users = getStoredAdminUsers();
  const updated = users.filter((u) => u.id !== id || u.isRoot);
  saveAdminUsers(updated);
  return updated;
}

