const { ethers, upgrades, network } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const chainId = Number((await ethers.provider.getNetwork()).chainId);

    console.log(`\n⛓  Network: ${network.name} (chainId ${chainId})`);
    console.log(`👤 Deployer: ${deployer.address}`);

    // Strategy A: dynamic metadata served by scripts/server.js at /metadata/.
    // Placeholder points at localhost; swap with a public URL via setBaseURI()
    // once the server is deployed behind a public domain.
    const baseURI =
        (process.env.PINATA_BASE_URL && process.env.PINATA_CID_OF_NFT)
            ? process.env.PINATA_BASE_URL + process.env.PINATA_CID_OF_NFT + "/"
            : (process.env.METADATA_BASE_URI || "http://localhost:3000/metadata/");
    console.log(`🌐 baseURI:  ${baseURI}`);

    const Factory = await ethers.getContractFactory("DompasNFT");
    const nft = await upgrades.deployProxy(Factory,
        [deployer.address, baseURI],
        { initializer: 'initialize', kind: 'uups' });

    await nft.waitForDeployment();
    const proxy = await nft.getAddress();
    const impl  = await upgrades.erc1967.getImplementationAddress(proxy);

    console.log(`\n✅ Proxy:          ${proxy}`);
    console.log(`   Implementation: ${impl}\n`);

    // Print a ready-to-paste .env snippet so the user doesn't have to hunt.
    const rpcForServer = network.name === "localhost"
        ? "http://127.0.0.1:8545"
        : (process.env.SEPOLIA_RPC_URL || "<your RPC URL>");

    console.log("── Paste into .env ────────────────────────────────────");
    console.log(`RPC_URL=${rpcForServer}`);
    console.log(`LEFTY_NFT_ADDR=${proxy}`);
    if (network.name === "localhost") {
        console.log("# Hardhat node account #0 (only for local dev, never on mainnet):");
        console.log("PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    }
    console.log("───────────────────────────────────────────────────────\n");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
