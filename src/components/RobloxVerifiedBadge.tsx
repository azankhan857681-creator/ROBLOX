import React from 'react';

interface RobloxVerifiedBadgeProps {
  className?: string;
  size?: number;
  title?: string;
  id?: string;
}

/**
 * Official Roblox Verified Badge
 * Features the signature electric blue 15° tilted square with the bold rounded white checkmark.
 */
export function RobloxVerifiedBadge({
  className = 'w-4 h-4 inline-block shrink-0',
  size,
  title = 'Verified Badge',
  id = 'roblox-verified-badge',
}: RobloxVerifiedBadgeProps) {
  return (
    <span
      id={id}
      className={`inline-flex items-center justify-center select-none ${className}`}
      title={title}
      aria-label={title}
    >
      <svg
        viewBox="0 0 24 24"
        width={size || '100%'}
        height={size || '100%'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <g transform="rotate(15 12 12)">
          {/* Tilted Electric Blue Square with smooth corner radius matching official Roblox badge */}
          <rect
            x="3.2"
            y="3.2"
            width="17.6"
            height="17.6"
            rx="2.5"
            fill="#0066FF"
          />
          {/* Bold White Rounded Checkmark */}
          <path
            d="M7.6 12.3L10.6 15.3L16.4 9.2"
            stroke="#FFFFFF"
            strokeWidth="3.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </span>
  );
}
