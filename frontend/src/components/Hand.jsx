// Photorealistic right hand emerging from below, pinching the bottom of a
// passport card. Rendered as layered SVG shapes with skin-tone gradients
// and overlapping highlights for depth. Fingers are drawn BEHIND the card;
// the thumb wraps IN FRONT of the card (see z-order in JSX below).
export default function Hand({ width = 380 }) {
  return (
    <svg
      viewBox="0 0 400 340"
      width={width}
      className="block drop-shadow-[0_30px_40px_rgba(0,0,0,0.65)]"
      aria-hidden="true"
    >
      <defs>
        {/* Main skin gradient — warm, top-lit */}
        <linearGradient id="skin-main" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#f1c9a4" />
          <stop offset="35%" stopColor="#d9a684" />
          <stop offset="70%" stopColor="#b27a52" />
          <stop offset="100%" stopColor="#7b4a2a" />
        </linearGradient>
        {/* Side-lit finger gradient (horizontal, for rim-light) */}
        <linearGradient id="skin-finger" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#8a4e28" />
          <stop offset="25%" stopColor="#c38360" />
          <stop offset="55%" stopColor="#eac3a1" />
          <stop offset="80%" stopColor="#d9a684" />
          <stop offset="100%" stopColor="#8a4e28" />
        </linearGradient>
        {/* Thumb gradient */}
        <linearGradient id="skin-thumb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3cfac" />
          <stop offset="45%" stopColor="#d9a684" />
          <stop offset="100%" stopColor="#7b4a2a" />
        </linearGradient>
        {/* Nail gradient */}
        <linearGradient id="nail" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fbe7d4" />
          <stop offset="60%" stopColor="#e8c5b0" />
          <stop offset="100%" stopColor="#b78a6e" />
        </linearGradient>
        {/* Deep shadow blob for under-hand */}
        <radialGradient id="palm-shadow" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Cast shadow beneath hand */}
      <ellipse cx="200" cy="325" rx="150" ry="12" fill="url(#palm-shadow)" />

      {/* === FOREARM / WRIST === */}
      <path
        d="M120 340 L130 240 Q200 220 270 240 L282 340 Z"
        fill="url(#skin-main)"
      />
      {/* Wrist shadow (under-side) */}
      <path
        d="M130 300 Q200 285 270 300 L275 340 L125 340 Z"
        fill="#6e3a1f"
        opacity="0.35"
      />
      {/* Wrist highlight (top) */}
      <path
        d="M145 245 Q200 232 255 245 Q200 242 145 248 Z"
        fill="#f7dcc1"
        opacity="0.55"
      />

      {/* === BACK OF HAND === */}
      <path
        d="M118 245 Q110 200 135 175 Q200 155 265 175 Q290 200 282 245 Q200 260 118 245 Z"
        fill="url(#skin-main)"
      />
      {/* Knuckle dimples (subtle shadow pockets) */}
      <ellipse cx="158" cy="195" rx="10" ry="5" fill="#8f5535" opacity="0.35" />
      <ellipse cx="190" cy="188" rx="11" ry="5" fill="#8f5535" opacity="0.4" />
      <ellipse cx="222" cy="192" rx="10" ry="5" fill="#8f5535" opacity="0.35" />
      <ellipse cx="252" cy="198" rx="9" ry="4" fill="#8f5535" opacity="0.3" />
      {/* Top highlight across back of hand */}
      <path
        d="M140 178 Q200 168 260 178 Q200 172 140 180 Z"
        fill="#f7dcc1"
        opacity="0.7"
      />

      {/* === FINGERS (behind the card) === */}
      {/* Pinky */}
      <FingerSegment x={132} top={90} height={90} width={26} nail />
      {/* Ring */}
      <FingerSegment x={170} top={70} height={110} width={28} nail />
      {/* Middle */}
      <FingerSegment x={208} top={60} height={120} width={30} nail />
      {/* Index */}
      <FingerSegment x={244} top={75} height={105} width={28} nail />

      {/* === THUMB (front of card — drawn last so it layers on top) === */}
      {/* Thumb base */}
      <path
        d="M268 220 Q295 195 305 160 Q312 130 300 100 Q285 90 270 105 Q258 140 262 180 Q262 205 268 220 Z"
        fill="url(#skin-thumb)"
      />
      {/* Thumb rim shadow on inside edge */}
      <path
        d="M268 220 Q275 195 275 160 Q275 130 282 105 Q275 100 270 105 Q258 140 262 180 Q262 205 268 220 Z"
        fill="#6e3a1f"
        opacity="0.35"
      />
      {/* Thumb highlight strip */}
      <path
        d="M290 110 Q300 140 295 180 Q293 195 288 205 Q296 175 298 140 Q299 122 295 108 Z"
        fill="#f7dcc1"
        opacity="0.75"
      />
      {/* Thumbnail */}
      <ellipse
        cx="295"
        cy="108"
        rx="9"
        ry="11"
        fill="url(#nail)"
        transform="rotate(-18 295 108)"
      />
      <ellipse
        cx="295"
        cy="104"
        rx="7"
        ry="3"
        fill="#fff4e6"
        opacity="0.8"
        transform="rotate(-18 295 104)"
      />
    </svg>
  );
}

function FingerSegment({ x, top, height, width, nail }) {
  const cx = x + width / 2;
  return (
    <g>
      <rect
        x={x}
        y={top}
        width={width}
        height={height}
        rx={width / 2}
        fill="url(#skin-finger)"
      />
      {/* Knuckle shading band */}
      <rect
        x={x}
        y={top + height * 0.55}
        width={width}
        height={height * 0.18}
        rx={width / 2}
        fill="#8f5535"
        opacity="0.22"
      />
      {/* Centerline highlight */}
      <rect
        x={cx - 2}
        y={top + 6}
        width={4}
        height={height - 20}
        rx={2}
        fill="#fbe7d4"
        opacity="0.55"
      />
      {nail && (
        <>
          <ellipse cx={cx} cy={top + 8} rx={width * 0.35} ry={6} fill="url(#nail)" />
          <ellipse cx={cx} cy={top + 5} rx={width * 0.28} ry={2} fill="#fff4e6" opacity="0.85" />
        </>
      )}
    </g>
  );
}
