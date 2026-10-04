import { useState, useMemo } from 'react';
import {
  Gamepad2,
  Search,
  Plus,
  Check,
  Trash2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Loader2,
  ThumbsUp,
  Users,
  ShieldCheck,
  AlertCircle,
  FolderPlus,
  SlidersHorizontal,
} from 'lucide-react';
import { RobloxVerifiedBadge } from './RobloxVerifiedBadge';
import { ROBLOX_MAIN_CATALOG, GENRE_FILTERS } from '../data/robloxCatalog';
import { GameItem, CatalogGame } from '../types';

interface RobloxGamesSettingsTabProps {
  continueGames: GameItem[];
  recommendedGames: GameItem[];
  onAddGame: (game: GameItem) => void;
  onRemoveGame: (id: string, type: 'continue' | 'recommended') => void;
  onResetGames: () => void;
}

export function RobloxGamesSettingsTab({
  continueGames,
  recommendedGames,
  onAddGame,
  onRemoveGame,
  onResetGames,
}: RobloxGamesSettingsTabProps) {
  const [subTab, setSubTab] = useState<'search' | 'catalog' | 'manage'>('search');
  
  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  
  // Lookup state
  const [lookupInput, setLookupInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchedGame, setFetchedGame] = useState<{
    placeId: number;
    title: string;
    description: string;
    creator: string;
    genre: string;
    rating: string;
    players: string;
    iconUrl: string;
    bannerUrl: string;
  } | null>(null);
  const [targetSection, setTargetSection] = useState<'recommended' | 'continue'>('recommended');
  const [sourceFilter, setSourceFilter] = useState<'main_roblox' | 'all'>('main_roblox');
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Manage active games tab state
  const [manageSection, setManageSection] = useState<'all' | 'continue' | 'recommended'>('all');

  // Helper to check if a place ID is already in a section
  const isPlaceInContinue = (placeId: number) => continueGames.some((g) => g.placeId === placeId);
  const isPlaceInRecommended = (placeId: number) => recommendedGames.some((g) => g.placeId === placeId);

  // Count unadded Main Roblox games
  const unaddedMainRobloxGames = useMemo(() => {
    return ROBLOX_MAIN_CATALOG.filter(
      (g) => g.isMainRoblox && !isPlaceInContinue(g.placeId) && !isPlaceInRecommended(g.placeId)
    );
  }, [continueGames, recommendedGames]);

  // Search Results for the Search & Add Tab
  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = ROBLOX_MAIN_CATALOG;
    
    // When sourceFilter is main_roblox, only show genuine Main Roblox Platform hits (not website-only mock games)
    if (sourceFilter === 'main_roblox') {
      list = list.filter((game) => game.isMainRoblox);
    }

    if (!q) {
      return list;
    }

    return list.filter((game) => {
      const matchTitle = game.title.toLowerCase().includes(q);
      const matchGenre = game.genre.toLowerCase().includes(q);
      const matchCreator = game.creator.toLowerCase().includes(q);
      return matchTitle || matchGenre || matchCreator;
    }).sort((a, b) => {
      // Prioritize main roblox games
      if (a.isMainRoblox && !b.isMainRoblox) return -1;
      if (!a.isMainRoblox && b.isMainRoblox) return 1;

      const aStarts = a.title.toLowerCase().startsWith(q) ? 1 : 0;
      const bStarts = b.title.toLowerCase().startsWith(q) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;
      return a.title.localeCompare(b.title);
    });
  }, [searchQuery, sourceFilter]);

  // Filter catalog games for the Browse Catalog Tab
  const filteredCatalog = useMemo(() => {
    return ROBLOX_MAIN_CATALOG.filter((game) => {
      const matchesSearch =
        !catalogSearchQuery.trim() ||
        game.title.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        game.genre.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
        game.creator.toLowerCase().includes(catalogSearchQuery.toLowerCase());

      const matchesGenre =
        selectedGenre === 'All' ||
        (selectedGenre === 'Popular' && ['Blox Fruits', 'Adopt Me!', 'Dress To Impress', 'Fisch 🌸', 'The Strongest Battlegrounds', 'Pet Simulator 99!'].includes(game.title)) ||
        (selectedGenre === 'Main Roblox' && game.isMainRoblox) ||
        game.genre.toLowerCase().includes(selectedGenre.toLowerCase());

      return matchesSearch && matchesGenre;
    });
  }, [catalogSearchQuery, selectedGenre]);

  const showToast = (message: string) => {
    setAddedToast(message);
    setTimeout(() => {
      setAddedToast(null);
    }, 2400);
  };

  const handleAddCatalogGame = (catalogGame: CatalogGame, section: 'continue' | 'recommended') => {
    const newGame: GameItem = {
      id: `roblox-${catalogGame.placeId}-${section}-${Date.now()}`,
      placeId: catalogGame.placeId,
      title: catalogGame.title,
      rating: catalogGame.rating,
      players: catalogGame.defaultPlayers,
      creator: catalogGame.creator,
      type: section,
      iconUrl: catalogGame.iconUrl,
      localImage: catalogGame.localImage || catalogGame.bannerUrl || catalogGame.iconUrl,
      bannerUrl: catalogGame.bannerUrl || catalogGame.localImage || catalogGame.iconUrl,
      genre: catalogGame.genre,
      description: catalogGame.description || `${catalogGame.title} on Roblox. Join thousands of players in this top experience!`,
      isCustom: true,
    };

    onAddGame(newGame);
    showToast(`Added "${catalogGame.title}" to ${section === 'continue' ? 'Continue' : 'Recommended'}!`);
  };

  const handleAddAllMainRobloxGames = () => {
    if (unaddedMainRobloxGames.length === 0) {
      showToast('All Main Roblox games are already on your dashboard!');
      return;
    }

    unaddedMainRobloxGames.forEach((g, idx) => {
      const newGame: GameItem = {
        id: `roblox-${g.placeId}-${targetSection}-${Date.now()}-${idx}`,
        placeId: g.placeId,
        title: g.title,
        rating: g.rating,
        players: g.defaultPlayers,
        creator: g.creator,
        type: targetSection,
        iconUrl: g.iconUrl,
        localImage: g.localImage || g.bannerUrl || g.iconUrl,
        bannerUrl: g.bannerUrl || g.localImage || g.iconUrl,
        genre: g.genre,
        description: g.description || `${g.title} on Roblox.`,
        isCustom: true,
      };
      onAddGame(newGame);
    });

    showToast(`Added ${unaddedMainRobloxGames.length} Main Roblox experiences to ${targetSection === 'continue' ? 'Continue' : 'Recommended'}!`);
  };

  const handleLookupGame = async (overrideQuery?: string) => {
    const query = (overrideQuery || lookupInput).trim();
    if (!query) {
      setFetchError('Please enter a Place ID or Roblox game URL.');
      return;
    }

    setIsFetching(true);
    setFetchError(null);
    setFetchedGame(null);

    try {
      const res = await fetch(`/api/roblox/game-details?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setFetchError(data.error || 'Failed to fetch game from Roblox. Check the Place ID.');
      } else {
        setFetchedGame(data);
      }
    } catch {
      setFetchError('Network error while connecting to Roblox API. Check your connection.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddFetchedGame = () => {
    if (!fetchedGame) return;

    const newGame: GameItem = {
      id: `roblox-${fetchedGame.placeId}-${targetSection}-${Date.now()}`,
      placeId: fetchedGame.placeId,
      title: fetchedGame.title,
      rating: fetchedGame.rating,
      players: fetchedGame.players,
      creator: fetchedGame.creator,
      type: targetSection,
      iconUrl: fetchedGame.iconUrl || 'https://tr.rbxcdn.com/180DAY-3ac5af325970a745b0156a5358174169/512/512/Image/Png/noFilter',
      localImage: fetchedGame.bannerUrl || fetchedGame.iconUrl,
      bannerUrl: fetchedGame.bannerUrl || fetchedGame.iconUrl,
      genre: fetchedGame.genre,
      description: fetchedGame.description || `Official Roblox experience by ${fetchedGame.creator}.`,
      isCustom: true,
    };

    onAddGame(newGame);
    showToast(`Added "${fetchedGame.title}" to ${targetSection === 'continue' ? 'Continue' : 'Recommended'}!`);
    setFetchedGame(null);
    setLookupInput('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {addedToast && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-600/50 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Main Banner */}
      <div className="p-4 bg-[#16181e] border border-[#262832] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#00a2ff]/10 border border-[#00a2ff]/20 flex items-center justify-center text-[#00a2ff] shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Main Roblox Games & Experiences
              <span className="text-[10px] bg-[#00a2ff]/20 text-[#00a2ff] px-2 py-0.5 rounded-full font-semibold">
                Live Catalog
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Add popular games from the main Roblox universe or look up any experience by Place ID.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {showResetConfirm ? (
            <div className="flex items-center gap-1.5 bg-[#121418] p-1 rounded-lg border border-red-500/40">
              <span className="text-[11px] text-red-300 px-1 font-medium">Reset all?</span>
              <button
                type="button"
                onClick={() => {
                  onResetGames();
                  setShowResetConfirm(false);
                  showToast('Restored default games!');
                }}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold rounded cursor-pointer"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-2 py-1 bg-[#22242a] text-neutral-300 hover:text-white text-[11px] font-semibold rounded cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 bg-[#121418] hover:bg-[#1a1c22] border border-[#2b2d35] rounded-lg transition-colors cursor-pointer"
              title="Reset dashboard games back to original defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#212328] pb-2">
        <button
          type="button"
          onClick={() => setSubTab('search')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            subTab === 'search'
              ? 'bg-[#1f2229] text-white border border-[#2d313b]'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16181e]'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#00a2ff]" />
          <span>Search & Add Games</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('catalog')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            subTab === 'catalog'
              ? 'bg-[#1f2229] text-white border border-[#2d313b]'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16181e]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00a2ff]" />
          <span>Browse Catalog ({ROBLOX_MAIN_CATALOG.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('manage')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            subTab === 'manage'
              ? 'bg-[#1f2229] text-white border border-[#2d313b]'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#16181e]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#00a2ff]" />
          <span>Active Games ({continueGames.length + recommendedGames.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: TOP ROBLOX CATALOG                                              */}
      {/* ========================================================================= */}
      {subTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search bar & genre filter pills */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={catalogSearchQuery}
                onChange={(e) => setCatalogSearchQuery(e.target.value)}
                placeholder="Search games by title, genre, or creator (e.g. Blox, Anime, Horror, Dress)..."
                className="w-full bg-[#16181e] text-xs text-white pl-10 pr-4 py-2.5 rounded-xl border border-[#262832] focus:border-[#00a2ff] outline-none transition-colors"
              />
              {catalogSearchQuery && (
                <button
                  type="button"
                  onClick={() => setCatalogSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Genre Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {GENRE_FILTERS.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    selectedGenre === genre
                      ? 'bg-[#00a2ff] text-white font-semibold'
                      : 'bg-[#16181e] text-neutral-400 hover:text-neutral-200 hover:bg-[#1f2229] border border-[#24262f]'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredCatalog.map((game) => {
              const inContinue = isPlaceInContinue(game.placeId);
              const inRec = isPlaceInRecommended(game.placeId);

              return (
                <div
                  key={game.placeId}
                  className="p-3 bg-[#15171c] hover:bg-[#1a1c22] border border-[#252830] rounded-xl flex flex-col justify-between transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={game.iconUrl}
                      alt={game.title}
                      className="w-14 h-14 rounded-lg object-cover bg-[#22242a] shrink-0 border border-[#2b2e37]"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-xs font-bold text-white truncate group-hover:text-[#00a2ff] transition-colors"
                        title={game.title}
                      >
                        {game.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1 mt-0.5">
                        <span>{game.creator}</span>
                        <RobloxVerifiedBadge className="w-3 h-3 shrink-0" />
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-400">
                        <span className="flex items-center gap-0.5 text-neutral-300">
                          <ThumbsUp className="w-2.5 h-2.5 text-emerald-400" />
                          {game.rating}
                        </span>
                        <span className="flex items-center gap-0.5 text-neutral-300">
                          <Users className="w-2.5 h-2.5 text-blue-400" />
                          {game.defaultPlayers}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add action buttons */}
                  <div className="mt-3 pt-2.5 border-t border-[#212328] flex items-center justify-between gap-1.5">
                    <span className="text-[10px] text-neutral-400 truncate max-w-[90px]">
                      {game.genre}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Add to Continue Button */}
                      <button
                        type="button"
                        onClick={() => handleAddCatalogGame(game, 'continue')}
                        className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          inContinue
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/50'
                            : 'bg-[#22252c] text-neutral-300 hover:text-white hover:bg-[#2c3039] border border-[#2e323b]'
                        }`}
                        title="Add to Continue Playing row on home page"
                      >
                        {inContinue ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Plus className="w-2.5 h-2.5" />}
                        <span>Continue</span>
                      </button>

                      {/* Add to Recommended Button */}
                      <button
                        type="button"
                        onClick={() => handleAddCatalogGame(game, 'recommended')}
                        className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                          inRec
                            ? 'bg-blue-950/70 text-blue-300 border border-blue-700/50'
                            : 'bg-[#00a2ff]/15 text-[#00a2ff] hover:bg-[#00a2ff]/25 border border-[#00a2ff]/30'
                        }`}
                        title="Add to Recommended For You section on home page"
                      >
                        {inRec ? <Check className="w-2.5 h-2.5 text-blue-400" /> : <Plus className="w-2.5 h-2.5" />}
                        <span>Recommend</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCatalog.length === 0 && (
            <div className="py-12 text-center text-neutral-400 space-y-1 bg-[#14161a] rounded-xl border border-[#23252d]">
              <p className="text-xs font-semibold text-neutral-300">No games found matching your search.</p>
              <p className="text-[11px] text-neutral-400">Try searching for &quot;Anime&quot;, &quot;Blox&quot;, or browse by genre.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB: SEARCH & ADD ANY GAME                                              */}
      {/* ========================================================================= */}
      {subTab === 'search' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="p-3.5 bg-[#171920] border border-[#282a35] rounded-xl text-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-[#00a2ff]" />
                  Main Roblox Platform Universe
                </span>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  Browse and add official global experiences directly from the real Roblox platform.
                </p>
              </div>

              {/* Quick Actions: Add All Main Roblox + Destination Selector */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Destination Section Selector */}
                <div className="flex items-center gap-1 bg-[#121418] p-1 rounded-lg border border-[#292c35]">
                  <span className="text-[10px] text-neutral-400 px-1 font-medium">Add to:</span>
                  <button
                    type="button"
                    onClick={() => setTargetSection('recommended')}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                      targetSection === 'recommended'
                        ? 'bg-[#00a2ff] text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Recommended
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetSection('continue')}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                      targetSection === 'continue'
                        ? 'bg-[#00a2ff] text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Continue
                  </button>
                </div>

                {/* Bulk Add All Main Roblox Button */}
                <button
                  type="button"
                  onClick={handleAddAllMainRobloxGames}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#00a2ff] to-[#0080ff] hover:from-[#0092e6] hover:to-[#0070e6] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Add all official Main Roblox hits that aren't yet on your dashboard"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add All Main Roblox Games ({unaddedMainRobloxGames.length})</span>
                </button>
              </div>
            </div>

            {/* Source Filter Switcher: Main Roblox vs All */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#232630]">
              <span className="text-[11px] text-neutral-400 font-medium">Catalog View:</span>
              <button
                type="button"
                onClick={() => setSourceFilter('main_roblox')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  sourceFilter === 'main_roblox'
                    ? 'bg-[#00a2ff]/20 text-[#00a2ff] border border-[#00a2ff]/40 shadow-xs'
                    : 'bg-[#14161c] text-neutral-400 hover:text-neutral-200 border border-[#23252e]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>🌟 Official Main Roblox Games ({ROBLOX_MAIN_CATALOG.filter((g) => g.isMainRoblox).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  sourceFilter === 'all'
                    ? 'bg-[#00a2ff]/20 text-[#00a2ff] border border-[#00a2ff]/40 shadow-xs'
                    : 'bg-[#14161c] text-neutral-400 hover:text-neutral-200 border border-[#23252e]'
                }`}
              >
                <span>All Catalog Experiences ({ROBLOX_MAIN_CATALOG.length})</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00a2ff]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim().match(/\d{5,}/)) {
                    e.preventDefault();
                    handleLookupGame(searchQuery.trim().match(/\d{5,}/)?.[0]);
                  }
                }}
                placeholder="Search any Main Roblox game (e.g. Blox Fruits, Adopt Me, Brookhaven, Dress To Impress, Fisch, DOORS, BedWars)..."
                className="w-full bg-[#16181e] text-xs text-white pl-10 pr-10 py-3 rounded-xl border border-[#2a2d39] focus:border-[#00a2ff] outline-none shadow-inner transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-neutral-800 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Trending Searches */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-semibold text-neutral-400 shrink-0">Popular Main Roblox:</span>
              {[
                'Blox Fruits',
                'Brookhaven 🏡 RP',
                'Adopt Me!',
                'Dress To Impress',
                'Fisch 🌸',
                'The Strongest Battlegrounds',
                'Pet Simulator 99!',
                'Murder Mystery 2',
                'DOORS 👁',
                'Blade Ball',
                'RIVALS',
                'Sol\'s RNG',
                'Tower of Hell',
                'Jailbreak',
                'BedWars',
                'Arsenal',
                'Da Hood',
                'Evade',
                'Slap Battles',
                'Anime Vanguards',
                'Pressure',
                'PLS DONATE 💸',
                'Bee Swarm Simulator',
                'Build A Boat',
              ].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                    searchQuery.toLowerCase() === term.toLowerCase()
                      ? 'bg-[#00a2ff] text-white border-[#00a2ff] font-semibold'
                      : 'bg-[#181a20] hover:bg-[#20232a] text-neutral-300 hover:text-white border-[#272932]'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Place ID or URL Live Detection Card */}
          {searchQuery.trim().match(/\d{5,}/) && (
            <div className="p-3 bg-[#131722] border border-[#233555] rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="text-xs">
                <span className="font-bold text-blue-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#00a2ff]" />
                  Detected Roblox Place ID: {searchQuery.trim().match(/\d{5,}/)?.[0]}
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Fetch live real-time details directly from Roblox servers
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleLookupGame(searchQuery.trim().match(/\d{5,}/)?.[0])}
                disabled={isFetching}
                className="px-3.5 py-1.5 bg-[#00a2ff] hover:bg-[#0092e6] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Fetch from Roblox</span>
              </button>
            </div>
          )}

          {fetchError && (
            <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          {/* Live Fetched Game Card (if fetched via ID/URL) */}
          {fetchedGame && (
            <div className="p-4 bg-[#16181e] border border-[#2d303a] rounded-xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#252830] pb-2.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Live Experience Found on Roblox
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Place ID: {fetchedGame.placeId}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <img
                  src={fetchedGame.iconUrl || fetchedGame.bannerUrl}
                  alt={fetchedGame.title}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-[#22242a] border border-[#2e313b] shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="space-y-1.5 flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white">{fetchedGame.title}</h4>
                  <p className="text-xs text-neutral-300 flex items-center gap-1">
                    <span>By {fetchedGame.creator}</span>
                    <RobloxVerifiedBadge className="w-3.5 h-3.5 shrink-0" />
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-neutral-400">
                    <span className="flex items-center gap-1 text-neutral-200">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                      {fetchedGame.rating}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-200">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      {fetchedGame.players} Active
                    </span>
                    <span className="px-2 py-0.5 bg-[#20222a] rounded text-[11px] text-neutral-300 border border-[#2b2d38]">
                      {fetchedGame.genre}
                    </span>
                  </div>

                  {fetchedGame.description && (
                    <p className="text-[11px] text-neutral-400 line-clamp-2 pt-1 leading-relaxed">
                      {fetchedGame.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#23252d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-neutral-400">
                  Destination: <span className="text-white font-semibold">{targetSection === 'continue' ? 'Continue Playing' : 'Recommended'}</span>
                </span>

                <button
                  type="button"
                  onClick={handleAddFetchedGame}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience to Dashboard</span>
                </button>
              </div>
            </div>
          )}

          {/* Results Header */}
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1 pt-1">
            <span>
              {searchQuery.trim()
                ? `Results for "${searchQuery}" (${filteredSearchResults.length})`
                : `Popular Roblox Games (${filteredSearchResults.length})`}
            </span>
            <span className="text-[11px] text-neutral-500">
              Click &quot;+ Add&quot; to place on dashboard
            </span>
          </div>

          {/* Search Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[440px] overflow-y-auto pr-1">
            {filteredSearchResults.map((game) => {
              const inContinue = isPlaceInContinue(game.placeId);
              const inRec = isPlaceInRecommended(game.placeId);
              const isAddedToSelected = targetSection === 'continue' ? inContinue : inRec;

              return (
                <div
                  key={game.placeId}
                  className="p-3 bg-[#15171c] hover:bg-[#1a1c22] border border-[#252830] rounded-xl flex flex-col justify-between transition-colors group shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={game.iconUrl}
                      alt={game.title}
                      className="w-14 h-14 rounded-xl object-cover bg-[#22242a] shrink-0 border border-[#2b2e37]"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4
                          className="text-xs font-bold text-white truncate group-hover:text-[#00a2ff] transition-colors"
                          title={game.title}
                        >
                          {game.title}
                        </h4>
                        {game.isMainRoblox && (
                          <span className="text-[9px] bg-[#00a2ff]/15 text-[#00a2ff] border border-[#00a2ff]/30 px-1 py-0.2 rounded font-semibold shrink-0">
                            Main Roblox
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1 mt-0.5">
                        <span>{game.creator}</span>
                        <RobloxVerifiedBadge className="w-3 h-3 shrink-0" />
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-400">
                        <span className="flex items-center gap-0.5 text-neutral-300">
                          <ThumbsUp className="w-2.5 h-2.5 text-emerald-400" />
                          {game.rating}
                        </span>
                        <span className="flex items-center gap-0.5 text-neutral-300">
                          <Users className="w-2.5 h-2.5 text-blue-400" />
                          {game.defaultPlayers}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add action buttons */}
                  <div className="mt-3 pt-2.5 border-t border-[#212328] flex items-center justify-between gap-1.5">
                    <span className="text-[10px] text-neutral-400 truncate max-w-[80px]">
                      {game.genre}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* One-click Add Button for Target Section */}
                      <button
                        type="button"
                        onClick={() => handleAddCatalogGame(game, targetSection)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isAddedToSelected
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50'
                            : 'bg-[#00a2ff] hover:bg-[#0091e6] text-white shadow-xs'
                        }`}
                        title={`Add to ${targetSection === 'continue' ? 'Continue' : 'Recommended'}`}
                      >
                        {isAddedToSelected ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-300 stroke-[3]" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 stroke-[3]" />
                            <span>Add</span>
                          </>
                        )}
                      </button>

                      {/* Direct alternate section button */}
                      {targetSection === 'recommended' ? (
                        <button
                          type="button"
                          onClick={() => handleAddCatalogGame(game, 'continue')}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                            inContinue
                              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                              : 'bg-[#20222a] text-neutral-300 hover:text-white hover:bg-[#282b35] border border-[#2b2d38]'
                          }`}
                          title="Add specifically to Continue row"
                        >
                          {inContinue ? '✓ Continue' : '+ Continue'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddCatalogGame(game, 'recommended')}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                            inRec
                              ? 'bg-blue-950/50 text-blue-400 border border-blue-800/40'
                              : 'bg-[#20222a] text-neutral-300 hover:text-white hover:bg-[#282b35] border border-[#2b2d38]'
                          }`}
                          title="Add specifically to Recommended grid"
                        >
                          {inRec ? '✓ Rec' : '+ Rec'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSearchResults.length === 0 && (
            <div className="py-12 text-center text-neutral-400 space-y-2 bg-[#14161a] rounded-xl border border-[#23252d]">
              <Search className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs font-semibold text-neutral-200">
                No experiences found matching &quot;{searchQuery}&quot;
              </p>
              <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                Try searching for popular titles like &quot;Murder Mystery&quot;, &quot;Brookhaven&quot;, &quot;Doors&quot;, &quot;Blade Ball&quot;, or click one of the quick search tags above.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 px-3 py-1 bg-[#22242b] hover:bg-[#2c3038] text-neutral-300 text-xs rounded-lg transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: MANAGE ACTIVE GAMES ON DASHBOARD                                */}
      {/* ========================================================================= */}
      {subTab === 'manage' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Currently Displayed Experiences
            </span>

            <div className="flex items-center gap-1 bg-[#14161a] p-1 rounded-lg border border-[#262831]">
              <button
                type="button"
                onClick={() => setManageSection('all')}
                className={`px-2.5 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                  manageSection === 'all' ? 'bg-[#262933] text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                All ({continueGames.length + recommendedGames.length})
              </button>
              <button
                type="button"
                onClick={() => setManageSection('continue')}
                className={`px-2.5 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                  manageSection === 'continue' ? 'bg-[#262933] text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Continue ({continueGames.length})
              </button>
              <button
                type="button"
                onClick={() => setManageSection('recommended')}
                className={`px-2.5 py-0.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                  manageSection === 'recommended' ? 'bg-[#262933] text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Recommended ({recommendedGames.length})
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {/* Continue Games Section */}
            {(manageSection === 'all' || manageSection === 'continue') && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                  Continue Playing Section ({continueGames.length})
                </div>
                {continueGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-2.5 bg-[#15171c] border border-[#23252d] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={game.localImage || game.iconUrl}
                        alt={game.title}
                        className="w-10 h-10 rounded-lg object-cover bg-[#22242a] border border-[#2b2d36] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{game.title}</span>
                          {game.isCustom && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-[#00a2ff]/20 text-[#00a2ff] font-semibold rounded">
                              Added
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span>{game.rating}</span>
                          {game.players && <span>• {game.players}</span>}
                          <span>• ID: {game.placeId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveGame(game.id, 'continue');
                          showToast(`Removed "${game.title}" from Continue!`);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Remove experience from Continue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommended Games Section */}
            {(manageSection === 'all' || manageSection === 'recommended') && (
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                  Recommended For You Section ({recommendedGames.length})
                </div>
                {recommendedGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-2.5 bg-[#15171c] border border-[#23252d] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={game.bannerUrl || game.localImage || game.iconUrl}
                        alt={game.title}
                        className="w-14 h-9 rounded-lg object-cover bg-[#22242a] border border-[#2b2d36] shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{game.title}</span>
                          {game.isCustom && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-[#00a2ff]/20 text-[#00a2ff] font-semibold rounded">
                              Added
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span>{game.rating}</span>
                          {game.players && <span>• {game.players}</span>}
                          <span>• ID: {game.placeId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveGame(game.id, 'recommended');
                          showToast(`Removed "${game.title}" from Recommended!`);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Remove experience from Recommended"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
