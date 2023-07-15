// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol';

/// @title USDC Contract
/// @dev A contract representing the USDC stablecoin.
contract Usdc is ERC20 {
    /// @dev Initializes the USDC contract.
    constructor() ERC20('USDC Stable', 'USDC') {}

    /// @dev Distributes USDC tokens to the recipient.
    /// @param recipient The address of the recipient.
    /// @param amount The amount of USDC tokens to distribute.
    function faucet (address recipient, uint amount) external {
        _mint(recipient, amount);
    }

    /// @dev Retrieves the number of decimal places used by USDC tokens.
    /// @return _decimals The number of decimal places.
    function decimals() public view virtual override returns (uint8 _decimals) {
        return 6;
    }
}