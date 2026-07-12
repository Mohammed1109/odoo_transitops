

export default function FleetSidebarBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Top Right Circle */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/5" />

      {/* Bottom Left Circle */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#E08D2C]/10" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 300 700"
        fill="none"
      >
        {/* Vertical Roads */}
        <path
          d="M60 0V700"
          stroke="white"
          strokeOpacity="0.05"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        <path
          d="M150 0V700"
          stroke="white"
          strokeOpacity="0.04"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        <path
          d="M240 0V700"
          stroke="white"
          strokeOpacity="0.05"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        {/* Horizontal Roads */}
        <path
          d="M0 120H300"
          stroke="white"
          strokeOpacity="0.05"
          strokeWidth="2"
        />

        <path
          d="M0 280H300"
          stroke="white"
          strokeOpacity="0.04"
          strokeWidth="2"
        />

        <path
          d="M0 440H300"
          stroke="white"
          strokeOpacity="0.05"
          strokeWidth="2"
        />

        <path
          d="M0 600H300"
          stroke="white"
          strokeOpacity="0.04"
          strokeWidth="2"
        />

        {/* Depot Points */}
        {[
          [60, 120],
          [150, 280],
          [240, 440],
          [60, 600],
          [240, 120],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="6" fill="#E08D2C" opacity="0.18" />
            <circle cx={x} cy={y} r="2.5" fill="#E08D2C" />
          </g>
        ))}
      </svg>
    </div>
  );
}