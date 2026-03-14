// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ILiquidityPool {
    function borrow(uint32 amount) external;
    function repay(uint32 amount) external;
}

contract CrossExchangeSettlement {
    IERC20 public inrToken;
    IERC20 public stockToken;
    ILiquidityPool public liquidityPool;

    struct Trade {
        address buyer;
        address seller;
        uint32 quantity;
        uint32 price;
    }

    // Temporary storage for user debts within a batch to avoid memory limitations
    mapping(address => uint256) private userDebt;

    event BatchSettled(uint256 totalTrades, uint256 totalValue);

    constructor(address _inrToken, address _stockToken, address _liquidityPool) {
        inrToken = IERC20(_inrToken);
        stockToken = IERC20(_stockToken);
        liquidityPool = ILiquidityPool(_liquidityPool);
    }

    function settleBatch(Trade[] calldata trades) external {
        uint256 totalValueSettled = 0;
        uint32 totalBorrowed = 0;

        for (uint i = 0; i < trades.length; i++) {
            Trade calldata trade = trades[i];
            uint256 totalCost = uint256(trade.quantity) * uint256(trade.price);
            
            uint256 buyerBalance = inrToken.balanceOf(trade.buyer);
            
            if (buyerBalance < totalCost) {
                uint256 shortfall = totalCost - buyerBalance;
                
                // Borrow from liquidity pool (transfers INR to this contract)
                uint32 shortfall32 = uint32(shortfall);
                liquidityPool.borrow(shortfall32);
                totalBorrowed += shortfall32;
                userDebt[trade.buyer] += shortfall;
                
                if (buyerBalance > 0) {
                    require(inrToken.transferFrom(trade.buyer, trade.seller, buyerBalance), "INR transfer from buyer failed");
                }
                require(inrToken.transfer(trade.seller, shortfall), "INR borrowed transfer failed");
            } else {
                require(inrToken.transferFrom(trade.buyer, trade.seller, totalCost), "INR full transfer failed");
            }

            // Transfer stock from seller to buyer
            require(stockToken.transferFrom(trade.seller, trade.buyer, trade.quantity), "Stock transfer failed");
            
            totalValueSettled += totalCost;
        }

        // Repay pool if we borrowed
        if (totalBorrowed > 0) {
            for (uint i = 0; i < trades.length; i++) {
                address buyer = trades[i].buyer;
                uint256 debt = userDebt[buyer];
                if (debt > 0) {
                    // Pull funds from the buyer (who is presumably an arbitrage trader and received funds in a subsequent trade in this batch)
                    require(inrToken.transferFrom(buyer, address(this), debt), "Failed to recover debt from buyer");
                    userDebt[buyer] = 0;
                }
            }
            
            require(inrToken.approve(address(liquidityPool), totalBorrowed), "Approve pool failed");
            liquidityPool.repay(totalBorrowed);
        }

        emit BatchSettled(trades.length, totalValueSettled);
    }
}
