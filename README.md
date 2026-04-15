<div align="center">

<br />

# Contact Location Tracker

**Real-time GPS tracking, built for trust and precision.**

<br />

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

<br />

> Share a link. Watch location update live. Delete the link — tracking stops instantly.
> No app download. No subscriptions. No magic. Just clean engineering.

<br />

</div>

---

## What This Is

Contact Location Tracker is a full-stack web application that lets you generate a secure, one-time tracking link and share it with anyone. The recipient opens it in their phone browser, grants location permission once, and their live GPS position streams back to you on an interactive map — in real time, with movement history and a full reverse-geocoded address.

When you're done, deleting the tracking session kills it instantly on both ends via WebSocket. No polling delay. No ghost sessions.

---

## Core Features

| | |
|---|---|
| **Secure Auth** | JWT-based register & login with bcrypt password hashing |
| **Contact Management** | Full CRUD contact list — your address book for tracking targets |
| **Shareable Tracking Links** | Generate a unique, tokenized link for any contact in one click |
| **Live GPS Streaming** | Location streams over Socket.IO — no page refresh needed |
| **Interactive Map** | Leaflet map with movement trail, zoom controls, and live marker |
| **Reverse Geocoding** | Full address breakdown (road → area → city → state) via OpenStreetMap |
| **Auto-Refresh** | Location re-sent automatically every 10 minutes even when stationary |
| **Instant Kill Switch** | Deleting a session fires `tracking-stopped` to the sharer's browser immediately |
| **Admin Dashboard** | Full control panel: user management, access approvals, session oversight |
| **Access Request System** | Users request tracking access; admin approves or rejects with email notification |
| **Mobile Ready** | Works on any phone browser on the same network — no app install |

---

## Tech Stack

```
Frontend    →   React 18 · Vite · TailwindCSS · React Leaflet
Backend     →   Node.js · Express.js
Database    →   MySQL 8 via Sequelize ORM (auto-sync, no migrations)
Real-time   →   Socket.IO (WebSocket with polling fallback)
Auth        →   JSON Web Tokens · bcrypt
Geocoding   →   OpenStreetMap Nominatim (free, no API key)
Email       →   Nodemailer (access approval / rejection notifications)
```

---

## Project Structure

```
contact-tracker/
│
├── client/                         # React + Vite frontend
│   └── src/
│       ├── components/             # Navbar, ProtectedRoute, LoadingScreen
│       ├── context/
│       │   └── AuthContext.jsx     # Global authentication state
│       ├── hooks/
│       │   ├── useSocket.js        # Socket.IO viewer hook
│       │   └── useGeolocation.js   # Raw GPS hook
│       ├── pages/
│       │   ├── Home.jsx            # Landing page
│       │   ├── Login.jsx / Register.jsx
│       │   ├── Dashboard.jsx       # Manage tracking requests
│       │   ├── Contacts.jsx        # Contact list
│       │   ├── CreateTracking.jsx  # Generate a tracking link
│       │   ├── TrackingLink.jsx    # Sharer's page — allow / deny
│       │   └── LiveMap.jsx         # Viewer's real-time map
│       └── services/
│           ├── api.js              # Axios instance via Vite proxy
│           ├── locationService.js  # GPS capture + socket broadcast + auto-refresh
│           └── geocodingService.js # OpenStreetMap reverse geocoding
│
├── server/                         # Express backend
│   ├── config/db.js                # Sequelize + MySQL connection
│   ├── controllers/                # authController · contactController · trackingController
│   ├── middleware/auth.js          # JWT verification
│   ├── models/                     # User · Contact · TrackingRequest · AccessRequest
│   ├── routes/                     # auth · contacts · tracking · admin
│   ├── utils/sendEmail.js          # Nodemailer email helper
│   └── server.js                   # Express app + Socket.IO bootstrap
│
├── package.json                    # Root scripts — runs both client + server
└── vercel.json                     # Deployment config
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MySQL** v8.0 or higher
- **Git**

---

### 1 — Clone

```bash
git clone https://github.com/Venisbhalara/Contact-Location-Tracker.git
cd Contact-Location-Tracker
```

### 2 — Install everything

```bash
npm run install:all
```

This one command installs dependencies for the root, server, and client.

### 3 — Create the database

Open your MySQL client and run:

```sql
CREATE DATABASE contact_tracker;
```

### 4 — Configure the server

```bash
cd server
copy .env.example .env
```

Open `server/.env` and fill in your values:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=contact_tracker
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=replace_this_with_something_long_and_random
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Email (for access approval notifications)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

> Tables are created and synced automatically on first run via Sequelize `sync({ alter: true })`. No manual migrations needed.

### 5 — Start

From the root directory:

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |

---

## Mobile Access

To test on a phone (same Wi-Fi network required):

**Step 1** — Find your PC's local IP:
```powershell
ipconfig
# Look for IPv4 Address under your active adapter
# Example: 192.168.1.42
```

**Step 2** — Allow port 5000 through Windows Firewall:
```powershell
netsh advfirewall firewall add rule name="Node Server 5000" dir=in action=allow protocol=TCP localport=5000
```

**Step 3** — Update `server/.env`:
```env
CLIENT_URL=http://192.168.1.42:3000
```

**Step 4** — Restart, then open on your phone:
```
http://192.168.1.42:3000
```

> Vite exposes the dev server to the local network automatically. All API and Socket.IO traffic routes through the Vite proxy — no hardcoded IPs needed in client code.

---

## How It Works

```
1.  Requester logs in → creates a tracking link for a contact
2.  The link (/track/:token) is copied and sent to the target (via WhatsApp, SMS, etc.)
3.  Target opens the link on their phone → taps "Allow Location Access"
4.  Their GPS coordinates are:
     — Persisted to MySQL via REST
     — Broadcast via Socket.IO to all viewers in the room instantly
     — Auto-refreshed every 10 minutes to handle idle sessions
