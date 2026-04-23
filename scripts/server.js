require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connection to the Blockchain (server acts as contract owner)
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
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

// Dynamic metadata endpoint (Strategy A).
// Contract baseURI should be set to e.g. http://localhost:3000/metadata/
app.get('/metadata/:file', async (req, res) => {
  try {
    const match = req.params.file.match(/^(\d+)\.json$/);
    if (!match) {
      return res.status(404).json({ message: "Not found" });
    }
    const tokenId = match[1];

    try {
      await nftContract.ownerOf(tokenId);
    } catch (e) {
      return res.status(404).json({ message: "Token does not exist" });
    }

    const points = await nftContract.tokenPoints(tokenId);
    const tier = pointsToTier(points);

    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      name: `Dompas NFT #${tokenId}`,
      description: "Dynamic membership NFT. Points and tier update on each login.",
      image: process.env.NFT_IMAGE_URL || "",
      attributes: [
        { trait_type: "Points", value: Number(points) },
        { trait_type: "Tier", value: tier }
      ]
    });
  } catch (error) {
    console.error("Metadata error:", error);
    res.status(500).json({ message: "Error processing request" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));