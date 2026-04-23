import Particles from "./Particles";
import { MAX_POINTS, TIERS } from "../lib/tiers";
import { shortAddress } from "../lib/wallet";

export default function Dashboard({ session, onLogout }) {
  const { tier, address, tokenId, points } = session;
  const progress = Math.min(100, (Number(points) / MAX_POINTS) * 100);

  return (
    <div
      className="cyber-bg scanlines relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundColor: "#05060a",
      }}
    >
      <Particles count={40} color={tier.hex} />

      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-sm border-2 flex items-center justify-center font-display font-black"
            style={{ borderColor: tier.hex, color: tier.hex }}
          >
            D
          </div>
          <div>
            <div className="font-display font-bold tracking-[0.3em] text-sm text-white">
              DOMPAS NFT
            </div>
            <div
              className="font-body text-[10px] tracking-[0.25em] uppercase"
              style={{ color: tier.hex }}
            >
              Member Terminal · {shortAddress(address)}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="font-display text-xs tracking-[0.3em] uppercase text-white/70 hover:text-white border border-white/15 hover:border-white/40 px-4 py-2 rounded-sm"
        >
          ◀ Sign Out
        </button>
      </header>

      <main className="relative z-10 px-6 py-12 max-w-5xl mx-auto">
        {/* Welcome banner */}
        <div className="text-center mb-10">
          <div
            className="font-display font-black tracking-[0.25em] text-4xl md:text-6xl"
            style={{ color: tier.hex, textShadow: `0 0 24px ${tier.glow}` }}
          >
            WELCOME, {tier.tagline.toUpperCase()}
          </div>
          <div className="mt-3 font-body text-sm tracking-[0.4em] uppercase text-white/50">
            Tier · {tier.name} · Token #{tokenId}
          </div>
        </div>

        {/* Tier badge card */}
        <TierBadge tier={tier} points={points} progress={progress} />

        {/* All tiers row */}
        <AllTiersRow currentTier={tier} />
      </main>
    </div>
  );
}

function TierBadge({ tier, points, progress }) {
  return (
    <div className="relative mx-auto max-w-2xl mb-12">
      <div
        className="relative rounded-xl p-1 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${tier.gradientFrom}, ${tier.gradientTo})`,
          boxShadow: `0 0 40px ${tier.glow}, 0 0 100px ${tier.glow}`,
        }}
      >
        {/* Sweeping sheen */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)",
            animation: "tier-sweep 3.5s linear infinite",
            mixBlendMode: "overlay",
          }}
        />

        <div className="relative rounded-[10px] bg-[#05060a]/90 backdrop-blur-sm p-8 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div
                className="font-display font-black text-5xl tracking-[0.15em]"
                style={{ color: tier.hex, textShadow: `0 0 18px ${tier.glow}` }}
              >
                {tier.name.toUpperCase()}
              </div>
              <div className="font-body text-xs tracking-[0.4em] uppercase text-white/50 mt-1">
                Access Level · {tier.tagline}
              </div>
            </div>
            <div
              className="w-20 h-20 rounded-full border-4 flex items-center justify-center font-display font-black text-2xl"
              style={{
                borderColor: tier.hex,
                color: tier.hex,
                boxShadow: `inset 0 0 20px ${tier.glow}, 0 0 24px ${tier.glow}`,
              }}
            >
              {tier.name[0]}
            </div>
          </div>

          <div className="flex items-center justify-between font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-2">
            <span>Loyalty Points</span>
            <span style={{ color: tier.hex }}>
              {points} / {MAX_POINTS}
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-white/5 overflow-hidden border border-white/10">
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${tier.gradientFrom}, ${tier.gradientTo})`,
                boxShadow: `0 0 12px ${tier.glow}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AllTiersRow({ currentTier }) {
  const order = ["Bronze", "Silver", "Gold", "Platinum"];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {order.map((key) => {
        const t = TIERS[key];
        const active = t.name === currentTier.name;
        return (
          <div
            key={key}
            className="relative rounded-lg p-5 border transition-all"
            style={{
              borderColor: active ? t.hex : "rgba(255,255,255,0.08)",
              background: active
                ? `linear-gradient(160deg, ${t.hex}15, transparent)`
                : "rgba(255,255,255,0.02)",
              boxShadow: active ? `0 0 24px ${t.glow}` : "none",
            }}
          >
            <div
              className="font-display font-bold text-lg tracking-[0.2em]"
              style={{ color: t.hex }}
            >
              {t.name.toUpperCase()}
            </div>
            <div className="font-body text-xs tracking-[0.2em] uppercase text-white/50 mt-1">
              {t.threshold}+ pts · {t.tagline}
            </div>
          </div>
        );
      })}
    </div>
  );
}
