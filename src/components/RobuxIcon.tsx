import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface RobuxIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  fill?: string;
  /**
   * Optional theme override ('dark' | 'light'). If omitted, derives from ThemeContext.
   */
  theme?: 'dark' | 'light';
  /**
   * Color theme for the Robux icon:
   * - 'current': inherits currentColor (perfect for navbars & buttons)
   * - 'gold': the iconic official gold gradient Robux coin
   * - 'white': crisp clean white in dark mode, turns to bold black in light mode (identical to robux.jpg)
   * - 'black': solid black (#000000) exactly as shown in light mode reference
   * - 'cyan': Roblox modern blue/cyan
   */
  variant?: 'current' | 'gold' | 'white' | 'cyan' | 'black';
}

/**
 * Official Roblox Robux Icon (2019-present)
 * Features the signature rounded hexagon outer rim, hollow groove,
 * solid inner rounded hexagon, and square cutout center.
 * In light mode, renders crisp solid black on white matching the official Roblox design (robux.jpg).
 */
export function RobuxIcon({
  className = 'w-4 h-4 shrink-0',
  size,
  variant = 'current',
  theme: themeProp,
  fill,
  ...props
}: RobuxIconProps) {
  const gradientId = React.useId();
  const themeContext = useTheme();
  const activeTheme = themeProp || themeContext?.theme || 'dark';

  let fillStyle = 'currentColor';

  if (variant === 'black') {
    fillStyle = '#000000';
  } else if (variant === 'white') {
    // In light mode, the classic/white Robux icon renders in solid black (#000000) matching robux.jpg
    fillStyle = activeTheme === 'light' ? '#000000' : '#ffffff';
  } else if (variant === 'cyan') {
    fillStyle = '#00a2ff';
  } else if (variant === 'gold') {
    fillStyle = `url(#${gradientId})`;
  } else if (variant === 'current') {
    fillStyle = 'currentColor';
  }

  if (fill) fillStyle = fill;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 26.1"
      className={className}
      width={size}
      height={size}
      fill={fillStyle}
      fillRule="evenodd"
      clipRule="evenodd"
      aria-label="Robux"
      {...props}
    >
      {variant === 'gold' && (
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#fee3a5" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#a9935a" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M21.4,4.62A5.2,5.2,0,0,1,24,9.12V17a5.19,5.19,0,0,1-2.6,4.5l-6.8,3.93a5.19,5.19,0,0,1-5.2,0L2.6,21.48A5.19,5.19,0,0,1,0,17V9.12a5.2,5.2,0,0,1,2.6-4.5L9.4.7a5.19,5.19,0,0,1,5.2,0ZM10.31,2.48,3.69,6.31A3.35,3.35,0,0,0,2,9.23v7.65A3.36,3.36,0,0,0,3.69,19.8l6.62,3.83a3.4,3.4,0,0,0,3.38,0l6.62-3.83A3.36,3.36,0,0,0,22,16.88V9.23a3.35,3.35,0,0,0-1.69-2.92L13.69,2.48a3.4,3.4,0,0,0-3.38,0Zm3.08,2.14,5.22,3A2.78,2.78,0,0,1,20,10v6a2.76,2.76,0,0,1-1.39,2.4l-5.22,3a2.76,2.76,0,0,1-2.78,0l-5.22-3A2.76,2.76,0,0,1,4,16.07V10A2.78,2.78,0,0,1,5.39,7.63l5.22-3a2.76,2.76,0,0,1,2.78,0ZM9,16.05h6v-6H9Z"
      />
    </svg>
  );
}

export default RobuxIcon;

