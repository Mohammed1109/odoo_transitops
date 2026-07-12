import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function NotificationDropdown({ open, onClose }: any) {
    const ref = useRef<HTMLDivElement | null>(null);
    const portalRoot = document.getElementById("dropdown-portal");

    const [notifications, setNotifications] = useState<any[]>([]);

    /* ======================================================
        DUMMY DATA (NO API)
    ====================================================== */
    useEffect(() => {
        if (open) {
            const dummyData = [
                {
                    id: 1,
                    message: "Critical vulnerability detected on device 192.168.1.10",
                    type: "error",
                    time: "2 min ago",
                },
                {
                    id: 2,
                    message: "Medium risk device found in subnet 192.168.1.0/24",
                    type: "warning",
                    time: "10 min ago",
                },
                {
                    id: 3,
                    message: "Scan completed successfully",
                    type: "success",
                    time: "30 min ago",
                },
                {
                    id: 4,
                    message: "Severe threat detected on server",
                    type: "error",
                    time: "1 hour ago",
                },
            ];

            setNotifications(dummyData);
        }
    }, [open]);

    /* ======================================================
        CLOSE ON OUTSIDE CLICK
    ====================================================== */
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    if (!portalRoot) return null;

    return createPortal(
        <div
            ref={ref}
            className={`
        fixed top-16 right-44 w-80
        bg-white rounded-2xl shadow-xl border border-slate-200
        transition-all duration-200 z-[99999]
        origin-top-right
        ${open
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }
      `}
        >
            <div className="flex flex-col max-h-[400px]">

                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm flex justify-between items-center sticky top-0 bg-white z-10">
                    Notifications
                    <span className="text-xs text-slate-400">
                        {notifications.length}
                    </span>
                </div>

                {/* List */}
                <div className="overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-400">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className="px-4 py-3 flex gap-3 items-start hover:bg-slate-50 transition"
                            >
                                {/* Icon */}
                                <div className="text-lg">
                                    {n.type === "error"
                                        ? "🔴"
                                        : n.type === "warning"
                                            ? "🟡"
                                            : "🟢"}
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm text-slate-800 font-medium">
                                        {n.message}
                                    </p>
                                    <p className="text-xs text-slate-500">{n.time}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-2 border-t">
                        <button
                            onClick={() => {
                                setNotifications([]);
                                window.dispatchEvent(new Event("notifications-cleared"));
                            }}
                            className="w-full text-xs text-red-500 hover:text-red-600 transition"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>
        </div>,
        portalRoot
    );
}