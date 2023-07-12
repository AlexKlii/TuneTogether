// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import './CrowdfundingCampaign.sol';
import '../node_modules/@openzeppelin/contracts/access/Ownable.sol';

contract CampaignFactory is Ownable {
    address private _ownerContractAddr;

    event CrowdfundingCampaignCreated(address _artistAddr, address _campaignAddress, uint _timestamp);
    event OwnerContractUpdated(address _contractAddr);

    modifier isContractOwner() {
        require(_ownerContractAddr == msg.sender, 'You\'re not the owner');
        _;
    }

    function createCrowdfundingCampaign(string memory _uri, address _artistAddr, string memory _name, uint8 _fees, string memory _description, uint8 _nbTiers) external isContractOwner returns (address campaignAddress) {
        bytes32 salt = keccak256(abi.encodePacked(_uri, _artistAddr));
        bytes memory campaignBytecode = abi.encodePacked(
            type(CrowdfundingCampaign).creationCode,
            abi.encode(_uri, _ownerContractAddr, _artistAddr, _name, _fees, _description, _nbTiers)
        );

        assembly {
            campaignAddress := create2(0,add(campaignBytecode, 0x20),mload(campaignBytecode),salt)
            if iszero(extcodesize(campaignAddress)) {
                revert(0, 0)
            }
        }

        emit CrowdfundingCampaignCreated(_artistAddr, campaignAddress, block.timestamp);
    }

    function setOwnerContractAddr(address ownerContractAddr_) external onlyOwner {
        _ownerContractAddr = ownerContractAddr_;
        emit OwnerContractUpdated(ownerContractAddr_);
    }
}
