# Solidity API

## Usdc

_A contract representing the USDC stablecoin._

### constructor

```solidity
constructor() public
```

_Initializes the USDC contract._

### faucet

```solidity
function faucet(address recipient, uint256 amount) external
```

_Distributes USDC tokens to the recipient._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address of the recipient. |
| amount | uint256 | The amount of USDC tokens to distribute. |

### decimals

```solidity
function decimals() public view virtual returns (uint8 _decimals)
```

_Retrieves the number of decimal places used by USDC tokens._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _decimals | uint8 | The number of decimal places. |

