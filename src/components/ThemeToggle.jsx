import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button className="theme-toggle-btn" onClick={() => setIsDark(!isDark)} title="Toggle Theme">
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default ThemeToggle;
