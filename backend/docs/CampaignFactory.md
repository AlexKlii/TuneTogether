# Solidity API

## CampaignFactory

_A contract for creating crowdfunding campaigns._

### CrowdfundingCampaignCreated

```solidity
event CrowdfundingCampaignCreated(address _artistAddr, address _campaignAddress, uint256 _timestamp)
```

### OwnerContractUpdated

```solidity
event OwnerContractUpdated(address _contractAddr)
```

### isContractOwner

```solidity
modifier isContractOwner()
```

_Throws if the caller is not the owner of the contract._

### createCrowdfundingCampaign

```solidity
function createCrowdfundingCampaign(string _uri, address _artistAddr, string _name, uint8 _fees, string _description, uint8 _nbTiers, address _usdcAddr, uint256 _objectif) external returns (address campaignAddress)
```

_Creates a new crowdfunding campaign._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _uri | string | The URI of the campaign metadata. |
| _artistAddr | address | The address of the artist. |
| _name | string | The name of the campaign. |
| _fees | uint8 | The fees of the campaign. |
| _description | string | The description of the campaign. |
| _nbTiers | uint8 | The number of tier prices in the campaign. |
| _usdcAddr | address | The address of the USDC token contract. |
| _objectif | uint256 | The price objectif of the campaign. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| campaignAddress | address | The address of the created crowdfunding campaign. |

### setOwnerContractAddr

```solidity
function setOwnerContractAddr(address ownerContractAddr_) external
```

_Sets the address of the owner contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ownerContractAddr_ | address | The address of the owner contract. |

