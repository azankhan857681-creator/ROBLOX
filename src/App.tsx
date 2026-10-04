import { useState, useMemo, useEffect } from 'react';
import { UserPlus, ArrowRight, X, Check } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GameCard } from './components/GameCard';
import { GameDetailsModal } from './components/GameDetailsModal';
import { AddFriendsModal } from './components/AddFriendsModal';
import { NotificationsDropdown } from './components/NotificationsDropdown';
import { RobloxSettingsModal, UserSettingsData } from './components/RobloxSettingsModal';
import { KeySystemLockScreen } from './components/KeySystemLockScreen';
import { AdminPanelModal } from './components/AdminPanelModal';
import { RobuxShopWindow } from './components/RobuxShopWindow';
import { SendRobuxModal } from './components/SendRobuxModal';
import { RobuxIcon } from './components/RobuxIcon';
import { CONTINUE_GAMES, RECOMMENDED_GAMES } from './data/games';
import { GameItem, NavTab, AccessKeyData } from './types';
import { getInitialKeyData, saveKeyData } from './utils/keySystem';
import { getStoredAdminConfig } from './utils/adminSystem';
import { ThemeProvider } from './context/ThemeContext';

const DEFAULT_SETTINGS: UserSettingsData = {
  username: 'Bugsbunnyboy1012',
  displayName: 'Bugsbunnyboy1012',
  joinYear: 2020,
  joinDate: 'Joined in 2020',
  bio: 'Roblox Player & Creator',
  isVerified: true,
  hasRobloxPlus: true,
  avatarUrl: '/games/user_avatar.png',
  avatarStyle: 'headshot',
  robux: 10000,
  robuxIconStyle: 'white',
  theme: 'dark',
  currency: 'EU EUR',
  currencySymbol: '€',
  sendRobuxSubtitle: 'Robux are sent instantly with no fees',
  sendRobuxNotificationStyle: 'dark',
  friends: [
    {
      id: 'f-1',
      username: 'BloxMaster99',
      avatarUrl: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-D2D0ECAA81907E4299225BDEF214F3D5-Png/150/150/AvatarHeadshot/Png/isCircular',
    },
    {
      id: 'f-2',
      username: 'PixelWarrior',
      avatarUrl: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-18DE3724BF6DF82EB4F0A9AE9C55C3E2-Png/150/150/AvatarHeadshot/Png/isCircular',
    },
  ],
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [isAddFriendsOpen, setIsAddFriendsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRobuxMenuOpen, setIsRobuxMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRobuxShopOpen, setIsRobuxShopOpen] = useState(false);
  const [isSendRobuxModalOpen, setIsSendRobuxModalOpen] = useState(false);
  const [sendRobuxRecipient, setSendRobuxRecipient] = useState('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isKeySystemActive, setIsKeySystemActive] = useState<boolean>(() => {
    return getStoredAdminConfig().isKeySystemEnabled;
  });

  // Key System State & Settings Tab Selection
  const [keyData, setKeyData] = useState<AccessKeyData>(getInitialKeyData);
  const [settingsInitialTab, setSettingsInitialTab] = useState<
    'profile' | 'key' | 'theme' | 'friends' | 'games' | 'disclaimer' | 'admin'
  >('profile');

  // Sync key system state with stored Admin config without auto-locking or resetting settings
  useEffect(() => {
    const syncConfig = () => {
      const conf = getStoredAdminConfig();
      setIsKeySystemActive(conf.isKeySystemEnabled);
    };

    window.addEventListener('storage', syncConfig);
    return () => window.removeEventListener('storage', syncConfig);
  }, []);

  const handleUnlockKey = (unlockedKey: AccessKeyData) => {
    setKeyData(unlockedKey);
    saveKeyData(unlockedKey);
  };

  const handleUpdateKeyData = (updatedKey: AccessKeyData) => {
    setKeyData(updatedKey);
    saveKeyData(updatedKey);
  };

  const handleLockApp = () => {
    const lockedKey: AccessKeyData = { ...keyData, isUnlocked: false };
    setKeyData(lockedKey);
    saveKeyData(lockedKey);
  };

  const handleOpenKeySettings = () => {
    setSettingsInitialTab('key');
    setIsSettingsOpen(true);
  };

  // Customizable Games State (allows adding experiences from the Main Roblox Catalog)
  const [continueGames, setContinueGames] = useState<GameItem[]>(() => {
    try {
      const saved = localStorage.getItem('roblox_custom_continue_games');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return CONTINUE_GAMES;
  });

  const [recommendedGames, setRecommendedGames] = useState<GameItem[]>(() => {
    try {
      const saved = localStorage.getItem('roblox_custom_recommended_games');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return RECOMMENDED_GAMES;
  });

  const handleAddGame = (newGame: GameItem) => {
    if (newGame.type === 'continue') {
      setContinueGames((prev) => {
        const filtered = prev.filter((g) => g.placeId !== newGame.placeId);
        const updated = [newGame, ...filtered];
        try {
          localStorage.setItem('roblox_custom_continue_games', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else {
      setRecommendedGames((prev) => {
        const filtered = prev.filter((g) => g.placeId !== newGame.placeId);
        const updated = [newGame, ...filtered];
        try {
          localStorage.setItem('roblox_custom_recommended_games', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const handleRemoveGame = (id: string, type: 'continue' | 'recommended') => {
    if (type === 'continue') {
      setContinueGames((prev) => {
        const updated = prev.filter((g) => g.id !== id);
        try {
          localStorage.setItem('roblox_custom_continue_games', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else {
      setRecommendedGames((prev) => {
        const updated = prev.filter((g) => g.id !== id);
        try {
          localStorage.setItem('roblox_custom_recommended_games', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const handleResetGames = () => {
    setContinueGames(CONTINUE_GAMES);
    setRecommendedGames(RECOMMENDED_GAMES);
    try {
      localStorage.removeItem('roblox_custom_continue_games');
      localStorage.removeItem('roblox_custom_recommended_games');
    } catch {}
  };

  // Settings State with LocalStorage persistence
  const [settings, setSettings] = useState<UserSettingsData>(() => {
    try {
      const saved = localStorage.getItem('roblox_settings_appearance');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Explicitly set robux to 10000 as requested
        const finalRobux =
          parsed.robux === 74341043 || parsed.robux === 0 || parsed.robux === undefined
            ? 10000
            : (parsed.robux || 10000);
        const finalUsername =
          !parsed.username || parsed.username === 'Bugsfunnyboy1012'
            ? 'Bugsbunnyboy1012'
            : parsed.username;
        const initialSettings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          username: finalUsername,
          displayName: parsed.displayName === 'Bugsfunnyboy1012' ? 'Bugsbunnyboy1012' : (parsed.displayName || finalUsername),
          robux: finalRobux,
          isVerified: parsed.isVerified !== undefined ? parsed.isVerified : true,
          hasRobloxPlus: parsed.hasRobloxPlus !== undefined ? parsed.hasRobloxPlus : true,
          theme: parsed.theme === 'light' ? 'light' : 'dark',
        };
        return initialSettings;
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const handleSaveSettings = (newSettings: UserSettingsData) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('roblox_settings_appearance', JSON.stringify(newSettings));
    } catch {
      // LocalStorage fallback
    }
  };

  const handleAddRobux = (amount: number) => {
    const updated = { ...settings, robux: (settings.robux || 0) + amount };
    handleSaveSettings(updated);
  };

  const handleInitiateSendRobux = (recipient: string = '') => {
    setSendRobuxRecipient(recipient || '');
    setIsSendRobuxModalOpen(true);
    if (recipient) {
      setIsRobuxShopOpen(false);
    }
  };

  const handleSendRobuxComplete = (amount: number, _recipient: string) => {
    // Update balance
    const updatedRobux = Math.max(0, (settings.robux || 0) - amount);
    handleSaveSettings({ ...settings, robux: updatedRobux });
  };

  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'more') {
      setIsSettingsOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  // Filter games based on search query
  const filteredContinueGames = useMemo(() => {
    let list = continueGames;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((g) => g.title.toLowerCase().includes(q) || (g.genre && g.genre.toLowerCase().includes(q)));
    }
    return list;
  }, [continueGames, searchQuery]);

  const filteredRecommendedGames = useMemo(() => {
    let list = recommendedGames;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((g) => g.title.toLowerCase().includes(q) || (g.genre && g.genre.toLowerCase().includes(q)));
    }
    return list;
  }, [recommendedGames, searchQuery]);

  const closeDropdowns = () => {
    setIsNotificationsOpen(false);
    setIsRobuxMenuOpen(false);
  };

  const isDark = (settings.theme || 'dark') === 'dark';

  return (
    <ThemeProvider
      theme={settings.theme || 'dark'}
      setTheme={(t) => handleSaveSettings({ ...settings, theme: t })}
    >
      <div
        className={`min-h-screen flex flex-col font-sans selection:bg-[#00a2ff]/30 transition-colors relative ${
          isDark ? 'bg-[#0b0c10] text-neutral-100' : 'bg-white text-neutral-900'
        }`}
        onClick={closeDropdowns}
      >
        {/* Background Page Content (Full screen blur when SendRobuxModal is open, vibrant and clearly visible without pitch black dimming) */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSendRobuxModalOpen ? 'filter blur-md pointer-events-none select-none' : ''
          }`}
        >
          {/* Top Navbar */}
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenNotifications={() => {
              setIsNotificationsOpen((prev) => !prev);
              setIsRobuxMenuOpen(false);
            }}
            onOpenRobuxShop={() => {
              setIsRobuxShopOpen(true);
              setIsRobuxMenuOpen(false);
              setIsNotificationsOpen(false);
            }}
            isRobuxMenuOpen={isRobuxMenuOpen}
            onToggleRobuxMenu={() => {
              setIsRobuxShopOpen(true);
              setIsNotificationsOpen(false);
            }}
            onOpenSettings={() => {
              setSettingsInitialTab('profile');
              setIsSettingsOpen(true);
            }}
            username={settings.username}
            displayName={settings.displayName}
            isVerified={settings.isVerified}
            hasRobloxPlus={settings.hasRobloxPlus}
            avatarUrl={settings.avatarUrl}
            robux={settings.robux}
            robuxIconStyle={settings.robuxIconStyle}
            theme={settings.theme}
          />

          {/* Notifications Dropdown */}
          <NotificationsDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />

          {/* Main Body with Left Sidebar + Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Navigation Sidebar */}
            <Sidebar
              currentTab={currentTab}
              onSelectTab={handleSelectTab}
              avatarUrl={settings.avatarUrl}
              theme={settings.theme}
            />

            {/* Scrollable Dashboard View */}
            <main
              className={`flex-1 overflow-y-auto px-5 md:px-8 py-5 ${
                isDark ? 'bg-[#0b0c10]' : 'bg-white'
              } ${isSendRobuxModalOpen ? 'overflow-hidden' : ''}`}
            >
              <div className="max-w-[1440px] mx-auto space-y-8">
                {/* Search Query Indicator if active */}
                {searchQuery && (
                  <div
                    className={`text-xs pb-2 border-b ${
                      isDark ? 'text-neutral-400 border-[#1f2125]' : 'text-neutral-600 border-neutral-200'
                    }`}
                  >
                    Showing results for &quot;{searchQuery}&quot;
                  </div>
                )}

                {/* Add Friends Section */}
                {!searchQuery && (
                  <section id="add-friends-section" className="flex flex-col items-start select-none">
                    <button
                      id="add-friends-button"
                      onClick={() => setIsAddFriendsOpen(true)}
                      className="group flex flex-col items-center cursor-pointer"
                    >
                      <div
                        className={`w-16 h-16 rounded-full border flex items-center justify-center transition-colors shadow-inner ${
                          isDark
                            ? 'bg-[#1b1d22] hover:bg-[#25282f] border-[#2a2c32]'
                            : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300'
                        }`}
                      >
                        <UserPlus
                          className={`w-7 h-7 transition-colors ${
                            isDark
                              ? 'text-neutral-300 group-hover:text-white'
                              : 'text-neutral-700 group-hover:text-neutral-900'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[13px] font-semibold mt-2 transition-colors ${
                          isDark
                            ? 'text-neutral-200 group-hover:text-white'
                            : 'text-neutral-800 group-hover:text-black'
                        }`}
                      >
                        Add Friends
                      </span>
                    </button>
                  </section>
                )}

                {/* Continue Section */}
                {filteredContinueGames.length > 0 && (
                  <section id="continue-section" className="space-y-3">
                    <div className="flex items-center gap-1.5 cursor-pointer group select-none">
                      <h2
                        className={`text-[18px] md:text-[20px] font-bold tracking-tight group-hover:underline ${
                          isDark ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        Continue
                      </h2>
                      <ArrowRight
                        className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${
                          isDark ? 'text-white' : 'text-neutral-900'
                        }`}
                      />
                    </div>

                    {/* Continue Games Horizontal Row / Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                      {filteredContinueGames.map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          onClick={() => setSelectedGame(game)}
                          theme={settings.theme}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Recommended For You Section */}
                {filteredRecommendedGames.length > 0 && (
                  <section id="recommended-section" className="space-y-3">
                    <div className="flex items-center justify-between select-none">
                      <h2
                        className={`text-[18px] md:text-[20px] font-bold tracking-tight ${
                          isDark ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        Recommended For You
                      </h2>
                    </div>

                    {/* Wide 16:9 Games Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
                      {filteredRecommendedGames.map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          onClick={() => setSelectedGame(game)}
                          theme={settings.theme}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty state when search yields no matches */}
                {filteredContinueGames.length === 0 && filteredRecommendedGames.length === 0 && (
                  <div
                    className={`py-16 text-center space-y-2 ${
                      isDark ? 'text-neutral-400' : 'text-neutral-600'
                    }`}
                  >
                    <p
                      className={`text-base font-semibold ${
                        isDark ? 'text-neutral-300' : 'text-neutral-800'
                      }`}
                    >
                      No experiences found matching &quot;{searchQuery}&quot;
                    </p>
                    <p className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
                      Try searching for Murder Mystery, Ghost Driver, Rivals, Blade Ball, or Brookhaven.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`mt-3 px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        isDark
                          ? 'bg-[#232527] hover:bg-[#2b2d30] text-white'
                          : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900'
                      }`}
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Game Details Experience Modal */}
      <GameDetailsModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
      />

      {/* Add Friends Modal */}
      <AddFriendsModal
        isOpen={isAddFriendsOpen}
        onClose={() => setIsAddFriendsOpen(false)}
      />

      {/* Roblox Settings Modal with All Images, Robux, and Username Customization */}
      <RobloxSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        continueGames={continueGames}
        recommendedGames={recommendedGames}
        onAddGame={handleAddGame}
        onRemoveGame={handleRemoveGame}
        onResetGames={handleResetGames}
        keyData={keyData}
        onUpdateKeyData={handleUpdateKeyData}
        onLockApp={handleLockApp}
        initialTab={settingsInitialTab}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Robux Shop & Send Window (Matches Video Exactly) */}
      <RobuxShopWindow
        isOpen={isRobuxShopOpen}
        onClose={() => setIsRobuxShopOpen(false)}
        username={settings.username}
        displayName={settings.displayName}
        isVerified={settings.isVerified}
        hasRobloxPlus={settings.hasRobloxPlus}
        robux={settings.robux}
        onAddRobux={handleAddRobux}
        onInitiateSend={handleInitiateSendRobux}
        friends={settings.friends}
        theme={settings.theme || 'dark'}
        currency={settings.currency}
        currencySymbol={settings.currencySymbol}
      />

      {/* Send Robux Modal (Over Home Page with full blur, 2-second halt & confirmation popout) */}
      <SendRobuxModal
        isOpen={isSendRobuxModalOpen}
        onClose={() => setIsSendRobuxModalOpen(false)}
        recipientUsername={sendRobuxRecipient}
        currentRobux={settings.robux}
        onSendComplete={handleSendRobuxComplete}
        subtitle={settings.sendRobuxSubtitle}
        friends={settings.friends}
        onSelectRecipient={(player) => {
          setIsRobuxShopOpen(false);
          setSendRobuxRecipient(player.username);
        }}
      />

      {/* Key System Fullscreen Lock Screen (Matches screenshot exactly) */}
      {isKeySystemActive && !keyData.isUnlocked && (
        <KeySystemLockScreen
          onUnlock={handleUnlockKey}
          currentKey={keyData}
        />
      )}

      {/* Full Administrator Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onKeySystemStatusChange={(enabled) => setIsKeySystemActive(enabled)}
        onUnlockAppAsAdmin={() => {
          handleUnlockKey({ ...keyData, isUnlocked: true });
        }}
      />
    </ThemeProvider>
  );
}
