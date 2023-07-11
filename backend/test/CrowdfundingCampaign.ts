import { CrowdfundingCampaign } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { baseUri, description, fees, campaignName } from './constants'
import { CrowdfundingCampaignFixture } from './interfaces'
import { time } from '@nomicfoundation/hardhat-network-helpers'

describe('CrowdfundingCampaign', () => {
  async function deployFixture(): Promise<CrowdfundingCampaignFixture> {
    const CrowdfundingCampaign = await ethers.getContractFactory('CrowdfundingCampaign')
    const [owner, artist, investor]: HardhatEthersSigner[] = await ethers.getSigners()

    const crowdfundingCampaign: CrowdfundingCampaign = await CrowdfundingCampaign.connect(owner).deploy(
      baseUri,
      artist.address,
      campaignName,
      fees,
      description
    )

    return { crowdfundingCampaign, owner, artist, investor }
  }

  describe('Deployment', () => {
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

    it('Should set the right artist address', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      expect(await crowdfundingCampaign.artistAddress()).to.be.equal(artist.address)
    })

    it('Should get the right URI for a given id', async () => {
      const { crowdfundingCampaign } = await loadFixture(deployFixture)

      for (let i = 1; i <= 4; i++) {
        expect(await crowdfundingCampaign.uri(i)).to.be.equal(`${baseUri}${i}.json`)
      }
    })
  })

  describe('Start Campaign', () => {
    it('Should start the campaign', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).startCampaign()).to.emit(crowdfundingCampaign, 'CampaignStarted')
    })

    it('Revert if not the Artist of the campaign', async () => {
      const { crowdfundingCampaign, owner } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(owner).startCampaign()).to.be.revertedWith('You\'re not the campaign artist')
    })

    it('Revert if campaign already started', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).startCampaign()
      await expect(crowdfundingCampaign.connect(artist).startCampaign()).to.be.revertedWith('Campaign already started')
    })
  })

  describe('Close Campaign', () => {
    it('Should close the campaign', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).startCampaign()
      await expect(crowdfundingCampaign.connect(artist).closeCampaign()).to.emit(crowdfundingCampaign, 'CampaignClosed')
    })

    it('Revert if not the Artist of the campaign', async () => {
      const { crowdfundingCampaign, owner, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).startCampaign()
      await expect(crowdfundingCampaign.connect(owner).closeCampaign()).to.be.revertedWith('You\'re not the campaign artist')
    })

    it('Revert if campaign not started', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).closeCampaign()).to.be.revertedWith('Artist didn\'t start the campaign yet')
    })

    it('Revert if campaign already closed', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).startCampaign()
      await crowdfundingCampaign.connect(artist).closeCampaign()
      await expect(crowdfundingCampaign.connect(artist).closeCampaign()).to.be.revertedWith('Campaign closed')
    })

    it('Revert if campaign ended', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).startCampaign()

      // Advance time by 8 weeks and mine a new block
      await time.increase(4838420);

      await expect(crowdfundingCampaign.connect(artist).closeCampaign()).to.be.revertedWith('Campaign ended')
    })
  })

  describe('Update Campaign Informations', () => {
    it('Should update campaign informations', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)

      await expect(crowdfundingCampaign.connect(artist).updateCampaignInfo(
        'new name',
        'Update campaign with 0% fees',
        0
      )).to.emit(crowdfundingCampaign, 'CampaignInfoUpdated').withArgs('new name', 'Update campaign with 0% fees', 0)

      await expect(crowdfundingCampaign.connect(artist).updateCampaignInfo(
        'new name',
        'Update campaign with 5% fees',
        5
      )).to.emit(crowdfundingCampaign, 'CampaignInfoUpdated').withArgs('new name', 'Update campaign with 5% fees', 5)

      await expect(crowdfundingCampaign.connect(artist).updateCampaignInfo(
        'new name',
        'Update campaign with 10% fees',
        10
      )).to.emit(crowdfundingCampaign, 'CampaignInfoUpdated').withArgs('new name', 'Update campaign with 10% fees', 10)
    })

    it('Revert if not the Artist of the campaign', async () => {
      const { crowdfundingCampaign, owner } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(owner).updateCampaignInfo(
        'new name',
        'new description',
        0
      )).to.be.revertedWith('You\'re not the campaign artist')
    })

    it('Revert if campaign already started', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).startCampaign()
      await expect(crowdfundingCampaign.connect(artist).updateCampaignInfo(
        'new name',
        'new description',
        0
      )).to.be.revertedWith('Campaign already started')
    })

    it('Revert if name too short', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).updateCampaignInfo(
        'S',
        'new description',
        0
      )).to.be.revertedWith('Name too short')
    })

    it('Revert if name too long', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).updateCampaignInfo(
        'This Campaign name is really long',
        'new description',
        0
      )).to.be.revertedWith('Name too long')
    })

    it('Revert if description too short', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).updateCampaignInfo(
        'new name',
        'S',
        0
      )).to.be.revertedWith('Description too short')
    })

    it('Revert if wrong fees', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).updateCampaignInfo(
        'new name',
        'new description',
        42
      )).to.be.revertedWith('Wrong fees option')
    })
  })

  describe('Mint', () => {
    it('Should mint', async () => {
      const { crowdfundingCampaign, artist, investor } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).startCampaign()
      await expect(crowdfundingCampaign.connect(investor).mint(1, 5)).to.emit(crowdfundingCampaign, 'TransferSingle')
    })

    it("Revert from mint if campaign not start", async () => {
      const { crowdfundingCampaign, investor } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(investor).mint(1, 5)).to.be.revertedWith('Artist didn\'t start the campaign yet');
    })

    it("Revert from mint if campaign closed", async () => {
      const { crowdfundingCampaign, artist, investor } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).startCampaign()
      await crowdfundingCampaign.connect(artist).closeCampaign()
      await expect(crowdfundingCampaign.connect(investor).mint(1, 5)).to.be.revertedWith('Campaign closed');
    })

    it("Revert from mint if campaign ended", async () => {
      const { crowdfundingCampaign, artist, investor } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).startCampaign()

      // Advance time by 8 weeks and mine a new block
      await time.increase(4838420);

      await expect(crowdfundingCampaign.connect(investor).mint(1, 5)).to.be.revertedWith('Campaign ended');
    })
  })
})