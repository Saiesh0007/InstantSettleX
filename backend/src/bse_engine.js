const EventEmitter = require('events');

class BSEEngine extends EventEmitter {
    constructor() {
        super();
        this.stockSymbol = "INFY";
        this.interval = null;
    }

    start(intervalMs = 4000) {
        if (this.interval) return;
        this.interval = setInterval(() => {
            const price = 1505 + Math.floor(Math.random() * 20); // 1505 - 1524
            const trade = {
                exchange: "BSE",
                stock: this.stockSymbol,
                quantity: 10 + Math.floor(Math.random() * 50),
                price: price,
                buyer: process.env.BUYER_ADDRESS,
                seller: process.env.ARBITRAGEUR_ADDRESS,
                timestamp: Date.now()
            };
            this.emit('trade', trade);
        }, intervalMs);
    }
    
    stop() {
        if(this.interval) clearInterval(this.interval);
    }
}

module.exports = new BSEEngine();
