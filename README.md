# PawCruz — Frontend (Web + Android)

React web application for the PawCruz veterinary clinic system. Supports 4 user roles with dedicated dashboards. Wrapped with Capacitor for Android APK generation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Routing | React Router 7 |
| HTTP Client | Axios |
| Mobile Wrapper | Capacitor 8 |
| Styling | Plain CSS (responsive, mobile-first) |

---

## Project Structure

```
frontend/
├── public/
│   └── index.html                  # Viewport meta for mobile
├── src/
│   ├── App.js                      # Route definitions
│   ├── index.js                    # App entry, imports global CSS
│   ├── api/
│   │   └── api.js                  # Axios instance + API calls
│   ├── components/
│   │   ├── useSidebar.js           # Sidebar open/close hook
│   │   ├── AdminSidebar.js
│   │   ├── StaffSidebar.js
│   │   ├── VetSidebar.js
│   │   └── PetOwnerSidebar.js
│   ├── css/
│   │   ├── global-mobile.css       # Global responsive base styles
│   │   └── *.css                   # Per-page styles
│   └── pages/
│       ├── Login.js
│       ├── Register.js
│       ├── DevNav.js               # Dev-only page to bypass auth
│       ├── dashboards/
│       │   ├── Admin/              # AdminDashboard, Users, Messages, Notif, Profile
│       │   ├── Staff/              # 8 pages
│       │   ├── Vet/                # 6 pages
│       │   └── PetOwner/           # 8 pages
│       └── security/               # ResetPassword, VerifyEmail, UnlockAccount, LoginOtp
├── android/                        # Capacitor Android project
├── capacitor.config.ts             # Capacitor config (appId, webDir)
└── build/                          # Production build output (git-ignored)
```

---

## Roles & Dashboards

| Role | Dashboard Route | Pages |
|---|---|---|
| `admin` | `/admin` | Dashboard, User Management, Messages, Notifications, Profile |
| `veterinarian` | `/vet` | Dashboard, Patients, Calendar, Messages, Medical Records, Inventory, Notifications, Profile |
| `staff` | `/staff` | Dashboard, Appointments, User Management, Pets Profile, Messages, Inventory, Payment History, Activity Log, Notifications, Profile |
| `pet_owner` | `/pet-owner` | Dashboard, Appointments, My Pets, Messages, Medical Records, Payment History, Notifications, Profile |

---

## Setup

```bash
npm install
```

### Run development server

```bash
npm start
```

Runs at `http://localhost:3000`.

### Dev navigation (bypass login)

Visit `http://localhost:3000/dev` to get one-click access to all pages as any role — no backend or login required.

---

## Build for Web

```bash
npm run build
```

Output goes to `build/`.

---

## Build for Android (APK)

### Requirements
- Android Studio installed
- Java 17+

### Steps

```bash
# 1. Build React app and sync to Android project
npm run build:android

# 2. Open in Android Studio
npm run open:android
```

Then in Android Studio:
**Build → Build Bundle(s) / APK(s) → Build APK(s)**

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Capacitor config (`capacitor.config.ts`)

```ts
{
  appId: "com.pawcruz.app",
  appName: "PawCruz",
  webDir: "build",
  server: { androidScheme: "https" }
}
```

---

## Environment / API

The frontend connects to the backend via Axios. Update the base URL in `src/api/api.js` to match your backend address (default: `http://localhost:5000`).

When running on a physical Android device, replace `localhost` with your machine LAN IP (e.g., `http://192.168.x.x:5000`).

---

## Responsiveness

All pages are responsive for mobile (375px+) and tablet using CSS media queries. The sidebar converts to a drawer overlay on screens <= 768px, toggled by a hamburger button in the top bar.
