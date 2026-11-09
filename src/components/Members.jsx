import { memo, useMemo, useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { Pill, input as inputCls } from './ui.jsx';
import { getStatus, daysLeft, fmtDate, isOpen } from '../lib/utils.js';
import { PANEL, MUTED, initials } from './kiosk-ui.jsx';

const FILTERS = [['all', 'All'], ['active', 'Active'], ['expiring', 'Expiring'], ['expired', 'Expired']];

const Row = memo(function Row({ m, inGym, onOpen }) {
  const st = getStatus(m), dl = daysLeft(m.expiry);
  return (
    <button onClick={() => onOpen(m.id)} className={`${PANEL} rounded-2xl p-4 text-left flex items-center gap-3 hover:border-gold/60 hover:-translate-y-0.5 transition`}>
      <span className="w-12 h-12 rounded-xl grid place-items-center disp text-lg font-extrabold text-black bg-gradient-to-br from-gold to-goldd shrink-0">{initials(m.name)}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2"><span className="font-bold truncate">{m.name}</span><Pill s={st} />{inGym && <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><span className="live" />In gym</span>}</span>
        <span className={`block text-xs mt-0.5 ${MUTED}`}>{m.id} · {m.phone}</span>
        <span className={`block text-xs ${st === 'expired' ? 'text-red-600 dark:text-red-400' : MUTED}`}>{st === 'expired' ? `Expired ${fmtDate(m.expiry)}` : `Ends ${fmtDate(m.expiry)} · ${dl} day${dl === 1 ? '' : 's'} left`}</span>
      </span>
      <span className={`text-xl ${MUTED}`} aria-hidden>›</span>
    </button>);
});

export default memo(function Members({ members, log, onOpen, onAdd }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const inGym = useMemo(() => new Set(members.filter(m => log.some(l => isOpen(l, m.id))).map(m => m.id)), [members, log]);
  const counts = useMemo(() => { const c = { all: members.length, active: 0, expiring: 0, expired: 0 }; members.forEach(m => { c[getStatus(m)]++; }); return c; }, [members]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return members.filter(m => (f === 'all' || getStatus(m) === f) && (!t || m.name.toLowerCase().includes(t) || m.id.toLowerCase().includes(t) || m.phone.replace(/\D/g, '').includes(t.replace(/\D/g, '') || '§')));
  }, [members, q, f]);
  return (
    <section className="space-y-5 rise">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="disp text-3xl font-extrabold">Members</h2>
          <p className={`text-sm ${MUTED}`}>{members.length} member{members.length === 1 ? '' : 's'} · open one for full details, editing and visit history</p>
        </div>
        <button onClick={onAdd} className="flex items-center gap-2 bg-gradient-to-r from-goldd to-gold text-black font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-gold/30 hover:-translate-y-0.5 active:scale-95 transition"><UserPlus className="w-4 h-4" />Add member</button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 flex items-center">
          <Search className={`w-5 h-5 absolute left-4 pointer-events-none ${MUTED}`} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, ID or phone…" aria-label="Search members" className={inputCls + ' !pl-12 !pr-11 !text-base'} />
          {q && <button onClick={() => setQ('')} aria-label="Clear" className={`absolute right-3 p-1 ${MUTED} hover:text-gold`}><X className="w-5 h-5" /></button>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(([k, l]) => <button key={k} onClick={() => setF(k)} className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${f === k ? 'bg-gold text-black border-gold shadow shadow-gold/30' : `border-black/10 dark:border-white/15 ${MUTED} hover:border-gold`}`}>{l} <span className="opacity-70">{counts[k]}</span></button>)}
        </div>
      </div>

      {list.length === 0 ? <p className={`text-sm text-center py-10 ${MUTED}`}>No members match.</p> :
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{list.map(m => <Row key={m.id} m={m} inGym={inGym.has(m.id)} onOpen={onOpen} />)}</div>}
    </section>);
});
