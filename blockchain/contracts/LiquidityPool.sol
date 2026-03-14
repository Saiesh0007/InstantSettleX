// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LiquidityPool is Ownable {
    IERC20 public inrToken;
    address public settlementContract;

    event Deposited(address indexer, uint32 amount);
    event Borrowed(address borrower, uint32 amount);
    event Repaid(address borrower, uint32 amount);

    constructor(address _inrToken) Ownable(msg.sender) {
        inrToken = IERC20(_inrToken);
    }

    function setSettlementContract(address _settlementContract) external onlyOwner {
        settlementContract = _settlementContract;
    }

    modifier onlySettlement() {
        require(msg.sender == settlementContract, "Only settlement contract can borrow");
        _;
    }

    function deposit(uint32 amount) external {
        require(inrToken.transferFrom(msg.sender, address(this), amount), "Deposit failed");
        emit Deposited(msg.sender, amount);
    }

    function borrow(uint32 amount) external onlySettlement {
        require(inrToken.transfer(msg.sender, amount), "Borrow transfer failed");
        emit Borrowed(msg.sender, amount);
    }

    function repay(uint32 amount) external onlySettlement {
        require(inrToken.transferFrom(msg.sender, address(this), amount), "Repay failed");
        emit Repaid(msg.sender, amount);
    }
}
