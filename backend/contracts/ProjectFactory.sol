// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./ArtistProject.sol";

contract ProjectFactory {
    event ProjectCreated(string _artistName, address _projectAddress, uint _timestamp);

    function createArtistProject(string memory _uri,string memory _artistName) external returns (address projectAddress) {
        bytes32 salt = keccak256(abi.encodePacked(_uri, _artistName));
        bytes memory projectBytecode = abi.encodePacked(
            type(ArtistProject).creationCode,
            abi.encode(_uri, _artistName)
        );

        assembly {
            projectAddress := create2(0,add(projectBytecode, 0x20),mload(projectBytecode),salt)
            if iszero(extcodesize(projectAddress)) {
                revert(0, 0)
            }
        }

        emit ProjectCreated(_artistName, projectAddress, block.timestamp);
    }
}
