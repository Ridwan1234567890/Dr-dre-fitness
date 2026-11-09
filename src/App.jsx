import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import Home from './components/Home.jsx';
import Kiosk from './components/Kiosk.jsx';
import AdminGate from './components/AdminGate.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import Members from './components/Members.jsx';
import MemberForm from './components/MemberForm.jsx';
import MemberDetail from './components/MemberDetail.jsx';
import VisitLog from './components/VisitLog.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import Transition from './components/Transition.jsx';
import { Modal, Toast, MUTED } from './components/kiosk-ui.jsx';
import { usePersisted } from './lib/usePersisted.js';
import { SEED, addDays, addMonths, todayIso, fmtDate, fmtDur, daysLeft, getStatus, findMember, isOpen, sameDay } from './lib/utils.js';

function MemberRoute({ members, log, onSave, onRenew, onDelete }) {
  const { id } = useParams();
  const m = members.find(x => x.id === id);
  const visits = m ? log.filter(l => l.id === m.id).slice(0, 10) : [];
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link to="/admin/members" className="text-sm font-semibold underline text-goldd dark:text-gold">← Back to members</Link>
      {m ? (<>
        <MemberDetail m={m} members={members} onSave={onSave} onRenew={onRenew} onDelete={onDelete} />
        <section className="bg-white/90 dark:bg-zinc-900/80 backdrop-blur rounded-2xl border border-black/10 dark:border-white/10 p-4 shadow-lg shadow-black/5">
          <h3 className="disp text-lg font-bold mb-2">Recent visits</h3>
          {visits.length === 0 ? <p className={`text-sm ${MUTED}`}>No visits logged yet.</p> :
            <ul className="divide-y divide-black/10 dark:divide-white/10 text-sm">{visits.map(l => (
              <li key={l.t} className="py-2 flex items-center justify-between gap-3">
                <span>{new Date(l.t).toLocaleString()}</span>
                <span className={l.allowed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>{l.allowed ? (l.out ? 'Out · ' + fmtDur(new Date(l.out) - new Date(l.t)) : 'In gym') : 'Denied'}</span>
              </li>))}</ul>}
        </section>
      </>) : <p className={`text-sm ${MUTED}`}>Member not found.</p>}
    </div>
  );
}

