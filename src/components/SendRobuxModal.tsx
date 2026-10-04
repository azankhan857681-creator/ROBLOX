import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  ArrowLeft,
  Calendar,
  Users,
  Info,
  Loader2,
  Check,
} from 'lucide-react';
import { RobuxIcon } from './RobuxIcon';
import {
  RobloxPlayerAvatar,
  getCachedOrPresetAvatar,
  saveAvatarToCache,
  KNOWN_AVATARS,
} from './RobloxPlayerAvatar';
import { RobloxVerifiedBadge } from './RobloxVerifiedBadge';
import { RobloxPlusBadge } from './RobloxPlusBadge';
import robloxPlayersData from '../data/robloxPlayers.json';

export interface SendRobuxModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientUsername?: string;
  currentRobux: number;
  onSendComplete: (amount: number, recipient: string) => void;
  subtitle?: string;
  friends?: Array<{
    id: string;
    username: string;
    avatarUrl?: string;
    isVerified?: boolean;
  }>;
  onSelectRecipient?: (player: RobloxPlayer) => void;
}

export interface RobloxPlayer {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  connectedTime?: string;
  mutualFriends?: number;
  joinedYear?: number;
  hasVerifiedBadge?: boolean;
}

const PRESET_ROBLOX_PLAYERS: RobloxPlayer[] = [
  {
    id: '1',
    displayName: 'Roblox',
    username: 'Roblox',
    avatarUrl: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-310966282D3529E36976BF6B07B1DC90-Png/150/150/AvatarHeadshot/Png/noFilter',
    connectedTime: 'Official Roblox Account',
    mutualFriends: 12,
    joinedYear: 2006,
    hasVerifiedBadge: true,
  },
  {
    id: '117039589',
    displayName: 'hyprism',
    username: 'hyprisms',
    avatarUrl: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-381471758B6B161C67FA989CCDF4648F-Png/150/150/AvatarHeadshot/Png/noFilter',
    connectedTime: 'Roblox Player',
    mutualFriends: 2,
    joinedYear: 2016,
    hasVerifiedBadge: true,
  },
  {
    id: '156',
    displayName: 'builderman',
    username: 'builderman',
    avatarUrl: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-882C70E071E5997E51F8CB373002AFC3-Png/150/150/AvatarHeadshot/Png/noFilter',
    connectedTime: 'Official Roblox CEO',
    mutualFriends: 8,
    joinedYear: 2006,
    hasVerifiedBadge: true,
  },
  {
    id: 'f-1',
    displayName: 'BloxMaster99',
    username: 'BloxMaster99',
    avatarUrl: '/avatars/bloxmaster99.png',
    connectedTime: 'Connected 1 month',
    mutualFriends: 5,
    joinedYear: 2020,
  },
  {
    id: 'f-2',
    displayName: 'PixelWarrior',
    username: 'PixelWarrior',
    avatarUrl: '/avatars/pixelwarrior.png',
    connectedTime: 'Connected 2 months',
    mutualFriends: 3,
    joinedYear: 2019,
  },
  {
    id: '80254',
    displayName: 'Stickmasterluke',
    username: 'Stickmasterluke',
    avatarUrl: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-1A9690EEAE8B9EA3D01BBC9ABF8CA7E1-Png/150/150/AvatarHeadshot/Png/noFilter',
    connectedTime: 'Roblox Administrator',
    mutualFriends: 4,
    joinedYear: 2007,
    hasVerifiedBadge: true,
  },
  {
    id: '140258990',
    displayName: 'KreekCraft',
    username: 'KreekCraft',
    avatarUrl: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-BE8960DE953FFC2D9B10565CC09A3EC3-Png/150/150/AvatarHeadshot/Png/noFilter',
    connectedTime: 'Connected 1 month',
    mutualFriends: 3,
    joinedYear: 2014,
  },
  {
    id: '2207291',
    displayName: 'Linkmon99',
    username: 'Linkmon99',
    avatarUrl: 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-89A5211C79181E57B2B08FB4A94B89BC-Png/420/420/AvatarHeadshot/Png/noFilter',
    connectedTime: 'Roblox Trader',
    mutualFriends: 5,
    joinedYear: 2009,
    hasVerifiedBadge: true,
  },
  ...(((robloxPlayersData as unknown as RobloxPlayer[]) || []).map((p) => ({
    id: String(p.id),
    displayName: p.displayName || p.username,
    username: p.username,
    avatarUrl: p.avatarUrl,
    connectedTime: p.connectedTime || 'Connected recently',
    mutualFriends: p.mutualFriends ?? 1,
    joinedYear: p.joinedYear || 2022,
    hasVerifiedBadge: p.hasVerifiedBadge,
  }))),
];

