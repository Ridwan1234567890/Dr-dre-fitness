import { memo, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { card } from './ui.jsx';

// Landing screen: the big logo IS the door. Clicking it plays the entrance transition into /kiosk.
export default memo(function Home({ inGym, todayCount, launching, onEnter }) {
  const logo = useRef(null);
  const enter = () => {
    if (launching) return;
    const r = logo.current.getBoundingClientRect(); // exact on-screen box, so the transition starts from the logo's real position
    onEnter({ left: r.left, top: r.top, width: r.width, height: r.height });
  };
  return (
    <div className="max-w-md mx-auto p-6 min-h-[92vh] flex flex-col justify-center items-center text-center space-y-7">
      <button type="button" onClick={enter} aria-label="Enter the Dr Dre Fitness member kiosk"
        className="group relative rounded-[2.5rem] outline-none focus-visible:ring-4 focus-visible:ring-gold/60">
        <span className="relative block float">
          <img ref={logo} src="/logo.png" alt="Dr Dre Fitness logo" width="384"
            style={{ visibility: launching ? 'hidden' : 'visible' }}
            className="w-72 sm:w-96 max-w-full h-auto transition duration-500 ease-out group-hover:scale-105 group-active:scale-95 drop-shadow-[0_18px_40px_rgba(235,169,59,0.4)]"
            fetchPriority="high" />
        </span>
      </button>

      <div>
        <h1 className="sr-only">Dr Dre Fitness</h1>
        <p className="disp text-lg tracking-[0.3em] text-slate-500">Train · Check in · Repeat</p>
        <p className="mt-4 disp text-sm tracking-[0.25em] text-amber-700 dark:text-gold">Tap the logo to enter</p>
        <ChevronDown className="w-5 h-5 mx-auto mt-1 text-amber-700 dark:text-gold nudge" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {[[inGym, 'In the gym now'], [todayCount, 'Check-ins today']].map(([n, l]) => (
          <div key={l} className={card + ' !p-3'}>
            <p className="disp text-4xl font-extrabold text-goldd dark:text-gold">{n}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">{l}</p>
          </div>))}
      </div>
    </div>
  );
});
