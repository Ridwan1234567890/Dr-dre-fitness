import { useMemo } from 'react';
import { UserCheck, Activity, AlertCircle } from 'lucide-react';
import { sameDay, fmtTime, daysLeft, CAPACITY } from '../lib/utils.js';
import CheckInPanel from './CheckInPanel.jsx';
import { PANEL, WELL, MUTED, LABEL, GOLD, Stat, initials } from './kiosk-ui.jsx';

export default function AdminDashboard({ members, log, alerts, onCheckIn, onCheckOut, onRenew, flash }) {
  const rise = n => ({ '--d': `${(0.05 + n * 0.09).toFixed(2)}s` });
  const inside = useMemo(() => log.filter(l => l.allowed && !l.out && sameDay(l.t)), [log]);
  const todayIn = useMemo(() => log.filter(l => l.allowed && sameDay(l.t)).length, [log]);
  const occ = Math.min(100, Math.round((inside.length / CAPACITY) * 100));
  const occBar = occ > 80 ? 'bg-rose-500' : occ > 50 ? 'bg-gold' : 'bg-emerald-500';
  const occTxt = occ > 80 ? ['High peak', 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'] : occ > 50 ? ['Moderate', 'bg-gold/15 text-amber-700 dark:text-gold border-gold/30'] : ['Quiet', 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'];
  const events = useMemo(() => {
    const ev = [];
    for (const l of log.slice(0, 60)) {
      ev.push({ k: l.t + l.id + 'i', t: l.t, name: l.name, id: l.id, kind: l.allowed ? 'IN' : 'DENIED' });
      if (l.out) ev.push({ k: l.out + l.id + 'o', t: l.out, name: l.name, id: l.id, kind: 'OUT' });
    }
    return ev.sort((a, b) => b.t.localeCompare(a.t)).slice(0, 30);
  }, [log]);

  return (<>
    {alerts.length > 0 && (
      <div className={`rise ${PANEL} rounded-2xl p-4 border-amber-400/60`} style={rise(0)}>
        <p className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300"><AlertCircle className="w-4 h-4" />Memberships expiring within 7 days</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {alerts.map(m => (
            <span key={m.id} className={`${WELL} rounded-xl pl-3 pr-1.5 py-1.5 text-xs flex items-center gap-2`}>
              <b>{m.name}</b><span className={MUTED}>{daysLeft(m.expiry) === 0 ? 'today' : daysLeft(m.expiry) + ' day(s)'}</span>
              <button onClick={() => { onRenew(m.id); flash('success', `${m.name} renewed for 30 days.`); }} className="px-2 py-1 rounded-lg bg-gold text-black font-bold hover:bg-goldd transition">Renew +30d</button>
            </span>))}
        </div>
      </div>)}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Stat label="Members in gym" value={inside.length} sub={`/ ${CAPACITY} capacity`} tone="emerald" Icon={UserCheck} rise={rise(0)} />
      <Stat label="Today’s check-ins" value={todayIn} sub="sessions logged" tone="gold" Icon={Activity} rise={rise(1)} />
      <div className={`rise ${PANEL} rounded-2xl p-5 flex flex-col justify-between`} style={rise(2)}>
        <div className="flex items-center justify-between mb-2">
          <span className={LABEL}>Occupancy</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${occTxt[1]}`}>{occTxt[0]}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold"><span>{occ}% full</span><span className={MUTED}>{Math.max(0, CAPACITY - inside.length)} spots free</span></div>
          <div className="w-full h-3 rounded-full overflow-hidden p-0.5 bg-black/10 dark:bg-black/50 border border-black/10 dark:border-white/10">
            <div className={`h-full rounded-full transition-all duration-700 ${occBar}`} style={{ width: `${occ}%` }} />
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8">
        <CheckInPanel members={members} log={log} admin onCheckIn={onCheckIn} onCheckOut={onCheckOut} onRenew={onRenew} flash={flash} rise={rise(3)} />
      </div>
      <div className="lg:col-span-4 space-y-6">
        <section className={`rise ${PANEL} rounded-3xl p-5 space-y-4`} style={rise(4)}>
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-emerald-500" /><h3 className="disp text-lg font-bold">Active in gym</h3></div>
            <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/25">{inside.length}</span>
          </div>
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {inside.length === 0 ? <p className={`text-xs text-center py-6 ${MUTED}`}>Nobody is in the gym right now.</p> : inside.map(l => (
              <div key={l.t + l.id} className={`${WELL} p-2.5 rounded-xl flex items-center justify-between gap-2`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-lg grid place-items-center disp text-sm font-bold text-black bg-gradient-to-br from-gold to-goldd shrink-0">{initials(l.name)}</span>
                  <div className="min-w-0"><p className="text-xs font-bold truncate">{l.name}</p><p className={`text-[10px] ${MUTED}`}>since {fmtTime(l.t)}</p></div>
                </div>
                <button onClick={() => onCheckOut(l.id)} className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-brand/40 text-brand hover:bg-brand hover:text-white transition">Check out</button>
              </div>))}
          </div>
        </section>

        <section className={`rise ${PANEL} rounded-3xl p-5 space-y-4`} style={rise(5)}>
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2"><Activity className={`w-4 h-4 ${GOLD}`} /><h3 className="disp text-lg font-bold">Live activity</h3></div>
            <span className={`text-[10px] flex items-center gap-1.5 ${MUTED}`}><span className="live" />Realtime</span>
          </div>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {events.length === 0 ? <p className={`text-xs text-center py-6 ${MUTED}`}>No activity yet.</p> : events.map(e => (
              <div key={e.k} className={`${WELL} flex items-center justify-between gap-2 text-xs p-2.5 rounded-xl`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${e.kind === 'IN' ? 'bg-emerald-500' : e.kind === 'OUT' ? 'bg-brand' : 'bg-red-500'}`} />
                  <div className="min-w-0"><p className="font-semibold truncate">{e.name}</p><p className={`text-[10px] ${MUTED}`}>{e.id}</p></div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${e.kind === 'IN' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : e.kind === 'OUT' ? 'bg-brand/10 text-brand' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>{e.kind === 'IN' ? 'CHECK IN' : e.kind === 'OUT' ? 'CHECK OUT' : 'DENIED'}</span>
                  <p className={`text-[10px] mt-0.5 ${MUTED}`}>{fmtTime(e.t)}</p>
                </div>
              </div>))}
          </div>
        </section>
      </div>
    </div>
  </>);
}