export default function App() {
  const [members, setMembers] = usePersisted('drf_members', SEED);
  const [log, setLog] = usePersisted('drf_log', []);
  const [pinHash, setPinHash] = usePersisted('drf_pin', null);
  const [admin, setAdmin] = useState(false); // in memory only: a refresh logs you out
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [trans, setTrans] = useState(null); // entrance transition: null | { phase: 'cover' | 'reveal', rect }
  const busy = useRef(false);
  const toastTimer = useRef();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const flash = useCallback((type, message) => {
    clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  // Landing logo -> kiosk. Panels close, the page switches behind them, then they open.
  const enterKiosk = useCallback(rect => {
    if (busy.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { nav('/kiosk'); return; }
    busy.current = true;
    setTrans({ phase: 'cover', rect });
    setTimeout(() => { nav('/kiosk'); setTrans(t => t && { ...t, phase: 'reveal' }); }, 550);
    setTimeout(() => { setTrans(null); busy.current = false; }, 1400);
  }, [nav]);

  // Admin is only unlocked while you are on /admin/*. Any other page logs out. Each page change clears the last result.
  useEffect(() => { if (!pathname.startsWith('/admin')) setAdmin(false); setResult(null); setAddOpen(false); }, [pathname]);

  // auto-lock admin after 5 minutes without activity
  useEffect(() => {
    if (!admin) return;
    let t; const reset = () => { clearTimeout(t); t = setTimeout(() => setAdmin(false), 5 * 60 * 1000); };
    reset(); window.addEventListener('pointerdown', reset); window.addEventListener('keydown', reset);
    return () => { clearTimeout(t); window.removeEventListener('pointerdown', reset); window.removeEventListener('keydown', reset); };
  }, [admin]);

  const checkIn = useCallback(raw => {
    const m = findMember(members, raw);
    if (!m) return setResult({ notFound: true, raw });
    const status = getStatus(m);
    const open = log.find(l => isOpen(l, m.id));
    if (open && status !== 'expired') return setResult({ m, status, already: open.t });
    const entry = { t: new Date().toISOString(), id: m.id, name: m.name, allowed: status !== 'expired', status, out: null };
    setLog(l => [entry, ...l].slice(0, 500));
    setResult({ m, status, days: daysLeft(m.expiry) });
  }, [members, log, setLog]);

  const checkOut = useCallback(raw => {
    const m = findMember(members, raw);
    if (!m) return setResult({ notFound: true, raw });
    const open = log.find(l => isOpen(l, m.id));
    if (!open) return setResult({ m, noSession: true });
    const now = new Date().toISOString();
    setLog(log.map(l => (l === open ? { ...l, out: now } : l)));
    setResult({ m, out: true, sessionMs: new Date(now) - new Date(open.t) });
  }, [members, log, setLog]);

  // Turn every check-in / check-out result into a toast (kiosk and admin both use it)
  useEffect(() => {
    if (!result) return;
    const f = result.m ? result.m.name.split(' ')[0] : '';
    if (result.notFound) flash('error', `No member found for “${result.raw}”.`);
    else if (result.noSession) flash('info', `${result.m.name} isn’t checked in.`);
    else if (result.already) flash('info', `${result.m.name} is already checked in.`);
    else if (result.out) flash('success', `Goodbye ${f}! Session: ${fmtDur(result.sessionMs)}.`);
    else if (result.status === 'expired') flash('error', `${result.m.name}’s membership has expired. Entry denied.`);
    else flash('success', `Welcome ${f}! Checked in${result.status === 'expiring' ? ` · ${result.days} day(s) left` : ''}.`);
  }, [result, flash]);

  const renew = useCallback((id, n = 30) => { setMembers(ms => ms.map(m => m.id !== id ? m : { ...m, expiry: addDays(n, daysLeft(m.expiry) >= 0 ? new Date(m.expiry) : new Date()) })); }, [setMembers]);
  const addMember = useCallback(f => {
    const expiry = addMonths(f.months);
    const n = Math.max(0, ...members.map(m => parseInt(m.id.split('-')[1]) || 0)) + 1;
    const id = 'DRF-' + String(n).padStart(3, '0');
    setMembers(ms => [...ms, { id, name: f.name, phone: f.phone, weightKg: f.weightKg, heightCm: f.heightCm, months: f.months, start: todayIso(), expiry }]);
    flash('success', `${f.name} added (${id}) — active until ${fmtDate(expiry)}.`);
    return id;
  }, [members, setMembers, flash]);
  const updateMember = useCallback((id, p) => { setMembers(ms => ms.map(m => m.id === id ? { ...m, ...p } : m)); flash('success', 'Changes saved.'); }, [setMembers, flash]);
  const removeMember = useCallback(id => { setMembers(ms => ms.filter(m => m.id !== id)); flash('info', 'Member deleted.'); nav('/admin/members'); }, [setMembers, nav, flash]);
  const openMember = useCallback(id => nav('/admin/members/' + id), [nav]);

  const { alerts, todayCount, inGym } = useMemo(() => ({
    alerts: members.filter(m => getStatus(m) === 'expiring').sort((a, b) => a.expiry.localeCompare(b.expiry)),
    todayCount: log.filter(l => l.allowed && sameDay(l.t)).length,
    inGym: log.filter(l => l.allowed && !l.out && sameDay(l.t)).length,
  }), [members, log]);

  const guard = el => (admin ? el : <Navigate to="/admin/login" replace />);
  const page = (tab, children) => guard(<AdminLayout tab={tab} onAdd={() => setAddOpen(true)} onLogout={() => { setAdmin(false); nav('/admin/login'); }}>{children}</AdminLayout>);

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home inGym={inGym} todayCount={todayCount} launching={!!trans} onEnter={enterKiosk} />} />
        <Route path="/kiosk" element={<Kiosk members={members} log={log} onCheckIn={checkIn} onCheckOut={checkOut} flash={flash} intro={!!trans} />} />
        <Route path="/desk/*" element={<Navigate to="/kiosk" replace />} />

        {/* Admin: nothing links here, admins type /admin */}
        <Route path="/admin/login" element={admin ? <Navigate to="/admin" replace /> :
          <AdminGate pinHash={pinHash} setPinHash={setPinHash} onUnlock={() => { setAdmin(true); nav('/admin', { replace: true }); }} onBack={() => nav('/kiosk')} />} />
        <Route path="/admin" element={page('dashboard', <AdminDashboard members={members} log={log} alerts={alerts} onCheckIn={checkIn} onCheckOut={checkOut} onRenew={renew} flash={flash} />)} />
        <Route path="/admin/members" element={page('members', <Members members={members} log={log} onOpen={openMember} onAdd={() => setAddOpen(true)} />)} />
        <Route path="/admin/members/new" element={<Navigate to="/admin/members" replace />} />
        <Route path="/admin/members/:id" element={page('members', <MemberRoute members={members} log={log} onSave={updateMember} onRenew={id => { renew(id); flash('success', 'Renewed for 30 days.'); }} onDelete={removeMember} />)} />
        <Route path="/admin/log" element={page('log', <div className="max-w-3xl mx-auto"><VisitLog log={log} /></div>)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {admin && addOpen && (
        <Modal wide onClose={() => setAddOpen(false)}>
          <MemberForm members={members} onCancel={() => setAddOpen(false)} onSave={f => { addMember(f); setAddOpen(false); }} />
        </Modal>)}
      <Toast toast={toast} />
      {pathname === '/' && <ThemeToggle />}
      {trans && <Transition phase={trans.phase} rect={trans.rect} />}
    </>
  );
}
