// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Usdc is ERC20 {
    constructor() ERC20('USDC Stable', 'USDC') {}

    function faucet (address recipient, uint amount) external {
        _mint(recipient, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}