import { useState } from 'react';
import { Play, ThumbsUp, ThumbsDown, X, Users, Shield, Heart, Share2, Check } from 'lucide-react';
import { RobloxVerifiedBadge } from './RobloxVerifiedBadge';
import { GameItem } from '../types';

interface GameDetailsModalProps {
  game: GameItem | null;
  onClose: () => void;
}

export function GameDetailsModal({ game, onClose }: GameDetailsModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [userRating, setUserRating] = useState<'liked' | 'disliked' | null>(null);

  if (!game) return null;

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs select-none">
      <div
        id="roblox-game-modal"
        className="relative w-full max-w-2xl bg-[#1e2024] border border-[#2d3036] rounded-2xl overflow-hidden shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero image banner */}
        <div className="relative w-full h-56 bg-neutral-900 overflow-hidden">
          <img
            src={game.bannerUrl || game.localImage || game.iconUrl}
            alt={game.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e2024] via-[#1e2024]/40 to-transparent" />

          {/* Quick Play overlay button */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/60 border border-neutral-700 text-neutral-300">
                {game.genre || 'Experience'}
              </span>
              <h2 className="text-2xl font-black text-white mt-1 drop-shadow-md">
                {game.title}
              </h2>
              <p className="text-xs text-neutral-300 flex items-center gap-1.5 mt-0.5">
                <span>By {game.creator || 'Official Roblox Studio'}</span>
                <RobloxVerifiedBadge className="w-4 h-4 shrink-0" />
              </p>
            </div>

            {/* Green Play Button */}
            <button
              id="game-play-button"
              onClick={handlePlay}
              disabled={isPlaying}
              className="px-6 py-3 bg-[#00b06f] hover:bg-[#00c77d] active:scale-95 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-80"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isPlaying ? 'Starting Roblox...' : 'Play'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-[#16181b] border border-[#27292e] text-center">
            <div>
              <p className="text-[11px] text-neutral-400 font-medium">Rating</p>
              <p className="text-sm font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                {game.rating}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 font-medium">Active Players</p>
              <p className="text-sm font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                {game.players || '4.8K'}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 font-medium">Server Status</p>
              <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <Shield className="w-3.5 h-3.5" />
                Online
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
              About Experience
            </h4>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {game.description ||
                'Explore the experience on Roblox. Play alone or invite your friends to join your server!'}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2d3036]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUserRating(userRating === 'liked' ? null : 'liked')}
                className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  userRating === 'liked'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-[#16181b] border-[#2d3036] text-neutral-300 hover:text-white'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Like</span>
              </button>

              <button
                onClick={() => setUserRating(userRating === 'disliked' ? null : 'disliked')}
                className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  userRating === 'disliked'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-[#16181b] border-[#2d3036] text-neutral-300 hover:text-white'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Dislike</span>
              </button>

              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  isFavorited
                    ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                    : 'bg-[#16181b] border-[#2d3036] text-neutral-300 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                <span>Favorite</span>
              </button>
            </div>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Experience link copied!');
              }}
              className="p-2 rounded-lg bg-[#16181b] border border-[#2d3036] text-neutral-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Playing Notification Banner */}
          {isPlaying && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-3 text-emerald-300 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Joining game server... Launching Roblox Player client!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
