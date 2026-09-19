# CampusRide - College Bus Live-Tracking & Real-Time ETA System

A comprehensive, production-grade real-time GPS tracking web platform built for university campuses. Designed to eliminate transit uncertainty for students, empower drivers with live telemetry tools, and give campus transit dispatchers a command center overview.

---

## 🌟 Key Features

### 🎓 1. Student Live-Tracking View
- **Interactive Leaflet Map**: OpenStreetMap vector tiles, smooth bus movements, stop markers, and road-following polylines.
- **Dynamic Bus Heading & Rotation**: Buses smoothly rotate to match the direction of road travel with real-time speed indicators (km/h).
- **Intelligent Dynamic ETA Engine**: Computes realistic arrival times factoring in road distance (Haversine formula), real-time speed, upcoming stop dwell times, and live traffic conditions.
- **Seat Occupancy Gauge**: Live student count and capacity gauge (`28 / 45 seats - 62% Occupied - Seats Available`).
- **Proximity Notification Bell**: Audio chime and alert banner when the bus approaches within 4 minutes / 500 meters of the student's stop.
- **Find Nearest Stop**: Automatically detects user location and pinpoints the closest campus bus stop with walking distance (km) and estimated walking time.
- **Interactive Stop Timetable**: Timeline view of scheduled vs real-time ETA for each stop along the route.
- **Driver Contact**: 1-tap call button to contact the on-duty driver.

### 🚌 2. Driver Cockpit Terminal
- **Dual GPS Transmission Modes**:
  - **Real Device Mobile GPS**: Uses HTML5 Geolocation API (`navigator.geolocation.watchPosition`) to transmit actual smartphone GPS coordinates, accuracy, and speed to the server and all students.
  - **Autonomous Road Simulator**: High-fidelity GPS route simulator with speed multipliers (1x, 2x, 4x, 8x) for testing without moving outside.
- **Passenger Boarding Counter**: Large `+` and `-` buttons (plus `+5` / `-5` quick chips) to update onboard student counts in real-time.
- **Traffic Condition Reporter**: 1-tap buttons (`Normal`, `Moderate Delay`, `Heavy Jam`) that dynamically adjust ETAs across the system.
- **Incident Broadcast**: Instantly notify dispatchers and students of delays or vehicle issues.

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
