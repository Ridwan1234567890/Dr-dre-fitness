import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

// Light / dark switch. `inline` sits in a header; otherwise it floats bottom-right.
export default function ThemeToggle({ inline = false }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const root = document.documentElement, next = !dark;
    root.classList.add('theme-anim');
    root.classList.toggle('dark', next);
    setTimeout(() => root.classList.remove('theme-anim'), 450);
    try { localStorage.setItem('drf_theme', next ? 'dark' : 'light'); } catch {}
    setDark(next);
  };
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  const Icon = dark ? Sun : Moon;
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label}
      style={inline ? undefined : { bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
      className={`${inline ? '' : 'fixed right-3 z-40 '}w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border border-black/10 dark:border-white/15 bg-white/80 dark:bg-zinc-900/80 backdrop-blur shadow-md text-amber-600 dark:text-gold transition hover:-translate-y-0.5 hover:border-gold active:scale-90`}>
      <Icon key={dark ? 'sun' : 'moon'} className="w-5 h-5 spinin" />
    </button>
  );
}
