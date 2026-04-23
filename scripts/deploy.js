const { ethers, upgrades, run } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying dNFT with account:", deployer.address);
    const baseURI = process.env.PINATA_BASE_URL + process.env.PINATA_CID_OF_NFT + "/";
    console.log("Base URI for metadata: ", baseURI);

    const LNFTFactory = await ethers.getContractFactory("DompasNFT");
    const thlft = await upgrades.deployProxy(LNFTFactory, 
        [deployer.address, baseURI], { 
            initializer: 'initialize',
            kind: 'uups'});

    await thlft.waitForDeployment();

    console.log("Proxy deployed at address: ", thlft.target);
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(thlft.target);
    console.log("Implementation contract address: ", implementationAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
