import { CampaignFactory } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { baseUri, description, fees, campaignName } from './constants'
import { CampaignFactoryFixture } from './interfaces'

describe('CampaignFactory', () => {
  async function deployFixture(): Promise<CampaignFactoryFixture> {
    const CampaignFactory = await ethers.getContractFactory('CampaignFactory')
    const [owner]: HardhatEthersSigner[] = await ethers.getSigners()

    const campaignFactory: CampaignFactory =  await CampaignFactory.connect(owner).deploy()
    return { campaignFactory, owner }
  }

  describe('Deployment', () => {
    it('Should create a campaign', async () => {
      const { campaignFactory, owner } = await loadFixture(deployFixture)
      await expect(campaignFactory.createCrowdfundingCampaign(
        baseUri,
        owner.address,
        campaignName,
        fees,
        description
      )).to.emit(campaignFactory, 'CrowdfundingCampaignCreated')
    })
  })
})