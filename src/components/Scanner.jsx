import { useEffect, useRef, useState } from 'react';
import { btn } from './ui.jsx';
// Loaded lazily: camera code only downloads when someone taps "Scan QR".
export default function Scanner({ onResult, onClose }) {
  const video = useRef(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let stream, raf, stop = false;
    (async () => {
      if (!('BarcodeDetector' in window)) { setErr('Camera QR scanning isn’t supported in this browser. Use a USB/Bluetooth scanner (it types into the box) or enter the ID.'); return; }
      try {
        const det = new window.BarcodeDetector({ formats: ['qr_code'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.current.srcObject = stream; await video.current.play();
        const tick = async () => {
          if (stop) return;
          try { const r = await det.detect(video.current); if (r.length) { onResult(r[0].rawValue); return; } } catch {}
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch { setErr('Couldn’t open the camera. Check permissions and try again.'); }
    })();
    return () => { stop = true; cancelAnimationFrame(raf); stream && stream.getTracks().forEach(t => t.stop()); };
  }, []); // eslint-disable-line
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 w-full max-w-md">
        <h3 className="font-bold mb-2">Scan member QR</h3>
        {err ? <p className="text-sm py-6">{err}</p> :
          <div className="relative overflow-hidden rounded-xl"><video ref={video} playsInline muted className="w-full bg-black aspect-square object-cover" /><div className="scanline" /></div>}
        <button onClick={onClose} className={`${btn} mt-3 bg-slate-200 dark:bg-slate-800`}>Close</button>
      </div>
    </div>
  );
}
