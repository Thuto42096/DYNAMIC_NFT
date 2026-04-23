// A premium dark "Dompas NFT" passport card. Held vertically — long edge
// is the tall axis. viewBox 220 x 340. Designed to read well at ~200px wide.
export default function PassportCard({ width = 200, tierHex = "#4dd6ff" }) {
  return (
    <svg
      viewBox="0 0 220 340"
      width={width}
      className="block"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="card-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f1430" />
          <stop offset="55%" stopColor="#06091c" />
          <stop offset="100%" stopColor="#020309" />
        </linearGradient>
        <linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2dd1" />
          <stop offset="35%" stopColor="#4dd6ff" />
          <stop offset="70%" stopColor="#29ffa4" />
          <stop offset="100%" stopColor="#ffd700" />
        </linearGradient>
        <linearGradient id="chip-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4e9b8" />
          <stop offset="50%" stopColor="#b39329" />
          <stop offset="100%" stopColor="#6b5510" />
        </linearGradient>
      </defs>

      {/* Card body with rounded corners */}
      <rect x="2" y="2" width="216" height="336" rx="16" fill="url(#card-bg)" />
      {/* Subtle inner border */}
      <rect
        x="8"
        y="8"
        width="204"
        height="324"
        rx="12"
        fill="none"
        stroke={tierHex}
        strokeOpacity="0.35"
        strokeWidth="1"
      />

      {/* Faint circuit/grid pattern */}
      <g opacity="0.12" stroke={tierHex} strokeWidth="0.8">
        <path d="M20 60 L60 60 L60 90 L100 90" fill="none" />
        <path d="M200 110 L160 110 L160 140 L120 140" fill="none" />
        <path d="M20 230 L50 230 L50 260 L80 260" fill="none" />
        <circle cx="60" cy="60" r="2" fill={tierHex} />
        <circle cx="100" cy="90" r="2" fill={tierHex} />
        <circle cx="160" cy="110" r="2" fill={tierHex} />
        <circle cx="50" cy="230" r="2" fill={tierHex} />
      </g>

      {/* Top header */}
      <text
        x="20"
        y="38"
        fontFamily="Orbitron, sans-serif"
        fontSize="10"
        fontWeight="700"
        letterSpacing="3"
        fill={tierHex}
      >
        DOMPAS · PASSPORT
      </text>
      <text
        x="200"
        y="38"
        textAnchor="end"
        fontFamily="Orbitron, sans-serif"
        fontSize="8"
        letterSpacing="2"
        fill="#6a7fa3"
      >
        v1.0
      </text>

      {/* Large brand "D" monogram */}
      <text
        x="110"
        y="140"
        textAnchor="middle"
        fontFamily="Orbitron, sans-serif"
        fontSize="96"
        fontWeight="900"
        fill="url(#holo)"
        opacity="0.92"
      >
        D
      </text>

      {/* Chip */}
      <g transform="translate(24 160)">
        <rect width="42" height="32" rx="5" fill="url(#chip-metal)" />
        <g stroke="#3a2e0a" strokeWidth="1" opacity="0.7">
          <line x1="0" y1="10" x2="42" y2="10" />
          <line x1="0" y1="22" x2="42" y2="22" />
          <line x1="14" y1="0" x2="14" y2="32" />
          <line x1="28" y1="0" x2="28" y2="32" />
        </g>
      </g>

      {/* Holographic strip */}
      <rect x="76" y="160" width="120" height="32" rx="4" fill="url(#holo)" opacity="0.7" />
      <rect x="76" y="160" width="120" height="32" rx="4" fill="none" stroke="#ffffff" strokeOpacity="0.2" />

      {/* ID number */}
      <text
        x="20"
        y="220"
        fontFamily="Orbitron, sans-serif"
        fontSize="13"
        letterSpacing="4"
        fill="#e6ecff"
      >
        DNFT 0000 XXXX
      </text>

      {/* Holder label */}
      <text
        x="20"
        y="252"
        fontFamily="Orbitron, sans-serif"
        fontSize="7"
        letterSpacing="2"
        fill="#6a7fa3"
      >
        HOLDER
      </text>
      <text
        x="20"
        y="268"
        fontFamily="Rajdhani, sans-serif"
        fontSize="13"
        fontWeight="600"
        fill="#e6ecff"
      >
        0x••••••••
      </text>

      {/* Tier accent band */}
      <rect x="20" y="290" width="180" height="2" fill={tierHex} opacity="0.6" />
      <text
        x="20"
        y="312"
        fontFamily="Orbitron, sans-serif"
        fontSize="9"
        letterSpacing="3"
        fill={tierHex}
      >
        MEMBER · DYNAMIC
      </text>
    </svg>
  );
}
