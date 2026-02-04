"use client";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "warning",
}: ConfirmModalProps) {
  const confirmColor = {
    danger: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
    warning: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    info: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">
            {type === "danger" ? "⚠️" : type === "warning" ? "❗" : "ℹ️"}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-purple-200 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white/10 border-2 border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 bg-gradient-to-r ${confirmColor} text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
