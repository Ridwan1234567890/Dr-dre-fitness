# Dr Dre Fitness Check-in (React + Vite)

    npm install
    npm run dev      # develop
    npm run build    # production bundle in dist/

Data (members, visit log, admin password hash) is stored per device in localStorage.

## Pages
- `/` landing: big logo. Click it to play the entrance animation (two flat panels close, the page changes behind them, then they open).
- `/kiosk` PUBLIC. Members can only check in / check out (search or scan). Nothing about admin appears here.
- `/admin` ADMIN (type it in the address bar, no button links to it). Asks for the admin password, then shows the dashboard: stats, check-in panel, active in gym, live activity, expiring memberships.
  - `/admin/members` all members: search, filter, full details, edit, renew, delete, visit history
  - `/admin/log` full visit log
  - "Add member" button in the admin header
- Light / dark button in every header (floating bottom-right on the landing page).
- Gym capacity for the occupancy meter: `CAPACITY` in `src/lib/utils.js`.
