<div align="center">
  <h1 align="center">Location Tracker</h1>
  <p align="center">
    <strong>Real-time GPS tracking, built for trust and precision.</strong>
    <br />
    Share a link. Watch location update live. Delete the link — tracking stops instantly.
  </p>

  <div>
    <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  </div>
</div>

<br/>

## ✨ Overview

**Location Tracker** is a premium full-stack web application engineered to generate secure, one-time tracking links. Share the link with anyone—once they open it in their mobile browser and grant location permissions, their live GPS position streams directly to your interactive map in real-time, complete with movement history and precise reverse-geocoded addressing.

When you're finished, deleting the tracking session terminates it instantly on both ends via WebSocket. 
*No polling delays. No ghost sessions. No magic. Just clean engineering.*

---

## 🚀 Core Features

- 🔐 **Secure Auth** — JWT-based registration and login with robust bcrypt password hashing.
- 👥 **Contact Management** — Comprehensive CRUD contact list acting as your secure address book for tracking targets.
- 🔗 **Shareable Tracking Links** — Instantly generate a unique, tokenized tracking link for any contact.
- 📡 **Live GPS Streaming** — Real-time location streaming over Socket.IO (no page refreshes required).
- 🗺️ **Interactive Map** — Beautiful Leaflet-powered maps featuring movement trails, smooth zoom controls, and live markers.
- 📍 **Reverse Geocoding** — Detailed address breakdowns (road → area → city → state) powered by OpenStreetMap.
- 🔄 **Auto-Refresh Engine** — Locations are intelligently re-sent every 10 minutes to maintain active sessions, even when stationary.
- ⚡ **Instant Kill Switch** — Deleting a session instantly fires a `tracking-stopped` event, killing the broadcast immediately.
- 🛡️ **Admin Dashboard** — A comprehensive control panel for user management, access approvals, and session oversight.
- 📱 **Mobile Ready** — Seamlessly operates on any smartphone browser on the same network without requiring an app download.

---

## 🛠️ Technology Stack

Our stack is meticulously chosen for performance, reliability, and developer experience.

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 18, Vite, TailwindCSS, React Leaflet |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8 via Sequelize ORM (auto-sync, no migrations) |
| **Real-time** | Socket.IO (WebSocket with polling fallback) |
| **Auth** | JSON Web Tokens, bcrypt |
| **Geocoding** | OpenStreetMap Nominatim (free, no API key required) |
| **Email** | Nodemailer (for access approval & rejection notifications) |

---

## 📂 Architecture & Structure

A clean, modular monorepo structure designed for scalability:

```text
location-tracker/
├── client/                         # React + Vite frontend environment
│   ├── src/
│   │   ├── components/             # Reusable UI (Navbar, Modals, LoadingScreen)
│   │   ├── context/                # Global state management (AuthContext)
│   │   ├── hooks/                  # Custom logic (useSocket, useGeolocation)
│   │   ├── pages/                  # Route views (Dashboard, LiveMap, Contacts)
│   │   └── services/               # API clients, Geocoding, Socket integrations
│   └── ...
├── server/                         # Node.js + Express backend environment
│   ├── config/                     # Database connections
│   ├── controllers/                # Business logic (Auth, Contacts, Tracking)
│   ├── middleware/                 # JWT verification, Role checks
│   ├── models/                     # Sequelize models
│   ├── routes/                     # API routing
│   └── server.js                   # Application bootstrap
└── package.json                    # Root workspace configurations
```

