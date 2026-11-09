import { useState, useMemo, lazy, Suspense } from 'react';
import { Users, UserCheck, UserX, Search, QrCode, X, ChevronRight } from 'lucide-react';
import { findMember, getStatus, daysLeft, isOpen, sameDay, fmtTime, fmtDate } from '../lib/utils.js';
import { Pill, input as inputCls } from './ui.jsx';
import { PANEL, WELL, MUTED, GOLD, DISABLED, initials } from './kiosk-ui.jsx';

const Scanner = lazy(() => import('./Scanner.jsx'));

// The member check-in card: search / scan, then Check in or Check out.
// Used on the public kiosk (admin=false) and on the admin dashboard (admin=true shows phone + Renew).
export default function CheckInPanel({ members, log, admin, onCheckIn, onCheckOut, onRenew, flash, rise }) {
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState(null);
  const [scan, setScan] = useState(false);

  const term = q.trim().toLowerCase();
  const exact = term.length >= 2 ? findMember(members, q) : null;
  const matches = useMemo(() => {
    if (term.length < 2) return [];
    const list = members.filter(m => m.name.toLowerCase().includes(term) || m.id.toLowerCase().includes(term)).slice(0, 6);
    return exact && !list.includes(exact) ? [exact, ...list] : list;
  }, [members, term, exact]);
  const select = m => { setSelId(m.id); setQ(''); };
  const submitSearch = e => {
    e.preventDefault();
    const m = exact || (matches.length === 1 ? matches[0] : null);
    if (m) select(m); else if (term) flash('error', `No single member matches “${q.trim()}”.`);
  };

  const sel = members.find(m => m.id === selId) || null;
  const selOpen = sel ? log.find(l => isOpen(l, sel.id)) : null;
  const selStatus = sel ? getStatus(sel) : null;
  const selDays = sel ? daysLeft(sel.expiry) : 0;
  const lastVisit = sel ? log.find(l => l.id === sel.id && l.allowed) : null;
  const lastTxt = lastVisit ? `${sameDay(lastVisit.t) ? 'Today' : new Date(lastVisit.t).toLocaleDateString([], { day: 'numeric', month: 'short' })} ${fmtTime(lastVisit.t)}` : 'Never';

  return (
    <section className={`rise ${PANEL} rounded-3xl p-5 sm:p-8 space-y-6`} style={rise}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-5">
        <div>
          <h2 className="disp text-3xl font-extrabold tracking-wide">Member check-in</h2>
          <p className={`text-sm mt-1 ${MUTED}`}>Scan your QR code, or type your name / member ID.</p>
        </div>
        <button onClick={() => setScan(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gold/50 bg-gold/10 hover:bg-gold/20 transition active:scale-95"><QrCode className={`w-4 h-4 ${GOLD}`} />Scan QR</button>
      </div>

      <form onSubmit={submitSearch} className="relative">
        <div className="relative flex items-center">
          <Search className={`w-5 h-5 absolute left-4 pointer-events-none ${MUTED}`} />
          <input value={q} onChange={e => setQ(e.target.value)} autoComplete="off" aria-label="Search member by name or ID" placeholder="Type a name or ID (e.g. Alex, DRF-001)…" className={inputCls + ' !pl-12 !pr-11 !text-base'} />
          {q && <button type="button" onClick={() => setQ('')} aria-label="Clear" className={`absolute right-3 p-1 ${MUTED} hover:text-gold`}><X className="w-5 h-5" /></button>}
        </div>
        {matches.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 shadow-2xl divide-y divide-black/5 dark:divide-white/10 pop">
            {matches.map(m => {
              const inG = log.some(l => isOpen(l, m.id));
              return (
                <button type="button" key={m.id} onClick={() => select(m)} className="group w-full text-left p-3.5 flex items-center justify-between gap-3 hover:bg-gold/10 transition">
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl grid place-items-center disp font-bold text-black bg-gradient-to-br from-gold to-goldd shrink-0">{initials(m.name)}</span>
                    <span className="min-w-0"><span className="block font-bold truncate group-hover:text-goldd dark:group-hover:text-gold transition-colors">{m.name}</span><span className={`block text-xs ${MUTED}`}>{m.id}</span></span>
                  </span>
                  <span className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${inG ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-black/5 dark:bg-white/5 ' + MUTED + ' border-black/10 dark:border-white/10'}`}>{inG ? 'In gym' : 'Out'}</span>
                    <ChevronRight className={`w-4 h-4 ${MUTED} group-hover:translate-x-1 transition-transform`} />
                  </span>
                </button>);
            })}
          </div>
        )}
      </form>

      {sel ? (
        <div key={sel.id} className={`${WELL} rounded-2xl p-5 sm:p-6 space-y-5 relative pop`}>
          <button onClick={() => setSelId(null)} aria-label="Clear selection" className={`absolute top-3 right-3 p-2 rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 ${MUTED} hover:text-gold transition`}><X className="w-4 h-4" /></button>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-24 h-24 rounded-2xl grid place-items-center disp text-4xl font-extrabold text-black bg-gradient-to-br from-gold to-goldd shadow-xl shadow-gold/30 ring-2 ring-white/50 dark:ring-white/10 shrink-0">{initials(sel.name)}</div>
            <div className="text-center sm:text-left space-y-2 flex-1 min-w-0 sm:pr-10">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-2xl font-black break-words">{sel.name}</h3><Pill s={selStatus} />
              </div>
              <p className={`text-sm font-semibold ${selStatus === 'expired' ? 'text-red-600 dark:text-red-400' : GOLD}`}>
                {selStatus === 'expired' ? `Expired on ${fmtDate(sel.expiry)}` : `Active until ${fmtDate(sel.expiry)} · ${selDays} day${selDays === 1 ? '' : 's'} left`}
              </p>
              <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs ${MUTED}`}>
                <span>ID: <strong className="text-slate-800 dark:text-slate-200">{sel.id}</strong></span><span>•</span>
                <span>Last visit: <strong className="text-slate-800 dark:text-slate-200">{lastTxt}</strong></span>
                {admin && <><span>•</span><span>{sel.phone}</span></>}
              </div>
              {selOpen && <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">In the gym since {fmtTime(selOpen.t)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-black/10 dark:border-white/10">
            <button onClick={() => onCheckIn(sel.id)} disabled={!!selOpen || selStatus === 'expired'}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl disp text-xl font-extrabold tracking-wide transition ${selOpen || selStatus === 'expired' ? DISABLED : 'bg-gradient-to-r from-goldd to-gold text-black shadow-lg shadow-gold/30 hover:-translate-y-0.5 active:scale-[.98]'}`}>
              <UserCheck className="w-5 h-5" />Check in
            </button>
            <button onClick={() => onCheckOut(sel.id)} disabled={!selOpen}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl disp text-xl font-extrabold tracking-wide transition ${!selOpen ? DISABLED : 'bg-brand text-white shadow-lg shadow-brand/30 hover:-translate-y-0.5 active:scale-[.98]'}`}>
              <UserX className="w-5 h-5" />Check out
            </button>
          </div>
          {selStatus === 'expired' && <p className="text-sm text-red-600 dark:text-red-400 font-medium text-center sm:text-left">Membership expired. Please renew at the front desk.</p>}
          {admin && selStatus !== 'active' && (
            <button onClick={() => { onRenew(sel.id); flash('success', `${sel.name} renewed for 30 days.`); }} className="w-full py-2.5 rounded-xl text-sm font-bold border border-gold/60 bg-gold/10 hover:bg-gold/20 transition active:scale-95">Renew +30 days</button>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-black/15 dark:border-white/15 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl mx-auto grid place-items-center bg-gold/15 border border-gold/30"><Users className={`w-6 h-6 ${GOLD}`} /></div>
          <h4 className="font-bold">No member selected</h4>
          <p className={`text-xs max-w-sm mx-auto ${MUTED}`}>Search above or scan your QR code. A USB scanner works too: it types the ID and presses Enter for you.</p>
        </div>
      )}

      {scan && <Suspense fallback={null}><Scanner onClose={() => setScan(false)} onResult={v => { setScan(false); const m = findMember(members, v); if (m) select(m); else flash('error', `No member found for “${v}”.`); }} /></Suspense>}
    </section>
  );
}
