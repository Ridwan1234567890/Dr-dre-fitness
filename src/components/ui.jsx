import { memo } from 'react';
export const STYLE = {
  active: { label: 'Active', box: 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-100 glow-g', pill: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  expiring: { label: 'Expiring soon', box: 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-100 glow-a', pill: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  expired: { label: 'Expired', box: 'bg-red-500/10 border-red-500 text-red-900 dark:text-red-100 glow-r', pill: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};
export const card = 'bg-white/90 dark:bg-zinc-900/80 backdrop-blur rounded-2xl border border-black/10 dark:border-white/10 p-4 shadow-lg shadow-black/5 fadeup';
export const input = 'w-full rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-black/40 px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-gold focus:border-gold transition';
export const btn = 'rounded-lg px-3 py-1.5 text-sm font-bold uppercase tracking-wide transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95';
export const Pill = memo(({ s }) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STYLE[s].pill}`}>{STYLE[s].label}</span>);
