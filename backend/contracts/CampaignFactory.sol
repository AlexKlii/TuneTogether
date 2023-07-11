// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./CrowdfundingCampaign.sol";

contract CampaignFactory {
    event CrowdfundingCampaignCreated(address _artistAddr, address _campaignAddress, uint _timestamp);

    function createCrowdfundingCampaign(string memory _uri, address _artistAddr, string memory _name, uint8 _fees, string memory _description) external returns (address campaignAddress) {
        bytes32 salt = keccak256(abi.encodePacked(_uri, _artistAddr));
        bytes memory campaignBytecode = abi.encodePacked(
            type(CrowdfundingCampaign).creationCode,
            abi.encode(_uri, _artistAddr, _name, _fees, _description)
        );

        assembly {
            campaignAddress := create2(0,add(campaignBytecode, 0x20),mload(campaignBytecode),salt)
            if iszero(extcodesize(campaignAddress)) {
                revert(0, 0)
            }
        }

        emit CrowdfundingCampaignCreated(_artistAddr, campaignAddress, block.timestamp);
    }
}
