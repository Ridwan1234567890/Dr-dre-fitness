# Dr Dre Fitness Check-in

A web app for running a gym's front desk: members check themselves in and out, and staff manage memberships from a password-protected admin area.

Built with React, Vite, Tailwind CSS and React Router. It runs entirely in the browser and needs no backend.

## Features

**Members (public `/kiosk`)**
- Find yourself by name or member ID, or scan the QR code on your card.
- Check in and check out with one tap.
- Expired memberships are blocked and told to renew at the front desk.
- Nothing about admin appears on public pages.

**Staff (`/admin`)**
- Password-protected dashboard: members in the gym now, today's check-ins, capacity used, memberships expiring within 7 days, recent activity.
- Front desk check-in with phone number and one-click renewal.
- Members list with search (name, ID, phone) and status filters (active, expiring, expired).
- Member details with edit, renew (+30 days), delete and recent visit history.
- Add new members (name, phone, weight, height, months paid).
- Full visit log.
- Admin locks itself after 5 minutes of inactivity, when you leave the admin pages, or on refresh.

**Everywhere**
- Light and dark theme with a toggle (your choice is remembered).
- Works on phones, tablets and desktops.
- Landing page with an entrance animation (reduced-motion settings are respected).

## Getting started

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev       # start the dev server (usually http://localhost:5173)
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

## Pages

| Address | Who | What |
| --- | --- | --- |
| `/` | Anyone | Landing page. Click the logo to enter the kiosk. |
| `/kiosk` | Members | Check in / check out. |
| `/admin` | Staff | Dashboard. Redirects to the sign-in page if you are not signed in. |
| `/admin/members` | Staff | All members. |
| `/admin/members/:id` | Staff | One member: details, edit, renew, delete, visits. |
| `/admin/log` | Staff | Visit log. |

There is deliberately no button linking to `/admin`. Staff type the address.

On the first visit to `/admin` you are asked to create the admin password (4+ characters). After that it is required to sign in.

## QR codes

Each member's QR code should contain `DRF:` followed by their ID, for example `DRF:DRF-001`. USB and Bluetooth barcode scanners work too: they type the code and press Enter. Camera scanning uses the browser's built-in `BarcodeDetector`, so it only works in browsers that support it (Chrome and Edge on most devices). Everywhere else, use a scanner or type the ID.

## Where data is stored

Members, the visit log, the admin password hash and the theme are stored in the browser's `localStorage`, on each device separately. Two phones or computers will not share members or visits.

Keep this in mind:
- Clearing the browser's site data deletes everything on that device.
- The admin password is checked in the browser. It keeps casual users out, but anyone with developer tools on that device can bypass it. For real security and shared data across devices, move the data and sign-in to a backend (for example Supabase or Firebase).

## Project structure

```
src/
  App.jsx                 routes, shared state, check-in / check-out logic
  main.jsx                entry point
  index.css               global styles and animations
  components/
    Home.jsx              landing page
    Transition.jsx        entrance animation between landing and kiosk
    Kiosk.jsx             public check-in page
    CheckInPanel.jsx      search / scan, check in and out (used by kiosk and admin)
    AdminGate.jsx         admin sign-in
    AdminLayout.jsx       admin header and navigation
    AdminDashboard.jsx    admin dashboard
    Members.jsx           members list
    MemberDetail.jsx      one member
    MemberForm.jsx        add / edit member form
    VisitLog.jsx          visit history table
    Scanner.jsx           camera QR scanner (loaded only when used)
    ThemeToggle.jsx       light / dark switch
    kiosk-ui.jsx, ui.jsx  shared styles and small components
  lib/
    utils.js              dates, membership status, member lookup, constants
    usePersisted.js       state that saves to localStorage
public/
  logo.png
  _redirects              single-page-app routing for Netlify
vercel.json               single-page-app routing for Vercel
```

## Settings you may want to change

- Gym capacity (used by the occupancy figures): `CAPACITY` in `src/lib/utils.js`.
- Expiry warning window and starter members: `src/lib/utils.js`.
- Brand colours: `tailwind.config.js` (`gold`, `goldd`, `brand`).

## Deploying

Run `npm run build` and host the `dist/` folder on any static host. Because the app uses real URLs like `/admin`, the host must send every path to `index.html`. This project already includes that setting for Netlify (`public/_redirects`) and Vercel (`vercel.json`). On other hosts, add an equivalent "rewrite all routes to index.html" rule.
