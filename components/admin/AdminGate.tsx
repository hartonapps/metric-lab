"use client";

import { useEffect, useState } from "react";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  // ✅ persist login
  useEffect(() => {
    const saved = localStorage.getItem("admin_access");
    if (saved === "true") setAuthorized(true);
  }, []);

  const handleLogin = () => {
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
        localStorage.setItem("admin_access", "true");
        setAuthorized(true);
      } else {
        setError("Incorrect password");
      }
      setLoading(false);
    }, 700); // smooth delay
  };

  const logout = () => {
    localStorage.removeItem("admin_access");
    setAuthorized(false);
  };

  // 🔒 LOCK SCREEN
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          
          <h1 className="text-2xl font-semibold mb-2 text-center">
            Metric Lab Admin
          </h1>

          <p className="text-gray-400 text-sm text-center mb-6">
            Restricted access • Authorized only
          </p>

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-4 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium"
          >
            {loading ? "Checking..." : "Enter Dashboard"}
          </button>

        </div>
      </div>
    );
  }

  // ✅ ADMIN VIEW
  return (
    <div className="relative">
      <button
        onClick={logout}
        className="fixed top-4 right-4 text-sm bg-red-500 px-3 py-1 rounded-lg"
      >
        Logout
      </button>

      {children}
    </div>
  );
}