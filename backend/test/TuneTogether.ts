import { CampaignFactory, TuneTogether, Usdc, CrowdfundingCampaign } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { artistName, baseUri, bio, description, fees, campaignName, nbTiers, objectif } from './constants'
import { TuneTogetherCampaignFixture, TuneTogetherFixture } from './interfaces'
import { time } from '@nomicfoundation/hardhat-network-helpers'

describe('TuneTogether', () => {
  async function deployFixture(): Promise<TuneTogetherFixture> {
    const [owner, artist]: HardhatEthersSigner[] = await ethers.getSigners()

    const CampaignFactory = await ethers.getContractFactory('CampaignFactory')
    const campaignFactory: CampaignFactory = await CampaignFactory.connect(owner).deploy()

    const USDC = await ethers.getContractFactory('Usdc')
    const usdc: Usdc = await USDC.connect(owner).deploy()
    const usdcAddr: string = await usdc.getAddress();

    const TuneTogether = await ethers.getContractFactory('TuneTogether')
    const campaignFactoryAddr = await campaignFactory.getAddress()

    const tuneTogether: TuneTogether = await TuneTogether.connect(owner).deploy(campaignFactoryAddr, usdcAddr)
    const tuneTogetherAddr: string = await tuneTogether.getAddress()
    await campaignFactory.setOwnerContractAddr(tuneTogetherAddr)

    return { tuneTogether, campaignFactory, owner, artist}
  }

  async function deployFixtureWithCampaign(): Promise<TuneTogetherCampaignFixture> {
    const { tuneTogether, campaignFactory, owner, artist } = await loadFixture(deployFixture)

    const decimals = 10**6
    const tierOne = 1 * decimals
    const tierTwo = 20 * decimals
    const tierThree = 50 * decimals
    const tierFour = 100 * decimals

    const tx = await tuneTogether.connect(artist).createNewCampaign(
      campaignName,
      description,
      fees,
      artistName,
      bio,
      baseUri,
      nbTiers,
      objectif
    )

    const result = await tx.wait();
    const eventLog: any = result?.logs.find((log) => log.index == 1)
    const campaignAddr: string = eventLog.args[1]
    const crowdfundingCampaign = await ethers.getContractAt('CrowdfundingCampaign', campaignAddr);

    await crowdfundingCampaign.connect(artist).setTierPrice(1, tierOne)
    await crowdfundingCampaign.connect(artist).setTierPrice(2, tierTwo)
    await crowdfundingCampaign.connect(artist).setTierPrice(3, tierThree)
    await crowdfundingCampaign.connect(artist).setTierPrice(4, tierFour)

    return { tuneTogether, campaignFactory, crowdfundingCampaign, owner, artist, campaignAddr }
  }

  describe('Deployment', () => {
    it('isArtist should be false', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)
      expect(await tuneTogether.isArtist(artist.address)).to.be.equal(false)
    })
  })

  describe('Create a new CrowdfundingCampaign', () => {
    it('Should emit CrowdfundingCampaignCreated', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)
      // Create campaign with 0% fees
      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        0,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.emit(tuneTogether, 'CampaignAdded')

      // Create campaign with 5% fees
      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        5,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.emit(tuneTogether, 'CampaignAdded')

      // Create campaign with 10% fees
      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        10,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.emit(tuneTogether, 'CampaignAdded')
    })

    it('Should emit ArtistCreated', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)
      await expect(tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.emit(tuneTogether, 'ArtistCreated').withArgs(artist.address)
    })

    it('Should get Artist', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)
      const tx = await tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )

      expect(await tuneTogether.isArtist(artist.address)).to.be.equal(true)

      const result = await tx.wait()
      const eventLog: any = result?.logs.find((log) => log.index == 1)
      const artistAddr: string = eventLog.args[1]
      
      expect(await tuneTogether.getArtist(artist.address)).to.deep.equal([
        artistName,
        bio,
        fees.toString(),
        [artistAddr]
      ])
    })

    it('Should get one campaign', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)

      const tx = await tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )

      const result = await tx.wait()
      const eventLog: any = result?.logs.find((log) => log.index == 1)
      const campaignAddr: string = eventLog.args[1]
      
      expect(await tuneTogether.getOneCampaign(campaignAddr)).to.deep.equal([
        campaignName,
        description,
        BigInt(fees),
        BigInt(nbTiers),
        artist.address,
        BigInt(0),
        BigInt(objectif)
      ])
    })

    it('Revert if campaign name too short', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)

      await expect(tuneTogether.createNewCampaign(
        'S',
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.be.revertedWith('Campaign name too short')
    })

    it('Revert if campaign name too long', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)

      await expect(tuneTogether.createNewCampaign(
        'This Campaign name is really long',
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.be.revertedWith('Campaign name too long')
    })

    it('Revert if description too short', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)

      await expect(tuneTogether.createNewCampaign(
        campaignName,
        'S',
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.be.revertedWith('Campaign description too short')
    })

    it('Revert if wrong fees', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)

      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        42,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.be.revertedWith('Wrong fees')
    })
    
    it('Revert if artist name too short', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)

      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        fees,
        'S',
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.be.revertedWith('Artist name too short')
    })

    it('Revert if artist name too long', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)

      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        fees,
        'This Artist name is really long',
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.be.revertedWith('Artist name too long')
    })

    it('Revert if artist bio too short', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)

      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        'S',
        baseUri,
        nbTiers,
        objectif
      )).to.be.revertedWith('Artist bio too short')
    })

    it('Should not enter an existing Artist', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)
      await tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )

      await expect(await tuneTogether.connect(artist).createNewCampaign(
        'Another campaign',
        'Campaign with existing artist',
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.not.emit(tuneTogether, 'ArtistCreated')
    })

    it('Revert if not enough tiers', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)
  
      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        fees,
        objectif
      )).to.be.revertedWith('Not enough tier prices')
    })
  
    it('Revert if too many tier prices', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)
  
      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        42,
        objectif
      )).to.be.revertedWith('Too many tier prices')
    })

      
    it('Revert if objectif too low', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)
  
      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        10
      )).to.be.revertedWith('Objectif too low')
    })
          
    it('Revert if max number of campaign reached', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)

      for (let i = 0; i < 10; i++) {
        const tx = await tuneTogether.createNewCampaign(
          campaignName + i,
          description,
          fees,
          artistName,
          bio,
          baseUri,
          nbTiers,
          objectif
        )

        tx.wait()
      }
  
      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )).to.be.revertedWith('Max number of campaign reached')
    })
  })

  describe('Update Campaign Informations', () => {
    it('Should update campaign informations', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)

      const tx = await tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )

      const result = await tx.wait();
      const eventLog: any = result?.logs.find((log) => log.index == 1)
      const campaignAddr: string = eventLog.args[1]
      
      await expect(tuneTogether.connect(artist).updateCampaignInfo(
        'new name',
        'Update campaign with 0% fees',
        0,
        campaignAddr
      )).to.emit(tuneTogether, 'CampaignUpdated').withArgs(campaignAddr)

      await expect(tuneTogether.connect(artist).updateCampaignInfo(
        'new name',
        'Update campaign with 5% fees',
        5,
        campaignAddr
      )).to.emit(tuneTogether, 'CampaignUpdated').withArgs(campaignAddr)

      await expect(tuneTogether.connect(artist).updateCampaignInfo(
        'new name',
        'Update campaign with 10% fees',
        10,
        campaignAddr
      )).to.emit(tuneTogether, 'CampaignUpdated').withArgs(campaignAddr)

      const campaign = await tuneTogether.getOneCampaign(campaignAddr)

      expect(campaign.name).to.equal('new name')
      expect(campaign.description).to.equal('Update campaign with 10% fees')
      expect(campaign.fees).to.equal(10)
    })

    it('Revert not the campaign artist', async () => {
      const { tuneTogether, artist, owner } = await loadFixture(deployFixture)

      const tx = await tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )

      const result = await tx.wait()
      const eventLog: any = result?.logs.find((log) => log.index == 1)
      const campaignAddr: string = eventLog.args[1]
      
      await expect(tuneTogether.connect(owner).updateCampaignInfo(
        campaignName,
        description,
        fees,
        campaignAddr
      )).to.be.revertedWith('You\'re not the campaign artist')
    })

    it('Revert if name too short', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)

      const tx = await tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )

      const result = await tx.wait()
      const eventLog: any = result?.logs.find((log) => log.index == 1)
      const campaignAddr: string = eventLog.args[1]
      
      await expect(tuneTogether.connect(artist).updateCampaignInfo(
        'S',
        description,
        fees,
        campaignAddr
      )).to.be.revertedWith('Name too short')
    })

    it('Revert if name too long', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)

      const tx = await tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )

      const result = await tx.wait()
      const eventLog: any = result?.logs.find((log) => log.index == 1)
      const campaignAddr: string = eventLog.args[1]
      
      await expect(tuneTogether.connect(artist).updateCampaignInfo(
        'This Campaign name is really long',
        description,
        fees,
        campaignAddr
      )).to.be.revertedWith('Name too long')
    })

    it('Revert if description too short', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)

      const tx = await tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )

      const result = await tx.wait()
      const eventLog: any = result?.logs.find((log) => log.index == 1)
      const campaignAddr: string = eventLog.args[1]
      
      await expect(tuneTogether.connect(artist).updateCampaignInfo(
        campaignName,
        'S',
        fees,
        campaignAddr
      )).to.be.revertedWith('Description too short')
    })

    it('Revert if wrong fees', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)

      const tx = await tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri,
        nbTiers,
        objectif
      )

      const result = await tx.wait()
      const eventLog: any = result?.logs.find((log) => log.index == 1)
      const campaignAddr: string = eventLog.args[1]
      
      await expect(tuneTogether.connect(artist).updateCampaignInfo(
        campaignName,
        description,
        42,
        campaignAddr
      )).to.be.revertedWith('Wrong fees option')
    })
  })

  describe('Boost', () => {
    it('Should set boost', async () => {
      const { tuneTogether, artist, crowdfundingCampaign, campaignAddr } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(artist).startCampaign()

      await expect(tuneTogether.connect(artist).setBoost(campaignAddr, {value: ethers.parseEther('0.001')})).to.emit(tuneTogether, 'CampaignBoosted')
    })

    it('Should set boost in Crowdfunding contract', async () => {
      const { tuneTogether, artist, crowdfundingCampaign, campaignAddr } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(artist).startCampaign()

      await expect(tuneTogether.connect(artist).setBoost(campaignAddr, {value: ethers.parseEther('0.001')})).to.emit(crowdfundingCampaign, 'Boosted')
    })

    it('Revert if not the campaign artist', async () => {
      const { tuneTogether, owner, crowdfundingCampaign, artist, campaignAddr } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(artist).startCampaign()

      await expect(tuneTogether.connect(owner).setBoost(campaignAddr, {value: ethers.parseEther('0.001')})).to.be.revertedWith('You\'re not the campaign artist')
    })

    it('Revert if wrong value', async () => {
      const { tuneTogether, crowdfundingCampaign, artist, campaignAddr } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(artist).startCampaign()

      await expect(tuneTogether.connect(artist).setBoost(campaignAddr, {value: ethers.parseEther('0.002')})).to.be.revertedWith('Wrong value')
    })

    it('Revert if Artist didn\'t start the campaign yet', async () => {
      const { tuneTogether, artist, campaignAddr } = await loadFixture(deployFixtureWithCampaign)

      await expect(tuneTogether.connect(artist).setBoost(campaignAddr, {value: ethers.parseEther('0.001')})).to.be.revertedWith('Artist didn\'t start the campaign yet')
    })

    it('Revert if campaign closed', async () => {
      const { tuneTogether, artist, crowdfundingCampaign, campaignAddr } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(artist).startCampaign()
      await crowdfundingCampaign.connect(artist).closeCampaign()

      await expect(tuneTogether.connect(artist).setBoost(campaignAddr, {value: ethers.parseEther('0.001')})).to.be.revertedWith('Campaign closed')
    })

    it('Revert if campaign ended', async () => {
      const { tuneTogether, crowdfundingCampaign, artist, campaignAddr } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(artist).startCampaign()
      await time.increase(4838420); // Advance time by 8 weeks and mine a new block

      await expect(tuneTogether.connect(artist).setBoost(campaignAddr, {value: ethers.parseEther('0.001')})).to.be.revertedWith('Campaign ended')
    })
  })

  describe('Withdraw', () => {
    it('Should withdraw fund', async () => {
      const { tuneTogether, artist, crowdfundingCampaign, campaignAddr, owner } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(artist).startCampaign()
      await tuneTogether.connect(artist).setBoost(campaignAddr, {value: ethers.parseEther('0.001')})

      await expect(tuneTogether.connect(owner).withdraw()).to.emit(tuneTogether, 'FundWithdraw')
    })

    it('Revert if not the owner', async () => {
      const { tuneTogether, artist, crowdfundingCampaign, campaignAddr, owner } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(artist).startCampaign()
      await tuneTogether.connect(artist).setBoost(campaignAddr, {value: ethers.parseEther('0.001')})

      await expect(tuneTogether.connect(artist).withdraw()).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
})