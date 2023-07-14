# Solidity API

## TuneTogether

_A contract for managing campaigns and artists._

### Campaign

```solidity
struct Campaign {
  string name;
  string description;
  uint8 fees;
  uint8 nbTiers;
  address artist;
  uint256 boost;
}
```

### Artist

```solidity
struct Artist {
  string name;
  string bio;
  uint8 feeSchedule;
}
```

### artists

```solidity
mapping(address => struct TuneTogether.Artist) artists
```

### campaigns

```solidity
mapping(address => struct TuneTogether.Campaign) campaigns
```

### ArtistCreated

```solidity
event ArtistCreated(address _artistAddr)
```

### CampaignAdded

```solidity
event CampaignAdded(address _artistAddr, address _campaignAddr)
```

### CampaignUpdated

```solidity
event CampaignUpdated(address _campaignAddr)
```

### CampaignBoosted

```solidity
event CampaignBoosted(address _contractAddr, uint256 _timestamp)
```

### constructor

```solidity
constructor(address _campaignFactoryAddress, address usdcAddr_) public
```

_Initializes the TuneTogether contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _campaignFactoryAddress | address | The address of the CampaignFactory contract. |
| usdcAddr_ | address | The address of the USDC token contract. |

### createNewCampaign

```solidity
function createNewCampaign(string _campaignName, string _description, uint8 _fees, string _artistName, string _bio, string _uri, uint8 _nbTiers) external
```

_Creates a new campaign and associates it with an artist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _campaignName | string | The name of the campaign. |
| _description | string | The description of the campaign. |
| _fees | uint8 | The fees of the campaign. |
| _artistName | string | The name of the artist. |
| _bio | string | The bio of the artist. |
| _uri | string | The URI of the campaign metadata. |
| _nbTiers | uint8 | The number of tier prices in the campaign. |

### updateCampaignInfo

```solidity
function updateCampaignInfo(string _name, string _description, uint8 _fees, address _addr) external
```

_Updates the information of a campaign._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _name | string | The updated name of the campaign. |
| _description | string | The updated description of the campaign. |
| _fees | uint8 | The updated fees of the campaign. |
| _addr | address | The address of the campaign to update. |

### isArtist

```solidity
function isArtist(address _addr) external view returns (bool _isArtist)
```

_Checks if an address belongs to an artist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | The address to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _isArtist | bool | A boolean indicating whether the address is associated with an artist. |

### getArtist

```solidity
function getArtist(address _addr) external view returns (struct TuneTogether.Artist _artist)
```

_Retrieves the information of an artist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | The address of the artist. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _artist | struct TuneTogether.Artist | The information of the artist. |

### getOneCampaign

```solidity
function getOneCampaign(address _addr) external view returns (struct TuneTogether.Campaign _campaign)
```

_Retrieves the information of a specific campaign._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addr | address | The address of the campaign. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _campaign | struct TuneTogether.Campaign | The information of the campaign. |

### setBoost

```solidity
function setBoost(address _campaignAddr) external payable
```

_Sets a boost for a campaign by the artist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _campaignAddr | address | The address of the campaign to boost. |

