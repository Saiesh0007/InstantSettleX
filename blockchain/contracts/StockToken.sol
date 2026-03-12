// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StockToken is ERC20, Ownable {
    string public stockSymbol;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory _stockSymbol
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        stockSymbol = _stockSymbol;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
