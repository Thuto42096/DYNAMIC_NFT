import { useCallback, useEffect, useRef, useState } from "react";
import Hand from "./Hand";
import PassportCard from "./PassportCard";
import Slot from "./Slot";
import Particles from "./Particles";
import { connectWallet, hasWallet, shortAddress, signInMessage } from "../lib/wallet";
import { mintNft, verifyNft } from "../lib/api";
import { tierFromPoints, TIERS } from "../lib/tiers";

// Phases:
//   idle        — entry, show "Authenticate" button
//   connecting  — requesting accounts
//   signing     — requesting signature
//   inserting   — hand rises, card enters slot
//   verifying   — slot scanning sweep
//   granted     — slot expands, reveal tier (calls onGranted)
//   denied      — slot slams shut, shake card
//   noNft       — denied but user can mint
export default function LoginScene({ onGranted }) {
  const [phase, setPhase] = useState("idle");
  const [address, setAddress] = useState(null);
  const [error, setError] = useState("");
  const [lastTier, setLastTier] = useState(TIERS.Bronze);
  const signerRef = useRef(null);

  const run = useCallback(async () => {
    setError("");
    if (!hasWallet()) {
      setError("No browser wallet detected. Install MetaMask to continue.");
      return;
    }

    try {
      setPhase("connecting");
      const { signer, address: addr } = await connectWallet();
      signerRef.current = signer;
      setAddress(addr);

      setPhase("signing");
      const signature = await signInMessage(signer);

      // Begin insertion animation and verify in parallel
      setPhase("inserting");
      await wait(900);
      setPhase("verifying");

      const result = await verifyNft({ walletAddress: addr, signature });
      // Keep scanning visible briefly for feel
      await wait(900);

      if (result.ok && result.authorized) {
        const tier = tierFromPoints(result.points);
        setLastTier(tier);
        setPhase("granted");
        await wait(1400);
        onGranted?.({
          address: addr,
          tokenId: result.tokenId,
          points: result.points,
          tier,
        });
      } else if (result.status === 403) {
        setPhase("noNft");
      } else {
        setError(result.message || "Access denied.");
        setPhase("denied");
      }
    } catch (e) {
      const msg =
        e?.shortMessage ||
        e?.info?.error?.message ||
        e?.message ||
        "Unknown error";
      setError(msg);
      setPhase("denied");
    }
  }, [onGranted]);

  const mint = useCallback(async () => {
    setError("");
    try {
      if (!signerRef.current) {
        const { signer, address: addr } = await connectWallet();
        signerRef.current = signer;
        setAddress(addr);
      }
      const signature = await signInMessage(signerRef.current);
      const res = await mintNft({ walletAddress: address, signature });
      if (!res.ok) throw new Error(res.message || "Mint failed");
      // After mint, retry the full flow
      setPhase("idle");
      setTimeout(run, 400);
    } catch (e) {
      setError(e?.message || "Mint failed");
    }
  }, [address, run]);

  // Auto-reset denied state back to idle after a moment so user can retry
  useEffect(() => {
    if (phase !== "denied") return;
    const t = setTimeout(() => setPhase("idle"), 2600);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="cyber-bg scanlines relative min-h-screen w-full overflow-hidden flex flex-col">
      <Particles count={40} />

      <HeaderBar address={address} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <Title phase={phase} />

        <SlotStage phase={phase} tierHex={lastTier.hex} />

        <Controls
          phase={phase}
          onStart={run}
          onMint={mint}
          error={error}
        />
      </div>

      <TierStrip />
    </div>
  );
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Sub-components below ---

function HeaderBar({ address }) {
  return (
    <div className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-sm border-2 border-[#4dd6ff] flex items-center justify-center font-display font-black text-[#4dd6ff]">
          D
        </div>
        <div>
          <div className="font-display font-bold tracking-[0.3em] text-sm text-white">
            DOMPAS NFT
          </div>
          <div className="font-body text-[10px] tracking-[0.25em] text-[#4dd6ff]/70 uppercase">
            Access Terminal · v1.0
          </div>
        </div>
      </div>
      <div className="font-body text-xs tracking-widest text-white/60 uppercase">
        {address ? shortAddress(address) : "Unlinked"}
      </div>
    </div>
  );
}


function Title({ phase }) {
  const headline =
    phase === "granted"
      ? "ACCESS GRANTED"
      : phase === "denied"
      ? "ACCESS DENIED"
      : phase === "noNft"
      ? "NO PASSPORT FOUND"
      : phase === "verifying"
      ? "SCANNING CREDENTIAL"
      : phase === "signing"
      ? "AWAITING SIGNATURE"
      : phase === "connecting"
      ? "LINKING WALLET"
      : phase === "inserting"
      ? "INSERTING PASSPORT"
      : "PRESENT YOUR PASSPORT";

  const color =
    phase === "denied" || phase === "noNft"
      ? "#ff2e4d"
      : phase === "granted"
      ? "#29ffa4"
      : "#4dd6ff";

  return (
    <div className="text-center mb-8 relative z-10">
      <div
        className="font-display font-black tracking-[0.3em] text-3xl md:text-5xl"
        style={{ color, textShadow: `0 0 20px ${color}` }}
      >
        <span className={phase === "denied" ? "glitch inline-block" : "inline-block"}>
          {headline}
        </span>
      </div>
      <div className="mt-2 font-body tracking-[0.4em] text-xs text-white/50 uppercase">
        Dompas Membership Verification
      </div>
    </div>
  );
}

function SlotStage({ phase, tierHex }) {
  const isInserting = phase === "inserting";
  const isVerifying = phase === "verifying";
  const isGranted = phase === "granted";
  const isDenied = phase === "denied";
  const isNoNft = phase === "noNft";

  const cardTransform = isGranted
    ? "translate(-50%, -60px) scale(0.95)"
    : isVerifying || isInserting
    ? "translate(-50%, 30px)"
    : isDenied || isNoNft
    ? "translate(-50%, 260px)"
    : "translate(-50%, 220px)";

  const cardOpacity = isGranted ? 0 : 1;

  const handTransform = isGranted
    ? "translate(-50%, 120%)"
    : isDenied || isNoNft
    ? "translate(-50%, 80%)"
    : phase === "idle"
    ? "translate(-50%, 30%)"
    : "translate(-50%, 0%)";

  return (
    <div className="relative w-full max-w-[720px] h-[620px] flex items-start justify-center mt-4">
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <Slot phase={phase} tierHex={tierHex} />
      </div>

      <div
        className={`absolute left-1/2 top-[60px] z-10 ${
          isDenied || isNoNft ? "[animation:reject-shake_0.5s_ease-in-out]" : ""
        }`}
        style={{
          transform: cardTransform,
          opacity: cardOpacity,
          transition:
            "transform 900ms cubic-bezier(0.22, 0.8, 0.3, 1), opacity 500ms ease-out",
          filter: isVerifying
            ? `drop-shadow(0 0 18px ${tierHex})`
            : "drop-shadow(0 20px 30px rgba(0,0,0,0.6))",
        }}
      >
        <PassportCard width={180} tierHex={tierHex} />
      </div>

      <div
        className="absolute left-1/2 bottom-[-40px] z-20"
        style={{
          transform: handTransform,
          transition: "transform 900ms cubic-bezier(0.22, 0.8, 0.3, 1)",
        }}
      >
        <Hand width={360} />
      </div>
    </div>
  );
}

function Controls({ phase, onStart, onMint, error }) {
  const busy =
    phase === "connecting" ||
    phase === "signing" ||
    phase === "inserting" ||
    phase === "verifying" ||
    phase === "granted";

  return (
    <div className="relative z-10 mt-2 min-h-[120px] flex flex-col items-center gap-3">
      {phase === "idle" && (
        <button
          onClick={onStart}
          className="group relative font-display font-bold tracking-[0.35em] text-sm px-10 py-4 text-[#4dd6ff] border-2 border-[#4dd6ff] rounded-sm hover:bg-[#4dd6ff]/10 transition-all duration-200"
          style={{ boxShadow: "0 0 24px rgba(77,214,255,0.4)" }}
        >
          <span className="relative z-10">▶ AUTHENTICATE</span>
        </button>
      )}

      {busy && phase !== "granted" && (
        <div className="font-body text-xs tracking-[0.3em] uppercase text-white/60">
          {phase === "connecting" && "Requesting wallet…"}
          {phase === "signing" && "Confirm signature in your wallet…"}
          {phase === "inserting" && "Aligning credential…"}
          {phase === "verifying" && "Reading on-chain membership…"}
        </div>
      )}

      {phase === "noNft" && (
        <div className="flex flex-col items-center gap-3">
          <div className="font-body text-sm text-[#ff2e4d] tracking-wider uppercase">
            No Dompas passport bound to this wallet.
          </div>
          <button
            onClick={onMint}
            className="font-display font-bold tracking-[0.3em] text-sm px-8 py-3 text-[#29ffa4] border-2 border-[#29ffa4] rounded-sm hover:bg-[#29ffa4]/10"
            style={{ boxShadow: "0 0 20px rgba(41,255,164,0.45)" }}
          >
            + MINT PASSPORT
          </button>
        </div>
      )}

      {error && phase !== "noNft" && (
        <div className="max-w-[520px] text-center font-body text-xs tracking-wider text-[#ff2e4d]/90 uppercase">
          {error}
        </div>
      )}
    </div>
  );
}

function TierStrip() {
  const order = ["Bronze", "Silver", "Gold", "Platinum"];
  return (
    <div className="relative z-10 flex items-center justify-center gap-8 pb-6 pt-4 border-t border-white/5">
      {order.map((key) => {
        const t = TIERS[key];
        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: t.hex, boxShadow: `0 0 10px ${t.glow}` }}
            />
            <span
              className="font-display text-[10px] tracking-[0.3em] uppercase"
              style={{ color: t.hex }}
            >
              {t.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
