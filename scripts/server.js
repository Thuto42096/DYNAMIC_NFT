require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connection to the Blockchain (server acts as contract owner).
//    RPC_URL wins; falls back to SEPOLIA_RPC_URL so existing .env still works.
const RPC_URL = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || "http://localhost:3000";

if (!RPC_URL) throw new Error("Set RPC_URL or SEPOLIA_RPC_URL in .env");
if (!process.env.PRIVATE_KEY) throw new Error("Set PRIVATE_KEY in .env");
if (!process.env.LEFTY_NFT_ADDR) throw new Error("Set LEFTY_NFT_ADDR in .env (deployed proxy address)");

const provider = new ethers.JsonRpcProvider(RPC_URL);
const ownerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.LEFTY_NFT_ADDR;
const abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function TokenOwnership(address owner) view returns (uint256)",
  "function tokenPoints(uint256 tokenId) view returns (uint256)",
  "function nextTokenId() view returns (uint256)",
  "function MAX_POINTS() view returns (uint256)",
  "function updatePoints(uint256 tokenId, uint256 points)",
  "function mint(address to)"
];
const nftContract = new ethers.Contract(contractAddress, abi, ownerWallet);

// 2. The exact message the frontend will ask the user to sign
const SIGN_IN_MESSAGE = "Welcome to the Club! Please sign this message to verify your wallet ownership.";

// 3. Tier mapping: 0-4 Bronze, 5-9 Silver, 10-14 Gold, 15-20 Platinum
function pointsToTier(points) {
  const p = Number(points);
  if (p >= 15) return "Platinum";
  if (p >= 10) return "Gold";
  if (p >= 5) return "Silver";
  return "Bronze";
}

function verifySignature(walletAddress, signature) {
  const recovered = ethers.verifyMessage(SIGN_IN_MESSAGE, signature);
  return recovered.toLowerCase() === walletAddress.toLowerCase();
}

app.post('/verify-nft', async (req, res) => {
  const { walletAddress, signature } = req.body;

  if (!walletAddress || !signature) {
    return res.status(400).json({ authorized: false, message: "Missing address or signature" });
  }

  try {
    if (!verifySignature(walletAddress, signature)) {
      return res.status(401).json({ authorized: false, message: "Invalid signature. Authentication failed." });
    }

    const balance = await nftContract.balanceOf(walletAddress);
    if (balance === 0n) {
      return res.status(403).json({ authorized: false, message: "No NFT found. Join the club first." });
    }

    const tokenId = await nftContract.TokenOwnership(walletAddress);
    const maxPoints = await nftContract.MAX_POINTS();
    const currentPoints = await nftContract.tokenPoints(tokenId);

    let newPoints = currentPoints;
    if (currentPoints < maxPoints) {
      const tx = await nftContract.updatePoints(tokenId, 1);
      await tx.wait();
      newPoints = currentPoints + 1n;
    }

    res.status(200).json({
      authorized: true,
      message: "Access Granted",
      tokenId: tokenId.toString(),
      points: Number(newPoints),
      tier: pointsToTier(newPoints)
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ authorized: false, message: "Error processing request" });
  }
});

app.post('/mint', async (req, res) => {
  const { walletAddress, signature } = req.body;

  if (!walletAddress || !signature) {
    return res.status(400).json({ message: "Missing address or signature" });
  }

  try {
    if (!verifySignature(walletAddress, signature)) {
      return res.status(401).json({ message: "Invalid signature. Authentication failed." });
    }

    const balance = await nftContract.balanceOf(walletAddress);
    if (balance > 0n) {
      return res.status(409).json({ message: "Wallet already owns an NFT" });
    }

    const tx = await nftContract.mint(walletAddress);
    await tx.wait();
    const tokenId = await nftContract.TokenOwnership(walletAddress);

    res.status(200).json({
      message: "Mint successful",
      tokenId: tokenId.toString(),
      txHash: tx.hash
    });
  } catch (error) {
    console.error("Mint error:", error);
    res.status(500).json({ message: "Error processing request" });
  }
});

// Tier visual palette — mirrors frontend/src/lib/tiers.js. Used by the
// dynamic SVG endpoint so image re-renders automatically when tier changes.
const TIER_VISUALS = {
  Bronze:   { hex: "#CD7F32", from: "#8a4e1f", to: "#e59a5a", tagline: "INITIATE"  },
  Silver:   { hex: "#C0C0C0", from: "#6c7a8a", to: "#e8eef7", tagline: "OPERATOR"  },
  Gold:     { hex: "#FFD700", from: "#a88400", to: "#ffe866", tagline: "ENVOY"     },
  Platinum: { hex: "#E5E4E2", from: "#8aa8cf", to: "#f7fbff", tagline: "SOVEREIGN" },
};

