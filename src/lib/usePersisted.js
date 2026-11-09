import { useState, useEffect, useRef } from 'react';
const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
export const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
// State that mirrors to localStorage, debounced so rapid updates don't block the UI thread.
export function usePersisted(key, fallback) {
  const [val, setVal] = useState(() => load(key, fallback));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => save(key, val), 250);
    return () => clearTimeout(t);
  }, [key, val]);
  return [val, setVal];
}
