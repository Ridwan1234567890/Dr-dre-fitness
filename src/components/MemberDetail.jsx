import { useState } from 'react';
import { card, btn, Pill } from './ui.jsx';
import MemberForm from './MemberForm.jsx';
import { getStatus, daysLeft, bmi, fmtDate } from '../lib/utils.js';

export default function MemberDetail({ m, members, onSave, onRenew, onDelete }) {
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  if (edit) return <MemberForm initial={m} members={members} onCancel={() => setEdit(false)} onSave={p => { onSave(m.id, p); setEdit(false); }} />;
  const dl = daysLeft(m.expiry), b = bmi(m.weightKg, m.heightCm);
  const rows = [
    ['Member ID', m.id], ['Phone', m.phone],
    ['Weight', m.weightKg ? `${m.weightKg} kg` : '—'], ['Height', m.heightCm ? `${m.heightCm} cm` : '—'],
    ['BMI', b ? b.toFixed(1) : '—'], ['Months paid', m.months ? `${m.months}` : '—'],
    ['Started', m.start ? fmtDate(m.start) : '—'], ['Expires', fmtDate(m.expiry)],
    ['Time left', dl < 0 ? `Expired ${Math.abs(dl)} day(s) ago` : `${dl} day(s)`], ['QR code content', `DRF:${m.id}`],
  ];
  return (
    <div className={card + ' space-y-4'}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-xl font-bold">{m.name}</h2><Pill s={getStatus(m)} />
      </div>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium break-words">{v}</dd></div>)}
      </dl>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setEdit(true)} className={`${btn} px-5 bg-gold text-black`}>Edit</button>
        <button onClick={() => onRenew(m.id)} className={`${btn} bg-slate-200 dark:bg-slate-800`}>+30 days</button>
        {confirm ? (<>
          <button onClick={() => onDelete(m.id)} className={`${btn} bg-red-600 text-white`}>Confirm delete</button>
          <button onClick={() => setConfirm(false)} className={`${btn} bg-slate-200 dark:bg-slate-800`}>Cancel</button>
        </>) : <button onClick={() => setConfirm(true)} className={`${btn} bg-slate-200 dark:bg-slate-800 text-red-600`}>Delete</button>}
      </div>
    </div>
  );
}
