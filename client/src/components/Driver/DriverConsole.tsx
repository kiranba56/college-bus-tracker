import React, { useState, useEffect, useRef } from "react";
import type { BusRoute } from "../../types";
import { socket } from "../../services/socket";
import {
  Bus,
  Play,
  Square,
  Radio,
  Users,
  Plus,
  Minus,
  CheckCircle,
} from "lucide-react";

interface DriverConsoleProps {
  routes: BusRoute[];
}

export const DriverConsole: React.FC<DriverConsoleProps> = ({ routes }) => {
  const [selectedBusId, setSelectedBusId] = useState<string>(routes[0]?.bus.id || "bus-01");
  const [isTripActive, setIsTripActive] = useState<boolean>(true);
  const [useDeviceGps, setUseDeviceGps] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [deviceGpsCoords, setDeviceGpsCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    speed: number | null;
  } | null>(null);
  const [sosSent, setSosSent] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);

  const currentRoute = routes.find((r) => r.bus.id === selectedBusId) || routes[0];
  const bus = currentRoute?.bus;

  // Handle Real Device GPS Tracking
  useEffect(() => {
    if (useDeviceGps && isTripActive) {
      if ("geolocation" in navigator) {
        // Disable simulation on server
        socket.emit("driver_simulation_toggle", { busId: selectedBusId, isSimulated: false });

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const coords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy),
              speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 25,
            };
            setDeviceGpsCoords(coords);

            // Broadcast GPS update
            socket.emit("driver_gps_update", {
              busId: selectedBusId,
              lat: coords.lat,
              lng: coords.lng,
              speed: coords.speed,
              heading: pos.coords.heading || 0,
            });
          },
          (err) => {
            console.warn("Device GPS error:", err.message);
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        );
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setDeviceGpsCoords(null);
      // Resume simulation if trip is active
      if (isTripActive) {
        socket.emit("driver_simulation_toggle", {
          busId: selectedBusId,
          isSimulated: true,
          speedMultiplier: simSpeed,
        });
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [useDeviceGps, isTripActive, selectedBusId, simSpeed]);

  if (!currentRoute || !bus) return null;

  // Passenger tally actions
  const handlePassengerChange = (delta: number) => {
    const updated = Math.max(0, Math.min(bus.capacity, bus.passengers + delta));
    socket.emit("driver_passenger_update", { busId: bus.id, passengers: updated });
  };

  // Traffic status
  const handleTrafficChange = (status: "Normal" | "Moderate" | "Heavy") => {
    socket.emit("driver_traffic_update", { busId: bus.id, trafficStatus: status });
  };

  // Speed multiplier
  const handleSpeedMultiplier = (mult: number) => {
    setSimSpeed(mult);
    if (!useDeviceGps) {
      socket.emit("driver_simulation_toggle", {
        busId: bus.id,
        isSimulated: true,
        speedMultiplier: mult,
      });
    }
  };

  // Send SOS Alert
  const handleReportIssue = (issueType: string) => {
    socket.emit("admin_broadcast_alert", {
      type: "warning",
      title: `Delay Notice: ${bus.busNumber}`,
      message: `Driver reported ${issueType} on Route ${currentRoute.routeNumber}. Expect 10m delay.`,
      routeId: currentRoute.id,
    });
    setSosSent(true);
    setTimeout(() => setSosSent(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Bus Switcher */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg">
            <Bus className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Driver Operations Terminal
            </span>
            <h2 className="text-xl font-bold">{bus.busNumber} Cockpit</h2>
            <p className="text-xs text-slate-400">
              Driver: {bus.driverName} · Reg: {bus.plateNumber}
            </p>
          </div>
        </div>

        {/* Bus / Route Selector */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label className="text-xs text-slate-300 font-medium">Switch Bus:</label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {routes.map((r) => (
              <option key={r.bus.id} value={r.bus.id}>
                {r.bus.busNumber} - {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SOS Banner Confirmation */}
      {sosSent && (
        <div className="bg-emerald-500 text-white p-3.5 rounded-xl shadow font-semibold text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Alert successfully broadcasted to student app and dispatchers.</span>
        </div>
      )}

      {/* Main Cockpit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* GPS Mode & Broadcast Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>GPS Telemetry Transmitter</span>
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isTripActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {isTripActive ? "BROADCASTING" : "STANDBY"}
            </span>
          </div>

          {/* Toggle Trip Start/Stop */}
          <div className="flex space-x-2">
            <button
              onClick={() => setIsTripActive(true)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isTripActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Trip Active</span>
            </button>
            <button
              onClick={() => {
                setIsTripActive(false);
                socket.emit("driver_simulation_toggle", { busId: bus.id, isSimulated: false });
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isTripActive
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Square className="w-4 h-4" />
              <span>Pause / Park</span>
            </button>
          </div>

          {/* GPS Mode Selection (Device vs Autonomous Simulation) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {useDeviceGps ? "Real Device GPS" : "Autonomous Route Simulator"}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {useDeviceGps
                    ? "Transmitting live mobile hardware coordinates"
                    : "Simulating route waypoints automatically"}
                </p>
              </div>
              <button
                onClick={() => setUseDeviceGps(!useDeviceGps)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  useDeviceGps
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                {useDeviceGps ? "Using Device" : "Use Real GPS"}
              </button>
            </div>

            {useDeviceGps && deviceGpsCoords && (
              <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 font-mono space-y-0.5">
                <div>Lat: {deviceGpsCoords.lat.toFixed(6)}</div>
                <div>Lng: {deviceGpsCoords.lng.toFixed(6)}</div>
                <div>Accuracy: ±{deviceGpsCoords.accuracy} meters</div>
              </div>
            )}

            {!useDeviceGps && (
              <div>
                <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                  Simulator Speed Multiplier:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 4, 8].map((mult) => (
                    <button
                      key={mult}
                      onClick={() => handleSpeedMultiplier(mult)}
                      className={`py-1 rounded text-xs font-bold transition-all ${
                        simSpeed === mult
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {mult}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Telemetry */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Current Speed
              </span>
              <span className="text-2xl font-black text-slate-800">{bus.speed}</span>
              <span className="text-xs text-slate-500 ml-1">km/h</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Compass Heading
              </span>
              <span className="text-2xl font-black text-slate-800">{bus.heading}°</span>
              <span className="text-xs text-slate-500 ml-1">deg</span>
            </div>
          </div>
        </div>

        {/* Passenger Boarding Counter & Traffic Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Passenger Tally & Occupancy</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Capacity: {bus.capacity}
            </span>
          </div>

          {/* Passenger Counter Box */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Onboard Students</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold">{bus.passengers}</span>
                <span className="text-xs text-slate-400">/ {bus.capacity} seats</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePassengerChange(-1)}
                className="w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center font-bold text-xl active:scale-95 transition-all"
                title="1 student alight"
              >
                <Minus className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePassengerChange(1)}
                className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold text-xl active:scale-95 transition-all shadow-lg shadow-emerald-600/40"
                title="1 student boarded"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Increment Chips (+5, -5) */}
          <div className="flex space-x-2">
            <button
              onClick={() => handlePassengerChange(-5)}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
            >
              -5 Alighted
            </button>
            <button
              onClick={() => handlePassengerChange(5)}
              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
            >
              +5 Boarded
            </button>
          </div>

          {/* Traffic Condition Reporting */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-700">Report Live Traffic Condition:</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTrafficChange("Normal")}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  bus.trafficStatus === "Normal"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                🟢 Normal
              </button>
              <button
                onClick={() => handleTrafficChange("Moderate")}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  bus.trafficStatus === "Moderate"
                    ? "bg-amber-50 border-amber-500 text-amber-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                🟡 Moderate
              </button>
              <button
                onClick={() => handleTrafficChange("Heavy")}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  bus.trafficStatus === "Heavy"
                    ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                🔴 Jam / Heavy
              </button>
            </div>
          </div>

          {/* Instant Delay Report Actions */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Quick Incident Broadcast:</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => handleReportIssue("Dense Traffic Congestion")}
                className="flex-1 py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold text-center"
              >
                Traffic Jam Alert
              </button>
              <button
                onClick={() => handleReportIssue("Mechanical Maintenance Check")}
                className="flex-1 py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold text-center"
              >
                Maintenance Delay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
