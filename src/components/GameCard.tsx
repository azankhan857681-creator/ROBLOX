import { useState } from 'react';
import type { Key } from 'react';
import { ThumbsUp, User, MoreHorizontal } from 'lucide-react';
import { RobloxVerifiedBadge } from './RobloxVerifiedBadge';
import { GameItem } from '../types';
import { useTheme } from '../context/ThemeContext';

interface GameCardProps {
  key?: Key;
  game: GameItem;
  onClick: () => void;
  theme?: 'dark' | 'light';
}

export function GameCard({ game, onClick, theme: propTheme }: GameCardProps) {
  const [imgError, setImgError] = useState(false);
  const themeContext = useTheme();
  const isDark = (propTheme || themeContext?.theme || 'dark') === 'dark';
  const isContinue = game.type === 'continue';

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={onClick}
      className="group flex flex-col cursor-pointer transition-opacity hover:opacity-95 text-left"
    >
      {/* Thumbnail Container */}
      <div
        className={`relative w-full overflow-hidden transition-colors ${
          isDark ? 'bg-[#1a1c20] border-[#23252a]' : 'bg-[#eaedf0] border-[#d8dce2]'
        } border ${
          isContinue
            ? 'aspect-square rounded-xl'
            : 'aspect-[16/9] rounded-xl'
        }`}
      >
        <img
          src={imgError ? game.iconUrl : game.localImage}
          onError={() => setImgError(true)}
          alt={game.title}
          className="w-full h-full object-cover select-none"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Brookhaven 3 dots button or hover 3-dots */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white backdrop-blur-xs transition-opacity ${
            game.id === 'brookhaven' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Game Title */}
      <h3
        className={`font-bold tracking-tight truncate mt-2 group-hover:underline ${
          isDark ? 'text-white' : 'text-neutral-900'
        } ${isContinue ? 'text-[13px]' : 'text-[14px]'}`}
        title={game.title}
      >
        {game.title}
      </h3>

      {/* Subtitle / Metadata Stats */}
      <div className={`flex items-center gap-2 text-[12px] mt-0.5 whitespace-nowrap ${
        isDark ? 'text-[#9ca3af]' : 'text-neutral-600'
      }`}>
        {game.ad && <span className={isDark ? 'text-[#888c94] font-medium' : 'text-neutral-500 font-medium'}>Ad • </span>}

        {game.creator ? (
          <div className={`flex items-center gap-1 ${isDark ? 'text-[#9ca3af]' : 'text-neutral-700'}`}>
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center overflow-hidden ${
              isDark ? 'bg-[#393b40]' : 'bg-neutral-300'
            }`}>
              <User className={`w-2.5 h-2.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`} />
            </div>
            <span className="text-[12px]">{game.creator}</span>
            <RobloxVerifiedBadge className="w-3.5 h-3.5 shrink-0" />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 fill-current opacity-80" />
            <span>{game.rating}</span>
          </div>
        )}

        {game.players && (
          <div className={`flex items-center gap-1 ml-1 ${isDark ? 'text-[#9ca3af]' : 'text-neutral-600'}`}>
            <User className="w-3 h-3 opacity-80" />
            <span>{game.players}</span>
          </div>
        )}
      </div>
    </div>
  );
}

