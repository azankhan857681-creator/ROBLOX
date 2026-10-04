import React, { createContext, useContext } from 'react';

export type AppTheme = 'dark' | 'light';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  isDark: true,
  isLight: false,
});

export function ThemeProvider({
  theme,
  setTheme,
  children,
}: {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  children: React.ReactNode;
}) {
  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      isDark: theme === 'dark',
      isLight: theme === 'light',
    }),
    [theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
