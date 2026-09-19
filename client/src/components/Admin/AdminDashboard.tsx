import React, { useState } from "react";
import type { BusRoute } from "../../types";
import { BusTrackerMap } from "../Map/BusTrackerMap";
import { socket } from "../../services/socket";
import {
  ShieldAlert,
  Bus,
  Users,
  Activity,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Phone,
} from "lucide-react";

interface AdminDashboardProps {
  routes: BusRoute[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ routes }) => {
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"info" | "warning" | "emergency">("info");
  const [targetRouteId, setTargetRouteId] = useState<string>("all");
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  // Compute fleet metrics
  const totalBuses = routes.length;
  const activeBuses = routes.filter((r) => r.bus.status !== "Idle").length;
  const totalPassengers = routes.reduce((acc, r) => acc + r.bus.passengers, 0);
  const totalCapacity = routes.reduce((acc, r) => acc + r.bus.capacity, 0);
  const delayedBuses = routes.filter((r) => r.bus.trafficStatus === "Heavy").length;
  const onTimePercentage = Math.round(((totalBuses - delayedBuses) / totalBuses) * 100);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertMessage.trim()) return;

    socket.emit("admin_broadcast_alert", {
      type: alertType,
      title: alertTitle,
      message: alertMessage,
      routeId: targetRouteId === "all" ? null : targetRouteId,
    });

    setBroadcastStatus("Broadcast sent successfully!");
    setAlertTitle("");
    setAlertMessage("");
    setTimeout(() => setBroadcastStatus(null), 4000);
  };

  const handleResetFleet = () => {
    if (window.confirm("Reset all fleet buses to initial routes and starting coordinates?")) {
      socket.emit("admin_reset_fleet");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold">Transport Dispatch Command Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time fleet monitoring, route telematics, and campus-wide emergency dispatch
          </p>
        </div>

        <button
          onClick={handleResetFleet}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all active:scale-95 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
          <span>Reset Fleet Demo</span>
        </button>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Fleet</p>
            <p className="text-2xl font-bold text-slate-800">
              {activeBuses} <span className="text-xs font-normal text-slate-400">/ {totalBuses}</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Students Onboard</p>
            <p className="text-2xl font-bold text-slate-800">
              {totalPassengers}{" "}
              <span className="text-xs font-normal text-slate-400">/ {totalCapacity} cap</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">On-Time Performance</p>
            <p className="text-2xl font-bold text-emerald-600">{onTimePercentage}%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div
            className={`p-3 rounded-xl ${
              delayedBuses > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Traffic Delays</p>
            <p className="text-2xl font-bold text-slate-800">{delayedBuses} Active</p>
          </div>
        </div>
      </div>

      {/* Fleet Unified Live Map */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b">
          <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-purple-600" />
            <span>Campus Fleet Radar (All Active Routes)</span>
          </h3>
          <span className="text-xs text-slate-400">
            Click any bus or stop marker for live details
          </span>
        </div>
        <div className="h-[440px] w-full">
          <BusTrackerMap routes={routes} isMultiFleet={true} />
        </div>
      </div>

      {/* Two Column Section: Fleet Roster Table & Emergency Broadcast Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fleet Roster Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
            <Bus className="w-4 h-4 text-blue-600" />
            <span>Active Bus Fleet Roster</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Route</th>
                  <th className="py-2.5 px-3">Driver</th>
                  <th className="py-2.5 px-3">Speed</th>
                  <th className="py-2.5 px-3">Next Stop</th>
                  <th className="py-2.5 px-3">Occupancy</th>
                  <th className="py-2.5 px-3">Traffic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routes.map((r) => {
                  const bus = r.bus;
                  const occPct = Math.round((bus.passengers / bus.capacity) * 100);

                  return (
                    <tr key={bus.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{bus.busNumber}</div>
                        <div className="text-[10px] text-slate-400">{bus.plateNumber}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                          style={{ backgroundColor: r.color }}
                        >
                          Line {r.routeNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-700">{bus.driverName}</div>
                        <a
                          href={`tel:${bus.driverPhone.replace(/[^\d+]/g, "")}`}
                          className="text-[10px] text-blue-600 hover:underline flex items-center space-x-1 font-mono"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>{bus.driverPhone}</span>
                        </a>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {bus.speed} km/h
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-700">
                          {bus.nextStopName || "In Transit"}
                        </div>
                        {bus.etaMinutesToNextStop && (
                          <div className="text-[10px] text-blue-600 font-semibold">
                            ETA ~{bus.etaMinutesToNextStop}m
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                occPct > 85
                                  ? "bg-rose-500"
                                  : occPct > 60
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${occPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium text-slate-700">
                            {bus.passengers}/{bus.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bus.trafficStatus === "Heavy"
                              ? "bg-rose-100 text-rose-800"
                              : bus.trafficStatus === "Moderate"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {bus.trafficStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Emergency & Announcement Broadcast Form (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 border-b pb-3">
            <Send className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-800">Dispatch Instant Announcement</h3>
          </div>

          {broadcastStatus && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{broadcastStatus}</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alert Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["info", "warning", "emergency"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAlertType(t)}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${
                      alertType === t
                        ? t === "emergency"
                          ? "bg-rose-600 text-white border-rose-600"
                          : t === "warning"
                          ? "bg-amber-500 text-slate-900 border-amber-500"
                          : "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Route
              </label>
              <select
                value={targetRouteId}
                onChange={(e) => setTargetRouteId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="all">All Campus Routes (Campus-wide)</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    Line {r.routeNumber} - {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Announcement Headline
              </label>
              <input
                type="text"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                placeholder="e.g., Heavy Traffic on North Boulevard"
                required
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Announcement Message
              </label>
              <textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Details of the delay, revised schedule, or weather warning..."
                rows={3}
                required
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast to Students & Drivers</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
