import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { CrowdfundingCampaign, CampaignFactory, TuneTogether, Usdc } from "../../typechain-types"

export interface CrowdfundingCampaignFixture {
    owner: HardhatEthersSigner
    artist: HardhatEthersSigner
    investor: HardhatEthersSigner
    tuneTogether: HardhatEthersSigner
    crowdfundingCampaign: CrowdfundingCampaign,
    usdc: Usdc
}

export interface CampaignFactoryFixture {
    owner: HardhatEthersSigner
    artist: HardhatEthersSigner
    tuneTogetherContract: HardhatEthersSigner
    campaignFactory: CampaignFactory
    usdcAddr: string
}

export interface TuneTogetherFixture {
    owner: HardhatEthersSigner
    artist: HardhatEthersSigner
    tuneTogether: TuneTogether
    campaignFactory: CampaignFactory
}

export interface TuneTogetherCampaignFixture extends TuneTogetherFixture {  
    crowdfundingCampaign: CrowdfundingCampaign
    campaignAddr: string
}

export interface UsdcFixture {
    owner: HardhatEthersSigner
    usdc: Usdc
}