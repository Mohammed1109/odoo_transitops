// components/SearchBar.tsx
import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";

type Props = {
  value?: string; // controlled value
  placeholder?: string;
  debounceMs?: number; // how long before calling onSearch
  onChange?: (val: string) => void; // immediate change
  onSearch?: (val: string) => void; // debounced search (useful for API)
  className?: string;
  allowClear?: boolean;
  loading?: boolean;
  triggerMode?: "debounce" | "manual";
};

export default function SearchBar({
  value,
  placeholder = "Search...",
  debounceMs = 300,
  onChange,
  onSearch,
  className = "",
  allowClear = true,
  loading = false,
  triggerMode = "manual",
}: Readonly<Props>) {
  const [internal, setInternal] = useState(value ?? "");
  const isControlled = value !== undefined;
  const mounted = useRef(false);
  const timer = useRef<number | null>(null);

  // keep internal state in sync when controlled
  useEffect(() => {
    if (isControlled) setInternal(value);
  }, [value, isControlled]);

  useEffect(() => {
    if (triggerMode !== "debounce") return; //  STOP for manual mode

    if (!mounted.current) {
      mounted.current = true;
    }

    if (timer.current) {
      globalThis.clearTimeout(timer.current);
    }

    timer.current = globalThis.setTimeout(() => {
      onSearch?.(internal);
    }, debounceMs);

    return () => {
      if (timer.current) globalThis.clearTimeout(timer.current);
    };
  }, [internal, debounceMs, onSearch, triggerMode]);

  const triggerSearch = () => {
    onSearch?.(internal);
  };

  const handleInput = (v: string) => {
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };

  const clear = () => {
    handleInput("");
    // immediately call search with empty value
    onSearch?.("");
  };
  // skeleton loading
  if (loading) {
    return (
      <div
        className={`flex items-center border rounded-lg bg-white px-3 py-2 w-full max-w-md ${className} animate-pulse`}
      >
        <div className="w-4 h-4 bg-slate-200 rounded" />
        <div className="ml-2 h-4 w-full bg-slate-200 rounded" />
      </div>
    );
  }
  return (
    <div
      className={`flex items-center border rounded-lg bg-white px-2 py-1 w-full max-w-md ${className}`}
    >
      {/* Input */}
      <input
        type="text"
        value={internal}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            triggerSearch();
          }
        }}
        placeholder="Search...."
        className="flex-1 px-2 py-1 outline-none text-sm bg-transparent"
        aria-label={placeholder}
      />

      {/* Clear Button */}
      {allowClear && internal.length > 0 && (
        <button
          onClick={clear}
          className="p-1 rounded hover:bg-gray-100 transition"
          aria-label="Clear Search"
          type="button"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}

      {/* Search Button */}
      <button
        onClick={triggerSearch}
        disabled={!internal.trim()}
        className={`ml-2 flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition ${internal.trim()
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        type="button"
      >
        <Search className="w-4 h-4" />
      </button>
    </div>
  );
}
