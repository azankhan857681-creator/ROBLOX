import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { RobloxLogo } from './RobloxLogo';
import { RobuxIcon } from './RobuxIcon';
import { RobloxVerifiedBadge } from './RobloxVerifiedBadge';
import { RobloxPlusBadge } from './RobloxPlusBadge';
import { USER_PROFILE } from '../data/games';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenRobuxShop?: () => void;
  isRobuxMenuOpen?: boolean;
  onToggleRobuxMenu?: () => void;
  username?: string;
  displayName?: string;
  isVerified?: boolean;
  hasRobloxPlus?: boolean;
  avatarUrl?: string;
  robux?: number;
  robuxIconStyle?: 'white' | 'gold' | 'cyan';
  theme?: 'dark' | 'light';
}

export function Header({
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  onOpenSettings,
  onOpenRobuxShop,
  isRobuxMenuOpen = false,
  onToggleRobuxMenu,
  username = USER_PROFILE.username,
  displayName,
  isVerified = false,
  hasRobloxPlus = false,
  avatarUrl = USER_PROFILE.avatarImage,
  robux = 1450,
  robuxIconStyle = 'white',
  theme: themeProp,
}: HeaderProps) {
  const [avatarError, setAvatarError] = useState(false);
  const themeContext = useTheme();
  const isDark = (themeProp || themeContext?.theme || 'dark') === 'dark';

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  return (
    <header
      className={`sticky top-0 z-40 h-14 px-4 flex items-center justify-between gap-4 select-none transition-colors border-b ${
        isDark
          ? 'bg-[#0b0c10] border-[#1f2229] text-neutral-100'
          : 'bg-white border-[#e3e5e8] text-neutral-900 shadow-xs'
      }`}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <RobloxLogo theme={isDark ? 'dark' : 'light'} />
      </div>

      {/* Middle: Search bar */}
      <div className="flex-1 max-w-xl mx-2">
        <div className="relative flex items-center">
          <Search className={`absolute left-3.5 w-4 h-4 pointer-events-none ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`} />
          <input
            id="roblox-global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className={`w-full text-sm pl-10 pr-4 py-1.5 rounded-md border outline-none transition-colors ${
              isDark
                ? 'bg-[#1b1d20] hover:bg-[#232528] focus:bg-[#232528] text-neutral-100 placeholder-neutral-400 border-[#2b2d31] focus:border-neutral-400'
                : 'bg-[#f2f4f5] hover:bg-[#eaedf0] focus:bg-white text-neutral-900 placeholder-neutral-500 border-neutral-300 focus:border-[#00a2ff]'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-2.5 text-xs px-1.5 py-0.5 ${
                isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Pill with Avatar & Username */}
        <div
          id="user-profile-button"
          className={`flex items-center gap-2 py-1 px-2 -ml-1 rounded-full transition-colors select-none text-left cursor-default ${
            isDark ? 'hover:bg-[#232527]/50' : 'hover:bg-neutral-100'
          }`}
          title={`Logged in as ${displayName || username}`}
        >
          <img
            src={avatarError ? USER_PROFILE.avatarFallbackUrl : avatarUrl}
            onError={() => setAvatarError(true)}
            alt="User Profile"
            className={`w-7 h-7 rounded-full object-cover border shrink-0 ${
              isDark ? 'border-[#3b3e44]' : 'border-neutral-300'
            }`}
            referrerPolicy="no-referrer"
          />
          <span className={`text-xs sm:text-sm font-semibold tracking-tight flex items-center gap-1.5 max-w-[130px] sm:max-w-[200px] truncate ${
            isDark ? 'text-white' : 'text-neutral-900'
          }`}>
            <span className="truncate">{username}</span>
            {isVerified && (
              <RobloxVerifiedBadge className="w-3.5 h-3.5 shrink-0" />
            )}
            {hasRobloxPlus && (
              <RobloxPlusBadge className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-white' : 'text-neutral-900'}`} />
            )}
          </span>
        </div>

        {/* Robux Icon Button */}
        <div className="relative">
          <button
            id="header-robux-button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenRobuxShop) {
                onOpenRobuxShop();
              } else if (onToggleRobuxMenu) {
                onToggleRobuxMenu();
              }
            }}
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer group ${
              isDark
                ? 'text-neutral-300 hover:text-white hover:bg-[#232527]'
                : 'text-neutral-900 hover:text-black hover:bg-neutral-100'
            }`}
            title="Robux Store & Send"
          >
            <RobuxIcon
              variant={robuxIconStyle}
              theme={isDark ? 'dark' : 'light'}
              className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110"
            />
          </button>

          {/* Robux Dropdown Popover */}
          {isRobuxMenuOpen && (
            <div
              id="header-robux-dropdown"
              onClick={(e) => e.stopPropagation()}
              className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 border ${
                isDark
                  ? 'bg-[#1e2024] border-[#2e3138] text-neutral-100'
                  : 'bg-white border-neutral-200 text-neutral-900 shadow-xl'
              }`}
            >
              <div
                className={`px-3.5 py-2 border-b flex items-center justify-between cursor-pointer transition-colors ${
                  isDark
                    ? 'border-[#292c33] hover:bg-[#282a30]'
                    : 'border-neutral-100 hover:bg-neutral-50'
                }`}
                onClick={() => {
                  if (onToggleRobuxMenu) onToggleRobuxMenu();
                  if (onOpenRobuxShop) onOpenRobuxShop();
                }}
              >
                <div className="flex items-center gap-2">
                  <RobuxIcon
                    variant={robuxIconStyle}
                    theme={isDark ? 'dark' : 'light'}
                    className="w-4 h-4 shrink-0"
                  />
                  <span className={`text-xs font-bold tracking-wide ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    {robux.toLocaleString()} Robux
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onToggleRobuxMenu) onToggleRobuxMenu();
                  if (onOpenRobuxShop) {
                    onOpenRobuxShop();
                  } else {
                    onOpenSettings();
                  }
                }}
                className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isDark
                    ? 'text-neutral-300 hover:bg-[#282a30] hover:text-white'
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <span>Buy & Send Robux</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <button
          id="notifications-button"
          onClick={onOpenNotifications}
          className={`relative w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
            isDark
              ? 'text-neutral-300 hover:text-white hover:bg-[#232527]'
              : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
          }`}
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {/* Red 69 badge */}
          <span className="absolute -top-1 -right-1 bg-[#d83a3a] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight border border-[#111216] shadow-sm">
            {USER_PROFILE.notificationsCount}
          </span>
        </button>
      </div>
    </header>
  );
}

