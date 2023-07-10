// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./ProjectFactory.sol";

contract TuneTogether {
    ProjectFactory private _projectFactory;

    struct Project {
        uint id;
        uint fees;
        address artist;
        string name;
        string description;
    }

    struct Artist {
        string name;
        string bio;
        mapping(address => Project) projects;
    }

    mapping(address => Artist) artists;
    mapping(address => Project) projects;

    event ArtistCreated(string _artistName, uint _timestamp);

    constructor(address _projectFactoryAddress) {
        _projectFactory = ProjectFactory(_projectFactoryAddress);
    }

    function createNewProject(string memory _projectsName, string memory _description, uint _fees, string memory _artistName, string memory _bio, string memory _uri) external {
        Project memory artistProject = Project(1,_fees,msg.sender,_projectsName,_description);
        address _projectAddr = _projectFactory.createArtistProject(
            _uri,
            _artistName
        );

        Artist storage artist = artists[msg.sender];
        if (bytes(artist.name).length == 0) {
            artist.name = _artistName;
            artist.bio = _bio;

            emit ArtistCreated(_artistName, block.timestamp);
        }

        artist.projects[_projectAddr] = artistProject;
        projects[_projectAddr] = artistProject;
    }
}
