// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import './CampaignFactory.sol';
import './CrowdfundingCampaign.sol';

contract TuneTogether {
    CampaignFactory private _campaignFactory;
    CrowdfundingCampaign private _crowdfundingCampaign;

    address private _usdcAddr;

    struct Campaign {
        string name;
        string description;
        uint8 fees;
        uint8 nbTiers;
        address artist;
    }

    struct Artist {
        string name;
        string bio;
        uint8 feeSchedule;
    }

    mapping(address => Artist) artists;
    mapping(address => Campaign) campaigns;

    event ArtistCreated(address _artistAddr);
    event CampaignAdded(address _artistAddr, address _campaignAddr);
    event CampaignUpdated(address _campaignAddr);

    constructor(address _campaignFactoryAddress, address usdcAddr_) {
        _campaignFactory = CampaignFactory(_campaignFactoryAddress);
        _usdcAddr = usdcAddr_;
    }

    function createNewCampaign(string memory _campaignName, string memory _description, uint8 _fees, string memory _artistName, string memory _bio, string memory _uri, uint8 _nbTiers) external {
        require(bytes(_campaignName).length >= 5, 'Campaign name too short');
        require(bytes(_campaignName).length <= 20, 'Campaign name too long');
        require(bytes(_description).length >= 10, 'Campaign description too short');
        require(_fees == 0 || _fees == 5 || _fees == 10, 'Wrong fees');
        require(bytes(_artistName).length >= 5, 'Artist name too short');
        require(bytes(_artistName).length <= 20, 'Artist name too long');
        require(bytes(_bio).length >= 10, 'Artist bio too short');
        require(_nbTiers > 0, 'Not enough tier prices');
        require(_nbTiers <= 10, 'Too many tier prices');

        address _campaignAddr = _campaignFactory.createCrowdfundingCampaign(_uri, msg.sender, _campaignName, _fees, _description, _nbTiers, _usdcAddr);
       
        _setCampaign(_campaignAddr, _campaignName, _fees, _description, _nbTiers);
        emit CampaignAdded(msg.sender, _campaignAddr);

        if (bytes(artists[msg.sender].name).length == 0) {
            _setArtist(_artistName, _bio, _fees);
        }
    }

    function updateCampaignInfo(string memory _name, string memory _description, uint8 _fees, address _addr) external {
        require(campaigns[_addr].artist == msg.sender, 'You\'re not the campaign artist');
        require(bytes(_name).length >= 5, 'Name too short');
        require(bytes(_name).length <= 20, 'Name too long');
        require(bytes(_description).length >= 10, 'Description too short');
        require(_fees == 0 || _fees == 5 || _fees == 10, 'Wrong fees option');

        _crowdfundingCampaign = CrowdfundingCampaign(_addr);
        _crowdfundingCampaign.updateCampaignInfo(_name, _description, _fees);

        campaigns[_addr].description = _description;
        campaigns[_addr].name = _name;
        campaigns[_addr].fees = _fees;
        
        emit CampaignUpdated(_addr);
    }

    function isArtist(address _addr) external view returns (bool) {
        return bytes(artists[_addr].name).length != 0;
    }

    function getArtist(address _addr) external view returns (Artist memory _artist) {
        return artists[_addr];
    }

    function getOneCampaign(address _addr) external view returns (Campaign memory _campaigns) {
        return campaigns[_addr];
    }

    function _setArtist(string memory _name, string memory _bio, uint8 _feeSchedule) private {
        Artist storage artist = artists[msg.sender];
        artist.name = _name;
        artist.bio = _bio;
        artist.feeSchedule = _feeSchedule;

        emit ArtistCreated(msg.sender);
    }

    function _setCampaign(address _addr, string memory _name, uint8 _fees, string memory _description, uint8 _nbTiers) private {
        Campaign memory campaign = Campaign(_name, _description, _fees, _nbTiers, msg.sender);
        campaigns[_addr] = campaign;
    }
}