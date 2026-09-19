# CampusRide - JIT Davangere College Bus Live-Tracking System

A real-time GPS tracking web platform built for **Jain Institute of Technology (JIT), Davangere** (located near Bada Cross on PB Road / NH-48). Designed to eliminate transit uncertainty for students, empower bus drivers with live telemetry tools, and provide transit dispatchers with a command center overview.

---

## 🌟 Key Features

### 🎓 1. Student Live-Tracking Portal
- **University USN Login Gate**: Secure authentication with student USN and matching password (`password === usn`) featuring 1-click test accounts (`4JD21CS045`, etc.).
- **4 JIT Campus Routes** (5+ pickup/drop stops each):
  1. **Route 101**: Vidyanagar to JIT Campus (near Bada Cross)
  2. **Route 202**: BIET to JIT Campus (near Bada Cross)
  3. **Route 303**: Harihara to JIT Campus (near Bada Cross)
  4. **Route 404**: Channagiri to JIT Campus (near Bada Cross)
- **College Hours Timetable (09:00 AM – 05:00 PM)**:
  - Morning Inbound: All 4 buses arrive at campus by 08:50 AM (10 mins before classes start).
  - Evening Return: Dispersal departures begin at 05:15 PM (15 mins after classes end).
  - Shift switcher: Toggle between 🌅 Morning and 🌆 Evening timings.
- **Interactive Leaflet Map**: Keyless OpenStreetMap tiles with distinct **🟢 START** and **🎓 JIT CAMPUS (END)** pins.
- **Dynamic Bus Heading & Rotation**: Buses smoothly rotate to match road travel with speed indicators (km/h).
- **Intelligent Dynamic ETA Engine**: Computes realistic arrival times factoring in road distance, live speed, upcoming stop dwell times, and traffic conditions.
- **Direct Driver Mobile Calling & WhatsApp**:
  - 1-Tap Call Driver button triggers the native smartphone phone dialer (`tel:+91...`).
  - Quick WhatsApp chat button with pre-filled route inquiry text.
  - 1-Click Copy Number with visual feedback.
  - Floating Mobile Quick-Call button pinned to the bottom-right on mobile devices.
  - Map Marker Call Button: Tap any bus on the map to call the driver directly from the popup.
- **Seat Occupancy Gauge**: Live student count and capacity gauge (`28 / 45 seats`).
- **Proximity Notification**: Web Audio synthesised chime and alert banner when the bus is within 4 minutes.
- **Find Nearest Stop**: Automatically pinpoints the closest campus bus stop with walking distance (km) and walking time.

### 🚌 2. Driver Cockpit Terminal
- **Dual GPS Transmission Modes**:
  - **Real Device Mobile GPS**: Uses HTML5 Geolocation API (`navigator.geolocation.watchPosition`) to transmit smartphone GPS coordinates.
  - **Autonomous Road Simulator**: High-fidelity GPS route simulator with speed multipliers (1x, 2x, 4x, 8x).
- **Passenger Boarding Counter**: `+` and `-` buttons to update student count in real-time.
- **Traffic Condition Reporter**: 1-tap buttons (`Normal`, `Moderate Delay`, `Heavy Jam`) that adjust ETAs across the system.
- **Incident Broadcast**: Instantly notify dispatchers and students of delays.

### 🛡️ 3. Dispatcher Admin Command Center
- **Unified Campus Fleet Radar**: View all 4 routes and buses on a single comprehensive university map.
- **Fleet Health Metrics**: Active fleet count, total students in transit, system-wide on-time percentage, and active traffic alerts.
- **Fleet Roster Table**: Live view of bus registration, driver names, phone numbers, vehicle speed, next stop, occupancy progress bars, and traffic status.
- **Instant Announcement Broadcaster**: Dispatch campus-wide or route-specific announcements (Info, Warning, Emergency) that pop up on student apps via WebSockets.
- **Demo Reset Tool**: Re-center and reset all bus simulation states with a single click.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
Clone or navigate to the project directory:
```bash
cd college-bus-tracker
npm install
npm run install:all
```

### Running the App (Single Command)
Run both the Node.js WebSocket backend and Vite React frontend concurrently:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173/`
- **Backend API & WebSockets**: `http://localhost:5000/`

---

## 📁 Project Architecture

```
college-bus-tracker/
├── package.json                 # Monorepo root script orchestration
├── server/                      # Express + Socket.IO Backend
│   ├── package.json
│   └── src/
│       ├── index.js             # REST endpoints & WebSocket event handlers
│       ├── routesData.js        # University routes, stops, schedules & fleet data
│       ├── geoUtils.js          # Haversine distance, ETA, bearing & nearest stop logic
│       └── simulator.js         # Autonomous road-following GPS simulator
└── client/                      # React 19 + Vite + TypeScript + Tailwind CSS Frontend
    ├── package.json
    ├── vite.config.ts           # Tailwind plugin & backend proxy configuration
    ├── index.html
    └── src/
        ├── types/index.ts       # Typed models (Bus, Stop, BusRoute, AlertMessage)
        ├── services/socket.ts   # Resilient WebSocket client connector
        ├── components/
        │   ├── Navbar.tsx       # Role switcher & live connectivity pill
        │   ├── AlertBanner.tsx  # Broadcast emergency / delay banner
        │   ├── Map/
        │   │   └── BusTrackerMap.tsx # Leaflet map with custom rotating SVG markers
        │   ├── Student/
        │   │   └── StudentView.tsx   # Student mobile-first live tracker & timetable
        │   ├── Driver/
        │   │   └── DriverConsole.tsx # Driver cockpit with GPS & passenger tally
        │   └── Admin/
        │       └── AdminDashboard.tsx# Fleet command center & emergency dispatcher
        ├── App.tsx              # Root app orchestrator
        ├── main.tsx
        └── index.css            # Tailwind CSS v4 & Leaflet animations
```

---

## 📡 REST API & WebSocket Events

### REST Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/routes` | Returns all routes, stops, schedules, and bus telemetry |
| `GET` | `/api/buses` | Returns list of all active fleet vehicles |
| `GET` | `/api/alerts` | Returns recent campus transit announcements |
| `POST` | `/api/alerts` | Creates and broadcasts a new transit alert |
| `POST` | `/api/nearest-stop` | Computes nearest bus stop from given `{ lat, lng }` |

### WebSocket Events (Socket.IO)
| Event | Direction | Payload | Description |
|---|---|---|---|
| `init_state` | Server → Client | `{ routes, alerts }` | Sent on connection |
| `bus_update` | Server → Client | `{ routeId, bus, stops }` | Real-time GPS & ETA tick |
| `new_alert` | Server → Client | `AlertMessage` | Broadcast alert |
| `driver_gps_update` | Client → Server | `{ busId, lat, lng, speed, heading }` | Mobile GPS stream |
| `driver_passenger_update` | Client → Server | `{ busId, passengers }` | Boarding counter |
| `driver_traffic_update` | Client → Server | `{ busId, trafficStatus }` | Live traffic report |
| `admin_broadcast_alert` | Client → Server | `{ type, title, message, routeId }` | Dispatcher announcement |
| `admin_reset_fleet` | Client → Server | - | Reset fleet to starting positions |

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Leaflet.js
- **Backend**: Node.js, Express, Socket.IO, CORS, Dotenv
- **Map Provider**: OpenStreetMap / CartoDB Voyager (No API key or billing required)
- **Geolocation**: HTML5 Geolocation API + Haversine Spherical Trigonometry
