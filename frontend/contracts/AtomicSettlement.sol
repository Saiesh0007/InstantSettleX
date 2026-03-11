// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AtomicSettlement {
    IERC20 public paymentToken;

    uint256 public tradeCounter;

    struct Trade {
        uint256 id;
        address buyer;
        address seller;
        address stockToken;
        uint256 stockAmount;
        uint256 pricePerStock;
        bool settled;
    }

    mapping(uint256 => Trade) public trades;

    event TradeCreated(
        uint256 tradeId,
        address buyer,
        address seller,
        address stockToken,
        uint256 amount,
        uint256 price
    );

    event TradeSettled(uint256 tradeId);

    constructor(address _paymentToken) {
        paymentToken = IERC20(_paymentToken);
    }

    function createTrade(
        address buyer,
        address seller,
        address stockToken,
        uint256 stockAmount,
        uint256 pricePerStock
    ) external returns (uint256) {
        tradeCounter++;

        trades[tradeCounter] = Trade({
            id: tradeCounter,
            buyer: buyer,
            seller: seller,
            stockToken: stockToken,
            stockAmount: stockAmount,
            pricePerStock: pricePerStock,
            settled: false
        });

        emit TradeCreated(
            tradeCounter,
            buyer,
            seller,
            stockToken,
            stockAmount,
            pricePerStock
        );

        return tradeCounter;
    }

    function settleTrade(uint256 tradeId) external {
        Trade storage trade = trades[tradeId];

        require(!trade.settled, "Trade already settled");

        uint256 totalCost = trade.stockAmount * trade.pricePerStock;

        IERC20 stock = IERC20(trade.stockToken);

        // Transfer INR from buyer → seller
        require(
            paymentToken.transferFrom(trade.buyer, trade.seller, totalCost),
            "INR transfer failed"
        );

        // Transfer stock from seller → buyer
        require(
            stock.transferFrom(trade.seller, trade.buyer, trade.stockAmount),
            "Stock transfer failed"
        );

        trade.settled = true;

        emit TradeSettled(tradeId);
    }
}
