import { Link } from 'react-router-dom';
import { UserPlus, Lock } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';
import { HEADER, MUTED, WELL, ClockChip } from './kiosk-ui.jsx';

const TABS = [['dashboard', 'Dashboard', '/admin'], ['members', 'Members', '/admin/members'], ['log', 'Visit log', '/admin/log']];

export default function AdminLayout({ tab, onAdd, onLogout, children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header style={{ top: 'env(safe-area-inset-top, 0px)' }} className={HEADER}>
        <Link to="/admin" className="flex items-center gap-3">
          <img src="/logo.png" alt="Dr Dre Fitness" className="h-12 w-auto drop-shadow" />
          <div>
            <h1 className="disp text-2xl font-extrabold leading-none">Dr Dre <span className="text-goldd dark:text-gold">Fitness</span></h1>
            <p className={`text-[11px] tracking-[0.25em] uppercase ${MUTED}`}>Admin dashboard</p>
          </div>
        </Link>

        <nav className={`order-last lg:order-none w-full lg:w-auto grid grid-cols-3 gap-1 p-1 rounded-xl ${WELL}`}>
          {TABS.map(([k, l, to]) => (
            <Link key={k} to={to} className={`disp text-base uppercase px-4 py-1.5 rounded-lg font-bold text-center transition duration-200 ${tab === k ? 'bg-gradient-to-r from-goldd to-gold text-black shadow-lg shadow-gold/30' : `${MUTED} hover:text-gold`}`}>{l}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ClockChip />
          <button onClick={onAdd} className="flex items-center gap-2 bg-gradient-to-r from-goldd to-gold text-black font-bold px-3.5 py-2 rounded-xl text-sm shadow-lg shadow-gold/30 hover:-translate-y-0.5 active:scale-95 transition"><UserPlus className="w-4 h-4" /><span className="hidden sm:inline">Add member</span></button>
          <button onClick={onLogout} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/5 hover:border-gold transition"><Lock className="w-4 h-4 text-amber-700 dark:text-gold" /><span className="hidden sm:inline">Log out</span></button>
          <ThemeToggle inline />
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">{children}</main>
      <footer className={`border-t border-black/10 dark:border-white/10 py-4 px-6 text-center text-xs ${MUTED}`}>Admin · locks after 5 minutes without activity</footer>
    </div>
  );
}
