import React from "react";
import { Bus, ShieldAlert, Navigation, Radio, Users, LogOut, UserCheck } from "lucide-react";
import type { UserRole } from "../types";

interface NavbarProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isConnected: boolean;
  activeBusCount: number;
  currentUserUsn?: string | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  setActiveRole,
  isConnected,
  activeBusCount,
  currentUserUsn,
  onLogout,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/30 flex items-center justify-center">
              <Bus className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  CampusRide · JIT
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  LIVE GPS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Jain Institute of Technology · Bada Cross, Davangere
              </p>
            </div>
          </div>

          {/* Role Navigation Switcher */}
          <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setActiveRole("student")}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeRole === "student"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Student View</span>
            </button>

            <button
              onClick={() => setActiveRole("driver")}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeRole === "driver"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>Driver Cockpit</span>
            </button>

            <button
              onClick={() => setActiveRole("admin")}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeRole === "admin"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Dispatcher Admin</span>
            </button>
          </nav>

          {/* Connection Status & Fleet Badge */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300">Active Fleet:</span>
              <span className="font-semibold text-white">{activeBusCount} Buses</span>
            </div>

            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isConnected
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                  : "bg-red-950/60 text-red-300 border-red-800"
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  isConnected ? "text-emerald-400 animate-pulse" : "text-red-400"
                }`}
              />
              <span className="hidden sm:inline">
                {isConnected ? "Real-Time Sync" : "Reconnecting"}
              </span>
            </div>

            {/* Logged in User USN & Logout */}
            {currentUserUsn && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
                <div className="hidden lg:flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono font-bold text-blue-400">{currentUserUsn}</span>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors flex items-center space-x-1 text-xs"
                    title="Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
