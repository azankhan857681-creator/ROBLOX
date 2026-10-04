export interface GameItem {
  id: string;
  placeId: number;
  title: string;
  rating: string;
  players?: string;
  ad?: boolean;
  creator?: string;
  type: 'recommended' | 'continue';
  iconUrl: string;
  localImage?: string;
  bannerUrl?: string;
  screenshotGroup?: 1 | 2 | 3 | 4;
  description?: string;
  genre?: string;
  isCustom?: boolean;
}

export interface CatalogGame {
  placeId: number;
  title: string;
  genre: string;
  defaultPlayers: string;
  rating: string;
  creator: string;
  iconUrl: string;
  bannerUrl?: string;
  localImage?: string;
  description?: string;
  isMainRoblox?: boolean;
}

export type NavTab = 'home' | 'charts' | 'avatar' | 'chat' | 'more';

export interface AccessKeyData {
  isUnlocked: boolean;
  code: string;
  durationLabel: string;
  durationHours: number; // -1 for lifetime/permanent
  activatedAt: number;
  expiresAt: number | null;
}

