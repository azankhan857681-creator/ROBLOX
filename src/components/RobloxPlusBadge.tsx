import React from 'react';

interface RobloxPlusBadgeProps {
  className?: string;
  size?: number;
  title?: string;
  id?: string;
  withDarkBackground?: boolean;
}

/**
 * Roblox+ (Roblox Plus) Badge
 * Features the signature white hexagonal spiral 'P' icon from the official Roblox+ extension.
 */
export function RobloxPlusBadge({
  className = 'w-4 h-4 inline-block shrink-0',
  size,
  title = 'Roblox+ Badge',
  id = 'roblox-plus-badge',
  withDarkBackground = false,
}: RobloxPlusBadgeProps) {
  const content = (
    <svg
      viewBox="0 0 200 200"
      width={size || '100%'}
      height={size || '100%'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible"
    >
      <path
        d="M 46 160
           C 32 153 24 140 24 125
           L 24 60
           C 24 45 35 32 50 24
           L 90 6
           C 96 3 104 3 110 6
           L 150 24
           C 165 32 176 45 176 60
           L 176 125
           C 176 140 165 153 150 161
           L 110 181
           C 104 184 96 184 90 181
           L 68 168
           C 64 165 62 158 62 150
           L 62 72
           C 62 60 72 52 84 52
           L 126 52
           C 138 52 148 62 148 74
           L 148 106
           C 148 118 138 126 126 126
           L 94 126"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (withDarkBackground) {
    return (
      <span
        id={id}
        className={`inline-flex items-center justify-center p-0.5 rounded bg-black border border-white/10 text-white select-none ${className}`}
        title={title}
        aria-label={title}
      >
        {content}
      </span>
    );
  }

  return (
    <span
      id={id}
      className={`inline-flex items-center justify-center text-white select-none ${className}`}
      title={title}
      aria-label={title}
    >
      {content}
    </span>
  );
}
