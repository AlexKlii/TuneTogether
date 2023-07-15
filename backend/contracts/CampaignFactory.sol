// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import './CrowdfundingCampaign.sol';
import '../node_modules/@openzeppelin/contracts/access/Ownable.sol';

/// @title CampaignFactory Contract
/// @dev A contract for creating crowdfunding campaigns.
contract CampaignFactory is Ownable {
    address private _ownerContractAddr;

    event CrowdfundingCampaignCreated(address _artistAddr, address _campaignAddress, uint _timestamp);
    event OwnerContractUpdated(address _contractAddr);

    /// @dev Throws if the caller is not the owner of the contract.
    modifier isContractOwner() {
        require(_ownerContractAddr == msg.sender, 'You\'re not the owner');
        _;
    }

    /// @dev Creates a new crowdfunding campaign.
    /// @param _uri The URI of the campaign metadata.
    /// @param _artistAddr The address of the artist.
    /// @param _name The name of the campaign.
    /// @param _fees The fees of the campaign.
    /// @param _description The description of the campaign.
    /// @param _nbTiers The number of tier prices in the campaign.
    /// @param _usdcAddr The address of the USDC token contract.
    /// @return campaignAddress The address of the created crowdfunding campaign.
    /// @param _objectif The price objectif of the campaign.
    function createCrowdfundingCampaign(string memory _uri, address _artistAddr, string memory _name, uint8 _fees, string memory _description, uint8 _nbTiers, address _usdcAddr, uint _objectif) external isContractOwner returns (address campaignAddress) {
        bytes32 salt = keccak256(abi.encodePacked(_uri, _artistAddr));
        bytes memory campaignBytecode = abi.encodePacked(
            type(CrowdfundingCampaign).creationCode,
            abi.encode(_uri, _ownerContractAddr, _usdcAddr, _artistAddr, _name, _fees, _description, _nbTiers, _objectif)
        );

        assembly {
            campaignAddress := create2(0,add(campaignBytecode, 0x20),mload(campaignBytecode),salt)
            if iszero(extcodesize(campaignAddress)) {
                revert(0, 0)
            }
        }

        emit CrowdfundingCampaignCreated(_artistAddr, campaignAddress, block.timestamp);
    }

    /// @dev Sets the address of the owner contract.
    /// @param ownerContractAddr_ The address of the owner contract.
    function setOwnerContractAddr(address ownerContractAddr_) external onlyOwner {
        _ownerContractAddr = ownerContractAddr_;
        emit OwnerContractUpdated(ownerContractAddr_);
    }
}