require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { ethers } = require('ethers');

// Ensure ABI matches the compiled contract
const SettlementABI = [
    "function settleBatch(tuple(address buyer, address seller, uint32 quantity, uint32 price)[] calldata trades) external",
    "event BatchSettled(uint256 totalTrades, uint256 totalValue)"
];

class SettlementService {
    constructor() {
        if(!process.env.RPC_URL) {
            require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
        }
        this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
        
        // Using orchestrator private key from setup, default to hardhat account 0 if not set
        const pk = process.env.ORCHESTRATOR_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        this.wallet = new ethers.Wallet(pk, this.provider);
        this.settlementContract = null;
        if (process.env.NEXT_PUBLIC_SETTLEMENT_ADDRESS) {
            this.settlementContract = new ethers.Contract(process.env.NEXT_PUBLIC_SETTLEMENT_ADDRESS, SettlementABI, this.wallet);
        }
    }

    async settleBatch(matches) {
        if (!this.settlementContract) {
             if (process.env.NEXT_PUBLIC_SETTLEMENT_ADDRESS) {
                 this.settlementContract = new ethers.Contract(process.env.NEXT_PUBLIC_SETTLEMENT_ADDRESS, SettlementABI, this.wallet);
             } else {
                 console.error("Settlement address not set in .env");
                 return;
             }
        }
        
        // Convert matches to smart contract struct format
        const tradesStruct = matches.map(m => ({
            buyer: m.buyer,
            seller: m.seller,
            quantity: m.quantity,
            price: m.price
        }));

        try {
            console.log(`[Settlement] Submitting batch of ${tradesStruct.length} trades to blockchain...`);
            const tx = await this.settlementContract.settleBatch(tradesStruct);
            console.log(`[Settlement] Transaction sent. Hash: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`[Settlement] Batch settled successfully in block ${receipt.blockNumber}`);
            return receipt;
        } catch (error) {
            console.error(`[Settlement] Error submitting batch to blockchain:`, error);
        }
    }
}

module.exports = new SettlementService();
