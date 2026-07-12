import React, { useState } from "react";
import { RefreshCcw } from "lucide-react";

export interface RefreshButtonProps {
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  skeleton?: boolean;
  className?: string;
  title?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  skeleton = false,
  className = "",
  title = "Refresh",
}) => {
  const [spinning, setSpinning] = useState(false);

  /* ---------------- REFRESH ---------------- */
  const triggerRefresh = async () => {
    if (loading) return;

    setSpinning(true);
    try {
      await onClick?.();
    } finally {
      setTimeout(() => setSpinning(false), 700);
    }
  };

  /* ---------------- SKELETON ---------------- */
  if (skeleton) {
    return (
      <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center animate-pulse">
        <div className="w-4 h-4 bg-slate-300 rounded" />
      </div>
    );
  }

  return (
    <button
      disabled={disabled || loading}
      title={title}
      onClick={triggerRefresh}
      className={`p-2 rounded-xl border bg-white hover:bg-gray-100
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}`}
    >
      <RefreshCcw
        className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`}
      />
    </button>
  );
};

export default RefreshButton;