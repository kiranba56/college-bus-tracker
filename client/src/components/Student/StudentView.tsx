import React, { useState, useEffect } from "react";
import type { BusRoute, NearestStopResult } from "../../types";
import { BusTrackerMap } from "../Map/BusTrackerMap";
import {
  Clock,
  Users,
  Bell,
  BellRing,
  Compass,
  PhoneCall,
  MessageCircle,
  Copy,
  Check,
  Smartphone,
  AlertCircle,
  Footprints,
  Sparkles,
} from "lucide-react";

interface StudentViewProps {
  routes: BusRoute[];
  selectedRouteId: string;
  setSelectedRouteId: (id: string) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  routes,
  selectedRouteId,
  setSelectedRouteId,
}) => {
  const [selectedTargetStopId, setSelectedTargetStopId] = useState<string | null>(null);
  const [isAlertEnabled, setIsAlertEnabled] = useState<boolean>(false);
  const [alertTriggered, setAlertTriggered] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestStopResult, setNearestStopResult] = useState<NearestStopResult | null>(null);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [scheduleTab, setScheduleTab] = useState<"morning" | "evening">("morning");
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);

  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const bus = currentRoute?.bus;

  const handleCopyPhone = (phoneNum: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phoneNum);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // When route changes, default target stop to JIT Campus (last stop)
  useEffect(() => {
    if (currentRoute && currentRoute.stops.length > 0) {
      setSelectedTargetStopId(currentRoute.stops[currentRoute.stops.length - 1].id);
    }
  }, [selectedRouteId, currentRoute?.id]);

  // Check proximity to target stop for alert
  useEffect(() => {
    if (!isAlertEnabled || !selectedTargetStopId || !bus || !currentRoute) return;

    const targetStop = currentRoute.stops.find((s) => s.id === selectedTargetStopId);
    if (targetStop && targetStop.etaMinutes !== undefined && targetStop.etaMinutes <= 4) {
      if (!alertTriggered) {
        setAlertTriggered(true);
        playAlertSound();
      }
    } else {
      setAlertTriggered(false);
    }
  }, [bus?.lat, bus?.lng, selectedTargetStopId, isAlertEnabled, currentRoute]);

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log("Audio notification played", e);
    }
  };

  // Find Nearest Stop with browser geolocation
  const handleFindNearestStop = () => {
    setLocatingUser(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(userPos);
          fetchNearestStop(userPos.lat, userPos.lng);
          setLocatingUser(false);
        },
        () => {
          // Fallback location in Vidyanagar, Davangere for simulation
          const fallbackPos = { lat: 14.4575, lng: 75.9125 };
          setUserCoords(fallbackPos);
          fetchNearestStop(fallbackPos.lat, fallbackPos.lng);
          setLocatingUser(false);
        },
        { timeout: 6000 }
      );
    } else {
      const fallbackPos = { lat: 14.4575, lng: 75.9125 };
      setUserCoords(fallbackPos);
      fetchNearestStop(fallbackPos.lat, fallbackPos.lng);
      setLocatingUser(false);
    }
  };

  const fetchNearestStop = async (lat: number, lng: number) => {
    try {
      const res = await fetch("/api/nearest-stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, routeId: currentRoute?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setNearestStopResult(data.data);
        if (data.data.stop) {
          setSelectedTargetStopId(data.data.stop.id);
        }
      }
    } catch (err) {
      console.error("Failed to query nearest stop:", err);
    }
  };

  if (!currentRoute || !bus) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        Loading routes and GPS telemetry...
      </div>
    );
  }

  // Calculate occupancy percentage
  const occupancyPct = Math.round((bus.passengers / bus.capacity) * 100);
  const targetStop = currentRoute.stops.find((s) => s.id === selectedTargetStopId);

  // Phone sanitization for RFC 3966 mobile dialing & WhatsApp
  const cleanPhone = bus.driverPhone.replace(/[^\d+]/g, "");
  const whatsappNumber = bus.driverPhone.replace(/[^\d]/g, "");
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(
    `Hello ${bus.driverName}, I am a JIT student waiting for ${bus.busNumber} (${currentRoute.name}).`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Route Selector Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          return (
            <button
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`flex items-center space-x-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 border ${
                isSelected
                  ? "bg-slate-900 text-white shadow-md border-slate-700"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: route.color }}
              />
              <span>Line {route.routeNumber}</span>
              <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                {route.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                LIVE
              </span>
            </button>
          );
        })}
      </div>

      {/* Proximity Alert Banner if Triggered */}
      {alertTriggered && targetStop && (
        <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <BellRing className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">Bus Approaching Your Stop!</p>
              <p className="text-xs">
                {bus.busNumber} is about {targetStop.etaMinutes} mins away from{" "}
                <strong>{targetStop.name}</strong>. Head towards the stop!
              </p>
            </div>
          </div>
          <button
            onClick={() => setAlertTriggered(false)}
            className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Main Content Layout: Map + Status Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Map Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="h-[460px] lg:h-[580px] w-full">
            <BusTrackerMap
              routes={routes}
              selectedRouteId={selectedRouteId}
              userLocation={userCoords}
              highlightedStopId={selectedTargetStopId}
              onStopClick={(stop) => setSelectedTargetStopId(stop.id)}
            />
          </div>

          {/* Quick Actions Row below Map */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nearest Stop Finder */}
            <button
              onClick={handleFindNearestStop}
              disabled={locatingUser}
              className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow transition-all text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {locatingUser ? "Locating Nearest Stop..." : "Find My Closest Stop"}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {nearestStopResult
                      ? `${nearestStopResult.stop.name} (${nearestStopResult.distanceKm} km · ${nearestStopResult.walkingMinutes}m walk)`
                      : "Calculate walking distance from current location"}
                  </p>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            </button>

            {/* Proximity Notification Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm text-left">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    isAlertEnabled ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Proximity Alert</h4>
                  <p className="text-[11px] text-slate-500">
                    {targetStop ? `Alert when 4 mins from ${targetStop.name}` : "Select a stop below"}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAlertEnabled}
                  onChange={(e) => setIsAlertEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Dashboard & Timetable Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hero ETA Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-xl border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg text-sm"
                  style={{ backgroundColor: currentRoute.color }}
                >
                  {currentRoute.routeNumber}
                </div>
                <div>
                  <h3 className="font-bold text-base leading-snug">{bus.busNumber}</h3>
                  <p className="text-xs text-slate-400">{bus.plateNumber}</p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    bus.status === "At Stop"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping"></span>
                  {bus.status}
                </span>
              </div>
            </div>

            {/* Dynamic ETA to Target Stop */}
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  Target Stop: <strong>{targetStop?.name || "Next Stop"}</strong>
                </span>
                <span className="text-xs text-blue-300 font-semibold">
                  {targetStop?.distanceFromBusKm ? `${targetStop.distanceFromBusKm} km away` : ""}
                </span>
              </div>

              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {targetStop?.etaMinutes !== undefined
                    ? `~${targetStop.etaMinutes}`
                    : bus.etaMinutesToNextStop || 4}
                </span>
                <span className="text-sm font-medium text-blue-300">minutes predicted</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                <div className="flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  <span>Speed: <strong className="text-slate-200">{bus.speed} km/h</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Traffic:{" "}
                    <strong
                      className={
                        bus.trafficStatus === "Heavy"
                          ? "text-rose-400"
                          : bus.trafficStatus === "Moderate"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }
                    >
                      {bus.trafficStatus}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Seat Availability Meter */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Live Seat Occupancy</span>
                </span>
                <span className="font-bold text-white">
                  {bus.passengers} / {bus.capacity} seats ({occupancyPct}%)
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    occupancyPct > 85
                      ? "bg-rose-500"
                      : occupancyPct > 65
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, occupancyPct)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span
                  className={
                    occupancyPct < 70
                      ? "text-emerald-400 font-semibold"
                      : occupancyPct < 90
                      ? "text-amber-400 font-semibold"
                      : "text-rose-400 font-semibold"
                  }
                >
                  {occupancyPct < 70
                    ? `✓ ${bus.capacity - bus.passengers} Seats Available`
                    : occupancyPct < 90
                    ? `⚠ Limited Seats (${bus.capacity - bus.passengers} left)`
                    : "✕ Standing Room Only"}
                </span>
                <span>Max: {bus.capacity}</span>
              </div>
            </div>

            {/* Driver Contact & Direct Dialing */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm">
                    👨‍✈️
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-xs text-slate-100">{bus.driverName}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                        ● On-Duty
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono flex items-center space-x-1 mt-0.5">
                      <Smartphone className="w-3 h-3 text-slate-400" />
                      <span>{bus.driverPhone}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyPhone(bus.driverPhone)}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors flex items-center space-x-1 text-[11px] font-medium cursor-pointer"
                  title="Copy Phone Number"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct Calling & Messaging Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition-all group"
                  title="Open mobile dialer"
                >
                  <PhoneCall className="w-3.5 h-3.5 animate-pulse text-white" />
                  <span>Call Driver</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold text-white border border-white/10 transition-all"
                  title="Send WhatsApp message to driver"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Tap <strong>Call Driver</strong> on mobile to trigger your device dialer directly
              </p>
            </div>
          </div>

          {/* Real-Time Stop Schedule & Timeline */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>College Bus Timetable</span>
                </h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    College Hours: 09:00 AM – 05:00 PM
                  </span>
                </div>
              </div>

              {/* Shift Selector Buttons */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setScheduleTab("morning")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    scheduleTab === "morning"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🌅 Morning (Starts 9 AM)
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleTab("evening")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    scheduleTab === "evening"
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🌆 Evening (Ends 5 PM)
                </button>
              </div>
            </div>

            {/* Shift Context Banner */}
            <div
              className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                scheduleTab === "morning"
                  ? "bg-blue-50/80 border-blue-200 text-blue-900"
                  : "bg-purple-50/80 border-purple-200 text-purple-900"
              }`}
            >
              <span>
                {scheduleTab === "morning"
                  ? "🎯 Morning Inbound: Arrives at JIT Bada Cross by 08:50 AM (Classes start 09:00 AM)"
                  : "🚌 Evening Return: Dispersal departures from JIT start at 05:15 PM (College ends 05:00 PM)"}
              </span>
            </div>

            <div className="relative pl-6 space-y-4 pt-2 max-h-[300px] overflow-y-auto pr-1">
              {/* Vertical timeline connector */}
              <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200" />

              {currentRoute.stops.map((stop) => {
                const isSelected = selectedTargetStopId === stop.id;
                const isNextStop = bus.nextStopId === stop.id;

                return (
                  <div
                    key={stop.id}
                    onClick={() => setSelectedTargetStopId(stop.id)}
                    className={`relative cursor-pointer group p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-400 shadow-sm"
                        : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-[27px] top-4 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-blue-600 ring-4 ring-blue-100"
                          : isNextStop
                          ? "bg-amber-500 animate-pulse ring-4 ring-amber-100"
                          : "bg-slate-300"
                      }`}
                    />

                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            {stop.name}
                          </span>
                          {stop.order === 1 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              🟢 START
                            </span>
                          )}
                          {stop.order === currentRoute.stops.length && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                              🎓 JIT CAMPUS (END)
                            </span>
                          )}
                          {isNextStop && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              NEXT
                            </span>
                          )}
                          {isSelected && stop.order !== currentRoute.stops.length && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              TARGET
                            </span>
                          )}
                        </div>

                        {/* Morning & Evening Timetable Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span
                            className={`px-2 py-0.5 rounded font-medium border ${
                              scheduleTab === "morning"
                                ? "bg-blue-100 text-blue-800 border-blue-300 font-bold"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            🌅 Morning: <strong>{stop.morningPickup || stop.scheduledTime}</strong>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-medium border ${
                              scheduleTab === "evening"
                                ? "bg-purple-100 text-purple-800 border-purple-300 font-bold"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            🌆 Evening: <strong>{stop.eveningDrop || "05:30 PM"}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className="text-xs font-bold text-blue-600 block">
                          {stop.etaMinutes !== undefined ? `~${stop.etaMinutes} mins` : "--"}
                        </span>
                        {stop.distanceFromBusKm !== undefined && (
                          <span className="text-[10px] text-slate-400">
                            {stop.distanceFromBusKm} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating 1-Tap Call Dialing Button (Always accessible on phones) */}
      <div className="fixed bottom-5 right-4 z-[9999] sm:hidden flex flex-col items-end space-y-2 pointer-events-auto">
        {copiedPhone && (
          <div className="bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 font-medium animate-bounce">
            ✓ Copied {bus.driverPhone}
          </div>
        )}
        <a
          href={`tel:${cleanPhone}`}
          className="flex items-center space-x-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-full shadow-2xl border-2 border-white transition-all text-xs"
          aria-label={`Call driver ${bus.driverName}`}
        >
          <PhoneCall className="w-4 h-4 animate-pulse text-white" />
          <span>Call Driver ({bus.driverName.split(" ")[0]})</span>
        </a>
      </div>
    </div>
  );
};
