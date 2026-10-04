import { useState } from 'react';
import { X, Search, UserPlus, Check } from 'lucide-react';
import { RobloxVerifiedBadge } from './RobloxVerifiedBadge';

interface AddFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFriendsModal({ isOpen, onClose }: AddFriendsModalProps) {
  const [friendQuery, setFriendQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  if (!isOpen) return null;

  const SUGGESTED_FRIENDS = [
    { username: 'NoobMaster2026', tag: '@noobmaster', mutual: 4, isVerified: false },
    { username: 'BloxRacer99', tag: '@blox_racer', mutual: 12, isVerified: true },
    { username: 'PixelKnight', tag: '@pixel_k', mutual: 7, isVerified: false },
    { username: 'SpeedyRobloxian', tag: '@speedy_r', mutual: 2, isVerified: false },
  ];

  const handleSendRequest = (name: string) => {
    setSentRequests((prev) => [...prev, name]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs select-none">
      <div
        className="relative w-full max-w-md bg-[#1e2024] border border-[#2d3036] rounded-2xl p-6 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#00a2ff]" />
            Add Friends
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search friend input */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={friendQuery}
            onChange={(e) => setFriendQuery(e.target.value)}
            placeholder="Search by username..."
            className="w-full bg-[#141518] text-sm text-neutral-100 placeholder-neutral-500 pl-10 pr-4 py-2 rounded-lg border border-[#2b2d31] focus:border-[#00a2ff] outline-none"
          />
        </div>

        {/* Suggested Friends */}
        <div>
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
            Suggested Friends
          </h3>
          <div className="space-y-2">
            {SUGGESTED_FRIENDS.map((friend) => {
              const sent = sentRequests.includes(friend.username);
              return (
                <div
                  key={friend.username}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#16181b] border border-[#25282e]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#272a30] flex items-center justify-center font-bold text-sm text-neutral-200">
                      {friend.username[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <span>{friend.username}</span>
                        {friend.isVerified && (
                          <RobloxVerifiedBadge className="w-3.5 h-3.5 shrink-0" />
                        )}
                      </p>
                      <p className="text-[11px] text-neutral-400">{friend.mutual} mutual friends</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendRequest(friend.username)}
                    disabled={sent}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors ${
                      sent
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-[#00a2ff] hover:bg-[#0092e6] text-white'
                    }`}
                  >
                    {sent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Sent</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