const QUICK_AMOUNTS = [25, 50, 100, 200];

type ModalStep = 'search' | 'amount' | 'review' | 'success';

export function SendRobuxModal({
  isOpen,
  onClose,
  recipientUsername = '',
  currentRobux,
  onSendComplete,
  subtitle = 'Robux arrive in 1 to 2 days with no fees',
  friends = [],
  onSelectRecipient,
}: SendRobuxModalProps) {
  const [step, setStep] = useState<ModalStep>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<RobloxPlayer | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [amountInput, setAmountInput] = useState<string>('0');
  const [isSending, setIsSending] = useState(false);
  const [displayedRobux, setDisplayedRobux] = useState(currentRobux && currentRobux > 0 ? currentRobux : 10000);
  const [liveAvatarMap, setLiveAvatarMap] = useState<Record<string, string>>({});

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Background lookup for official Roblox avatar when typing custom usernames
  useEffect(() => {
    const clean = searchTerm.trim().replace(/^@/, '');
    const cleanLower = clean.toLowerCase();
    if (!clean || clean.length < 2) {
      setIsSearching(false);
      return;
    }

    if (KNOWN_AVATARS[cleanLower] || liveAvatarMap[cleanLower]) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    let active = true;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/roblox/avatar?username=${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = (await res.json()) as { id: number; username: string; displayName: string; avatarUrl?: string };
          if (active && data?.avatarUrl) {
            saveAvatarToCache(data.username, data.avatarUrl);
            setLiveAvatarMap((prev) => ({
              ...prev,
              [cleanLower]: data.avatarUrl!,
              [data.username.toLowerCase()]: data.avatarUrl!,
            }));
          }
        }
      } catch (_) {}
      if (active) setIsSearching(false);
    }, 120);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm, liveAvatarMap]);

  // Sync displayed Robux with props
  useEffect(() => {
    setDisplayedRobux(currentRobux && currentRobux > 0 ? currentRobux : 10000);
  }, [currentRobux]);

  // Lock body scroll when modal is open to ensure no background detachment
  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isOpen]);

  const prevIsOpenRef = useRef(false);

  // Reset state ONLY when modal transitions from closed to open
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (isOpen && !wasOpen) {
      setDisplayedRobux(currentRobux && currentRobux > 0 ? currentRobux : 10000);
      setIsSending(false);
      setIsSearching(false);

      if (recipientUsername) {
        // If an initial recipient was passed, prepare selected player directly
        const cleanRecip = recipientUsername.replace('@', '');
        const matched = PRESET_ROBLOX_PLAYERS.find(
          (p) => p.username.toLowerCase() === cleanRecip.toLowerCase()
        ) || {
          id: `p-${cleanRecip}`,
          displayName: cleanRecip,
          username: cleanRecip,
          avatarUrl: liveAvatarMap[cleanRecip.toLowerCase()] || getCachedOrPresetAvatar(cleanRecip),
          connectedTime: 'Connected 3 months',
          mutualFriends: 1,
          joinedYear: 2022,
        };
        setSelectedPlayer(matched);
        setStep('amount');
        setAmount(0);
        setAmountInput('0');
      } else {
        setStep('search');
        setSearchTerm('');
        setSelectedPlayer(null);
        setAmount(0);
        setAmountInput('0');
      }
    }
  }, [isOpen, recipientUsername, currentRobux, liveAvatarMap]);

  if (!isOpen) return null;

  // Search Results derived INSTANTLY on every keystroke (0ms delay)
  const cleanSearch = searchTerm.trim().replace(/^@/, '');
  const trimmedSearch = cleanSearch.toLowerCase();
  let matchingPlayers: RobloxPlayer[] = [];

  if (trimmedSearch.length > 0) {
    // 1. Check existing friends
    const matchedFriends: RobloxPlayer[] = friends
      .filter((f) => f.username.toLowerCase().includes(trimmedSearch))
      .map((f) => ({
        id: f.id,
        displayName: f.username,
        username: f.username,
        avatarUrl: f.avatarUrl || liveAvatarMap[f.username.toLowerCase()] || getCachedOrPresetAvatar(f.username),
        connectedTime: 'Connected recently',
        mutualFriends: 1,
        joinedYear: 2021,
      }));

    // 2. Check preset Roblox players
    const matchedPresets = PRESET_ROBLOX_PLAYERS.filter(
      (p) =>
        p.username.toLowerCase().includes(trimmedSearch) ||
        p.displayName.toLowerCase().includes(trimmedSearch)
    ).map((p) => ({
      ...p,
      avatarUrl: p.avatarUrl || liveAvatarMap[p.username.toLowerCase()] || getCachedOrPresetAvatar(p.username),
    }));

    // Merge: Exact Match First -> Friends -> Presets -> Custom Typed
    const combined: RobloxPlayer[] = [];
    const addedUsernames = new Set<string>();

    const addPlayer = (p: RobloxPlayer) => {
      const key = p.username.toLowerCase();
      if (!addedUsernames.has(key)) {
        addedUsernames.add(key);
        combined.push(p);
      }
    };

    // If exact preset match exists (e.g. user typed "hyprisms" or "roblox"), prioritize it!
    const exactPreset = matchedPresets.find((p) => p.username.toLowerCase() === trimmedSearch);
    if (exactPreset) {
      addPlayer(exactPreset);
    }
    const exactFriend = matchedFriends.find((p) => p.username.toLowerCase() === trimmedSearch);
    if (exactFriend) {
      addPlayer(exactFriend);
    }

    matchedFriends.forEach(addPlayer);
    matchedPresets.forEach(addPlayer);

    // Always ensure the typed user option is present with an INSTANT avatar headshot
    const instantAvatar = liveAvatarMap[trimmedSearch] || getCachedOrPresetAvatar(cleanSearch);
    addPlayer({
      id: `custom-${trimmedSearch}`,
      displayName: cleanSearch,
      username: cleanSearch,
      avatarUrl: instantAvatar,
      connectedTime: 'Player on Roblox',
      mutualFriends: 0,
      joinedYear: 2023,
    });

    matchingPlayers = combined;
  }

  const handleSelectPlayer = (player: RobloxPlayer) => {
    setSelectedPlayer({
      ...player,
      avatarUrl: player.avatarUrl || liveAvatarMap[player.username.toLowerCase()] || getCachedOrPresetAvatar(player.username),
    });
    setAmount(0);
    setAmountInput('0');
    setStep('amount');
    if (onSelectRecipient) {
      onSelectRecipient(player);
    }
  };

  const handleEnterKey = () => {
    const trimmed = searchTerm.trim().replace(/^@/, '');
    if (!trimmed) return;

    if (matchingPlayers.length > 0) {
      handleSelectPlayer(matchingPlayers[0]);
    } else {
      const matched = PRESET_ROBLOX_PLAYERS.find(
        (p) => p.username.toLowerCase() === trimmed.toLowerCase()
      ) || {
        id: `custom-${trimmed.toLowerCase()}`,
        displayName: trimmed,
        username: trimmed,
        avatarUrl: liveAvatarMap[trimmed.toLowerCase()] || getCachedOrPresetAvatar(trimmed),
        connectedTime: 'Player on Roblox',
        mutualFriends: 0,
        joinedYear: 2023,
      };
      handleSelectPlayer(matched);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  const updateAmount = (val: number) => {
    const clamped = Math.max(0, val);
    setAmount(clamped);
    setAmountInput(clamped === 0 ? '0' : clamped.toLocaleString('en-US'));
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawVal = input.value;
    const selectionStart = input.selectionStart ?? rawVal.length;

    // How many digits were before the cursor before this change
    const digitsBeforeCursor = rawVal.slice(0, selectionStart).replace(/[^0-9]/g, '').length;
    const digitsOnly = rawVal.replace(/[^0-9]/g, '');

    if (!digitsOnly) {
      setAmount(0);
      setAmountInput('');
      return;
    }

    // Limit to 12 digits (up to 999,999,999,999 Robux)
    const trimmedDigits = digitsOnly.slice(0, 12);
    const parsed = parseInt(trimmedDigits, 10) || 0;
    const formatted = parsed.toLocaleString('en-US');

    setAmount(parsed);
    setAmountInput(formatted);

    // Reposition cursor smoothly after commas insertion
    requestAnimationFrame(() => {
      if (amountInputRef.current) {
        let newCursorPos = 0;
        let digitsCounted = 0;
        for (let i = 0; i < formatted.length; i++) {
          if (/[0-9]/.test(formatted[i])) {
            digitsCounted++;
          }
          if (digitsCounted >= digitsBeforeCursor) {
            newCursorPos = i + 1;
            break;
          }
        }
        if (digitsBeforeCursor === 0) newCursorPos = 0;
        amountInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const input = e.currentTarget;
      const { selectionStart, selectionEnd } = input;
      // If cursor is right after a comma and no selection, delete comma and preceding digit
      if (
        selectionStart !== null &&
        selectionStart === selectionEnd &&
        selectionStart > 0 &&
        input.value[selectionStart - 1] === ','
      ) {
        e.preventDefault();
        const before = input.value.slice(0, selectionStart - 2);
        const after = input.value.slice(selectionStart);
        const newRaw = (before + after).replace(/[^0-9]/g, '');
        if (!newRaw) {
          setAmount(0);
          setAmountInput('');
          return;
        }
        const parsed = parseInt(newRaw.slice(0, 12), 10) || 0;
        const formatted = parsed.toLocaleString('en-US');
        setAmount(parsed);
        setAmountInput(formatted);

        const newDigitsBefore = before.replace(/[^0-9]/g, '').length;
        requestAnimationFrame(() => {
          if (amountInputRef.current) {
            let targetPos = 0;
            let counted = 0;
            for (let i = 0; i < formatted.length; i++) {
              if (/[0-9]/.test(formatted[i])) counted++;
              if (counted >= newDigitsBefore) {
                targetPos = i + 1;
                break;
              }
            }
            if (newDigitsBefore === 0) targetPos = 0;
            amountInputRef.current.setSelectionRange(targetPos, targetPos);
          }
        });
        return;
      }
    }

    if (e.key === 'Enter' && amount > 0 && amount <= displayedRobux) {
      handleNextToReview();
    }
  };

  const handleNextToReview = () => {
    if (amount <= 0 || amount > displayedRobux) return;
    setStep('review');
  };

  const handleConfirmSend = () => {
    if (!selectedPlayer || amount <= 0 || isSending) return;

    setIsSending(true);

    // Wait for 1 second halt with sending animation then show success window (Pic 2)
    setTimeout(() => {
      setIsSending(false);
      const updated = Math.max(0, displayedRobux - amount);
      setDisplayedRobux(updated);
      onSendComplete(amount, selectedPlayer.username);
      setStep('success');
    }, 1000);
  };

  const handleClose = () => {
    if (isSending) return;
    onClose();
  };

  return (
    <div
      id="send-robux-modal-overlay"
      className="fixed inset-0 z-50 w-screen h-screen min-h-[100dvh] bg-black/35 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 transition-all overflow-y-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100dvh',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={() => {
        // Prevent accidental dismiss while sending or while viewing success confirmation
        if (isSending || step === 'success') return;
        handleClose();
      }}
    >
      <div
        id="send-robux-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b0c10] text-white w-full max-w-[410px] rounded-2xl border border-[#232630] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
      >
        {/* Top Header Bar - Black and grey mixture matching the window */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-[#232630] bg-[#0b0c10] shrink-0">
          <div className="flex items-center gap-2.5">
            {step === 'review' && !isSending && (
              <button
                type="button"
                id="send-robux-back-button"
                onClick={() => setStep('amount')}
                className="w-6 h-6 -ml-1 rounded-md hover:bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {step === 'amount' && (
              <button
                type="button"
                id="send-robux-back-to-search"
                onClick={() => setStep('search')}
                className="w-6 h-6 -ml-1 rounded-md hover:bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <RobloxPlusBadge className="w-5 h-5 text-white shrink-0" />
              <span className="text-[15px] sm:text-[16px] font-bold text-white tracking-tight leading-none">
                Send Robux
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Robux Balance - Clean text + icon without box/pill border (Pic 2) */}
            <div className="flex items-center gap-1.5 text-white select-none">
              <RobuxIcon className="w-4.5 h-4.5 text-white shrink-0" />
              <span className="text-[14px] font-bold tracking-tight text-white leading-none">
                {displayedRobux.toLocaleString()}
              </span>
            </div>

            {/* Close button */}
            <button
              type="button"
              id="send-robux-close-button"
              disabled={isSending}
              onClick={handleClose}
              className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer transition-colors disabled:opacity-40"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {/* STEP 1: SEARCH USERNAME */}
          {step === 'search' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Search Box */}
              <div className="relative flex items-center bg-[#0e1017] border border-[#2563eb] rounded-xl px-3.5 py-2.5 transition-all shadow-sm">
                <Search className="w-4.5 h-4.5 text-neutral-400 shrink-0 mr-2.5" />
                <input
                  id="send-robux-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEnterKey();
                    }
                  }}
                  placeholder="Search username"
                  className="bg-transparent text-[14px] text-white placeholder-neutral-500 outline-none w-full"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0066ff] shrink-0 mr-1.5" />
                )}
                {searchTerm.length > 0 && (
                  <button
                    type="button"
                    id="send-robux-search-clear"
                    onClick={handleClearSearch}
                    className="text-xs text-neutral-400 hover:text-white ml-2 cursor-pointer font-medium select-none px-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Body: empty prompt matching user screenshot */}
              {searchTerm.trim().length === 0 ? (
                <div className="py-14 px-4 text-center">
                  <p className="text-[13px] text-neutral-400 leading-relaxed max-w-[340px] mx-auto font-normal select-none">
                    No friends found. Type a Roblox username above to search.
                  </p>
                </div>
              ) : matchingPlayers.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-[280px] mx-auto">
                    No Roblox players found for &ldquo;{searchTerm}&rdquo;.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-semibold text-neutral-400 px-1 flex items-center justify-between">
                    <span>Roblox Players ({matchingPlayers.length})</span>
                    {isSearching && (
                      <span className="text-[11px] text-[#00a2ff] flex items-center gap-1 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                      </span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1 pr-0.5">
                    {matchingPlayers.map((player) => (
                      <div
                        key={player.id}
                        onClick={() => handleSelectPlayer(player)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#1d2026] active:bg-[#252830] transition-colors cursor-pointer group"
                      >
                        <RobloxPlayerAvatar
                          username={player.username}
                          avatarUrl={player.avatarUrl}
                          size={40}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-white truncate leading-tight flex items-center gap-1.5">
                            <span className="truncate">{player.displayName}</span>
                            {(player.hasVerifiedBadge || player.id === '1' || player.username.toLowerCase() === 'roblox') && (
                              <RobloxVerifiedBadge className="w-3.5 h-3.5 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-neutral-400 truncate">
                            @{player.username}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ENTER AMOUNT */}
          {step === 'amount' && selectedPlayer && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Selected Player Avatar & Name */}
              <div className="text-center pt-1">
                <RobloxPlayerAvatar
                  username={selectedPlayer.username}
                  avatarUrl={selectedPlayer.avatarUrl}
                  size={60}
                  className="mx-auto shadow-md"
                />
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <h3 className="text-base font-bold text-white leading-tight">
                    {selectedPlayer.displayName}
                  </h3>
                  {(selectedPlayer.hasVerifiedBadge || selectedPlayer.id === '1' || selectedPlayer.username.toLowerCase() === 'roblox') && (
                    <RobloxVerifiedBadge className="w-4 h-4 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  @{selectedPlayer.username}
                </p>
              </div>

              {/* Editable Robux Amount Display (Invisible box, no pen icon, directly clickable to edit) */}
              <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                <label
                  htmlFor="send-robux-amount-input"
                  className="flex items-center justify-center gap-2 py-1 cursor-text select-none group"
                >
                  <RobuxIcon className="w-7 h-7 text-white shrink-0" />
                  <input
                    ref={amountInputRef}
                    type="text"
                    inputMode="numeric"
                    id="send-robux-amount-input"
                    value={amountInput}
                    onChange={handleAmountInputChange}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                    onBlur={() => {
                      if (!amountInput || amountInput === '0') {
                        setAmount(0);
                        setAmountInput('0');
                      }
                    }}
                    onKeyDown={handleAmountKeyDown}
                    placeholder="0"
                    style={{
                      width: `${Math.max(1, (amountInput || '').length) + 0.4}ch`,
                      minWidth: '1.2ch',
                    }}
                    className="text-center text-4xl sm:text-5xl font-black text-white bg-transparent border-none outline-none ring-0 p-0 m-0 tracking-tight caret-white cursor-text focus:outline-none focus:ring-0"
                    autoFocus
                  />
                </label>
                {amount > displayedRobux && (
                  <p className="text-[11px] text-red-400 font-medium">
                    Exceeds your balance of {displayedRobux.toLocaleString('en-US')} Robux
                  </p>
                )}
              </div>

              {/* Quick Add Buttons: 25, 50, 100, 200 */}
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map((amt) => {
                  const isSelected = amount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      id={`send-robux-quick-${amt}`}
                      onClick={() => updateAmount(amt)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#22252c] border border-[#0066ff] text-white shadow-sm ring-1 ring-[#0066ff]/40'
                          : 'bg-[#181a1f] border border-[#2b2e35] text-white/90 hover:bg-[#20232a]'
                      }`}
                    >
                      <RobuxIcon className="w-3.5 h-3.5 text-white" />
                      <span>{amt.toLocaleString('en-US')}</span>
                    </button>
                  );
                })}
              </div>

              {/* Next Button & Subtitle */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  id="send-robux-next-button"
                  disabled={amount <= 0 || amount > displayedRobux}
                  onClick={handleNextToReview}
                  className="w-full bg-[#0055ff] hover:bg-[#0048e0] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer"
                >
                  Next
                </button>
                <p className="text-[11px] text-neutral-400 text-center">
                  {subtitle}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW / CONFIRMATION */}
          {step === 'review' && selectedPlayer && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Centered Player Info */}
              <div className="text-center pt-1">
                <RobloxPlayerAvatar
                  username={selectedPlayer.username}
                  avatarUrl={selectedPlayer.avatarUrl}
                  size={60}
                  className="mx-auto shadow-md"
                />
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <h3 className="text-base font-bold text-white leading-tight">
                    {selectedPlayer.displayName}
                  </h3>
                  {(selectedPlayer.hasVerifiedBadge || selectedPlayer.id === '1' || selectedPlayer.username.toLowerCase() === 'roblox') && (
                    <RobloxVerifiedBadge className="w-4 h-4 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  @{selectedPlayer.username}
                </p>

                {/* Metadata Info Badges */}
                <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    {selectedPlayer.connectedTime || 'Connected 3 months'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-neutral-500" />
                    {selectedPlayer.mutualFriends ?? 1} mutual friend
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1 text-[11px] text-neutral-400 mt-0.5">
                  <Info className="w-3 h-3 text-neutral-500" />
                  <span>Joined in {selectedPlayer.joinedYear || 2022}</span>
                </div>
              </div>

              {/* Amount to receive */}
              <div className="text-center py-1">
                <div className="flex items-center justify-center gap-2">
                  <RobuxIcon className="w-6 h-6 text-white shrink-0" />
                  <span className="text-3xl font-black text-white tracking-tight">
                    {amount.toLocaleString('en-US')}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-1">
                  @{selectedPlayer.username} will receive {amount.toLocaleString('en-US')} Robux
                </p>
              </div>

              {/* Send Robux & Edit Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  id="send-robux-confirm-button"
                  disabled={isSending}
                  onClick={handleConfirmSend}
                  className="w-full bg-[#0055ff] hover:bg-[#0048e0] active:scale-[0.98] disabled:opacity-75 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Robux</span>
                  )}
                </button>

                <button
                  type="button"
                  id="send-robux-edit-button"
                  disabled={isSending}
                  onClick={() => setStep('amount')}
                  className="w-full bg-[#1c1f26] hover:bg-[#252831] border border-[#2e3138] active:scale-[0.98] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-neutral-400 text-center leading-relaxed px-1">
                You need an age check or parental consent to send Robux. Once you send, you cannot cancel.
              </p>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION MODAL (MATCHES PIC 2 EXACTLY) */}
          {step === 'success' && (
            <div
              id="send-robux-success-view"
              className="py-6 px-2 sm:px-3 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200 select-none"
            >
              {/* Circular Checkmark Badge */}
              <div className="w-14 h-14 rounded-full bg-[#1c1f26] border border-neutral-700/60 flex items-center justify-center shadow-inner mt-1">
                <Check className="w-7 h-7 text-white stroke-[2.5]" />
              </div>

              {/* Success Notification Text */}
              <h3 className="text-base sm:text-[17px] font-semibold text-white tracking-tight">
                You sent {amount.toLocaleString()} Robux
              </h3>

              {/* Blue Confirmation OK Button */}
              <button
                type="button"
                id="send-robux-success-ok-button"
                onClick={handleClose}
                className="w-full bg-[#0055ff] hover:bg-[#0048e0] active:scale-[0.98] text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer text-center"
              >
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
