// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';
import '../node_modules/@openzeppelin/contracts/utils/Strings.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol';

/// @title CrowdfundingCampaign Contract
/// @dev A contract for managing crowdfunding campaigns and token minting.
contract CrowdfundingCampaign is ERC1155, ERC1155Supply {
    string  private _baseUri;
    bool    private _campaignStarted;
    uint8   private _nbFilledTiers;
    address private _tuneTogetherAddr;
    IERC20  private _usdc;

    string  public name;
    string  public description;
    uint8   public fees;
    address public artistAddress;
    uint8   public nbTiers;
    uint    public boost;
    uint    public objectif;
    uint256 public endTimestamp;
    bool    public campaignInProgress;
    bool    public fundWithdrawn;

    mapping(uint8 => uint) private tierPrices;

    event CampaignStarted(uint256 _startTimestamp, uint256 _endTimestamp);
    event CampaignClosed(uint256 _endTimestamp);
    event CampaignInfoUpdated(string _name, string _description, uint8 _fees);
    event TierPriceAdded(uint8 _id, uint _price);
    event FundWithdraw(address _artistAddr, uint _usdcBalance, uint _ethBalance, uint _timestamp);
    event Boosted(uint _timestamp);

    /// @dev Throws if the caller is not the contract owner.
    modifier isContractOwner() {
        require(_tuneTogetherAddr == msg.sender, 'You\'re not the owner');
        _;
    }

    /// @dev Throws if the caller is not the campaign artist.
    modifier onlyArtist() {
        require(artistAddress == msg.sender, 'You\'re not the campaign artist');
        _;
    }
    
    /// @dev Throws if the campaign has already started.
    modifier campaignNotStarted() {
        require(!_campaignStarted, 'Campaign already started');
        _;
    }

    /// @dev Throws if the campaign is not in progress.
    modifier campaignIsInProgress() {
        require(_campaignStarted, 'Artist didn\'t start the campaign yet');
        require(campaignInProgress, 'Campaign closed');
        require(endTimestamp > block.timestamp, 'Campaign ended');
        _;
    }

    /// @dev Throws if the campaign is not closed.
    modifier campaignClosed() {
        require(_campaignStarted, 'Artist didn\'t start the campaign yet');
        require(!campaignInProgress || endTimestamp < block.timestamp, 'Campaign in progress');
        _;
    }

    /// @dev Initializes the CrowdfundingCampaign contract.
    /// @param baseUri_ The base URI for the token metadata.
    /// @param tuneTogetherAddr_ The address of the TuneTogether contract.
    /// @param usdcAddr_ The address of the USDC token contract.
    /// @param _artistAddr The address of the artist wallet.
    /// @param _name The name of the campaign.
    /// @param _fees The fees of the campaign.
    /// @param _description The description of the campaign.
    /// @param _nbTiers The number of tier prices in the campaign.
    /// @param _objectif The price objectif of the campaign.
    constructor(string memory baseUri_, address tuneTogetherAddr_, address usdcAddr_, address _artistAddr, string memory _name, uint8 _fees, string memory _description, uint8 _nbTiers, uint _objectif) ERC1155(baseUri_) {
        _baseUri = baseUri_;
        _tuneTogetherAddr = tuneTogetherAddr_;
        _usdc = IERC20(usdcAddr_);
        artistAddress = _artistAddr;
        name = _name;
        fees = _fees;
        description = _description;
        nbTiers = _nbTiers;
        objectif = _objectif;
    }

    /// @dev Mints a specific amount of tokens to the caller.
    /// @param _id The ID of the token to mint.
    /// @param _amount The amount of tokens to mint.
    function mint(uint8 _id, uint256 _amount) public campaignIsInProgress {
        require(_usdc.balanceOf(msg.sender) >= _amount * tierPrices[_id], 'Not enough balance');

        _usdc.transferFrom(msg.sender, address(this), _amount * tierPrices[_id]);
        _mint(msg.sender, _id, _amount, '');
    }

    /// @dev Returns the token URI for a given token ID.
    /// @param _tokenId The ID of the token.
    /// @return _uri The URI of the token metadata.
    function uri(uint _tokenId) public view override returns (string memory _uri) {
        return string(abi.encodePacked(_baseUri, Strings.toString(_tokenId), '.json'));
    }

    /// @dev Starts the crowdfunding campaign.
    function startCampaign() external onlyArtist campaignNotStarted {
        require(nbTiers == _nbFilledTiers, 'Missing tier prices');

        uint256 _startTimestamp = block.timestamp;

        endTimestamp = _startTimestamp + 8 weeks;
        _campaignStarted = true;
        campaignInProgress = true;

        emit CampaignStarted(_startTimestamp, endTimestamp);
    }

    /// @dev Closes the crowdfunding campaign.
    function closeCampaign() external onlyArtist campaignIsInProgress {
        campaignInProgress = false;
        emit CampaignClosed(block.timestamp);
    }

    /// @dev Updates the campaign information.
    /// @param _name The updated name of the campaign.
    /// @param _description The updated description of the campaign.
    /// @param _fees The updated fees of the campaign.
    function updateCampaignInfo(string memory _name, string memory _description, uint8 _fees) external isContractOwner campaignNotStarted {
        description = _description;
        name = _name;
        fees = _fees;

        emit CampaignInfoUpdated(name, description, fees);
    }

    /// @dev Sets the price for a specific tier in the campaign.
    /// @param _id The ID of the tier.
    /// @param _price The price of the tier.
    function setTierPrice(uint8 _id, uint _price) external onlyArtist campaignNotStarted {
        require(_id > 0 && _id <= nbTiers, 'Tier does not exist');
        require(_price >= 1 * 10**6 , 'Price too low');

        if (_id > 1) {
            require(_price > tierPrices[_id - 1], 'Price should be higher than the previous tier');
        }

        if (_id < nbTiers && tierPrices[_id + 1] != 0) {
            require(_price < tierPrices[_id + 1], 'Price should be lower than the next tier');
        }

        tierPrices[_id] = _price;
        _nbFilledTiers = _nbFilledTiers + 1;

        emit TierPriceAdded(_id, _price);
    }

    /// @dev Retrieves the price of a specific tier in the campaign.
    /// @param _id The ID of the tier.
    /// @return _price The price of the tier.
    function getTierPrice(uint8 _id) external view returns (uint _price) {
        return tierPrices[_id];
    }

    /// @dev Sets the boost timestamp for the campaign.
    /// @param _timestamp The boost timestamp.
    function setBoost(uint _timestamp) external isContractOwner campaignIsInProgress {
        boost = _timestamp;
        emit Boosted(boost);
    }

    /// @dev Withdraws funds from the campaign.
    function withdraw() external onlyArtist campaignClosed {
        require(!fundWithdrawn, 'Fund already withdrawn');

        fundWithdrawn = true;
        uint ethBalance = address(this).balance;
        uint usdcBalance = _usdc.balanceOf(address(this));

        _usdc.transfer(msg.sender, usdcBalance);
        
        (bool success, ) = msg.sender.call{value: ethBalance}('');
        require(success, 'Withdraw failed');

        emit FundWithdraw(msg.sender, usdcBalance, ethBalance, block.timestamp);
    }

    /// @dev The following functions are overrides required by Solidity. Hook function called before any token transfer.
    /// @param _operator The address performing the operation.
    /// @param _from The address transferring the tokens.
    /// @param _to The address receiving the tokens.
    /// @param _ids The IDs of the tokens being transferred.
    /// @param _amounts The amounts of tokens being transferred.
    /// @param _data Additional data.
    function _beforeTokenTransfer(address _operator, address _from, address _to, uint256[] memory _ids, uint256[] memory _amounts, bytes memory _data) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(_operator,_from,_to,_ids,_amounts,_data);
    }
}