import { CampaignFactory, TuneTogether } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { artistName, baseUri, bio, description, fees, campaignName } from './constants'
import { TuneTogetherFixture } from './interfaces'

describe('TuneTogether', () => {
  async function deployFixture(): Promise<TuneTogetherFixture> {
    const [owner, artist]: HardhatEthersSigner[] = await ethers.getSigners()

    const CampaignFactory = await ethers.getContractFactory('CampaignFactory')
    const campaignFactory: CampaignFactory = await CampaignFactory.connect(owner).deploy()

    const TuneTogether = await ethers.getContractFactory('TuneTogether')
    const campaignFactoryAddr = await campaignFactory.getAddress()

    const tuneTogether: TuneTogether = await TuneTogether.connect(owner).deploy(campaignFactoryAddr)
    return { tuneTogether, campaignFactory, owner, artist }
  }

  describe('Deployment', () => {
    it('isArtist should be false', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)
      expect(await tuneTogether.isArtist(artist.address)).to.be.equal(false)
    })
  })

  describe('Create a new CrowdfundingCampaign', () => {
    it('Should emit CrowdfundingCampaignCreated', async () => {
      const { tuneTogether, campaignFactory } = await loadFixture(deployFixture)
      // Create campaign with 0% fees
      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        0,
        artistName,
        bio,
        baseUri
      )).to.emit(campaignFactory, 'CrowdfundingCampaignCreated')

      // Create campaign with 5% fees
      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        5,
        artistName,
        bio,
        baseUri
      )).to.emit(campaignFactory, 'CrowdfundingCampaignCreated')

      // Create campaign with 10% fees
      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        10,
        artistName,
        bio,
        baseUri
      )).to.emit(campaignFactory, 'CrowdfundingCampaignCreated')
    })

    it('Should emit ArtistCreated', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)
      await expect(tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri
      )).to.emit(tuneTogether, 'ArtistCreated').withArgs(artist.address)
    })

    it('Should get Artist', async () => {
      const { tuneTogether, artist } = await loadFixture(deployFixture)
      await tuneTogether.connect(artist).createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri
      )

      expect(await tuneTogether.isArtist(artist.address)).to.be.equal(true)
      expect(await tuneTogether.getArtist(artist.address)).to.deep.equal([
        artistName,
        bio,
        fees.toString()
      ])
    })

    it('Should get an empty campaign', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)
      expect(await tuneTogether.getOneCampaign('0x0000000000000000000000000000000000000000')).to.deep.equal(['','',BigInt(0)])
    })

    it('Should get one campaign', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)

      await tuneTogether.createNewCampaign(
        campaignName,
        description,
        fees,
        artistName,
        bio,
        baseUri
      )

      // @TODO: Retrive `campaignAddr` from event emitted
      // expect(await tuneTogether.getOneCampaign(campaignAddr)).to.deep.equal([
      //   campaignName,
      //   description,
      //   fees.toString()
      // ])
    })

    it('Revert if campaign name too short', async () => {
      const { tuneTogether } = await loadFixture(deployFixture)

      await expect(tuneTogether.createNewCampaign(
        'S',
        description,
        fees,
        artistName,
        bio,
        baseUri
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
        baseUri
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
        baseUri
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
        baseUri
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
        baseUri
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
        baseUri
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
        baseUri
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
        baseUri
      )

      await expect(await tuneTogether.connect(artist).createNewCampaign(
        'Another campaign',
        'Campaign with existing artist',
        fees,
        artistName,
        bio,
        baseUri
      )).to.not.emit(tuneTogether, 'ArtistCreated')
    })
  })
})