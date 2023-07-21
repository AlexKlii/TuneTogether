# Changelog

## 0.18.0 (2023-07-21)

### feat: Implement `Footer` Component

- Implement `Footer` Component
- Update `Campaigns` page component when no campaigns

<details>
  <summary>See old changelog</summary>

  ## 0.17.2 (2023-07-21)

  ### fix: Fix errors in `CampaignManagement` and `Campaign` components

  - Fix message after `withdrawn` action
  - Redirect if campaign not found
  - Fix infinite loader

  ## 0.17.1 (2023-07-20)

  ### fix: Fix error on mumbai network

  ## 0.17.0 (2023-07-20)

  ### feat: Implement `CampaignManagement` component for artists

  - Frontend
    - Update `Campaign` page component to implement `CampaignManagement` for artists
    - Implement `CampaignManagement` component with action:
      - `close` 
      - `boost`
      - `withdraw`
    - Implement `CardLoader` component
    - Update `CampaignWithArtist` interface

  - Backend
    - Update `CrowdfundingCampaign` contract
      - Add new variable `fundWithdrawn`
      - Switch private variable `campaignInProgress` to public
    - Add a require on `setBoost` method from `TuneTogether` contract
    - Generate new doc files
    - Update unit tests
  ---

  ## 0.16.3 (2023-07-20)

  ### feat: Update campaign default cover

  - Update campaign default cover with TuneToghether logo
  - Update favicon with TuneTogether logo
  - Implement `Homepage` page component
  ---

  ## 0.16.2 (2023-07-19)

  ### fix: Fix error on second mint in `Campaign` page component
  ---

  ## 0.16.1 (2023-07-19)

  ### fix: Fix loading in `CreateCampaign` page component
  ---

  ## 0.16.0 (2023-07-19)

  ### feat: Implement `Campaign` page component

  - Implement mint function on `Campaign` page component
  - Fix issue in `CreateCampaign` when redirect to the created campaign
  - Fix link issue in `Campaigns` page component
  - Update `Loader` component to accept a waiting message
  - Add new constants
  - Implement `CampaignTierInfo` interface
  - Implement new method in `utils` file
  - Switch `_endTimestamp` private variable from `CrowdfundingCampaign.sol` to public
  - Add `.env` variable
  ---

  ## 0.15.0 (2023-07-19)

  ### feat: Implement `withdraw` function in `TuneTogether`

  - Add a `withdraw` function in `TuneTogether` to withdraw th boost fund
  ---

  ## 0.14.0 (2023-07-19)

  ### feat: Implement `Campaigns` page component

  - List all campaigns in `Campaigns` page
  - Fix `CreateCampaign` when no img for a `tierPrice`
  - Implement `Campaign` page component
  - Change redirect in `CreateCampaign` when campaign created to `Campaign` page
  - Update `Home` page component
  - Fix `AppLogo` minor issue
  - Update `Header` component
  - Add `Campaign` and `CampaignWithArtist` interfaces
  ---

  ## 0.13.2 (2023-07-19)

  ### fix: Update `CreateCampaign` to avoid issue with images name

  - Update upload of image file (now upload file by file)
  - Update file name by `tierPrice.id` before upload to pinata
  - Update `TierPrice` interface
  ---

  ## 0.13.1 (2023-07-18)

  ### feat: Implement `CreateCampaign` form page (backend part)

  - Implement `IsConnected` Component
  - Implement `Loader` Component
  - Implement `utils` file
  - Add `.env` constant
  - Update `CreateCampaign` with backend implementation
  ---

  ## 0.13.0 (2023-07-17)

  ### feat: Implement `CreateCampaign` form page (frontend part)

  - Implement `PageTitle` Component
  - Change `CreateProject` name component to `CreateCampaign`
  - Change `Projects` name component to `Campaigns`
  - Implement `CreateCampaign` form page (frontend part)
  - Add `TierPrice` and `TierPriceReward` interfaces
  ---

  ## 0.12.0 (2023-07-17)

  ### feat: Implement first frontend components

  - Implement `Header` Component
  - Implement `AppLogo` Component
  - Implement `Projects` Page Component
  - Implement `CreateProject` Page Component
  - Update deployment scripts
  ---


  ## 0.11.0 (2023-07-15)

  ### feat: Implement Campaign Objectif

  - Implement `objectif` in `CrowdfundingCampaign`
  - Update `_setArtist` method from `TuneTogether`
  - Update tests
  ---

  ## 0.10.1 (2023-07-14)

  ### feat: Implement NATSPEC + DOC

  - Implement natspec in contracts
  - Add docs generate with `solidity-docgen`
  - Update `README` file
  ---

  ## 0.10.0 (2023-07-14)

  ### feat: Boost Campaign

  - Implement `setBoost` method in `CrowdfundingCampaign` and `TuneTogether`
  - Update tests
  ---

  ## 0.9.1 (2023-07-14)

  ### fix: Update script to fix issue on mumbai testnet

  - Update `01_genesisProject` script to fix issue on mumbai testnet
  - Update `.gitignore` files
  ---

  ## 0.9.0 (2023-07-14)

  ### feat: Implement mint in USDC

  - Update `mint` method in `CrowdfundingCampaign` to accept USDC
  - Add `withdraw` method in `CrowdfundingCampaign`
  - Add `getTierPrice` method in `CrowdfundingCampaign`
  - Implement `Usdc` contract (only for dev and unit test)
  - Implement new tasks (only for dev)
    - `approveAllowance`
    - `faucet`
  - Update `README` file
  - Update deploy scrpits
  - Update tests
  ---

  ## 0.8.0 (2023-07-12)

  ### feat: Update Requirements for CrowdfundingCampaign contract

  - Update requirements to `updateCampaignInfo` method
  - Implement `updateCampaignInfo` in `TuneTogether` contract
  - Update deploy scrpits
  - Update tests
  ---

  ## 0.7.0 (2023-07-12)

  ### feat: Implement Requirements for CampaignFactory contract

  - Implement `setOwnerContractAddr` to update new `_ownerContractAddr` variable
  - New event `OwnerContractUpdated`
  - Implement requirements to `createCrowdfundingCampaign` method
  - Update tests
  ---

  ## 0.6.0 (2023-07-11)

  ### feat: Implement Tier Prices

  - Implement new method `setTierPrice` in `CrowdfundingCampaign` contract
  - Update `createNewCampaign` method requirements in `TuneTogether` contract
  - Update `startCampaign` method requirements in `CrowdfundingCampaign` contract
  - Update `mint` method requirements in `CrowdfundingCampaign` contract
  - Update tests
  ---

  ## 0.5.0 (2023-07-11)

  ### feat: Implement Requirements

  - Implement requirements for `createNewCampaign` method in `TuneTogether` contract
  - Implement requirements for methods in `CrowdfundingCampaign` contract
  - Implement new method in `CrowdfundingCampaign` contract
    - startCampaign
    - closeCampaign
    - updateCampaignInfo
  ---

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