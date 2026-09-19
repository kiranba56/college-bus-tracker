import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import type { BusRoute, Stop } from "../../types";
import { Navigation, Locate, Eye, Layers } from "lucide-react";

interface BusTrackerMapProps {
  routes: BusRoute[];
  selectedRouteId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
  highlightedStopId?: string | null;
  onStopClick?: (stop: Stop) => void;
  isMultiFleet?: boolean;
}

export const BusTrackerMap: React.FC<BusTrackerMapProps> = ({
  routes,
  selectedRouteId,
  userLocation,
  highlightedStopId,
  onStopClick,
  isMultiFleet = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const stopMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylinesRef = useRef<Map<string, L.Polyline>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapStyle, setMapStyle] = useState<"standard" | "humanitarian">("standard");

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center around Jain Institute of Technology (JIT) & Bada Cross, Davangere
    const defaultCenter: L.LatLngTuple = [14.4450, 75.9450];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: false,
    });

    // Add zoom control at bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Manage 100% Free OpenStreetMap Tile Layer (No API Key Required)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }

    if (mapStyle === "standard") {
      tileLayerRef.current = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      }).addTo(map);
    }
  }, [mapStyle]);

  const lastFittedRouteIdRef = useRef<string | null>(null);

  // Render Polylines & Stops with distinct START and END (JIT Campus) markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing polylines
    polylinesRef.current.forEach((polyline) => polyline.remove());
    polylinesRef.current.clear();

    // Clear existing stop markers
    stopMarkersRef.current.forEach((marker) => marker.remove());
    stopMarkersRef.current.clear();

    // Determine routes to show
    const routesToDisplay = isMultiFleet
      ? routes
      : routes.filter((r) => !selectedRouteId || r.id === selectedRouteId);

    routesToDisplay.forEach((route) => {
      // 1. Draw Polyline
      const latLngs: L.LatLngTuple[] = route.waypoints.map((w) => [w.lat, w.lng]);
      const polyline = L.polyline(latLngs, {
        color: route.color,
        weight: isMultiFleet ? 4 : 5,
        opacity: isMultiFleet ? 0.7 : 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      polylinesRef.current.set(route.id, polyline);

      // 2. Draw Stops with distinct START (order 1) and END / JIT CAMPUS (last order)
      route.stops.forEach((stop) => {
        const isStart = stop.order === 1;
        const isEnd = stop.order === route.stops.length;
        const isNextStop = route.bus.nextStopId === stop.id;
        const isHighlighted = highlightedStopId === stop.id;

        let stopHtml = "";

        if (isStart) {
          // Distinct START / ORIGIN marker
          stopHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full text-[10px] font-black text-white bg-emerald-600 shadow-lg border border-white whitespace-nowrap mb-1">
                🟢 START: ${stop.name.split(" ")[0]}
              </div>
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-xl border-2 border-white bg-emerald-600 ring-4 ring-emerald-400/40 transition-transform group-hover:scale-125">
                1
              </div>
            </div>
          `;
        } else if (isEnd) {
          // Distinct END / JIT CAMPUS DESTINATION marker
          stopHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full text-[10px] font-black text-white bg-rose-600 shadow-xl border border-white whitespace-nowrap mb-1 animate-pulse">
                🎓 JIT CAMPUS (END)
              </div>
              <div class="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-[11px] font-black shadow-2xl border-2 border-white bg-gradient-to-br from-rose-600 to-red-700 ring-4 ring-rose-400/50 transition-transform group-hover:scale-125">
                JIT
              </div>
            </div>
          `;
        } else {
          // Intermediate stop marker
          stopHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group">
              ${
                isNextStop || isHighlighted
                  ? `<div class="absolute w-8 h-8 rounded-full bg-blue-500/40 pulse-marker-ring"></div>`
                  : ""
              }
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-md border-2 border-white transition-transform group-hover:scale-125"
                   style="background-color: ${isHighlighted ? "#3B82F6" : route.color}">
                ${stop.order}
              </div>
            </div>
          `;
        }

        const stopIcon = L.divIcon({
          html: stopHtml,
          className: "custom-stop-marker",
          iconSize: isStart || isEnd ? [70, 50] : [24, 24],
          iconAnchor: isStart || isEnd ? [35, 45] : [12, 12],
        });

        const stopMarker = L.marker([stop.lat, stop.lng], {
          icon: stopIcon,
          zIndexOffset: isEnd ? 800 : isStart ? 750 : 500,
        }).addTo(map);

        const popupContent = `
          <div class="p-3 min-w-[220px] text-slate-800 font-sans">
            <div class="flex items-center justify-between gap-2 border-b pb-1.5 mb-1.5">
              <span class="font-bold text-sm leading-tight">${stop.name}</span>
              <span class="text-[10px] px-2 py-0.5 rounded font-bold text-white ${
                isStart
                  ? "bg-emerald-600"
                  : isEnd
                  ? "bg-rose-600"
                  : "bg-slate-700"
              }">
                ${isStart ? "🟢 START STOP" : isEnd ? "🎓 JIT CAMPUS" : `Stop #${stop.order}`}
              </span>
            </div>
            <div class="text-xs text-slate-600 space-y-1.5">
              <div>Route: <span class="font-semibold text-slate-800">${route.name}</span></div>
              <div class="bg-slate-50 p-1.5 rounded text-[11px] space-y-0.5 border">
                <div>🌅 Morning Pickup: <strong>${stop.morningPickup || stop.scheduledTime}</strong></div>
                <div>🌆 Evening Drop: <strong>${stop.eveningDrop || "05:25 PM"}</strong></div>
              </div>
              ${
                stop.etaMinutes !== undefined
                  ? `<div class="text-blue-600 font-bold flex items-center gap-1 mt-1 bg-blue-50 p-1 rounded">
                      <span>Live ETA from Bus:</span>
                      <span>~${stop.etaMinutes} mins</span>
                      ${stop.distanceFromBusKm ? `<span class="text-slate-400 font-normal">(${stop.distanceFromBusKm} km)</span>` : ""}
                    </div>`
                  : ""
              }
            </div>
          </div>
        `;

        stopMarker.bindPopup(popupContent);
        stopMarker.on("click", () => {
          if (onStopClick) onStopClick(stop);
        });

        stopMarkersRef.current.set(`${route.id}-${stop.id}`, stopMarker);
      });
    });

    // Auto-fit bounds ONLY when route selection changes (not on every 1s bus tick)
    if (selectedRouteId && selectedRouteId !== lastFittedRouteIdRef.current) {
      lastFittedRouteIdRef.current = selectedRouteId;
      const targetRoute = routes.find((r) => r.id === selectedRouteId);
      if (targetRoute && targetRoute.waypoints.length > 0) {
        const bounds = L.latLngBounds(targetRoute.waypoints.map((w) => [w.lat, w.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    } else if (isMultiFleet && lastFittedRouteIdRef.current !== "all") {
      lastFittedRouteIdRef.current = "all";
      const allPoints: L.LatLngTuple[] = [];
      routes.forEach((r) => r.waypoints.forEach((w) => allPoints.push([w.lat, w.lng])));
      if (allPoints.length > 0) {
        map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
      }
    }
  }, [selectedRouteId, highlightedStopId, isMultiFleet, routes.length]);

  // Update Live Bus Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const routesToDisplay = isMultiFleet
      ? routes
      : routes.filter((r) => !selectedRouteId || r.id === selectedRouteId);

    // Keep track of current bus IDs
    const activeBusIds = new Set<string>();

    routesToDisplay.forEach((route) => {
      const bus = route.bus;
      activeBusIds.add(bus.id);

      // Bus SVG Icon with dynamic rotation heading
      const busSvgHtml = `
        <div class="bus-marker-container relative flex flex-col items-center cursor-pointer group">
          <!-- Live Status Badge -->
          <div class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-lg whitespace-nowrap mb-1 flex items-center space-x-1 border border-white/60 transition-transform group-hover:scale-110"
               style="background-color: ${route.color}">
            <span>${bus.busNumber}</span>
            <span class="opacity-80">|</span>
            <span>${bus.speed} km/h</span>
          </div>

          <!-- Rotating Bus Body -->
          <div class="relative flex items-center justify-center p-2 rounded-2xl bg-white shadow-2xl border-2 border-slate-900 transition-all group-hover:scale-110"
               style="box-shadow: 0 0 15px ${route.color}66;">
            <div style="transform: rotate(${bus.heading || 0}deg); transition: transform 0.6s ease-out;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="${route.color}" stroke="#0f172a" stroke-width="1.2">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <path d="M7 6h10M7 10h10M6 18h2M16 18h2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                <!-- Front arrow indicator -->
                <polygon points="12,1 15,4 9,4" fill="#ef4444" stroke="none" />
              </svg>
            </div>
            ${
              bus.status === "At Stop"
                ? `<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>`
                : ""
            }
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        html: busSvgHtml,
        className: "custom-bus-marker",
        iconSize: [44, 44],
        iconAnchor: [22, 28],
      });

      let marker = busMarkersRef.current.get(bus.id);

      if (!marker) {
        marker = L.marker([bus.lat, bus.lng], { icon: busIcon, zIndexOffset: 1000 }).addTo(map);
        busMarkersRef.current.set(bus.id, marker);
      } else {
        marker.setLatLng([bus.lat, bus.lng]);
        marker.setIcon(busIcon);
      }

      // Popup Content for Bus
      const busPopupContent = `
        <div class="p-3 min-w-[220px] text-slate-800 font-sans">
          <div class="flex items-center justify-between border-b pb-2 mb-2">
            <div>
              <h4 class="font-bold text-sm">${bus.busNumber}</h4>
              <p class="text-[11px] text-slate-500">${bus.plateNumber}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded font-semibold ${
              bus.status === "At Stop"
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
            }">${bus.status}</span>
          </div>

          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Driver:</span>
              <span class="font-medium text-slate-700">${bus.driverName}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-500">Contact:</span>
              <a href="tel:${bus.driverPhone.replace(/[^\d+]/g, '')}" class="font-bold text-emerald-700 hover:underline font-mono">${bus.driverPhone}</a>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Speed:</span>
              <span class="font-medium text-slate-700">${bus.speed} km/h</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Traffic:</span>
              <span class="font-medium ${
                bus.trafficStatus === "Heavy"
                  ? "text-rose-600 font-bold"
                  : bus.trafficStatus === "Moderate"
                  ? "text-amber-600 font-bold"
                  : "text-emerald-600"
              }">${bus.trafficStatus}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Occupancy:</span>
              <span class="font-semibold">${bus.passengers} / ${bus.capacity} seats</span>
            </div>
            ${
              bus.nextStopName
                ? `<div class="bg-blue-50 text-blue-800 p-1.5 rounded mt-2 text-xs">
                    Next Stop: <strong>${bus.nextStopName}</strong>
                    ${bus.etaMinutesToNextStop ? ` (~${bus.etaMinutesToNextStop}m)` : ""}
                   </div>`
                : ""
            }
            <a
              href="tel:${bus.driverPhone.replace(/[^\d+]/g, '')}"
              class="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow transition-colors text-center w-full mt-2.5 no-underline cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Call Driver Mobile</span>
            </a>
          </div>
        </div>
      `;
      marker.bindPopup(busPopupContent);
    });

    // Remove any buses no longer in view
    busMarkersRef.current.forEach((marker, id) => {
      if (!activeBusIds.has(id)) {
        marker.remove();
        busMarkersRef.current.delete(id);
      }
    });
  }, [routes, selectedRouteId, isMultiFleet]);

  // User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-blue-600/30 pulse-marker-ring"></div>
          <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        html: userHtml,
        className: "custom-user-marker",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 900,
        }).addTo(map);
        userMarkerRef.current.bindPopup(
          '<div class="p-2 text-xs font-semibold">📍 Your Current Location</div>'
        );
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  // Map Controls
  const handleRecenterBus = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
    if (activeRoute) {
      map.flyTo([activeRoute.bus.lat, activeRoute.bus.lng], 15, { duration: 1 });
    }
  };

  const handleFitRoute = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const activeRoute = routes.find((r) => r.id === selectedRouteId);
    if (activeRoute && activeRoute.waypoints.length > 0) {
      const bounds = L.latLngBounds(activeRoute.waypoints.map((w) => [w.lat, w.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (isMultiFleet) {
      const allPoints: L.LatLngTuple[] = [];
      routes.forEach((r) => r.waypoints.forEach((w) => allPoints.push([w.lat, w.lng])));
      if (allPoints.length > 0) {
        map.fitBounds(L.latLngBounds(allPoints), { padding: [30, 30] });
      }
    }
  };

  const handleCenterUser = () => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;
    map.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1 });
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        <button
          onClick={handleRecenterBus}
          className="bg-white/95 hover:bg-white text-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 backdrop-blur-sm flex items-center space-x-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          title="Track Bus"
        >
          <Navigation className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Track Bus</span>
        </button>

        <button
          onClick={handleFitRoute}
          className="bg-white/95 hover:bg-white text-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 backdrop-blur-sm flex items-center space-x-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          title="Fit Full Route"
        >
          <Eye className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Full Route</span>
        </button>

        <button
          onClick={() => setMapStyle((prev) => (prev === "standard" ? "humanitarian" : "standard"))}
          className="bg-white/95 hover:bg-white text-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 backdrop-blur-sm flex items-center space-x-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          title={`Switch Map: ${mapStyle === "standard" ? "Humanitarian Transit" : "Standard OpenStreetMap"}`}
        >
          <Layers className="w-4 h-4 text-purple-600" />
          <span className="hidden sm:inline">
            {mapStyle === "standard" ? "Transit Map" : "Standard Map"}
          </span>
        </button>

        {userLocation && (
          <button
            onClick={handleCenterUser}
            className="bg-white/95 hover:bg-white text-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 backdrop-blur-sm flex items-center space-x-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            title="My Location"
          >
            <Locate className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Me</span>
          </button>
        )}
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700/60 hidden sm:flex items-center space-x-3">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-slate-300">Live Bus</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          <span className="text-slate-300">Stops</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-slate-300">At Stop</span>
        </div>
      </div>
    </div>
  );
};
