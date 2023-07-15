// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import './CampaignFactory.sol';
import './CrowdfundingCampaign.sol';

/// @title TuneTogether Contract
/// @dev A contract for managing campaigns and artists.
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
        uint boost;
        uint objectif;
    }

    struct Artist {
        string name;
        string bio;
        uint8 feeSchedule;
        address[] campaigns;
    }

    mapping(address => Artist) artists;
    mapping(address => Campaign) campaigns;

    event ArtistCreated(address _artistAddr);
    event CampaignAdded(address _artistAddr, address _campaignAddr);
    event CampaignUpdated(address _campaignAddr);
    event CampaignBoosted(address _contractAddr, uint _timestamp);

    /// @dev Initializes the TuneTogether contract.
    /// @param _campaignFactoryAddress The address of the CampaignFactory contract.
    /// @param usdcAddr_ The address of the USDC token contract.
    constructor(address _campaignFactoryAddress, address usdcAddr_) {
        _campaignFactory = CampaignFactory(_campaignFactoryAddress);
        _usdcAddr = usdcAddr_;
    }

    /// @dev Creates a new campaign and associates it with an artist.
    /// @param _campaignName The name of the campaign.
    /// @param _description The description of the campaign.
    /// @param _fees The fees of the campaign.
    /// @param _artistName The name of the artist.
    /// @param _bio The bio of the artist.
    /// @param _uri The URI of the campaign metadata.
    /// @param _nbTiers The number of tier prices in the campaign.
    /// @param _objectif The price objectif of the campaign.
    function createNewCampaign(string memory _campaignName, string memory _description, uint8 _fees, string memory _artistName, string memory _bio, string memory _uri, uint8 _nbTiers, uint _objectif) external {
        require(bytes(_campaignName).length >= 5, 'Campaign name too short');
        require(bytes(_campaignName).length <= 20, 'Campaign name too long');
        require(bytes(_description).length >= 10, 'Campaign description too short');
        require(_fees == 0 || _fees == 5 || _fees == 10, 'Wrong fees');
        require(bytes(_artistName).length >= 5, 'Artist name too short');
        require(bytes(_artistName).length <= 20, 'Artist name too long');
        require(bytes(_bio).length >= 10, 'Artist bio too short');
        require(_nbTiers > 0, 'Not enough tier prices');
        require(_nbTiers <= 10, 'Too many tier prices');
        require(_objectif >= 100*10**6, 'Objectif too low');
        require(artists[msg.sender].campaigns.length < 10, 'Max number of campaign reached');

        address _campaignAddr = _campaignFactory.createCrowdfundingCampaign(_uri, msg.sender, _campaignName, _fees, _description, _nbTiers, _usdcAddr, _objectif);
       
        _setCampaign(_campaignAddr, _campaignName, _fees, _description, _nbTiers, _objectif);
        emit CampaignAdded(msg.sender, _campaignAddr);

        _setArtist(_artistName, _bio, _fees, _campaignAddr);
    }

    /// @dev Updates the information of a campaign.
    /// @param _name The updated name of the campaign.
    /// @param _description The updated description of the campaign.
    /// @param _fees The updated fees of the campaign.
    /// @param _addr The address of the campaign to update.
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

    /// @dev Checks if an address belongs to an artist.
    /// @param _addr The address to check.
    /// @return _isArtist A boolean indicating whether the address is associated with an artist.
    function isArtist(address _addr) external view returns (bool _isArtist) {
        return bytes(artists[_addr].name).length != 0;
    }


    /// @dev Retrieves the information of an artist.
    /// @param _addr The address of the artist.
    /// @return _artist The information of the artist.
    function getArtist(address _addr) external view returns (Artist memory _artist) {
        return artists[_addr];
    }

    /// @dev Retrieves the information of a specific campaign.
    /// @param _addr The address of the campaign.
    /// @return _campaign The information of the campaign.
    function getOneCampaign(address _addr) external view returns (Campaign memory _campaign) {
        return campaigns[_addr];
    }
    
    /// @dev Sets a boost for a campaign by the artist.
    /// @param _campaignAddr The address of the campaign to boost.
    function setBoost(address _campaignAddr) external payable {
        require(campaigns[_campaignAddr].artist == msg.sender, 'You\'re not the campaign artist');
        require(msg.value == 0.001 ether, 'Wrong value');

        _crowdfundingCampaign = CrowdfundingCampaign(_campaignAddr);

        uint boost = block.timestamp + 1 weeks;
        _crowdfundingCampaign.setBoost(boost);
        
        campaigns[_campaignAddr].boost = boost;
        
        emit CampaignBoosted(_campaignAddr, boost);
    }

    /// @dev Sets the information for an artist.
    /// @param _name The name of the artist.
    /// @param _bio The bio of the artist.
    /// @param _feeSchedule The fee schedule of the artist.
    /// @param _campaignAddr The created campaign address.
    function _setArtist(string memory _name, string memory _bio, uint8 _feeSchedule, address _campaignAddr) private {
        Artist storage artist = artists[msg.sender];
        if (bytes(artist.name).length == 0) {
            artist.name = _name;
            artist.bio = _bio;
            artist.feeSchedule = _feeSchedule;
            artist.campaigns = [_campaignAddr];

            emit ArtistCreated(msg.sender);
        } else {
            address[] memory artistCampaigns = new address[](artist.campaigns.length+1);

            for (uint256 i = 0; i < artist.campaigns.length; i++) {
                artistCampaigns[i] = artist.campaigns[i];
            }
            
            artistCampaigns[artist.campaigns.length] = _campaignAddr;
            artist.campaigns = artistCampaigns;
        }
    }

    /// @dev Sets the information for a campaign.
    /// @param _addr The address of the campaign.
    /// @param _name The name of the campaign.
    /// @param _fees The fees of the campaign.
    /// @param _description The description of the campaign.
    /// @param _nbTiers The number of tier prices in the campaign.
    /// @param _objectif The price objectif of the campaign.
    function _setCampaign(address _addr, string memory _name, uint8 _fees, string memory _description, uint8 _nbTiers, uint _objectif) private {
        Campaign memory campaign = Campaign(_name, _description, _fees, _nbTiers, msg.sender, 0, _objectif);
        campaigns[_addr] = campaign;
    }
}