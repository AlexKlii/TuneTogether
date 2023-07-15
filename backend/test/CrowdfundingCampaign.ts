import { CrowdfundingCampaign, Usdc } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { baseUri, description, fees, campaignName, nbTiers, objectif } from './constants'
import { CrowdfundingCampaignFixture } from './interfaces'
import { time } from '@nomicfoundation/hardhat-network-helpers'

describe('CrowdfundingCampaign', () => {
  const decimals = 10**6

  const lowUSDC = 0.5 * decimals
  const tierOne = 1 * decimals
  const tierTwo = 20 * decimals
  const tierThree = 50 * decimals
  const tierFour = 100 * decimals

  async function deployFixture(): Promise<CrowdfundingCampaignFixture> {
    const [owner, artist, investor, tuneTogether]: HardhatEthersSigner[] = await ethers.getSigners()
    
    const USDC = await ethers.getContractFactory('Usdc')
    const usdc: Usdc = await USDC.connect(owner).deploy()
    const usdcAddr: string = await usdc.getAddress();

    const CrowdfundingCampaign = await ethers.getContractFactory('CrowdfundingCampaign')
  
    const crowdfundingCampaign: CrowdfundingCampaign = await CrowdfundingCampaign.connect(owner).deploy(
      baseUri,
      tuneTogether.address,
      usdcAddr,
      artist.address,
      campaignName,
      fees,
      description,
      nbTiers,
      objectif
    )

    const crowdfundingCampaignAddr: string = await crowdfundingCampaign.getAddress()
    
    // Giving some USDC to the investor for mint NFTs and approve allowance
    await usdc.faucet(investor.address, 420 * decimals)
    await usdc.connect(investor).approve(crowdfundingCampaignAddr, 420 * decimals)

    return { crowdfundingCampaign, owner, artist, investor, tuneTogether, usdc }
  }

  async function deployFixtureWithCampaign(): Promise<CrowdfundingCampaignFixture> {
    const { crowdfundingCampaign, owner, artist, investor, tuneTogether, usdc } = await loadFixture(deployFixture)
    await crowdfundingCampaign.connect(artist).setTierPrice(1, tierOne)
    await crowdfundingCampaign.connect(artist).setTierPrice(2, tierTwo)
    await crowdfundingCampaign.connect(artist).setTierPrice(3, tierThree)
    await crowdfundingCampaign.connect(artist).setTierPrice(4, tierFour)
    await crowdfundingCampaign.connect(artist).startCampaign()

    return { crowdfundingCampaign, owner, artist, investor, tuneTogether, usdc }
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
      await crowdfundingCampaign.connect(artist).setTierPrice(1, tierOne)
      await crowdfundingCampaign.connect(artist).setTierPrice(2, tierTwo)
      await crowdfundingCampaign.connect(artist).setTierPrice(3, tierThree)
      await crowdfundingCampaign.connect(artist).setTierPrice(4, tierFour)
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
      await time.increase(4838420); // Advance time by 8 weeks and mine a new block

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
  })

  describe('Mint', () => {
    it('Should mint', async () => {
      const { crowdfundingCampaign, investor } = await loadFixture(deployFixtureWithCampaign)
      await expect(crowdfundingCampaign.connect(investor).mint(1, 4)).to.emit(crowdfundingCampaign, 'TransferSingle')
    })

    it("Revert if campaign not start", async () => {
      const { crowdfundingCampaign, investor } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(investor).mint(2, 4)).to.be.revertedWith('Artist didn\'t start the campaign yet');
    })

    it("Revert if campaign closed", async () => {
      const { crowdfundingCampaign, artist, investor } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(artist).closeCampaign()
      await expect(crowdfundingCampaign.connect(investor).mint(3, 4)).to.be.revertedWith('Campaign closed');
    })

    it('Revert if not enough balance', async () => {
      const { crowdfundingCampaign, investor } = await loadFixture(deployFixtureWithCampaign)
      await expect(crowdfundingCampaign.connect(investor).mint(4, 5)).to.be.revertedWith('Not enough balance')
    })

    it("Revert if campaign ended", async () => {
      const { crowdfundingCampaign, investor } = await loadFixture(deployFixtureWithCampaign)
      await time.increase(4838420);

      await expect(crowdfundingCampaign.connect(investor).mint(1, 4)).to.be.revertedWith('Campaign ended');
    })
  })

  describe('Tier Prices', () => {
    it('Should set tier price', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(1, tierOne)).to.emit(crowdfundingCampaign, 'TierPriceAdded').withArgs(1, tierOne)
    })

    it('Should get tier price', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).setTierPrice(1, tierOne)
      expect(await crowdfundingCampaign.connect(artist).getTierPrice(1)).to.be.equal(tierOne)
    })

    it('Revert if not the Artist of the campaign', async () => {
      const { crowdfundingCampaign, owner } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(owner).setTierPrice(1, tierOne)).to.be.revertedWith('You\'re not the campaign artist')
    })

    it('Revert if campaign already started', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixtureWithCampaign)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(1, tierOne)).to.be.revertedWith('Campaign already started')
    })

    it('Revert if tier does not exist', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(42, tierOne)).to.be.revertedWith('Tier does not exist')
    })

    it('Revert if price too low', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(1, lowUSDC)).to.be.revertedWith('Price too low')
    })

    it('Revert if price not higher than the previous tier', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).setTierPrice(1, tierTwo)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(2, tierOne)).to.be.revertedWith('Price should be higher than the previous tier')
    })

    it('Revert if price higher than the next tier', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).setTierPrice(2, tierOne)
      await expect(crowdfundingCampaign.connect(artist).setTierPrice(1, tierTwo)).to.be.revertedWith('Price should be lower than the next tier')
    })
  })

  describe('Withdraw', () => {
    it('Should withdraw fund after close campaign', async () => {
      const { crowdfundingCampaign, artist, investor, usdc } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(investor).mint(1, 4)
      await crowdfundingCampaign.connect(artist).closeCampaign()
  
      // Initial Ether balance of the artist's address
      const initialBalance = await artist.provider.getBalance(artist.address);

      await expect(crowdfundingCampaign.connect(artist).withdraw()).to.emit(crowdfundingCampaign, 'FundWithdraw')
  
      // Assert that the USDC tokens were transferred to the artist's address
      const usdcBalance = await usdc.balanceOf(artist.address);
      expect(usdcBalance).to.equal(4000000); // Replace with the expected balance
  
      // No Ether was transferred to the artist's address, so with the gas, he should have less eth than before withdraw
      const ethBalanceAfter = await artist.provider.getBalance(artist.address);
      expect(ethBalanceAfter).to.be.lessThan(initialBalance); // Replace with the expected balance
    })

    it('Should withdraw fund after 8 weeks', async () => {
      const { crowdfundingCampaign, artist, investor } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(investor).mint(1, 4)
      await time.increase(4838420);

      await expect(crowdfundingCampaign.connect(artist).withdraw()).to.emit(crowdfundingCampaign, 'FundWithdraw')
    })

    it('Revert if not the campaign artist', async () => {
      const { crowdfundingCampaign, artist, investor } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(investor).mint(1, 4)
      await crowdfundingCampaign.connect(artist).closeCampaign()

      await expect(crowdfundingCampaign.connect(investor).withdraw()).to.be.revertedWith('You\'re not the campaign artist')
    })

    it('Revert if Artist didn\'t start the campaign', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)

      await expect(crowdfundingCampaign.connect(artist).withdraw()).to.be.revertedWith('Artist didn\'t start the campaign yet')
    })

    it('Revert if campaign in progress', async () => {
      const { crowdfundingCampaign, artist, investor } = await loadFixture(deployFixtureWithCampaign)
      await crowdfundingCampaign.connect(investor).mint(1, 4)

      await expect(crowdfundingCampaign.connect(artist).withdraw()).to.be.revertedWith('Campaign in progress')
    })
  })

  describe('Boost', () => {
    it('Should set boost', async () => {
      const { crowdfundingCampaign, artist, tuneTogether } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).setTierPrice(1, tierOne)
      await crowdfundingCampaign.connect(artist).setTierPrice(2, tierTwo)
      await crowdfundingCampaign.connect(artist).setTierPrice(3, tierThree)
      await crowdfundingCampaign.connect(artist).setTierPrice(4, tierFour)
      await crowdfundingCampaign.connect(artist).startCampaign()

      await expect(crowdfundingCampaign.connect(tuneTogether).setBoost(Date.now())).to.emit(crowdfundingCampaign, 'Boosted')
    })

    it('Revert if not the campaign artist', async () => {
      const { crowdfundingCampaign, artist } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).setTierPrice(1, tierOne)
      await crowdfundingCampaign.connect(artist).setTierPrice(2, tierTwo)
      await crowdfundingCampaign.connect(artist).setTierPrice(3, tierThree)
      await crowdfundingCampaign.connect(artist).setTierPrice(4, tierFour)
      await crowdfundingCampaign.connect(artist).startCampaign()

      await expect(crowdfundingCampaign.connect(artist).setBoost(Date.now())).to.be.revertedWith('You\'re not the owner')
    })

    it('Revert if Artist didn\'t start the campaign', async () => {
      const { crowdfundingCampaign, artist, tuneTogether } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).setTierPrice(1, tierOne)
      await crowdfundingCampaign.connect(artist).setTierPrice(2, tierTwo)
      await crowdfundingCampaign.connect(artist).setTierPrice(3, tierThree)
      await crowdfundingCampaign.connect(artist).setTierPrice(4, tierFour)

      await expect(crowdfundingCampaign.connect(tuneTogether).setBoost(Date.now())).to.be.revertedWith('Artist didn\'t start the campaign yet')
    })

    it('Revert if campaign closed', async () => {
      const { crowdfundingCampaign, artist, tuneTogether } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).setTierPrice(1, tierOne)
      await crowdfundingCampaign.connect(artist).setTierPrice(2, tierTwo)
      await crowdfundingCampaign.connect(artist).setTierPrice(3, tierThree)
      await crowdfundingCampaign.connect(artist).setTierPrice(4, tierFour)
      await crowdfundingCampaign?.connect(artist).startCampaign()
      await crowdfundingCampaign?.connect(artist).closeCampaign()

      await expect(crowdfundingCampaign.connect(tuneTogether).setBoost(Date.now())).to.be.revertedWith('Campaign closed')
    })

    it('Revert if campaign ended', async () => {
      const { crowdfundingCampaign, artist, tuneTogether } = await loadFixture(deployFixture)
      await crowdfundingCampaign.connect(artist).setTierPrice(1, tierOne)
      await crowdfundingCampaign.connect(artist).setTierPrice(2, tierTwo)
      await crowdfundingCampaign.connect(artist).setTierPrice(3, tierThree)
      await crowdfundingCampaign.connect(artist).setTierPrice(4, tierFour)
      await crowdfundingCampaign?.connect(artist).startCampaign()
      await time.increase(4838420);

      await expect(crowdfundingCampaign.connect(tuneTogether).setBoost(Date.now())).to.be.revertedWith('Campaign ended')
    })
  })
})