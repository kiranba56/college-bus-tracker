import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { AlertBanner } from "./components/AlertBanner";
import { StudentView } from "./components/Student/StudentView";
import { DriverConsole } from "./components/Driver/DriverConsole";
import { AdminDashboard } from "./components/Admin/AdminDashboard";
import { LoginPage } from "./components/Auth/LoginPage";
import { socket } from "./services/socket";
import type { BusRoute, AlertMessage, UserRole } from "./types";
import { Bus, Shield, PhoneCall } from "lucide-react";

export const App: React.FC = () => {
  const [userUsn, setUserUsn] = useState<string | null>(() => {
    return localStorage.getItem("campusride_user_usn") || null;
  });
  const [activeRole, setActiveRole] = useState<UserRole>("student");
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleLogin = (usn: string) => {
    setUserUsn(usn);
    localStorage.setItem("campusride_user_usn", usn);
  };

  const handleLogout = () => {
    setUserUsn(null);
    localStorage.removeItem("campusride_user_usn");
  };

  // Setup WebSocket listeners
  useEffect(() => {
    // Initial fetch via REST fallback in case socket takes a moment
    fetch("/api/routes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setRoutes(data.data);
          setSelectedRouteId((prev) => prev || data.data[0].id);
          setIsLoading(false);
        }
      })
      .catch((err) => console.log("Initial REST fetch error (using socket sync):", err));

    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAlerts(data.data);
      })
      .catch((err) => console.log("Alerts REST fetch error:", err));

    // Socket lifecycle
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onInitState = (data: { routes: BusRoute[]; alerts: AlertMessage[] }) => {
      setRoutes(data.routes);
      setSelectedRouteId((prev) => prev || data.routes[0]?.id || "");
      setAlerts(data.alerts);
      setIsLoading(false);
    };

    const onBusUpdate = (data: { routeId: string; bus: BusRoute["bus"]; stops: BusRoute["stops"] }) => {
      setRoutes((prevRoutes) =>
        prevRoutes.map((r) => {
          if (r.id === data.routeId) {
            return {
              ...r,
              bus: { ...data.bus },
              stops: data.stops ? [...data.stops] : r.stops,
            };
          }
          return r;
        })
      );
    };

    const onNewAlert = (alert: AlertMessage) => {
      setAlerts((prev) => [alert, ...prev]);
    };

    const onFleetReset = (resetRoutes: BusRoute[]) => {
      setRoutes(resetRoutes);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("init_state", onInitState);
    socket.on("bus_update", onBusUpdate);
    socket.on("new_alert", onNewAlert);
    socket.on("fleet_reset", onFleetReset);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("init_state", onInitState);
      socket.off("bus_update", onBusUpdate);
      socket.off("new_alert", onNewAlert);
      socket.off("fleet_reset", onFleetReset);
    };
  }, []);

  // If user is not logged in with their USN, show Login Screen
  if (!userUsn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Navigation Header */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        isConnected={isConnected}
        activeBusCount={routes.length}
        currentUserUsn={userUsn}
        onLogout={handleLogout}
      />

      {/* Broadcast Announcement Bar */}
      <AlertBanner alerts={alerts} />

      {/* Main Content Area */}
      <main className="flex-1 pb-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/30 animate-bounce">
              <Bus className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-800">
                Connecting to Campus Transit GPS...
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Synchronizing satellite waypoints, live bus telemetry & dynamic schedules
              </p>
            </div>
          </div>
        ) : (
          <>
            {activeRole === "student" && (
              <StudentView
                routes={routes}
                selectedRouteId={selectedRouteId}
                setSelectedRouteId={setSelectedRouteId}
              />
            )}

            {activeRole === "driver" && <DriverConsole routes={routes} />}

            {activeRole === "admin" && <AdminDashboard routes={routes} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 font-semibold">
              University Transport Management & Safety Division
            </span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <div className="flex items-center space-x-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campus Transit Helpline: <strong>+91 80 2345 6789</strong></span>
            </div>
            <span>•</span>
            <span>Real-time GPS Telemetry Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
