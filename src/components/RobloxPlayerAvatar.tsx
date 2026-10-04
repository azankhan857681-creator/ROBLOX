import React from 'react';

interface RobloxPlayerAvatarProps {
  username: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
}

export const KNOWN_AVATARS: Record<string, string> = {
  roblox: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-310966282D3529E36976BF6B07B1DC90-Png/150/150/AvatarHeadshot/Png/noFilter',
  builderman: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-635A2AA0A87D473B6136800B5B86F761-Png/420/420/AvatarHeadshot/Png/noFilter',
  hyprisms: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-381471758B6B161C67FA989CCDF4648F-Png/420/420/AvatarHeadshot/Png/noFilter',
  stickmasterluke: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-1A9690EEAE8B9EA3D01BBC9ABF8CA7E1-Png/150/150/AvatarHeadshot/Png/noFilter',
  kreekcraft: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-BE8960DE953FFC2D9B10565CC09A3EC3-Png/150/150/AvatarHeadshot/Png/noFilter',
  linkmon99: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-89A5211C79181E57B2B08FB4A94B89BC-Png/420/420/AvatarHeadshot/Png/noFilter',
  david_baszucki: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-CD091D895E85620AE6C02E9F0D27BBE6-Png/150/150/AvatarHeadshot/Png/noFilter',
  'david.baszucki': 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-CD091D895E85620AE6C02E9F0D27BBE6-Png/150/150/AvatarHeadshot/Png/noFilter',
  shedletsky: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-97C404164D7B9655EC6BFC1B3208F601-Png/150/150/AvatarHeadshot/Png/noFilter',
  bugsbunnyboy1012: '/games/user_avatar.png',
};

const LOCAL_STORAGE_KEY = 'roblox_avatar_cache_v2';

// Global in-memory cache for fetched Roblox avatars with LocalStorage backing
export const AVATAR_CACHE = new Map<string, string>();

// Seed in-memory cache from local storage if in browser
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'string') {
          AVATAR_CACHE.set(k.toLowerCase(), v);
        }
      }
    }
  }
} catch (_) {}

export function saveAvatarToCache(username: string, url: string) {
  if (!username || !url) return;
  const clean = username.toLowerCase().replace('@', '').trim();
  AVATAR_CACHE.set(clean, url);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[clean] = url;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (_) {}
}

export function getCachedOrPresetAvatar(username: string): string | undefined {
  const clean = (username || 'roblox').toLowerCase().replace('@', '').trim();
  return KNOWN_AVATARS[clean] || AVATAR_CACHE.get(clean);
}

export function RobloxPlayerAvatar({
  username,
  avatarUrl,
  size = 40,
  className = '',
}: RobloxPlayerAvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const clean = (username || 'Roblox').toLowerCase().replace('@', '').trim();

  const initialUrl =
    avatarUrl ||
    KNOWN_AVATARS[clean] ||
    AVATAR_CACHE.get(clean) ||
    (clean === 'bugsbunnyboy1012' ? '/games/user_avatar.png' : undefined);

  const [dynamicUrl, setDynamicUrl] = React.useState<string | undefined>(initialUrl);

  const effectiveAvatarUrl =
    avatarUrl ||
    KNOWN_AVATARS[clean] ||
    dynamicUrl ||
    AVATAR_CACHE.get(clean);

  // Background fetch for official avatar if not already known
  React.useEffect(() => {
    if (avatarUrl || KNOWN_AVATARS[clean] || AVATAR_CACHE.has(clean)) {
      if (AVATAR_CACHE.has(clean)) {
        setDynamicUrl(AVATAR_CACHE.get(clean));
      }
      return;
    }

    let isMounted = true;
    fetch(`/api/roblox/avatar?username=${encodeURIComponent(clean)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.avatarUrl) {
          saveAvatarToCache(clean, data.avatarUrl);
          setDynamicUrl(data.avatarUrl);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [clean, avatarUrl]);

  // Reset imgError if effectiveAvatarUrl changes
  React.useEffect(() => {
    setImgError(false);
  }, [effectiveAvatarUrl]);

  // If a valid image URL is given and didn't error out, render it
  if (effectiveAvatarUrl && !imgError) {
    return (
      <img
        src={effectiveAvatarUrl}
        alt={username}
        className={`rounded-full object-cover shrink-0 ring-1 ring-white/10 ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
        loading="eager"
        decoding="async"
      />
    );
  }

  // Authentic clean Roblox default avatar silhouette
  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center bg-[#1c2230] border border-white/10 overflow-hidden select-none ${className}`}
      style={{ width: size, height: size }}
      title={username}
    >
      <svg
        viewBox="0 0 36 36"
        fill="currentColor"
        className="w-[58%] h-[58%] text-[#4b5568]"
      >
        <path d="M18 5.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm-9.5 21.5c0-4.8 4.2-8 9.5-8s9.5 3.2 9.5 8v2H8.5v-2z" />
      </svg>
    </div>
  );
}
