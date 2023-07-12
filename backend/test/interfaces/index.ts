import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { CrowdfundingCampaign, CampaignFactory, TuneTogether } from "../../typechain-types"

export interface CrowdfundingCampaignFixture {
    owner: HardhatEthersSigner
    artist: HardhatEthersSigner
    investor: HardhatEthersSigner
    crowdfundingCampaign: CrowdfundingCampaign
}

export interface CampaignFactoryFixture {
    owner: HardhatEthersSigner
    artist: HardhatEthersSigner
    tuneTogetherContract: HardhatEthersSigner
    campaignFactory: CampaignFactory
}

export interface TuneTogetherFixture {
    owner: HardhatEthersSigner
    artist: HardhatEthersSigner
    tuneTogether: TuneTogether
    campaignFactory: CampaignFactory
}