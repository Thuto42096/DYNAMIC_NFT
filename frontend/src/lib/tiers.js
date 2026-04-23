// Tier definitions mirror scripts/server.js pointsToTier():
// 0-4 Bronze, 5-9 Silver, 10-14 Gold, 15-20 Platinum
export const TIERS = {
  Bronze: {
    name: "Bronze",
    hex: "#CD7F32",
    glow: "rgba(205, 127, 50, 0.75)",
    accent: "#F2A867",
    shadow: "#7A4A1A",
    gradientFrom: "#8a4e1f",
    gradientTo: "#e59a5a",
    tagline: "Initiate",
    threshold: 0,
  },
  Silver: {
    name: "Silver",
    hex: "#C0C0C0",
    glow: "rgba(200, 220, 240, 0.85)",
    accent: "#E8F0FA",
    shadow: "#6C7480",
    gradientFrom: "#6c7a8a",
    gradientTo: "#e8eef7",
    tagline: "Operator",
    threshold: 5,
  },
  Gold: {
    name: "Gold",
    hex: "#FFD700",
    glow: "rgba(255, 215, 0, 0.9)",
    accent: "#FFE866",
    shadow: "#8A6A00",
    gradientFrom: "#a88400",
    gradientTo: "#ffe866",
    tagline: "Envoy",
    threshold: 10,
  },
  Platinum: {
    name: "Platinum",
    hex: "#E5E4E2",
    glow: "rgba(200, 230, 255, 0.95)",
    accent: "#F7F9FC",
    shadow: "#8892A6",
    gradientFrom: "#8aa8cf",
    gradientTo: "#f7fbff",
    tagline: "Sovereign",
    threshold: 15,
  },
};

export function tierFromPoints(points) {
  const p = Number(points) || 0;
  if (p >= 15) return TIERS.Platinum;
  if (p >= 10) return TIERS.Gold;
  if (p >= 5) return TIERS.Silver;
  return TIERS.Bronze;
}

export const MAX_POINTS = 20;
