# Solidity API

## CrowdfundingCampaign

_A contract for managing crowdfunding campaigns and token minting._

### name

```solidity
string name
```

### description

```solidity
string description
```

### fees

```solidity
uint8 fees
```

### artistAddress

```solidity
address artistAddress
```

### nbTiers

```solidity
uint8 nbTiers
```

### boost

```solidity
uint256 boost
```

### CampaignStarted

```solidity
event CampaignStarted(uint256 _startTimestamp, uint256 _endTimestamp)
```

### CampaignClosed

```solidity
event CampaignClosed(uint256 _endTimestamp)
```

### CampaignInfoUpdated

```solidity
event CampaignInfoUpdated(string _name, string _description, uint8 _fees)
```

### TierPriceAdded

```solidity
event TierPriceAdded(uint8 _id, uint256 _price)
```

### FundWithdraw

```solidity
event FundWithdraw(address _artistAddr, uint256 _usdcBalance, uint256 _ethBalance, uint256 _timestamp)
```

### Boosted

```solidity
event Boosted(uint256 _timestamp)
```

### isContractOwner

```solidity
modifier isContractOwner()
```

_Throws if the caller is not the contract owner._

### onlyArtist

```solidity
modifier onlyArtist()
```

_Throws if the caller is not the campaign artist._

### campaignNotStarted

```solidity
modifier campaignNotStarted()
```

_Throws if the campaign has already started._

### campaignInProgress

```solidity
modifier campaignInProgress()
```

_Throws if the campaign is not in progress._

### campaignClosed

```solidity
modifier campaignClosed()
```

_Throws if the campaign is not closed._

### constructor

```solidity
constructor(string baseUri_, address tuneTogetherAddr_, address usdcAddr_, address _artistAddr, string _name, uint8 _fees, string _description, uint8 _nbTiers) public
```

_Initializes the CrowdfundingCampaign contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| baseUri_ | string | The base URI for the token metadata. |
| tuneTogetherAddr_ | address | The address of the TuneTogether contract. |
| usdcAddr_ | address | The address of the USDC token contract. |
| _artistAddr | address | The address of the artist wallet. |
| _name | string | The name of the campaign. |
| _fees | uint8 | The fees of the campaign. |
| _description | string | The description of the campaign. |
| _nbTiers | uint8 | The number of tier prices in the campaign. |

### mint

```solidity
function mint(uint8 _id, uint256 _amount) public
```

_Mints a specific amount of tokens to the caller._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint8 | The ID of the token to mint. |
| _amount | uint256 | The amount of tokens to mint. |

### uri

```solidity
function uri(uint256 _tokenId) public view returns (string _uri)
```

_Returns the token URI for a given token ID._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _tokenId | uint256 | The ID of the token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _uri | string | The URI of the token metadata. |

### startCampaign

```solidity
function startCampaign() external
```

_Starts the crowdfunding campaign._

### closeCampaign

```solidity
function closeCampaign() external
```

_Closes the crowdfunding campaign._

### updateCampaignInfo

```solidity
function updateCampaignInfo(string _name, string _description, uint8 _fees) external
```

_Updates the campaign information._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _name | string | The updated name of the campaign. |
| _description | string | The updated description of the campaign. |
| _fees | uint8 | The updated fees of the campaign. |

### setTierPrice

```solidity
function setTierPrice(uint8 _id, uint256 _price) external
```

_Sets the price for a specific tier in the campaign._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint8 | The ID of the tier. |
| _price | uint256 | The price of the tier. |

### getTierPrice

```solidity
function getTierPrice(uint8 _id) external view returns (uint256 _price)
```

_Retrieves the price of a specific tier in the campaign._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | uint8 | The ID of the tier. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _price | uint256 | The price of the tier. |

### setBoost

```solidity
function setBoost(uint256 _timestamp) external
```

_Sets the boost timestamp for the campaign._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _timestamp | uint256 | The boost timestamp. |

### withdraw

```solidity
function withdraw() external
```

_Withdraws funds from the campaign._

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address _operator, address _from, address _to, uint256[] _ids, uint256[] _amounts, bytes _data) internal
```

_The following functions are overrides required by Solidity. Hook function called before any token transfer._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _operator | address | The address performing the operation. |
| _from | address | The address transferring the tokens. |
| _to | address | The address receiving the tokens. |
| _ids | uint256[] | The IDs of the tokens being transferred. |
| _amounts | uint256[] | The amounts of tokens being transferred. |
| _data | bytes | Additional data. |