function tierSvg(tokenId, points, tier) {
  const v = TIER_VISUALS[tier] || TIER_VISUALS.Bronze;
  const maxPoints = 20;
  const pct = Math.min(100, (Number(points) / maxPoints) * 100).toFixed(1);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0c16"/>
      <stop offset="100%" stop-color="#02030a"/>
    </linearGradient>
    <linearGradient id="tier" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${v.from}"/>
      <stop offset="100%" stop-color="${v.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="${v.hex}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${v.hex}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <circle cx="300" cy="300" r="260" fill="url(#glow)"/>
  <g stroke="${v.hex}" stroke-opacity="0.18" stroke-width="1" fill="none">
    ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 60}" x2="600" y2="${i * 60}"/>`).join("")}
    ${Array.from({ length: 11 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="600"/>`).join("")}
  </g>
  <rect x="40" y="40" width="520" height="520" rx="18" fill="none" stroke="${v.hex}" stroke-opacity="0.65" stroke-width="2"/>
  <text x="60" y="90" font-family="Orbitron, monospace" font-weight="700" font-size="22" letter-spacing="6" fill="${v.hex}">DOMPAS · PASSPORT</text>
  <text x="540" y="90" text-anchor="end" font-family="Orbitron, monospace" font-size="14" letter-spacing="4" fill="#6a7fa3">#${tokenId}</text>
  <text x="300" y="310" text-anchor="middle" font-family="Orbitron, monospace" font-weight="900" font-size="180" fill="url(#tier)">${tier[0]}</text>
  <text x="300" y="380" text-anchor="middle" font-family="Orbitron, monospace" font-weight="900" font-size="52" letter-spacing="12" fill="${v.hex}">${tier.toUpperCase()}</text>
  <text x="300" y="410" text-anchor="middle" font-family="Orbitron, monospace" font-size="14" letter-spacing="8" fill="#6a7fa3">${v.tagline}</text>
  <text x="60" y="488" font-family="Orbitron, monospace" font-size="12" letter-spacing="4" fill="#6a7fa3">LOYALTY POINTS</text>
  <text x="540" y="488" text-anchor="end" font-family="Orbitron, monospace" font-size="14" fill="${v.hex}">${points} / ${maxPoints}</text>
  <rect x="60" y="500" width="480" height="10" rx="5" fill="#ffffff" fill-opacity="0.06"/>
  <rect x="60" y="500" width="${(480 * pct) / 100}" height="10" rx="5" fill="url(#tier)"/>
  <text x="60" y="550" font-family="Orbitron, monospace" font-size="11" letter-spacing="4" fill="${v.hex}" opacity="0.7">MEMBER · DYNAMIC · v1.0</text>
</svg>`;
}

// Dynamic image endpoint — re-rendered per request with live tier/points.
app.get('/image/:file', async (req, res) => {
  try {
    const match = req.params.file.match(/^(\d+)\.svg$/);
    if (!match) return res.status(404).send("Not found");
    const tokenId = match[1];
    try { await nftContract.ownerOf(tokenId); }
    catch (e) { return res.status(404).send("Token does not exist"); }
    const points = await nftContract.tokenPoints(tokenId);
    const tier = pointsToTier(points);
    res.set('Content-Type', 'image/svg+xml');
    res.set('Cache-Control', 'no-store');
    res.status(200).send(tierSvg(tokenId, Number(points), tier));
  } catch (error) {
    console.error("Image error:", error);
    res.status(500).send("Error");
  }
});

// Dynamic metadata endpoint (Strategy A).
// Contract baseURI should be set to e.g. http://localhost:3000/metadata/
app.get('/metadata/:file', async (req, res) => {
  try {
    const match = req.params.file.match(/^(\d+)\.json$/);
    if (!match) return res.status(404).json({ message: "Not found" });
    const tokenId = match[1];

    try { await nftContract.ownerOf(tokenId); }
    catch (e) { return res.status(404).json({ message: "Token does not exist" }); }

    const points = await nftContract.tokenPoints(tokenId);
    const tier = pointsToTier(points);

    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      name: `Dompas NFT #${tokenId}`,
      description: "Dynamic membership passport. Tier and loyalty points update on-chain each time the holder authenticates. Four tiers: Bronze, Silver, Gold, Platinum.",
      image: `${PUBLIC_BASE_URL}/image/${tokenId}.svg`,
      external_url: PUBLIC_BASE_URL,
      attributes: [
        { trait_type: "Tier", value: tier },
        { trait_type: "Points", value: Number(points), max_value: 20 },
        { trait_type: "Token ID", value: Number(tokenId) }
      ]
    });
  } catch (error) {
    console.error("Metadata error:", error);
    res.status(500).json({ message: "Error processing request" });
  }
});

app.listen(3000, () => {
  console.log(`Server running on ${PUBLIC_BASE_URL}`);
  console.log(`  RPC:       ${RPC_URL}`);
  console.log(`  Contract:  ${contractAddress}`);
  console.log(`  Signer:    ${ownerWallet.address}`);
});