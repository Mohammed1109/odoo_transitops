import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

type FooterProps = Readonly<{
  sidebarOpen: boolean;
}>;

export default function Footer({ sidebarOpen }: FooterProps) {

  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const logout = () => {
    sessionStorage.clear();
    fetch("/logout").finally(() => navigate("/login"));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <footer
      className={`
        backdrop-blur-xl bg-white/30
        fixed bottom-0 
        border-t border-white/20 shadow-2xl
        flex items-center justify-between 
        px-6 text-sm 
        
        /* 💡 Key Change: Match Sidebar's  timing (duration-300 ease-out) */
        transition-[width,left] duration-300 ease-out z-40
        
        /* Mobile responsive additions */
        sm:flex-row py-3 sm:py-0 gap-2 sm:gap-0
        
        ${sidebarOpen ? "left-64 w-[calc(100%-16rem)]" : "left-0 w-full"}
      `}
    >
      {/* LEFT SECTION - Logout (only when sidebar is closed) */}
      {/* Note: Kept the inner transition at duration-300 for the hover effect */}
      <div className="flex items-center gap-4 transition-all duration-300 order-1 sm:order-1">
        {!sidebarOpen && (
          <>
            <button
              onClick={logout}
              className="group flex items-center justify-start w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.06)]  hover:w-32 hover:rounded-2xl hover:from-red-600 hover:to-red-700 active:scale-95 hover:shadow-red-500/25"
            >
              <div className="flex items-center justify-center w-full transition-all duration-500 group-hover:justify-start group-hover:px-4">
                <svg
                  className="w-3 h-3 transition-transform duration-300 group-hover:scale-110"
                  viewBox="0 0 512 512"
                  fill="white"
                >
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                </svg>
              </div>
              <div className="absolute right-10 transform translate-x-full opacity-0 text-white text-sm font-semibold transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 tracking-wide">
                Logout
              </div>
            </button>

            <div className="w-px h-6 bg-gray-600/50"></div>
          </>
        )}
        <span className="text-gray-700 font-medium whitespace-nowrap text-xs sm:text-sm">
          © 2026 My App. All rights reserved.
        </span>
      </div>

      {/* CENTER SECTION - Version (moves to center when sidebar is open) */}
      {/* Note: Kept the inner transition at duration-500 for the positioning change */}
      <div
        className={`
        flex items-center transition-all duration-500 order-2 sm:order-2
        ${sidebarOpen ? "absolute left-1/2 transform -translate-x-1/2" : ""}
      `}
      >
        <div>
          <div className="flex items-center gap-3">
            <span
              className="font-semibold text-gray-700 
                             px-4 py-1 rounded-full 
                             bg-white/40 backdrop-blur-sm
                             border border-black/30
                             shadow-sm text-xs sm:text-sm"
            >
              Version 1.0
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - System Time - Hidden on mobile */}
      <div className=" items-center gap-4 order-3 sm:order-3 hidden sm:flex">
        <div className="flex flex-col items-end">
          <div className="text-gray-800 font-mono font-semibold text-sm sm:text-base tracking-wider">
            {formatTime(currentTime)}
          </div>
          <div className="text-gray-600 text-xs font-medium">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
    </footer>
  );
}
