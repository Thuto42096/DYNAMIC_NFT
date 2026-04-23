// The slot: a horizontal glowing opening with a scanning sweep. Two doors on
// either side that slide IN (slam-shut) on denial. When granted, it widens.
// Phase drives which visual state is active.
//   phase: 'idle' | 'inserting' | 'verifying' | 'granted' | 'denied'
export default function Slot({ phase, tierHex = "#4dd6ff" }) {
  const isGranted = phase === "granted";
  const isDenied = phase === "denied";
  const isVerifying = phase === "verifying";

  const glowColor = isDenied ? "#ff2e4d" : isGranted ? "#29ffa4" : tierHex;

  // Slot body width via inline style so it can animate via keyframes on granted
  const widthPx = isGranted ? 560 : 320;

  return (
    <div
      className="relative flex items-center justify-center transition-all duration-700 ease-out"
      style={{
        width: `${widthPx}px`,
        height: "120px",
      }}
    >
      {/* Outer housing */}
      <div
        className="relative w-full h-full rounded-2xl border overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg,#0a0c16 0%, #121626 50%,#0a0c16 100%)",
          borderColor: glowColor,
          boxShadow: `0 0 ${isGranted ? 120 : 40}px ${isGranted ? 20 : 6}px ${glowColor}${
            isGranted ? "cc" : "55"
          }, inset 0 0 40px rgba(0,0,0,0.8)`,
          transition:
            "box-shadow 700ms ease-out, border-color 400ms ease-out",
        }}
      >
        {/* Bezel corner notches */}
        <Notch pos="tl" color={glowColor} />
        <Notch pos="tr" color={glowColor} />
        <Notch pos="bl" color={glowColor} />
        <Notch pos="br" color={glowColor} />

        {/* Inner slot opening (dark strip) */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm overflow-hidden"
          style={{
            width: "calc(100% - 40px)",
            height: "56px",
            background: "#02030a",
            boxShadow: `inset 0 0 24px ${glowColor}${isGranted ? "aa" : "55"}`,
          }}
        >
          {/* Scan sweep during verification */}
          {isVerifying && (
            <div
              className="scan-sweep absolute left-0 right-0 h-3"
              style={{
                background: `linear-gradient(180deg, transparent, ${glowColor}, transparent)`,
                boxShadow: `0 0 20px ${glowColor}`,
              }}
            />
          )}

          {/* Left door — closes in (from right-edge start) on denial */}
          <div
            className="absolute top-0 bottom-0 left-0 w-1/2"
            style={{
              background:
                "linear-gradient(90deg,#1a2142 0%,#0a0c16 100%)",
              transform: isDenied ? "translateX(0%)" : "translateX(-100%)",
              transition: "transform 280ms cubic-bezier(0.7, 0, 0.9, 0.3)",
              borderRight: `2px solid ${glowColor}`,
              boxShadow: isDenied ? `4px 0 20px ${glowColor}` : "none",
            }}
          />
          {/* Right door */}
          <div
            className="absolute top-0 bottom-0 right-0 w-1/2"
            style={{
              background:
                "linear-gradient(270deg,#1a2142 0%,#0a0c16 100%)",
              transform: isDenied ? "translateX(0%)" : "translateX(100%)",
              transition: "transform 280ms cubic-bezier(0.7, 0, 0.9, 0.3)",
              borderLeft: `2px solid ${glowColor}`,
              boxShadow: isDenied ? `-4px 0 20px ${glowColor}` : "none",
            }}
          />

          {/* Center seam line glow (only when doors meet / on denial) */}
          {isDenied && (
            <div
              className="absolute left-1/2 top-0 bottom-0 w-[2px]"
              style={{
                background: glowColor,
                boxShadow: `0 0 12px ${glowColor}`,
              }}
            />
          )}
        </div>

        {/* Status text */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-2 font-display text-[10px] tracking-[0.4em] uppercase"
          style={{ color: glowColor, textShadow: `0 0 8px ${glowColor}` }}
        >
          {phase === "idle" && "● Standby"}
          {phase === "inserting" && "▲ Insert"}
          {isVerifying && "◆ Scanning"}
          {isGranted && "✓ Access Granted"}
          {isDenied && "✕ Access Denied"}
        </div>
      </div>
    </div>
  );
}

function Notch({ pos, color }) {
  const base = "absolute w-4 h-4 border-2";
  const map = {
    tl: "top-1 left-1 border-r-0 border-b-0",
    tr: "top-1 right-1 border-l-0 border-b-0",
    bl: "bottom-1 left-1 border-r-0 border-t-0",
    br: "bottom-1 right-1 border-l-0 border-t-0",
  };
  return (
    <span
      className={`${base} ${map[pos]}`}
      style={{ borderColor: color, boxShadow: `0 0 6px ${color}` }}
    />
  );
}
