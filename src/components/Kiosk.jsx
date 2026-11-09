import { useRef } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import CheckInPanel from './CheckInPanel.jsx';
import { HEADER, MUTED, ClockChip } from './kiosk-ui.jsx';

// PUBLIC page: members can only check in / check out. Nothing about admin lives here.
export default function Kiosk({ members, log, onCheckIn, onCheckOut, flash, intro }) {
  const base = useRef(intro ? 0.45 : 0.05).current; // when arriving from the logo, start rising as the panels open
  return (
    <div className="min-h-screen flex flex-col">
      <header style={{ top: 'env(safe-area-inset-top, 0px)' }} className={HEADER}>
        <Link to="/" className="flex items-center gap-3" title="Back to the start screen">
          <img src="/logo.png" alt="Dr Dre Fitness" className="h-12 w-auto drop-shadow" />
          <div>
            <h1 className="disp text-2xl font-extrabold leading-none">Dr Dre <span className="text-goldd dark:text-gold">Fitness</span></h1>
            <p className={`text-[11px] tracking-[0.25em] uppercase ${MUTED}`}>Train · Check in · Repeat</p>
          </div>
        </Link>
        <ClockChip />
        <ThemeToggle inline />
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <CheckInPanel members={members} log={log} admin={false} onCheckIn={onCheckIn} onCheckOut={onCheckOut} onRenew={() => {}} flash={flash} rise={{ '--d': `${base}s` }} />
      </main>

      <footer className={`border-t border-black/10 dark:border-white/10 py-4 px-6 text-center text-xs ${MUTED}`}>© {new Date().getFullYear()} Dr Dre Fitness · Member check-in</footer>
    </div>
  );
}
