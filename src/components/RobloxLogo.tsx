import { useTheme } from '../context/ThemeContext';

interface RobloxLogoProps {
  theme?: 'dark' | 'light';
}

export function RobloxLogo({ theme: propTheme }: RobloxLogoProps) {
  const themeContext = useTheme();
  const isDark = (propTheme || themeContext?.theme || 'dark') === 'dark';

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Roblox Tilted Square Icon */}
      <svg
        className={`w-6 h-6 shrink-0 transition-colors ${isDark ? 'fill-white' : 'fill-black'}`}
        viewBox="0 0 24 24"
        aria-label="Roblox Icon"
      >
        <path d="M5.33 2.13 21.87 6.4 18.67 22.87 2.13 18.6zM10.8 9.6l-1.33 5.33 5.33 1.33 1.33-5.33z" />
      </svg>
      {/* Roblox text in heavy geometric typography */}
      <span className={`text-xl font-black tracking-wider uppercase font-sans transition-colors ${
        isDark ? 'text-white' : 'text-black'
      }`}>
        ROBLOX
      </span>
      {/* SELECT pill badge */}
      <span className={`ml-0.5 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded border transition-colors ${
        isDark
          ? 'text-white border-neutral-600 bg-[#111216]'
          : 'text-neutral-800 border-neutral-300 bg-neutral-100'
      }`}>
        SELECT
      </span>
    </div>
  );
}

