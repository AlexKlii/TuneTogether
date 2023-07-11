import { ProjectFactory, TuneTogether } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { artistName, baseUri, bio, description, fees, projectAddr, projectName } from './constants'

describe('TuneTogether', () => {
  async function deployTuneTogetherFixture(): Promise<{tuneTogether: TuneTogether, projectFactory: ProjectFactory, artist: HardhatEthersSigner}> {
    const [owner, artist]: HardhatEthersSigner[] = await ethers.getSigners()

    const ProjectFactory = await ethers.getContractFactory('ProjectFactory')
    const projectFactory: ProjectFactory = await ProjectFactory.connect(owner).deploy()

    const TuneTogether = await ethers.getContractFactory('TuneTogether')
    const projectFactoryAddr = await projectFactory.getAddress()

    const tuneTogether: TuneTogether = await TuneTogether.connect(owner).deploy(projectFactoryAddr)
    return { tuneTogether, projectFactory, artist }
  }

  describe('Deployment', () => {
    it('isArtist should be false', async () => {
      const { tuneTogether, artist } = await loadFixture(deployTuneTogetherFixture)
      expect(await tuneTogether.isArtist(artist.address)).to.be.equal(false)
    })
  })

  describe('Create a new ArtistProject', () => {
    it('Should emit ArtistProjectCreated', async () => {
      const { tuneTogether, projectFactory } = await loadFixture(deployTuneTogetherFixture)
      await expect(tuneTogether.createNewProject(
        projectName,
        description,
        fees,
        artistName,
        bio,
        baseUri
      )).to.emit(projectFactory, 'ArtistProjectCreated')
    })

    it('Should emit ArtistCreated', async () => {
      const { tuneTogether, artist } = await loadFixture(deployTuneTogetherFixture)
      await expect(tuneTogether.connect(artist).createNewProject(
        projectName,
        description,
        fees,
        artistName,
        bio,
        baseUri
      )).to.emit(tuneTogether, 'ArtistCreated').withArgs(artist.address)
    })

    it('Should get Artist', async () => {
      const { tuneTogether, artist } = await loadFixture(deployTuneTogetherFixture)
      await tuneTogether.connect(artist).createNewProject(
        projectName,
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

    it('Should get one project', async () => {
      const { tuneTogether } = await loadFixture(deployTuneTogetherFixture)

      await tuneTogether.createNewProject(
        projectName,
        description,
        fees,
        artistName,
        bio,
        baseUri
      )

      expect(await tuneTogether.getOneProject(projectAddr)).to.deep.equal([
        projectName,
        description,
        fees.toString()
      ])
    })

    it('Should not enter an existing Artist', async () => {
      const { tuneTogether, artist } = await loadFixture(deployTuneTogetherFixture)
      await tuneTogether.connect(artist).createNewProject(
        projectName,
        description,
        fees,
        artistName,
        bio,
        baseUri
      )

      await expect(await tuneTogether.connect(artist).createNewProject(
        'Another project',
        'Project with existing artist',
        fees,
        artistName,
        bio,
        baseUri
      )).to.not.emit(tuneTogether, 'ArtistCreated')
    })
  })
})