import { useState } from 'react';
import { Lock } from 'lucide-react';
import { input } from './ui.jsx';
import { sha } from '../lib/utils.js';
import { save } from '../lib/usePersisted.js';
import ThemeToggle from './ThemeToggle.jsx';
import { PANEL, MUTED, GOLD } from './kiosk-ui.jsx';

// Admin login page at /admin/login. There is no button anywhere that links here: admins type /admin.
export default function AdminGate({ pinHash, setPinHash, onUnlock, onBack }) {
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  const submit = async e => {
    e.preventDefault();
    if (pin.length < 4) { setMsg('Use at least 4 characters.'); return; }
    const h = await sha(pin); setPin('');
    if (!pinHash) { setPinHash(h); save('drf_pin', h); onUnlock(); }
    else if (h === pinHash) onUnlock();
    else setMsg('Wrong password.');
  };
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-end p-4"><ThemeToggle inline /></div>
      <main className="flex-1 grid place-items-center p-4 -mt-10">
        <form onSubmit={submit} className={`${PANEL} rounded-3xl p-8 w-full max-w-sm space-y-4 text-center pop`}>
          <img src="/logo.png" alt="Dr Dre Fitness" className="h-28 w-auto mx-auto drop-shadow-lg" />
          <div className="flex items-center justify-center gap-2"><Lock className={`w-4 h-4 ${GOLD}`} /><h1 className="disp text-2xl font-extrabold">{pinHash ? 'Admin login' : 'Set up admin password'}</h1></div>
          <p className={`text-sm ${MUTED}`}>{pinHash ? 'Enter the admin password to continue.' : 'First time here: choose a password (4+ characters). Only people who know it can open the admin area.'}</p>
          <input type="password" autoFocus autoComplete="off" value={pin} onChange={e => setPin(e.target.value)} placeholder="Password" className={input + ' text-center tracking-widest'} />
          {msg && <p className="text-sm text-red-600 dark:text-red-400">{msg}</p>}
          <button className="w-full py-3 rounded-xl disp text-lg font-extrabold bg-gradient-to-r from-goldd to-gold text-black shadow-lg shadow-gold/30 hover:-translate-y-0.5 active:scale-95 transition">{pinHash ? 'Log in' : 'Save password'}</button>
          <button type="button" onClick={onBack} className={`text-xs underline ${MUTED}`}>← Back to check-in</button>
        </form>
      </main>
    </div>
  );
}
