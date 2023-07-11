import { CrowdfundingCampaign } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { baseUri, description, fees, campaignName } from './constants'
import { CrowdfundingCampaignFixture } from './interfaces'

describe('CrowdfundingCampaign', () => {
  async function deployFixture(): Promise<CrowdfundingCampaignFixture> {
    const CrowdfundingCampaign = await ethers.getContractFactory('CrowdfundingCampaign')
    const [owner]: HardhatEthersSigner[] = await ethers.getSigners()

    const crowdfundingCampaign: CrowdfundingCampaign = await CrowdfundingCampaign.connect(owner).deploy(
      baseUri,
      owner.address,
      campaignName,
      fees,
      description
    )

    return { crowdfundingCampaign, owner }
  }

  describe('Deployment', () => {
    it('Should set the right owner', async () => {
      const { crowdfundingCampaign, owner } = await loadFixture(deployFixture)
      expect(await crowdfundingCampaign.owner()).to.be.equal(owner.address)
    })

    it('Should set the right campaign name', async () => {
      const { crowdfundingCampaign } = await loadFixture(deployFixture)
      expect(await crowdfundingCampaign.name()).to.be.equal(campaignName)
    })

    it('Should set the right campaign description', async () => {
      const { crowdfundingCampaign } = await loadFixture(deployFixture)
      expect(await crowdfundingCampaign.description()).to.be.equal(description)
    })

    it('Should set the right campaign fees', async () => {
      const { crowdfundingCampaign } = await loadFixture(deployFixture)
      expect(await crowdfundingCampaign.fees()).to.be.equal(fees)
    })

    it('Should set the right Artist address', async () => {
      const { crowdfundingCampaign, owner } = await loadFixture(deployFixture)
      expect(await crowdfundingCampaign.artistAddress()).to.be.equal(owner.address)
    })

    it('Should set the right URI for a given id', async () => {
      const { crowdfundingCampaign } = await loadFixture(deployFixture)

      for (let i = 1; i <= 4; i++) {
        expect(await crowdfundingCampaign.uri(i)).to.be.equal(`${baseUri}${i}.json`)
      }
    })
  })

  describe('Mint', () => {
    it('Should emit TransferSingle', async () => {
      const { crowdfundingCampaign } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.mint(1, 5)).to.emit(crowdfundingCampaign, 'TransferSingle')
    })
  })
})