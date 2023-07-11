// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';
import '../node_modules/@openzeppelin/contracts/utils/Strings.sol';

contract CrowdfundingCampaign is ERC1155, ERC1155Burnable, ERC1155Supply {
    string  private _baseUri;
    uint256 private _endTimestamp;
    bool    private _campaignStarted;
    bool    private _campaignInProgress;

    string  public name;
    string  public description;
    uint8   public fees;
    address public artistAddress;

    event CampaignStarted(uint256 _startTimestamp, uint256 _endTimestamp);
    event CampaignClosed(uint256 _endTimestamp);
    event CampaignInfoUpdated(string name, string description, uint8 fees);

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

    constructor(string memory baseUri_, address _artistAddr, string memory _name, uint8 _fees, string memory _description) ERC1155(baseUri_) {
        _baseUri = baseUri_;
        artistAddress = _artistAddr;
        name = _name;
        fees = _fees;
        description = _description;
    }

    function mint(uint256 _id, uint256 _amount) public campaignInProgress {
        _mint(msg.sender, _id, _amount, '');
    }

    function uri(uint _tokenId) public view override returns (string memory) {
        return string.concat(_baseUri, Strings.toString(_tokenId), '.json');
    }

    function startCampaign() external onlyArtist campaignNotStarted {
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

    function updateCampaignInfo(string memory _name, string memory _description, uint8 _fees) external onlyArtist campaignNotStarted {
        require(bytes(_name).length >= 5, 'Name too short');
        require(bytes(_name).length <= 20, 'Name too long');
        require(bytes(_description).length >= 10, 'Description too short');
        require(_fees == 0 || _fees == 5 ||_fees == 10, 'Wrong fees option');

        description = _description;
        name = _name;
        fees = _fees;

        emit CampaignInfoUpdated(name, description, fees);
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address _operator, address _from, address _to, uint256[] memory _ids, uint256[] memory _amounts, bytes memory _data) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(_operator,_from,_to,_ids,_amounts,_data);
    }
}
