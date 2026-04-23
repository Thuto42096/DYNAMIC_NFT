// Ambient floating particles. Memoized so they don't re-generate on every
// state change.
import { useMemo } from "react";

export default function Particles({ count = 30, color = "#4dd6ff" }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        drift: (Math.random() - 0.5) * 200,
        duration: 10 + Math.random() * 18,
        delay: -Math.random() * 20,
        size: 1 + Math.random() * 3,
        opacity: 0.25 + Math.random() * 0.55,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.id}
          className="particle"
          style={{
            left: `${d.left}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.opacity,
            background: color,
            boxShadow: `0 0 ${d.size * 3}px ${color}`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            ["--drift"]: `${d.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
