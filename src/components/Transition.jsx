import { useMemo } from 'react';

// Page-change cover that lives above the router so it survives navigation.
//  "cover":  two flat dark panels close over the screen (the logo stays put)
//  "reveal": the new page is already mounted underneath; the logo fades and the panels open
export default function Transition({ phase, rect }) {
  const vars = useMemo(() => ({ '--lx': rect.left + 'px', '--ly': rect.top + 'px', '--lw': rect.width + 'px', '--lh': rect.height + 'px' }), [rect]);
  return (
    <div className={`tx ${phase}`} style={vars} aria-hidden="true">
      <div className="tx-panel l" /><div className="tx-panel r" />
      <img src="/logo.png" alt="" className="tx-logo" />
    </div>
  );
}
