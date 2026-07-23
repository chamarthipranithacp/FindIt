import React, { useState } from 'react';
import { useTheme } from '../context/themeContext';
import { Sun, Moon, Palette, ChevronDown } from 'lucide-react';

const themesList = [
  { id: 'space', name: 'Space Cyber', color: '#3b82f6' },
  { id: 'emerald', name: 'Emerald Forest', color: '#10b981' },
  { id: 'sunset', name: 'Sunset Amber', color: '#f97316' },
  { id: 'ocean', name: 'Ocean Breeze', color: '#06b6d4' },
  { id: 'midnight', name: 'Midnight Velvet', color: '#a855f7' },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', color: '#facc15' },
  { id: 'nordic', name: 'Nordic Frost', color: '#38bdf8' },
  { id: 'royal', name: 'Royal Gold', color: '#eab308' },
  { id: 'tokyo', name: 'Tokyo Lavender', color: '#818cf8' },
  { id: 'solar', name: 'Solar Flare', color: '#f59e0b' }
];

const ThemeSelector = ({ align = 'left' }) => {
  const themeContext = useTheme() || {};
  const theme = themeContext.theme || 'space';
  const isDark = themeContext.isDark ?? true;
  const toggleDarkMode = themeContext.toggleDarkMode || (() => {});
  const selectTheme = themeContext.selectTheme || (() => {});

  const [showDropdown, setShowDropdown] = useState(false);

  const currentThemeObj = themesList.find(t => t.id === theme) || themesList[0];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.6rem',
      position: 'relative'
    }}>
      {/* Theme Picker Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }}
          className="glass-panel"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}
          title="Choose Application Theme (10 Available)"
        >
          <span style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: currentThemeObj.color,
            boxShadow: `0 0 8px ${currentThemeObj.color}`
          }} />
          <span>{currentThemeObj.name}</span>
          <ChevronDown size={14} style={{ opacity: 0.7 }} />
        </button>

        {showDropdown && (
          <div 
            className="glass-panel" 
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              [align]: 0,
              zIndex: 10000,
              width: '210px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '0.3rem 0.5rem'
            }}>
              Select Theme (10)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.2rem', maxHeight: '260px', overflowY: 'auto' }}>
              {themesList.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectTheme(item.id);
                    setShowDropdown(false);
                  }}
                  style={{
                    background: theme === item.id ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.45rem 0.6rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: theme === item.id ? '700' : '500',
                    textAlign: 'left'
                  }}
                >
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: item.color
                  }} />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Light / Dark Mode Toggle */}
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleDarkMode();
        }}
        className="glass-panel"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          outline: 'none',
          padding: '0.4rem 0.8rem',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: '600'
        }}
        title="Toggle Dark/Light Mode"
      >
        {isDark ? (
          <>
            <Sun size={15} style={{ color: 'var(--accent-warning)' }} />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon size={15} style={{ color: 'var(--primary)' }} />
            <span>Dark</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ThemeSelector;
