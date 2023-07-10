// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./ArtistProject.sol";

contract ProjectFactory {
    event ArtistProjectCreated(address _artistAddr, address _projectAddress, uint _timestamp);

    function createArtistProject(string memory _uri, address _artistAddr, string memory _name, uint8 _fees, string memory _description) external returns (address projectAddress) {
        bytes32 salt = keccak256(abi.encodePacked(_uri, _artistAddr));
        bytes memory projectBytecode = abi.encodePacked(
            type(ArtistProject).creationCode,
            abi.encode(_uri, _artistAddr, _name, _fees, _description)
        );

        assembly {
            projectAddress := create2(0,add(projectBytecode, 0x20),mload(projectBytecode),salt)
            if iszero(extcodesize(projectAddress)) {
                revert(0, 0)
            }
        }

        emit ArtistProjectCreated(_artistAddr, projectAddress, block.timestamp);
    }
}
