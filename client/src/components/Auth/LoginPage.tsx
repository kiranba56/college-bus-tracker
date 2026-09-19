import React, { useState } from "react";
import {
  Bus,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface LoginPageProps {
  onLogin: (usn: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [usn, setUsn] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleUSNs = [
    { usn: "4JD21CS045", branch: "JIT - Computer Science" },
    { usn: "4JD22EC018", branch: "JIT - Electronics" },
    { usn: "4JD23IS032", branch: "JIT - Info Science" },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsn = usn.trim().toUpperCase();
    const cleanPassword = password.trim().toUpperCase();

    if (!cleanUsn) {
      setErrorMessage("Please enter your University Seat Number (USN).");
      return;
    }

    if (!cleanPassword) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    // Verification rule: Password must match USN
    setTimeout(() => {
      if (cleanUsn === cleanPassword) {
        onLogin(cleanUsn);
      } else {
        setErrorMessage(
          "Invalid Credentials! The password must match your USN. (Hint: enter your USN in both fields)."
        );
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleQuickFill = (sampleUsn: string) => {
    setUsn(sampleUsn);
    setPassword(sampleUsn);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Branding & Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/30 mb-4 animate-pulse">
            <Bus className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            CampusRide · JIT
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Jain Institute of Technology (JIT), Davangere
          </p>
          <p className="text-xs text-blue-400 font-semibold mt-0.5">
            Bada Cross Campus Bus Live-Tracking Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <h2 className="text-lg font-bold text-white">Student & Staff Login</h2>
              <p className="text-xs text-slate-400">Authenticate using university credentials</p>
            </div>
            <span className="p-2 bg-slate-700/50 rounded-xl text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* USN Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                University Seat Number (USN)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={usn}
                  onChange={(e) => {
                    setUsn(e.target.value.toUpperCase());
                    setErrorMessage(null);
                  }}
                  placeholder="e.g. 1RV21CS045"
                  className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono uppercase tracking-wider placeholder:text-slate-500 placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password (Same as USN)
                </label>
                <span className="text-[11px] text-blue-400 font-medium">
                  Matches your USN
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Enter your USN as password"
                  className="w-full bg-slate-900/90 border border-slate-700 text-white rounded-xl pl-10 pr-10 py-2.5 text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Policy Info Note */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>
                Standard university access rule: Enter your <strong>USN</strong> in both fields to log in.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Authenticating..." : "Access Live Tracker"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Test Accounts */}
          <div className="pt-2 border-t border-slate-700/60">
            <div className="flex items-center space-x-1 text-slate-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Test USN Accounts:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sampleUSNs.map((item) => (
                <button
                  key={item.usn}
                  type="button"
                  onClick={() => handleQuickFill(item.usn)}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-700/60 border border-slate-700 text-left transition-all group"
                >
                  <p className="font-mono text-xs font-bold text-white group-hover:text-blue-400">
                    {item.usn}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{item.branch}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Secured by University Transport Management Division · Real-Time GPS
        </p>
      </div>
    </div>
  );
};
