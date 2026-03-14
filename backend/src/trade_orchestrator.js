const EventEmitter = require('events');
const nseEngine = require('./nse_engine');
const bseEngine = require('./bse_engine');
const settlementService = require('./settlement_service');

class TradeOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.nseTrades = [];
        this.bseTrades = [];
    }

    start() {
        console.log("Starting Trade Orchestrator...");
        
        nseEngine.on('trade', (trade) => {
            console.log(`[NSE] New Trade: ${trade.quantity} ${trade.stock} @ ₹${trade.price}`);
            this.nseTrades.push(trade);
            this.detectArbitrage();
        });

        bseEngine.on('trade', (trade) => {
            console.log(`[BSE] New Trade: ${trade.quantity} ${trade.stock} @ ₹${trade.price}`);
            this.bseTrades.push(trade);
            this.detectArbitrage();
        });

        nseEngine.start();
        bseEngine.start();
    }

    detectArbitrage() {
        if (this.nseTrades.length === 0 || this.bseTrades.length === 0) return;

        const nseTrade = this.nseTrades[0];
        const bseTrade = this.bseTrades[0];

        if (nseTrade.price < bseTrade.price) {
            const profitPerShare = bseTrade.price - nseTrade.price;
            console.log(`[Arbitrage Detected] NSE Buy @ ₹${nseTrade.price} | BSE Sell @ ₹${bseTrade.price}`);
            
            const matchedQty = Math.min(nseTrade.quantity, bseTrade.quantity);
            
            const trade1 = { ...nseTrade, quantity: matchedQty }; 
            const trade2 = { ...bseTrade, quantity: matchedQty }; 
            
            this.nseTrades.shift(); 
            this.bseTrades.shift();
            
            this.emit('arbitrage', {
                buyPrice: nseTrade.price,
                sellPrice: bseTrade.price,
                profitPerShare: profitPerShare,
                quantity: matchedQty,
                timestamp: Date.now()
            });

            this.triggerBatchSettlement([trade1, trade2]);
        } else {
            // Discard mismatched trades to prevent queue jam
            this.nseTrades.shift();
            this.bseTrades.shift();
        }
    }

    async triggerBatchSettlement(matches) {
        console.log(`[Orchestrator] Grouping ${matches.length} trades for batch settlement...`);
        try {
            const receipt = await settlementService.settleBatch(matches);
            if(receipt) {
                this.emit('settlement', {
                    hash: receipt.hash,
                    block: receipt.blockNumber,
                    trades: matches.length,
                    timestamp: Date.now()
                });
            }
        } catch (e) {
            console.error("Batch settlement failed:", e);
        }
    }
}

module.exports = new TradeOrchestrator();
