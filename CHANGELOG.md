# Changelog

## 0.5.0 (2023-07-11)

### feat: Implement Requirements

- Implement Requirements for `createNewCampaign` method in `TuneTogether` contract
- Implement Requirements for methods in `CrowdfundingCampaign` contract
- Implement new method in `CrowdfundingCampaign` contract
  - startCampaign
  - closeCampaign
  - updateCampaignInfo
---

<details>
  <summary>See old changelog</summary>

  ## 0.4.1 (2023-07-11)

  ### feat: Refactoring

  - Create Fixture interfaces for test
  - Update `README.md` with Unit Test section
  - Rename `ArtistProject` to `CrowdfundingCampaign` 
  - Rename `ProjectFactory` to `CampaignFactory` 
  ---

  ## 0.4.0 (2023-07-11)

  ### feat: Implement Test

  - Implement basic tests for all contracts
  - Update `bug_report` issue template
  - Update `ArtistCreated` event
  ---
  
  ## 0.3.0 (2023-07-10)

  ### feat: Implement Mumbai deployement

  - Implement Mumbai deployement
    - Change solidity version beacause an error occured in Mumbai (see [Invalid opcode: opcode 0x5f not defined](https://ethereum.stackexchange.com/questions/150281/invalid-opcode-opcode-0x5f-not-defined))
    - Update/Add deploy scripts
    - Update `hardhat.config`
    - Update `.env` file
  - Add new feature on TuneTogether
    - isArtist
    - getArtist
    - getOneProject
  ---

  ## 0.2.1 (2023-07-10)

  ### feat: Add Github Issue template

  - Add Github Issue template
    - A bug report template: `bug_report.md`
    - A feature request template: `feature_request.md`

  ---

  ## 0.2.0 (2023-07-10)

  ### feat: Basic implementation of smart contracts

  - Basic implementation of smart contracts
    - ProjectFactory: Create an ERC-1155 NFT collection from another contract
    - ArtistProject: The ERC-1155 NFT collection (created by ProjectFactory)
    - TuneTogether: Main contract
  - Update deploy script

  ---

  ## 0.1.0 (2023-07-07)

  ### feat: Init project 

  - Init project with 
    - NEXT.js
    - Hardhat
    - RainbowKit
    - Wagmi
    - ChakraUI
  - Setup RainbowKit with first button
<details>