5.  Requester opens the Live Map (/live/:token)
     — Sees the target's position on a Leaflet map with movement trail
     — Full reverse-geocoded address shown (road, area, city, state)
6.  When requester deletes the session:
     — Server emits "tracking-stopped" to the sharer's socket
     — Sharer's browser immediately shows "Tracking Ended" and stops transmitting
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Create a new account |
| `POST` | `/login` | Public | Authenticate and receive JWT |
| `GET` | `/me` | Private | Return the current authenticated user |

### Contacts — `/api/contacts`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Private | List all contacts (paginated) |
| `POST` | `/` | Private | Add a new contact |
| `PUT` | `/:id` | Private | Update a contact |
| `DELETE` | `/:id` | Private | Remove a contact |

### Tracking — `/api/tracking`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/create` | Private | Generate a new tracking link |
| `GET` | `/` | Private | List all tracking sessions for the user |
| `GET` | `/:token` | Public | Fetch tracking info by token |
| `POST` | `/update-location` | Public | Sharer pushes GPS coordinates |
| `DELETE` | `/:id` | Private | Terminate tracking (notifies sharer via socket) |

### Admin — `/api/admin`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | Stats: users, sessions, signups, 7-day activity chart |
| `GET` | `/users` | All users with session counts |
| `PUT` | `/users/:id/role` | Promote or demote a user |
| `PUT` | `/users/:id/access` | Grant or revoke tracking access |
| `DELETE` | `/users/:id` | Delete a user and cascade their data |
| `GET` | `/access-requests` | List all pending access requests |
| `PUT` | `/access-requests/:id` | Approve or reject with email notification |
| `GET` | `/tracking-sessions` | View all active tracking sessions |
| `DELETE` | `/tracking-sessions/:id` | Force-terminate any session |

---

## Socket.IO Events

| Event | Direction | Description |
|---|---|---|
| `join-tracking` | Client → Server | Join a tracking room by token |
| `register-sharer` | Client → Server | Sharer registers their socket in the room |
| `send-location` | Client → Server | Sharer broadcasts GPS coordinates |
| `location-update` | Server → Client | Live position pushed to all viewers |
| `tracking-stopped` | Server → Client | Fires when the requester deletes the session |

---

## Available Scripts

From the root directory:

| Script | What it does |
|---|---|
| `npm run dev` | Start both frontend and backend concurrently |
| `npm run server` | Start only the backend (nodemon) |
| `npm run client` | Start only the frontend (Vite) |
| `npm run install:all` | Install all dependencies across root, server, and client |
| `npm run build` | Build the React frontend for production |

---

## Environment Variables

### `server/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend port | `5000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `contact_tracker` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `yourpassword` |
| `JWT_SECRET` | Signing secret for tokens | *(long random string)* |
| `JWT_EXPIRE` | Token lifespan | `7d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` |
| `EMAIL_USER` | Gmail address for notifications | `you@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `xxxx xxxx xxxx xxxx` |

### `client/.env`

No client-side env vars required for local development. All API and Socket.IO traffic is proxied through Vite.

---

## Security

- Passwords are hashed with **bcrypt** — plaintext is never stored (unless the admin credential vault feature is explicitly enabled)
- All private routes require a valid **JWT Bearer token**
- CORS is restricted to `CLIENT_URL` and known local origins
- Tracking tokens expire after **24 hours** by default
- Admin routes require re-verification and are protected by a lockout after 5 failed attempts
- **Never commit `.env` files** — both are listed in `.gitignore`

---

## Contributing

1. Fork the repository
2. Create your branch — `git checkout -b feature/your-feature`
3. Commit with intent — `git commit -m 'Add: brief description'`
4. Push — `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

Licensed under the **ISC License**.

---

<div align="center">

Built by [Venisbhalara](https://github.com/Venisbhalara)

</div>
