const { ethers, upgrades, network } = require("hardhat");

async function main() {
    const proxyAddress = process.env.LEFTY_NFT_ADDR;
    if (!proxyAddress) throw new Error("Set LEFTY_NFT_ADDR in .env to the deployed proxy address");

    const [deployer] = await ethers.getSigners();
    const chainId = Number((await ethers.provider.getNetwork()).chainId);

    console.log(`\n⛓  Network: ${network.name} (chainId ${chainId})`);
    console.log(`👤 Deployer: ${deployer.address}`);
    console.log(`📦 Proxy:    ${proxyAddress}`);

    const oldImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`   Old impl: ${oldImpl}`);

    const Factory = await ethers.getContractFactory("DompasNFT");
    const upgraded = await upgrades.upgradeProxy(proxyAddress, Factory, { kind: 'uups' });
    await upgraded.waitForDeployment();

    const newImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`\n✅ Upgrade complete`);
    console.log(`   New impl: ${newImpl}\n`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
