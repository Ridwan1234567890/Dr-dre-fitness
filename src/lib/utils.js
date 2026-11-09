export const iso = d => d.toISOString().slice(0, 10);
export const addDays = (n, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() + n); return iso(d); };
export const daysLeft = exp => Math.ceil((new Date(exp + 'T23:59:59') - new Date()) / 864e5);
export const EXPIRY_WARN_DAYS = 7;
export const sameDay = t => new Date(t).toDateString() === new Date().toDateString();
export const fmtTime = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
export const fmtDur = ms => { const m = Math.max(0, Math.round(ms / 60000)); return `${Math.floor(m / 60)}h ${m % 60}m (${(m / 60).toFixed(2)} hrs)`; };
export const getStatus = m => { const d = daysLeft(m.expiry); return d < 0 ? 'expired' : d <= EXPIRY_WARN_DAYS ? 'expiring' : 'active'; };
export const digits = s => s.replace(/\D/g, '');
export const sha = async s => {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('drf:' + s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch { return 'p:' + btoa(s); }
};
// QR payload: "DRF:<memberId>". USB scanners, camera scans and typing all end up here.
export const findMember = (members, raw) => {
  let q = raw.trim(); if (!q) return null;
  if (q.toUpperCase().startsWith('DRF:')) q = q.slice(4);
  const up = q.toUpperCase(), dg = digits(q);
  return members.find(m => m.id.toUpperCase() === up) ||
    (dg.length >= 7 ? members.find(m => digits(m.phone).slice(-10) === dg.slice(-10)) : null) || null;
};
export const isOpen = (l, id) => l.id === id && l.allowed && !l.out && sameDay(l.t);
export const SEED = [
  { id: 'DRF-001', name: 'Adaeze Okafor', phone: '08012345678', expiry: addDays(45) },
  { id: 'DRF-002', name: 'Tunde Bello', phone: '08098765432', expiry: addDays(3) },
  { id: 'DRF-003', name: 'Chioma Eze', phone: '07011223344', expiry: addDays(-5) },
  { id: 'DRF-004', name: 'Ibrahim Musa', phone: '09055667788', expiry: addDays(200) },
];

const localIso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addMonths = (n, from = new Date()) => {
  const d = new Date(from), day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return localIso(d);
};
export const todayIso = () => localIso(new Date());
export const fmtDate = s => new Date(s + 'T12:00:00').toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
export const monthsCovered = (n, from = new Date()) => Array.from({ length: n }, (_, i) => {
  const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
  return d.toLocaleDateString([], { month: 'short', year: 'numeric' });
});
export const bmi = (kg, cm) => (kg && cm ? kg / ((cm / 100) ** 2) : 0);

export const CAPACITY = 100; // gym capacity used by the kiosk occupancy meter
