const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer, userA, userB, userC] = await hre.ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);

    const INRToken = await hre.ethers.getContractFactory("INRToken");
    const inrToken = await INRToken.deploy();
    await inrToken.waitForDeployment();
    console.log("INRToken deployed to:", inrToken.target);

    const StockToken = await hre.ethers.getContractFactory("StockToken");
    const stockToken = await StockToken.deploy("Infosys Token", "INFY", "INFY");
    await stockToken.waitForDeployment();
    console.log("StockToken deployed to:", stockToken.target);

    const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
    const liquidityPool = await LiquidityPool.deploy(inrToken.target);
    await liquidityPool.waitForDeployment();
    console.log("LiquidityPool deployed to:", liquidityPool.target);

    const Settlement = await hre.ethers.getContractFactory("CrossExchangeSettlement");
    const settlement = await Settlement.deploy(inrToken.target, stockToken.target, liquidityPool.target);
    await settlement.waitForDeployment();
    console.log("Settlement deployed to:", settlement.target);

    // Setup: Set settlement contract in LiquidityPool
    await liquidityPool.setSettlementContract(settlement.target);

    // Setup: Mint tokens
    // Mint 100,000 INR to the Liquidity Pool (Fits in uint32)
    await inrToken.mint(liquidityPool.target, 100000);
    
    // Seed wallets
    // User A will act as the arbitrageur (starts with 0 INR but has gas ETH for some actions, though they won't invoke blockchain directly!)
    // User B will act as Seller on NSE (needs INFY tokens)
    // User C will act as Buyer on BSE (needs INR tokens)
    
    // So give User B 100,000 INFY
    await stockToken.mint(userB.address, 100000);
    // Give User C 100,000 INR
    await inrToken.mint(userC.address, 100000);
    
    // Provide unlimited approval to settlement contract from these users (in reality users would call approve themselves via frontend)
    await inrToken.connect(userC).approve(settlement.target, hre.ethers.MaxUint256);
    await stockToken.connect(userB).approve(settlement.target, hre.ethers.MaxUint256);
    await inrToken.connect(userA).approve(settlement.target, hre.ethers.MaxUint256);
    await stockToken.connect(userA).approve(settlement.target, hre.ethers.MaxUint256);

    console.log("Wallets seeded: User B (Seller NSE) has INFY, User C (Buyer BSE) has INR.");
    
    // Save addresses to .env.local in frontend and backend
    const envContent = `
NEXT_PUBLIC_SETTLEMENT_ADDRESS=${settlement.target}
NEXT_PUBLIC_INR_TOKEN_ADDRESS=${inrToken.target}
NEXT_PUBLIC_STOCK_TOKEN_ADDRESS=${stockToken.target}
NEXT_PUBLIC_POOL_ADDRESS=${liquidityPool.target}

# The orchestrator will use the deployer private key (Account 0)
ORCHESTRATOR_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Accounts
ARBITRAGEUR_ADDRESS=${userA.address}
SELLER_ADDRESS=${userB.address}
BUYER_ADDRESS=${userC.address}
RPC_URL=http://127.0.0.1:8545
`;
    // We also save private keys for the orchestrator to use to sign transactions
    
    const frontendEnvPath = path.join(__dirname, "../../frontend/.env.local");
    const backendEnvPath = path.join(__dirname, "../../backend/.env");
    
    fs.writeFileSync(frontendEnvPath, envContent.trim() + "\n", { flag: 'w' });
    fs.writeFileSync(backendEnvPath, envContent.trim() + "\n", { flag: 'w' });

    console.log("Addresses saved to .env files");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
