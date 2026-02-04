"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "from-green-500 to-green-600",
    error: "from-red-500 to-red-600",
    info: "from-blue-500 to-blue-600",
  }[type];

  const icon = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`bg-gradient-to-r ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
        <span className="text-2xl">{icon}</span>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-white hover:scale-110 transition-transform"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
