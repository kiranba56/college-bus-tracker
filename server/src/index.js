import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { INITIAL_ROUTES, INITIAL_ALERTS } from "./routesData.js";
import { BusSimulator } from "./simulator.js";
import { findNearestStop } from "./geoUtils.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({ origin: "*" }));
app.use(express.json());

// In-memory state
let routes = JSON.parse(JSON.stringify(INITIAL_ROUTES));
let alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Simulator Engine
const simulator = new BusSimulator(routes, io);
simulator.start(1000);

// --- REST Endpoints ---

// Get all routes, stops, and current bus state
app.get("/api/routes", (req, res) => {
  res.json({ success: true, data: routes });
});

// Get all buses
app.get("/api/buses", (req, res) => {
  const buses = routes.map((r) => ({
    routeId: r.id,
    routeName: r.name,
    routeColor: r.color,
    ...r.bus,
  }));
  res.json({ success: true, data: buses });
});

// Get alerts
app.get("/api/alerts", (req, res) => {
  res.json({ success: true, data: alerts });
});

// Post a new announcement/alert
app.post("/api/alerts", (req, res) => {
  const { title, message, type = "info", routeId = null } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, error: "Title and message are required" });
  }

  const newAlert = {
    id: `alert-${Date.now()}`,
    type,
    title,
    message,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    routeId,
  };

  alerts.unshift(newAlert);
  // Keep latest 20 alerts
  if (alerts.length > 20) alerts.pop();

  io.emit("new_alert", newAlert);
  res.status(201).json({ success: true, data: newAlert });
});

// Find nearest stop for student
app.post("/api/nearest-stop", (req, res) => {
  const { lat, lng, routeId } = req.body;
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ success: false, error: "Coordinates lat & lng required" });
  }

  let stopPool = [];
  if (routeId) {
    const route = routes.find((r) => r.id === routeId);
    stopPool = route ? route.stops : [];
  } else {
    // Search across all stops
    routes.forEach((r) => {
      r.stops.forEach((s) => {
        stopPool.push({ ...s, routeName: r.name, routeColor: r.color, routeId: r.id });
      });
    });
  }

  if (stopPool.length === 0) {
    return res.status(404).json({ success: false, error: "No stops found" });
  }

  const result = findNearestStop(Number(lat), Number(lng), stopPool);
  res.json({ success: true, data: result });
});

// --- Socket.IO Event Handlers ---

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Send initial full fleet state & alerts
  socket.emit("init_state", {
    routes,
    alerts,
  });

  // Driver emits GPS coordinates from mobile browser Geolocation API
  socket.on("driver_gps_update", (data) => {
    const { busId, lat, lng, speed, heading } = data;
    simulator.setManualLocation(busId, { lat, lng, speed, heading });
  });

  // Driver toggles simulation or changes speed multiplier (1x, 2x, 5x)
  socket.on("driver_simulation_toggle", (data) => {
    const { busId, isSimulated, speedMultiplier } = data;
    if (isSimulated) {
      simulator.resumeSimulation(busId, speedMultiplier || 1);
    } else {
      const state = simulator.busStates.get(busId);
      if (state) state.isSimulated = false;
      const r = routes.find((route) => route.bus.id === busId);
      if (r) r.bus.isSimulated = false;
    }
  });

  // Driver reports traffic condition
  socket.on("driver_traffic_update", (data) => {
    const { busId, trafficStatus } = data;
    simulator.setTrafficStatus(busId, trafficStatus);
  });

  // Driver updates passenger tally
  socket.on("driver_passenger_update", (data) => {
    const { busId, passengers } = data;
    simulator.updatePassengers(busId, passengers);
  });

  // Admin broadcasts alert
  socket.on("admin_broadcast_alert", (alertData) => {
    const alert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ...alertData,
    };
    alerts.unshift(alert);
    io.emit("new_alert", alert);
  });

  // Admin resets fleet to starting positions
  socket.on("admin_reset_fleet", () => {
    routes = JSON.parse(JSON.stringify(INITIAL_ROUTES));
    simulator.routes = routes;
    simulator.initStates();
    io.emit("fleet_reset", routes);
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚌 College Bus Tracker Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready & GPS Simulation active`);
  console.log(`=================================================\n`);
});
