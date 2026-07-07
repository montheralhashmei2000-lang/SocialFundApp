// src/context/ThemeContext.js
import React, {createContext, useContext, useState, useMemo} from 'react';
import {LIGHT, DARK} from '../theme';

const ThemeContext = createContext(null);

export function ThemeProvider({children}) {
  const [dark, setDark] = useState(false);
  const theme = useMemo(() => {
    const base = dark ? DARK : LIGHT;
    return {
      ...base,
      // aliases used across screens (short + long names)
      primary: base.primary,
      primaryMid: base.primaryMid,
      primaryLight: base.primaryLight,
      primaryDark: base.primaryDark,
      p: base.primary,
      pm: base.primaryMid,
      pl: base.primaryLight,
      pd: base.primaryDark,
      goldD: base.goldDark,
    };
  }, [dark]);

  return (
    <ThemeContext.Provider value={{theme, dark, setDark}}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
