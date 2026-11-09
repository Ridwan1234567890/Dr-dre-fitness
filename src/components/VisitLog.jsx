import { memo, useMemo } from 'react';
import { card } from './ui.jsx';
import { fmtDur, sameDay } from '../lib/utils.js';

// One row. `kind` decides what the right-hand side shows.
const Item = memo(({ l, kind }) => (
  <li className="py-2 flex items-center justify-between text-sm gap-3">
    <span className="min-w-0"><b>{l.name}</b> <span className="text-slate-500">{l.id}</span></span>
    <span className="text-right shrink-0">
      <span className={kind === 'denied' ? 'text-red-600' : 'text-emerald-600'}>
        {kind === 'in' && 'In gym'}
        {kind === 'out' && (l.out ? 'Out · ' + fmtDur(new Date(l.out) - new Date(l.t)) : 'No check-out')}
        {kind === 'denied' && 'Denied'}
      </span>
      <br /><span className="text-xs text-slate-500">{new Date(l.t).toLocaleString()}</span>
    </span>
  </li>));

const Column = ({ title, count, empty, children }) => (
  <div className="min-w-0">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-bold">{title}</h3>
      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 font-bold">{count}</span>
    </div>
    {count === 0
      ? <p className="text-sm text-slate-500">{empty}</p>
      : <ul className="divide-y divide-slate-200 dark:divide-slate-800">{children}</ul>}
  </div>
);

export default memo(function VisitLog({ log }) {
  const { inside, outside, denied } = useMemo(() => {
    const recent = log.slice(0, 100);
    return {
      // still inside: allowed, not checked out, and checked in today (same rule as the dashboard)
      inside: recent.filter(l => l.allowed && !l.out && sameDay(l.t)),
      // left: checked out (or an old entry nobody checked out)
      outside: recent.filter(l => l.allowed && (l.out || !sameDay(l.t))),
      denied: recent.filter(l => !l.allowed),
    };
  }, [log]);

  if (log.length === 0) return <section className={card}><p className="text-sm text-slate-500">No visits logged yet.</p></section>;

  return (
    <section className={card}>
      {/* stacked on phones, side by side from the md breakpoint up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:divide-x md:divide-slate-200 md:dark:divide-slate-800">
        <Column title="In the gym" count={inside.length} empty="Nobody is in the gym right now.">
          {inside.map(l => <Item key={l.t + l.id} l={l} kind="in" />)}
        </Column>
        <div className="md:pl-6 min-w-0">
          <Column title="Out of the gym" count={outside.length} empty="Nobody has checked out yet.">
            {outside.map(l => <Item key={l.t + l.id} l={l} kind="out" />)}
          </Column>
        </div>
      </div>

      {denied.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Column title="Denied" count={denied.length} empty="">
            {denied.map(l => <Item key={l.t + l.id} l={l} kind="denied" />)}
          </Column>
        </div>
      )}
    </section>);
});