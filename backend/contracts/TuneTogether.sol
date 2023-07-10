// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./ProjectFactory.sol";

contract TuneTogether {
    ProjectFactory private _projectFactory;

    struct Project {
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
    mapping(address => Project) projects;

    event ArtistCreated(string _artistName, uint _timestamp);

    constructor(address _projectFactoryAddress) {
        _projectFactory = ProjectFactory(_projectFactoryAddress);
    }

    function createNewProject(string memory _projectsName, string memory _description, uint8 _fees, string memory _artistName, string memory _bio, string memory _uri) external {
        address _projectAddr = _projectFactory.createArtistProject(_uri, msg.sender, _projectsName, _fees, _description);
        _setProject(_projectAddr, _projectsName, _fees, _description);

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

    function getOneProject(address _addr) external view returns (Project memory _projects) {
        return projects[_addr];
    }

    function _setArtist(string memory _name, string memory _bio, uint8 _feeSchedule) private {
        Artist storage artist = artists[msg.sender];
        artist.name = _name;
        artist.bio = _bio;
        artist.feeSchedule = _feeSchedule;

        emit ArtistCreated(_name, block.timestamp);
    }

    function _setProject(address _addr, string memory _name, uint8 _fees, string memory _description) private {
        Project memory project = Project(_name, _description, _fees);
        projects[_addr] = project;
    }
}
