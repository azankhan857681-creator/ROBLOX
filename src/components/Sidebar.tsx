import { useState, useEffect } from 'react';
import { Home, BarChart2, MessageSquare, MoreHorizontal } from 'lucide-react';
import { NavTab } from '../types';
import { USER_PROFILE } from '../data/games';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  avatarUrl?: string;
  theme?: 'dark' | 'light';
}

export function Sidebar({
  currentTab,
  onSelectTab,
  avatarUrl = USER_PROFILE.avatarImage,
  theme: themeProp,
}: SidebarProps) {
  const [avatarError, setAvatarError] = useState(false);
  const themeContext = useTheme();
  const isDark = (themeProp || themeContext?.theme || 'dark') === 'dark';

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  return (
    <aside
      className={`w-16 md:w-18 shrink-0 flex flex-col items-center py-3 select-none transition-colors border-r ${
        isDark ? 'bg-[#0b0c10] border-[#1f2229]' : 'bg-white border-[#e3e5e8]'
      }`}
    >
      <nav className="flex flex-col items-center gap-4 w-full">
        {/* Home Item */}
        <button
          id="nav-home"
          onClick={() => onSelectTab('home')}
          className={`group flex flex-col items-center w-full py-1 cursor-pointer transition-colors ${
            currentTab === 'home'
              ? isDark ? 'text-white' : 'text-neutral-900 font-bold'
              : isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <Home className="w-6 h-6 mb-1" />
            {currentTab === 'home' && (
              <span className="w-4 h-0.5 bg-[#00a2ff] rounded-full absolute -bottom-0.5" />
            )}
          </div>
          <span className="text-[11px] font-semibold mt-1">Home</span>
        </button>

        {/* Charts Item */}
        <button
          id="nav-charts"
          onClick={() => onSelectTab('charts')}
          className={`group flex flex-col items-center w-full py-1 cursor-pointer transition-colors ${
            currentTab === 'charts'
              ? isDark ? 'text-white' : 'text-neutral-900 font-bold'
              : isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <BarChart2 className="w-6 h-6 mb-1" />
            {currentTab === 'charts' && (
              <span className="w-4 h-0.5 bg-[#00a2ff] rounded-full absolute -bottom-0.5" />
            )}
          </div>
          <span className="text-[11px] font-medium mt-1">Charts</span>
        </button>

        {/* Avatar Item */}
        <button
          id="nav-avatar"
          onClick={() => onSelectTab('avatar')}
          className={`group flex flex-col items-center w-full py-1 cursor-pointer transition-colors ${
            currentTab === 'avatar'
              ? isDark ? 'text-white' : 'text-neutral-900 font-bold'
              : isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full overflow-hidden border ${
              isDark ? 'border-[#3b3e44] bg-[#232527]' : 'border-neutral-300 bg-neutral-100'
            }`}>
              <img
                src={avatarError ? USER_PROFILE.avatarFallbackUrl : avatarUrl}
                onError={() => setAvatarError(true)}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {currentTab === 'avatar' && (
              <span className="w-4 h-0.5 bg-[#00a2ff] rounded-full absolute -bottom-1" />
            )}
          </div>
          <span className="text-[11px] font-medium mt-1">Avatar</span>
        </button>

        {/* Chat Item */}
        <button
          id="nav-chat"
          onClick={() => onSelectTab('chat')}
          className={`group flex flex-col items-center w-full py-1 cursor-pointer transition-colors ${
            currentTab === 'chat'
              ? isDark ? 'text-white' : 'text-neutral-900 font-bold'
              : isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <MessageSquare className="w-6 h-6 mb-1" />
            {currentTab === 'chat' && (
              <span className="w-4 h-0.5 bg-[#00a2ff] rounded-full absolute -bottom-0.5" />
            )}
          </div>
          <span className="text-[11px] font-medium mt-1">Chat</span>
        </button>

        {/* More Item */}
        <button
          id="nav-more"
          onClick={() => onSelectTab('more')}
          className={`group flex flex-col items-center w-full py-1 cursor-pointer transition-colors ${
            currentTab === 'more'
              ? isDark ? 'text-white' : 'text-neutral-900 font-bold'
              : isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
              isDark ? 'border-neutral-400 text-neutral-300' : 'border-neutral-400 text-neutral-600'
            }`}>
              <MoreHorizontal className="w-4 h-4" />
            </div>
            {currentTab === 'more' && (
              <span className="w-4 h-0.5 bg-[#00a2ff] rounded-full absolute -bottom-1" />
            )}
          </div>
          <span className="text-[11px] font-medium mt-1">More</span>
        </button>
      </nav>
    </aside>
  );
}

