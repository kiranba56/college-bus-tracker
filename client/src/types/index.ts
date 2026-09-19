export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
  scheduledTime: string;
  morningPickup?: string;
  eveningDrop?: string;
  distanceFromBusKm?: number;
  etaMinutes?: number;
}

export interface Waypoint {
  lat: number;
  lng: number;
}

export interface Bus {
  id: string;
  busNumber: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  passengers: number;
  status: "In Transit" | "At Stop" | "Delayed" | "Idle";
  speed: number;
  heading: number;
  lat: number;
  lng: number;
  nextStopId?: string;
  nextStopName?: string;
  etaMinutesToNextStop?: number;
  currentWaypointIndex?: number;
  isSimulated: boolean;
  simulationSpeed?: number;
  trafficStatus: "Normal" | "Moderate" | "Heavy";
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  name: string;
  color: string;
  description: string;
  operatingHours: string;
  frequency: string;
  stops: Stop[];
  waypoints: Waypoint[];
  bus: Bus;
}

export interface AlertMessage {
  id: string;
  type: "info" | "warning" | "emergency";
  title: string;
  message: string;
  timestamp: string;
  routeId?: string | null;
}

export interface NearestStopResult {
  stop: Stop & { routeName?: string; routeColor?: string; routeId?: string };
  distanceKm: number;
  walkingMinutes: number;
}

export type UserRole = "student" | "driver" | "admin";
