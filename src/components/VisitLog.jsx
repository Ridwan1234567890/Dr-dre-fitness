import { memo } from 'react';
import { card } from './ui.jsx';
import { fmtDur } from '../lib/utils.js';
const Item = memo(({ l }) => (
  <li className="py-2 flex items-center justify-between text-sm">
    <span><b>{l.name}</b> <span className="text-slate-500">{l.id}</span></span>
    <span className="text-right">
      <span className={l.allowed ? 'text-emerald-600' : 'text-red-600'}>{l.allowed ? (l.out ? 'Out · ' + fmtDur(new Date(l.out) - new Date(l.t)) : 'In gym') : 'Denied'}</span>
      <br /><span className="text-xs text-slate-500">{new Date(l.t).toLocaleString()}</span>
    </span>
  </li>));
export default memo(function VisitLog({ log }) {
  return (
    <section className={card}>
      {log.length === 0 ? <p className="text-sm text-slate-500">No visits logged yet.</p> :
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">{log.slice(0, 100).map(l => <Item key={l.t + l.id} l={l} />)}</ul>}
    </section>);
});
