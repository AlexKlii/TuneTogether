import { CampaignFactory, TuneTogether } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { artistName, baseUri, bio, description, fees, campaignAddr, campaignName } from './constants'
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
      await expect(tuneTogether.createNewCampaign(
        campaignName,
        description,
        fees,
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

      expect(await tuneTogether.getOneCampaign(campaignAddr)).to.deep.equal([
        campaignName,
        description,
        fees.toString()
      ])
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