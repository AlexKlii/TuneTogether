import { CampaignFactory, CrowdfundingCampaign, TuneTogether } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { baseUri, description, fees, campaignName, nbTiers } from './constants'
import { CrowdfundingCampaignFixture } from './interfaces'
import { time } from '@nomicfoundation/hardhat-network-helpers'

describe('CrowdfundingCampaign', () => {
  const lowEther = ethers.parseEther("0.000001")
  const oneEther = ethers.parseEther("1")
  const twoEther = ethers.parseEther("2")
  const threeEther = ethers.parseEther("3")
  const fourEther = ethers.parseEther("4")

  async function deployFixture(): Promise<CrowdfundingCampaignFixture> {
    const CrowdfundingCampaign = await ethers.getContractFactory('CrowdfundingCampaign')
    const [owner, artist, investor, tuneTogether]: HardhatEthersSigner[] = await ethers.getSigners()
  
    const crowdfundingCampaign: CrowdfundingCampaign = await CrowdfundingCampaign.connect(owner).deploy(
      baseUri,
      tuneTogether.address,
      artist.address,
      campaignName,
      fees,
      description,
      nbTiers,
    )

    return { crowdfundingCampaign, owner, artist, investor, tuneTogether }
  }

  async function deployFixtureWithCampaign(): Promise<CrowdfundingCampaignFixture> {
    const { crowdfundingCampaign, owner, artist, investor, tuneTogether } = await loadFixture(deployFixture)
    await crowdfundingCampaign.connect(artist).setTierPrice(1, oneEther)
    await crowdfundingCampaign.connect(artist).setTierPrice(2, twoEther)
    await crowdfundingCampaign.connect(artist).setTierPrice(3, threeEther)
    await crowdfundingCampaign.connect(artist).setTierPrice(4, fourEther)
    await crowdfundingCampaign.connect(artist).startCampaign()

    return { crowdfundingCampaign, owner, artist, investor, tuneTogether }
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

    it('Should set the right number of tiers', async () => {
      const { crowdfundingCampaign } = await loadFixture(deployFixture)
      expect(await crowdfundingCampaign.nbTiers()).to.be.equal(nbTiers)
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
      await crowdfundingCampaign.connect(artist).setTierPrice(1, oneEther)
      await crowdfundingCampaign.connect(artist).setTierPrice(2, twoEther)
      await crowdfundingCampaign.connect(artist).setTierPrice(3, threeEther)
      await crowdfundingCampaign.connect(artist).setTierPrice(4, fourEther)
      await expect(crowdfundingCampaign.connect(artist).startCampaign()).to.emit(crowdfundingCampaign, 'CampaignStarted')
    })

    it('Revert if not the Artist of the campaign', async () => {
      const { crowdfundingCampaign, owner } = await loadFixture(deployFixtureWithCampaign)
      await expect(crowdfundingCampaign.connect(owner).startCampaign()).to.be.revertedWith('You\'re not the campaign artist')
    })

    it('Revert if campaign already started', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixtureWithCampaign)
      await expect(crowdfundingCampaign.connect(artist).startCampaign()).to.be.revertedWith('Campaign already started')
    })

    it('Revert if missing tier prices', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).startCampaign()).to.be.revertedWith('Missing tier prices')
    })
  })

  describe('Close Campaign', () => {
    it('Should close the campaign', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixtureWithCampaign)
      await expect(crowdfundingCampaign.connect(artist).closeCampaign()).to.emit(crowdfundingCampaign, 'CampaignClosed')
    })

    it('Revert if not the Artist of the campaign', async () => {
      const { crowdfundingCampaign, owner, artist } = await loadFixture(deployFixtureWithCampaign)
      await expect(crowdfundingCampaign.connect(owner).closeCampaign()).to.be.revertedWith('You\'re not the campaign artist')
    })

    it('Revert if campaign not started', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).closeCampaign()).to.be.revertedWith('Artist didn\'t start the campaign yet')
    })

    it('Revert if campaign already closed', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(artist).closeCampaign()
      await expect(crowdfundingCampaign.connect(artist).closeCampaign()).to.be.revertedWith('Campaign closed')
    })

    it('Revert if campaign ended', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixtureWithCampaign)

      // Advance time by 8 weeks and mine a new block
      await time.increase(4838420);

      await expect(crowdfundingCampaign.connect(artist).closeCampaign()).to.be.revertedWith('Campaign ended')
    })
  })

  describe('Update Campaign Informations', () => {
    it('Should update campaign informations', async () => {
      const { crowdfundingCampaign, tuneTogether } = await loadFixture(deployFixture)

      await expect(crowdfundingCampaign.connect(tuneTogether).updateCampaignInfo(
        'new name',
        'Update campaign with 0% fees',
        0
      )).to.emit(crowdfundingCampaign, 'CampaignInfoUpdated').withArgs('new name', 'Update campaign with 0% fees', 0)

      await expect(crowdfundingCampaign.connect(tuneTogether).updateCampaignInfo(
        'new name',
        'Update campaign with 5% fees',
        5
      )).to.emit(crowdfundingCampaign, 'CampaignInfoUpdated').withArgs('new name', 'Update campaign with 5% fees', 5)

      await expect(crowdfundingCampaign.connect(tuneTogether).updateCampaignInfo(
        'new name',
        'Update campaign with 10% fees',
        10
      )).to.emit(crowdfundingCampaign, 'CampaignInfoUpdated').withArgs('new name', 'Update campaign with 10% fees', 10)
    })

    it('Revert if caller is not TuneTogheter contract', async () => {
      const { crowdfundingCampaign, owner } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(owner).updateCampaignInfo(
        'new name',
        'new description',
        0
      )).to.be.revertedWith('You\'re not the owner')
    })

    it('Revert if campaign already started', async () => {
      const { crowdfundingCampaign, tuneTogether } = await loadFixture(deployFixtureWithCampaign)
      await expect(crowdfundingCampaign.connect(tuneTogether).updateCampaignInfo(
        'new name',
        'new description',
        0
      )).to.be.revertedWith('Campaign already started')
    })

    it('Revert if name too short', async () => {
      const { crowdfundingCampaign, tuneTogether } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(tuneTogether).updateCampaignInfo(
        'S',
        'new description',
        0
      )).to.be.revertedWith('Name too short')
    })

    it('Revert if name too long', async () => {
      const { crowdfundingCampaign, tuneTogether } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(tuneTogether).updateCampaignInfo(
        'This Campaign name is really long',
        'new description',
        0
      )).to.be.revertedWith('Name too long')
    })

    it('Revert if description too short', async () => {
      const { crowdfundingCampaign, tuneTogether } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(tuneTogether).updateCampaignInfo(
        'new name',
        'S',
        0
      )).to.be.revertedWith('Description too short')
    })

    it('Revert if wrong fees', async () => {
      const { crowdfundingCampaign, tuneTogether } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(tuneTogether).updateCampaignInfo(
        'new name',
        'new description',
        42
      )).to.be.revertedWith('Wrong fees option')
    })
  })

  describe('Mint', () => {
    it('Should mint', async () => {
      const { crowdfundingCampaign, artist, investor } = await loadFixture(deployFixtureWithCampaign)
      await expect(crowdfundingCampaign.connect(investor).mint(1, 4, {value : fourEther})).to.emit(crowdfundingCampaign, 'TransferSingle')
    })

    it('Revert if wrong value', async () => {
      const { crowdfundingCampaign, artist, investor } = await loadFixture(deployFixtureWithCampaign)
      await expect(crowdfundingCampaign.connect(investor).mint(1, 4, {value : oneEther})).to.be.revertedWith('Wrong value')
    })

    it("Revert if campaign not start", async () => {
      const { crowdfundingCampaign, investor } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(investor).mint(1, 4, {value : fourEther})).to.be.revertedWith('Artist didn\'t start the campaign yet');
    })

    it("Revert if campaign closed", async () => {
      const { crowdfundingCampaign, artist, investor } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(artist).closeCampaign()
      await expect(crowdfundingCampaign.connect(investor).mint(1, 4, {value : fourEther})).to.be.revertedWith('Campaign closed');
    })

    it("Revert if campaign ended", async () => {
      const { crowdfundingCampaign, artist, investor } = await loadFixture(deployFixtureWithCampaign)

      // Advance time by 8 weeks and mine a new block
      await time.increase(4838420);

      await expect(crowdfundingCampaign.connect(investor).mint(1, 4, {value : fourEther})).to.be.revertedWith('Campaign ended');
    })
  })

  describe('Tier Prices', () => {
    it('Should set tier price', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(1, oneEther)).to.emit(crowdfundingCampaign, 'TierPriceAdded').withArgs(1, oneEther)
    })

    it('Revert if not the Artist of the campaign', async () => {
      const { crowdfundingCampaign, owner } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(owner).setTierPrice(1, oneEther)).to.be.revertedWith('You\'re not the campaign artist')
    })

    it('Revert if campaign already started', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixtureWithCampaign)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(1, oneEther)).to.be.revertedWith('Campaign already started')
    })

    it('Revert if tier does not exist', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(42, oneEther)).to.be.revertedWith('Tier does not exist')
    })

    it('Revert if price too low', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(1, lowEther)).to.be.revertedWith('Price too low')
    })

    it('Revert if price not higher than the previous tier', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).setTierPrice(1, twoEther)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(2, oneEther)).to.be.revertedWith('Price should be higher than the previous tier')
    })

    it('Revert if price higher than the next tier', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).setTierPrice(2, oneEther)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(1, twoEther)).to.be.revertedWith('Price should be lower than the next tier')
    })
  })
})