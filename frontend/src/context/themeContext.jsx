import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('findit_theme') || 'space';
  });
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('findit_is_dark');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const applyThemeClasses = (t, dark) => {
    const themeClasses = [
      'theme-space', 'theme-emerald', 'theme-sunset', 'theme-ocean',
      'theme-midnight', 'theme-cyberpunk', 'theme-nordic', 'theme-royal',
      'theme-tokyo', 'theme-solar'
    ];
    const modeClasses = ['dark-mode', 'light-mode'];
    
    [document.body, document.documentElement].forEach(el => {
      if (el) {
        el.classList.remove(...themeClasses);
        el.classList.remove(...modeClasses);
        el.classList.add(`theme-${t}`);
        el.classList.add(dark ? 'dark-mode' : 'light-mode');
        el.setAttribute('data-theme', t);
      }
    });
  };

  useEffect(() => {
    applyThemeClasses(theme, isDark);
    localStorage.setItem('findit_theme', theme);
    localStorage.setItem('findit_is_dark', JSON.stringify(isDark));
  }, [theme, isDark]);

  const toggleDarkMode = () => {
    setIsDark(prev => {
      const next = !prev;
      applyThemeClasses(theme, next);
      return next;
    });
  };
  
  const selectTheme = (themeName) => {
    const validThemes = [
      'space', 'emerald', 'sunset', 'ocean',
      'midnight', 'cyberpunk', 'nordic', 'royal',
      'tokyo', 'solar'
    ];
    if (validThemes.includes(themeName)) {
      setTheme(themeName);
      applyThemeClasses(themeName, isDark);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleDarkMode, selectTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