---

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Venisbhalara/Contact-Location-Tracker.git
cd Contact-Location-Tracker
```

**2. Install dependencies**
Install all packages across the root, server, and client environments in a single command.
```bash
npm run install:all
```

**3. Database Setup**
Open your MySQL client and create the database:
```sql
CREATE DATABASE contact_tracker;
```
*(Tables are automatically created and synced on the first run via Sequelize `sync({ alter: true })`.)*

**4. Environment Configuration**
Navigate to the server directory and duplicate the example environment file:
```bash
cd server
cp .env.example .env
```
Update `server/.env` with your secure credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=contact_tracker
DB_USER=root
DB_PASSWORD=your_secure_password

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Email Notifications
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**5. Launch the Application**
From the root directory, start both the frontend and backend concurrently:
```bash
npm run dev
```

| Environment | Local URL |
| --- | --- |
| **Frontend** | `http://localhost:3000` |
| **Backend API** | `http://localhost:5000/api` |

---

## 📱 Mobile Access (Local Network)

To track a mobile device during local development (devices must be on the same Wi-Fi):

1. **Find your local IP**:
   ```bash
   # Windows
   ipconfig 
   # Mac/Linux
   ifconfig
   ```
2. **Configure Firewall** (Windows example):
   ```powershell
   netsh advfirewall firewall add rule name="Node Server 5000" dir=in action=allow protocol=TCP localport=5000
   ```
3. **Update `.env`**: Set `CLIENT_URL=http://<YOUR_LOCAL_IP>:3000` in `server/.env`.
4. **Restart the server** and access `http://<YOUR_LOCAL_IP>:3000` on your mobile device.

---

## 🔒 Security Posture

- **Cryptography**: Passwords are hashed with `bcrypt`. Plaintext is never stored.
- **Authentication**: All private routes are secured with `JWT Bearer tokens`.
- **CORS Policies**: Cross-Origin Resource Sharing is strictly limited to your configured `CLIENT_URL`.
- **Ephemeral Tracking**: Tracking tokens automatically expire after **24 hours**.
- **Admin Protection**: Administrative routes require re-verification and enforce account lockouts after 5 failed attempts.

---

## 📚 API Documentation

A comprehensive suite of RESTful endpoints powers the application.

<details>
<summary><strong>Authentication API <code>/api/auth</code></strong></summary>

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | Public | Create a new account |
| `POST` | `/login` | Public | Authenticate and receive JWT |
| `GET` | `/me` | Private | Retrieve authenticated user profile |
</details>

<details>
<summary><strong>Tracking API <code>/api/tracking</code></strong></summary>

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/create` | Private | Generate a new tracking session/link |
| `GET` | `/` | Private | Retrieve all active tracking sessions |
| `GET` | `/:token` | Public | Fetch session details via public token |
| `POST` | `/update-location` | Public | Stream GPS coordinates |
| `DELETE` | `/:id` | Private | Terminate tracking & notify sharer |
</details>

<details>
<summary><strong>Contacts API <code>/api/contacts</code></strong></summary>

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Private | List all contacts (paginated) |
| `POST` | `/` | Private | Create a new contact |
| `PUT` | `/:id` | Private | Update contact details |
| `DELETE` | `/:id` | Private | Remove contact from address book |
</details>

<details>
<summary><strong>Admin API <code>/api/admin</code></strong></summary>

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/dashboard` | Stats: users, sessions, signups, 7-day activity chart |
| `GET` | `/users` | All users with session counts |
| `PUT` | `/users/:id/role` | Promote or demote a user |
| `PUT` | `/users/:id/access` | Grant or revoke tracking access |
| `DELETE` | `/users/:id` | Delete a user and cascade their data |
| `GET` | `/access-requests` | List all pending access requests |
| `PUT` | `/access-requests/:id`| Approve or reject with email notification |
| `GET` | `/tracking-sessions` | View all active tracking sessions |
| `DELETE` | `/tracking-sessions/:id`| Force-terminate any session |
</details>

---

## 🤝 Contributing

We welcome contributions to make Location Tracker even better.
1. **Fork** the repository.
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request.

---

## 📄 License

Distributed under the **ISC License**.

<br />

<div align="center">
  <p>Engineered with precision by <a href="https://github.com/Venisbhalara">Venisbhalara</a></p>
</div>
