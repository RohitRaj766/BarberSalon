"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginRequest } from "@/types";

export default function AdminLoginForm(): React.ReactElement {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: LoginRequest = { username, password };

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <label htmlFor="username" className="block text-xs sm:text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <span>👤</span>
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          required
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/10 border-2 border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:bg-white/20 transition-all duration-200 backdrop-blur-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <span>🔑</span>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/10 border-2 border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:bg-white/20 transition-all duration-200 backdrop-blur-sm"
        />
      </div>

      {error && (
        <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/50 backdrop-blur-sm rounded-lg sm:rounded-xl">
          <p className="text-xs sm:text-sm text-red-200 flex items-center gap-2">
            <span>⚠️</span>
            <span className="break-words">{error}</span>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Logging in...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>🚀</span>
            Login to Dashboard
          </span>
        )}
      </button>
    </form>
  );
}
