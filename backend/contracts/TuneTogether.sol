// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./CampaignFactory.sol";

contract TuneTogether {
    CampaignFactory private _campaignFactory;

    struct Campaign {
        string name;
        string description;
        uint8 fees;
    }

    struct Artist {
        string name;
        string bio;
        uint8 feeSchedule;
    }

    mapping(address => Artist) artists;
    mapping(address => Campaign) campaigns;

    event ArtistCreated(address _artistAddr);

    constructor(address _campaignFactoryAddress) {
        _campaignFactory = CampaignFactory(_campaignFactoryAddress);
    }

    function createNewCampaign(string memory _campaignName, string memory _description, uint8 _fees, string memory _artistName, string memory _bio, string memory _uri) external {
        address _campaignAddr = _campaignFactory.createCrowdfundingCampaign(_uri, msg.sender, _campaignName, _fees, _description);
        _setCampaign(_campaignAddr, _campaignName, _fees, _description);

        if (bytes(artists[msg.sender].name).length == 0) {
            _setArtist(_artistName, _bio, _fees);
        }
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

    function _setCampaign(address _addr, string memory _name, uint8 _fees, string memory _description) private {
        Campaign memory campaign = Campaign(_name, _description, _fees);
        campaigns[_addr] = campaign;
    }
}
