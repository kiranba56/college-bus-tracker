/**
 * Autonomous GPS Route Simulator with realistic traffic & stop dwell dynamics
 */

import { getDistanceKm, calculateBearing, calculateEtaMinutes, interpolate } from "./geoUtils.js";

export class BusSimulator {
  constructor(routes, io) {
    this.routes = routes;
    this.io = io;
    this.intervalId = null;
    this.busStates = new Map();

    this.initStates();
  }

  initStates() {
    this.routes.forEach((route) => {
      this.busStates.set(route.bus.id, {
        routeId: route.id,
        currentWaypointIndex: route.bus.currentWaypointIndex || 0,
        segmentProgress: 0, // 0.0 to 1.0 between current and next waypoint
        dwellSecondsRemaining: 0,
        isSimulated: route.bus.isSimulated ?? true,
        simulationSpeed: route.bus.simulationSpeed || 1,
        trafficStatus: route.bus.trafficStatus || "Normal",
      });
    });
  }

  start(tickMs = 1000) {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.tick();
    }, tickMs);

    console.log(`[Simulator] GPS Engine active (tick: ${tickMs}ms)`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  tick() {
    this.routes.forEach((route) => {
      const state = this.busStates.get(route.bus.id);
      if (!state || !state.isSimulated) return;

      // Check if bus is currently dwelling at a stop
      if (state.dwellSecondsRemaining > 0) {
        state.dwellSecondsRemaining -= 1;
        route.bus.status = "At Stop";
        route.bus.speed = 0;
        if (state.dwellSecondsRemaining === 0) {
          route.bus.status = "In Transit";
        }
        this.emitBusUpdate(route);
        return;
      }

      // Traffic speed factor
      let trafficMultiplier = 1.0;
      if (state.trafficStatus === "Moderate") trafficMultiplier = 0.75;
      if (state.trafficStatus === "Heavy") trafficMultiplier = 0.45;

      const baseSpeedKmh = 35 * trafficMultiplier * state.simulationSpeed;
      // Step fraction per second: roughly speed / segment length
      const stepDelta = 0.08 * state.simulationSpeed * trafficMultiplier;

      state.segmentProgress += stepDelta;

      const waypoints = route.waypoints;
      const curIndex = state.currentWaypointIndex;
      const nextIndex = (curIndex + 1) % waypoints.length;

      const p1 = waypoints[curIndex];
      const p2 = waypoints[nextIndex];

      if (state.segmentProgress >= 1) {
        // Move to next waypoint
        state.segmentProgress = 0;
        state.currentWaypointIndex = nextIndex;

        // Check if close to any stop
        const currentCoord = waypoints[nextIndex];
        const closestStop = route.stops.find((s) => {
          return getDistanceKm(currentCoord.lat, currentCoord.lng, s.lat, s.lng) < 0.05; // 50m
        });

        if (closestStop) {
          state.dwellSecondsRemaining = 4; // Dwell for 4 ticks
          route.bus.status = "At Stop";
          route.bus.speed = 0;
          // Fluctuate passengers slightly
          const delta = Math.floor(Math.random() * 5) - 2;
          route.bus.passengers = Math.max(5, Math.min(route.bus.capacity, route.bus.passengers + delta));
        }
      }

      // Interpolate position
      const currentP1 = waypoints[state.currentWaypointIndex];
      const currentP2 = waypoints[(state.currentWaypointIndex + 1) % waypoints.length];
      const currentPos = interpolate(currentP1, currentP2, state.segmentProgress);

      const bearing = calculateBearing(currentP1.lat, currentP1.lng, currentP2.lat, currentP2.lng);

      route.bus.lat = currentPos.lat;
      route.bus.lng = currentPos.lng;
      route.bus.heading = bearing;
      route.bus.speed = Math.round(baseSpeedKmh + (Math.random() * 4 - 2));

      // Calculate upcoming next stop and dynamic ETAs
      this.updateNextStopAndEtas(route);

      this.emitBusUpdate(route);
    });
  }

  updateNextStopAndEtas(route) {
    const bus = route.bus;
    let minDistance = Infinity;
    let nextStop = route.stops[0];

    // Compute distance and dynamic ETA for every stop on route
    route.stops.forEach((stop, index) => {
      const distKm = getDistanceKm(bus.lat, bus.lng, stop.lat, stop.lng);
      stop.distanceFromBusKm = parseFloat(distKm.toFixed(2));
      stop.etaMinutes = calculateEtaMinutes(
        distKm,
        bus.speed,
        Math.max(0, index),
        bus.trafficStatus === "Heavy" ? 1.8 : bus.trafficStatus === "Moderate" ? 1.3 : 1.0
      );

      if (distKm < minDistance) {
        minDistance = distKm;
        nextStop = stop;
      }
    });

    bus.nextStopId = nextStop.id;
    bus.nextStopName = nextStop.name;
    bus.etaMinutesToNextStop = nextStop.etaMinutes;
  }

  emitBusUpdate(route) {
    if (!this.io) return;
    const payload = {
      routeId: route.id,
      bus: route.bus,
      stops: route.stops,
    };
    this.io.emit("bus_update", payload);
  }

  setManualLocation(busId, { lat, lng, speed, heading }) {
    const route = this.routes.find((r) => r.bus.id === busId);
    if (!route) return;

    const state = this.busStates.get(busId);
    if (state) {
      state.isSimulated = false;
    }

    route.bus.isSimulated = false;
    route.bus.lat = lat;
    route.bus.lng = lng;
    if (speed !== undefined) route.bus.speed = speed;
    if (heading !== undefined) route.bus.heading = heading;

    this.updateNextStopAndEtas(route);
    this.emitBusUpdate(route);
  }

  resumeSimulation(busId, speedMultiplier = 1) {
    const route = this.routes.find((r) => r.bus.id === busId);
    if (!route) return;

    const state = this.busStates.get(busId);
    if (state) {
      state.isSimulated = true;
      state.simulationSpeed = speedMultiplier;
    }
    route.bus.isSimulated = true;
    route.bus.simulationSpeed = speedMultiplier;
    this.emitBusUpdate(route);
  }

  setTrafficStatus(busId, trafficStatus) {
    const route = this.routes.find((r) => r.bus.id === busId);
    if (!route) return;

    const state = this.busStates.get(busId);
    if (state) {
      state.trafficStatus = trafficStatus;
    }
    route.bus.trafficStatus = trafficStatus;
    this.updateNextStopAndEtas(route);
    this.emitBusUpdate(route);
  }

  updatePassengers(busId, passengerCount) {
    const route = this.routes.find((r) => r.bus.id === busId);
    if (!route) return;

    route.bus.passengers = Math.max(0, Math.min(route.bus.capacity, passengerCount));
    this.emitBusUpdate(route);
  }
}
