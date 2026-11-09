import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Sparkles, Clock } from 'lucide-react';

/* Shared look for the kiosk + admin screens (light and dark) */
export const PANEL = 'bg-white/85 dark:bg-zinc-900/75 backdrop-blur border border-black/10 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/30';
export const WELL = 'bg-black/[.04] dark:bg-black/40 border border-black/10 dark:border-white/10';
export const MUTED = 'text-slate-500 dark:text-slate-400';
export const LABEL = `text-xs font-bold uppercase tracking-wider ${MUTED}`;
export const GOLD = 'text-amber-700 dark:text-gold';
export const DISABLED = 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-slate-600 border border-black/10 dark:border-white/10 cursor-not-allowed';
export const HEADER = 'sticky z-30 border-b border-black/10 dark:border-white/10 bg-white/75 dark:bg-zinc-950/75 backdrop-blur-md px-4 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm';
const TONE = {
  emerald: { num: 'text-emerald-600 dark:text-emerald-400', chip: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400', glow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20' },
  gold: { num: 'text-amber-600 dark:text-gold', chip: 'bg-gold/15 border-gold/30 text-amber-700 dark:text-gold', glow: 'bg-gold/10 group-hover:bg-gold/25' },
};
export const initials = n => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

function Tick() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return <span className="tabular-nums">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>;
}
export const ClockChip = () => (
  <div className={`hidden md:flex items-center gap-5 px-4 py-2 rounded-xl text-sm ${WELL}`}>
    <span className="flex items-center gap-2 font-medium"><Clock className={`w-4 h-4 ${GOLD}`} /><Tick /></span>
    <span className="h-4 w-px bg-black/15 dark:bg-white/15" />
    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"><span className="live" />System live</span>
  </div>
);

export function Modal({ onClose, wide, children }) {
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className={`pop w-full ${wide ? 'max-w-lg' : 'max-w-sm'}`}>{children}</div>
    </div>
  );
}

export function Stat({ label, value, sub, tone, Icon, rise }) {
  const t = TONE[tone];
  return (
    <div className={`rise ${PANEL} rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group`} style={rise}>
      <div className="relative z-10 space-y-1">
        <span className={LABEL}>{label}</span>
        <div className="flex items-baseline gap-2"><span className={`disp text-5xl font-extrabold leading-none ${t.num}`}>{value}</span><span className={`text-xs ${MUTED}`}>{sub}</span></div>
      </div>
      <div className={`relative z-10 w-12 h-12 rounded-2xl border grid place-items-center ${t.chip}`}><Icon className="w-6 h-6" /></div>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-xl transition-colors ${t.glow}`} />
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  const c = toast.type === 'success' ? 'border-emerald-500/60 text-emerald-700 dark:text-emerald-300' : toast.type === 'error' ? 'border-rose-500/60 text-rose-700 dark:text-rose-300' : 'border-brand/60 text-sky-700 dark:text-sky-300';
  return (
    <div role="status" className="fixed top-20 right-4 z-[60] max-w-sm pop">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl bg-white dark:bg-zinc-900 ${c}`}>
        {toast.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
        {toast.type === 'info' && <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />}
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
    </div>
  );
}
