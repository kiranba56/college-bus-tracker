import React, { useState } from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import type { AlertMessage } from "../types";

interface AlertBannerProps {
  alerts: AlertMessage[];
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts }) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const activeAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));
  if (activeAlerts.length === 0) return null;

  const currentAlert = activeAlerts[0];

  const getAlertStyles = (type: string) => {
    switch (type) {
      case "emergency":
        return {
          bg: "bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-200",
          icon: <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />,
          badge: "bg-rose-500 text-white",
        };
      case "warning":
        return {
          bg: "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-200",
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          badge: "bg-amber-500 text-slate-900",
        };
      default:
        return {
          bg: "bg-blue-500/15 border-blue-500/40 text-blue-800 dark:text-blue-200",
          icon: <Info className="w-5 h-5 text-blue-500" />,
          badge: "bg-blue-500 text-white",
        };
    }
  };

  const style = getAlertStyles(currentAlert.type);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
      <div
        className={`flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-sm transition-all ${style.bg}`}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="shrink-0">{style.icon}</div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${style.badge}`}
            >
              {currentAlert.type}
            </span>
            <span className="font-semibold text-sm">{currentAlert.title}:</span>
            <span className="text-sm truncate sm:overflow-visible sm:whitespace-normal">
              {currentAlert.message}
            </span>
            <span className="text-xs opacity-75 hidden sm:inline">
              ({currentAlert.timestamp})
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 ml-2">
          {activeAlerts.length > 1 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800/20">
              +{activeAlerts.length - 1} more
            </span>
          )}
          <button
            onClick={() => setDismissedIds((prev) => [...prev, currentAlert.id])}
            className="p-1 rounded-md hover:bg-black/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
