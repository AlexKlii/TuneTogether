import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { CrowdfundingCampaign, CampaignFactory, TuneTogether } from "../../typechain-types"

export interface CrowdfundingCampaignFixture {
    owner: HardhatEthersSigner
    crowdfundingCampaign: CrowdfundingCampaign
}

export interface CampaignFactoryFixture {
    owner: HardhatEthersSigner
    campaignFactory: CampaignFactory
}

export interface TuneTogetherFixture {
    owner: HardhatEthersSigner
    artist: HardhatEthersSigner
    tuneTogether: TuneTogether
    campaignFactory: CampaignFactory
}