// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';
import '../node_modules/@openzeppelin/contracts/utils/Strings.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract CrowdfundingCampaign is ERC1155, ERC1155Burnable, ERC1155Supply {
    string  private _baseUri;
    uint256 private _endTimestamp;
    bool    private _campaignStarted;
    bool    private _campaignInProgress;
    uint8   private _nbFilledTiers;
    address private _tuneTogetherAddr;
    IERC20  private _usdc;

    string  public name;
    string  public description;
    uint8   public fees;
    address public artistAddress;
    uint8   public nbTiers;

    mapping(uint8 => uint) private tierPrices;

    event CampaignStarted(uint256 _startTimestamp, uint256 _endTimestamp);
    event CampaignClosed(uint256 _endTimestamp);
    event CampaignInfoUpdated(string _name, string _description, uint8 _fees);
    event TierPriceAdded(uint8 _id, uint _price);
    event FundWithdraw(address _artistAddr, uint _usdcBalance, uint _ethBalance, uint _timestamp);

    modifier isContractOwner() {
        require(_tuneTogetherAddr == msg.sender, 'You\'re not the owner');
        _;
    }

    modifier onlyArtist() {
        require(artistAddress == msg.sender, 'You\'re not the campaign artist');
        _;
    }
    
    modifier campaignNotStarted() {
        require(!_campaignStarted, 'Campaign already started');
        _;
    }

    modifier campaignInProgress() {
        require(_campaignStarted, 'Artist didn\'t start the campaign yet');
        require(_campaignInProgress, 'Campaign closed');
        require(_endTimestamp > block.timestamp, 'Campaign ended');
        _;
    }

    modifier campaignClosed() {
        require(_campaignStarted, 'Artist didn\'t start the campaign yet');
        require(!_campaignInProgress || _endTimestamp < block.timestamp, 'Campaign in progress');
        _;
    }

    constructor(string memory baseUri_, address tuneTogetherAddr_, address usdcAddr_, address _artistAddr, string memory _name, uint8 _fees, string memory _description, uint8 _nbTiers) ERC1155(baseUri_) {
        _baseUri = baseUri_;
        _tuneTogetherAddr = tuneTogetherAddr_;
        _usdc = IERC20(usdcAddr_);
        artistAddress = _artistAddr;
        name = _name;
        fees = _fees;
        description = _description;
        nbTiers = _nbTiers;
    }

    function mint(uint8 _id, uint256 _amount) public campaignInProgress {
        require(_usdc.balanceOf(msg.sender) >= _amount * tierPrices[_id], "Not enough balance");

        _usdc.transferFrom(msg.sender, address(this), _amount * tierPrices[_id]);
        _mint(msg.sender, _id, _amount, '');
    }

    function uri(uint _tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseUri, Strings.toString(_tokenId), '.json'));
    }

    function startCampaign() external onlyArtist campaignNotStarted {
        require(nbTiers == _nbFilledTiers, 'Missing tier prices');

        uint256 _startTimestamp = block.timestamp;

        _endTimestamp = _startTimestamp + 8 weeks;
        _campaignStarted = true;
        _campaignInProgress = true;

        emit CampaignStarted(_startTimestamp, _endTimestamp);
    }

    function closeCampaign() external onlyArtist campaignInProgress {
        _campaignInProgress = false;
        emit CampaignClosed(block.timestamp);
    }

    function updateCampaignInfo(string memory _name, string memory _description, uint8 _fees) external isContractOwner campaignNotStarted {
        require(bytes(_name).length >= 5, 'Name too short');
        require(bytes(_name).length <= 20, 'Name too long');
        require(bytes(_description).length >= 10, 'Description too short');
        require(_fees == 0 || _fees == 5 || _fees == 10, 'Wrong fees option');

        description = _description;
        name = _name;
        fees = _fees;

        emit CampaignInfoUpdated(name, description, fees);
    }

    function setTierPrice(uint8 _id, uint _price) external onlyArtist campaignNotStarted {
        require(_id > 0 && _id <= nbTiers, 'Tier does not exist');
        require(_price >= 1 * 10**6 , 'Price too low');

        if (_id > 1) {
            require(_price > tierPrices[_id - 1], 'Price should be higher than the previous tier');
        }

        if (_id < nbTiers && tierPrices[_id + 1] != 0) {
            require((_price < tierPrices[_id + 1]), 'Price should be lower than the next tier');
        }

        tierPrices[_id] = _price;
        _nbFilledTiers = _nbFilledTiers + 1;

        emit TierPriceAdded(_id, _price);
    }

    function getTierPrice(uint8 _id) external view returns (uint _price) {
        return tierPrices[_id];
    }

    function withdraw() external onlyArtist campaignClosed {
        uint ethBalance = address(this).balance;
        uint usdcBalance = _usdc.balanceOf(address(this));

        _usdc.transfer(msg.sender, usdcBalance);
        
        if (ethBalance > 0) {
            (bool success, ) = msg.sender.call{value: ethBalance}('');
            require(success, "Withdraw failed");
        }

        emit FundWithdraw(msg.sender, usdcBalance, ethBalance, block.timestamp);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address _operator, address _from, address _to, uint256[] memory _ids, uint256[] memory _amounts, bytes memory _data) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(_operator,_from,_to,_ids,_amounts,_data);
    }
}