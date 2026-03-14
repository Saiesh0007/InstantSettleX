const EventEmitter = require('events');

class NSEEngine extends EventEmitter {
    constructor() {
        super();
        this.stockSymbol = "INFY";
        this.interval = null;
    }

    start(intervalMs = 4000) {
        if (this.interval) return;
        this.interval = setInterval(() => {
            const price = 1490 + Math.floor(Math.random() * 20); // 1490 - 1509
            const trade = {
                exchange: "NSE",
                stock: this.stockSymbol,
                quantity: 10 + Math.floor(Math.random() * 50),
                price: price,
                buyer: process.env.ARBITRAGEUR_ADDRESS,
                seller: process.env.SELLER_ADDRESS,
                timestamp: Date.now()
            };
            this.emit('trade', trade);
        }, intervalMs);
    }
    
    stop() {
        if(this.interval) clearInterval(this.interval);
    }
}

module.exports = new NSEEngine();
