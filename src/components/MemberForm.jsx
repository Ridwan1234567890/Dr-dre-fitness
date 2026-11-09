import { useState, useMemo } from 'react';
import { card, input, btn } from './ui.jsx';
import { digits, addMonths, fmtDate, monthsCovered } from '../lib/utils.js';

const Field = ({ label, id, err, children }) => (
  <div><label htmlFor={id} className="text-sm font-medium">{label}</label>{children}{err && <p className="text-xs text-red-600 mt-1">{err}</p>}</div>
);

// One form for both "add" (no `initial`) and "edit".
export default function MemberForm({ initial, members, onSave, onCancel }) {
  const editing = !!initial;
  const [f, setF] = useState(editing
    ? { name: initial.name, phone: initial.phone, weightKg: initial.weightKg ?? '', heightCm: initial.heightCm ?? '', expiry: initial.expiry }
    : { name: '', phone: '', weightKg: '', heightCm: '', months: '1' });
  const [errs, setErrs] = useState({});
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const months = Math.floor(Number(f.months)) || 0;
  const cover = useMemo(() => !editing && months >= 1 && months <= 36 ? { end: addMonths(months), list: monthsCovered(months) } : null, [editing, months]);

  const submit = e => {
    e.preventDefault();
    const er = {}, w = f.weightKg === '' ? null : Number(f.weightKg), h = f.heightCm === '' ? null : Number(f.heightCm);
    if (!f.name.trim()) er.name = 'Enter the full name.';
    if (digits(f.phone).length < 7) er.phone = 'Enter a phone number with at least 7 digits.';
    else if (members.some(m => m.id !== initial?.id && digits(m.phone).slice(-10) === digits(f.phone).slice(-10))) er.phone = 'This phone number is already registered.';
    if (w === null ? !editing : !(w >= 20 && w <= 300)) er.weightKg = 'Weight must be 20–300 kg.';
    if (h === null ? !editing : !(h >= 100 && h <= 250)) er.heightCm = 'Height must be 100–250 cm.';
    if (editing ? !f.expiry : !cover) er[editing ? 'expiry' : 'months'] = editing ? 'Choose an expiry date.' : 'Choose 1 to 36 months.';
    setErrs(er);
    if (Object.keys(er).length) return;
    const base = { name: f.name.trim(), phone: f.phone.trim(), weightKg: w, heightCm: h };
    onSave(editing ? { ...base, expiry: f.expiry } : { ...base, months });
  };

  return (
    <form onSubmit={submit} noValidate className={card + ' space-y-3'}>
      <h2 className="text-xl font-bold">{editing ? `Edit ${initial.name}` : 'Add new member'}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" id="m-name" err={errs.name}><input id="m-name" value={f.name} onChange={set('name')} className={input} /></Field>
        <Field label="Phone number" id="m-phone" err={errs.phone}><input id="m-phone" value={f.phone} onChange={set('phone')} inputMode="tel" placeholder="08012345678" className={input} /></Field>
        <Field label="Weight (kg)" id="m-w" err={errs.weightKg}><input id="m-w" type="number" min="20" max="300" step="0.1" value={f.weightKg} onChange={set('weightKg')} placeholder="70" className={input} /></Field>
        <Field label="Height (cm)" id="m-h" err={errs.heightCm}><input id="m-h" type="number" min="100" max="250" value={f.heightCm} onChange={set('heightCm')} placeholder="170" className={input} /></Field>
      </div>
      {editing ? (
        <Field label="Membership expires" id="m-exp" err={errs.expiry}><input id="m-exp" type="date" value={f.expiry} onChange={set('expiry')} className={input + ' sm:max-w-xs'} /></Field>
      ) : (<>
        <Field label="Months paying for" id="m-months" err={errs.months}>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 6, 12].map(n => <button type="button" key={n} onClick={() => setF(p => ({ ...p, months: String(n) }))} className={`px-3 py-1 rounded-lg text-sm font-semibold border ${months === n ? 'bg-gold text-black border-gold' : 'border-black/15 dark:border-white/15'}`}>{n}</button>)}
            <input id="m-months" type="number" min="1" max="36" value={f.months} onChange={set('months')} className={input + ' !w-28 !py-2'} aria-label="Custom number of months" />
          </div>
        </Field>
        {cover && (
          <div className="rounded-xl border border-gold/60 bg-gold/10 p-3 text-sm">
            <p className="font-semibold">Covers {months} month{months > 1 ? 's' : ''}: {fmtDate(addMonths(0))} → {fmtDate(cover.end)}</p>
            <p className="mt-1 flex flex-wrap gap-1">{cover.list.map(x => <span key={x} className="px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/40 text-xs">{x}</span>)}</p>
          </div>)}
      </>)}
      <div className="flex gap-2">
        <button className={`${btn} px-5 bg-gold text-black`}>{editing ? 'Save changes' : 'Add member'}</button>
        <button type="button" onClick={onCancel} className={`${btn} bg-slate-200 dark:bg-slate-800`}>Cancel</button>
      </div>
    </form>
  );
}
