import { ArtistProject } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { baseUri, description, fees, projectName } from './constants'

describe('ArtistProject', () => {
  async function deployArtistProjectFixture(): Promise<{ artistProject: ArtistProject, owner: HardhatEthersSigner }> {
    const ArtistProject = await ethers.getContractFactory('ArtistProject')
    const [owner]: HardhatEthersSigner[] = await ethers.getSigners()

    const artistProject: ArtistProject = await ArtistProject.connect(owner).deploy(
      baseUri,
      owner.address,
      projectName,
      fees,
      description
    )

    return { artistProject, owner }
  }

  describe('Deployment', () => {
    it('Should set the right owner', async () => {
      const { artistProject, owner } = await loadFixture(deployArtistProjectFixture)
      expect(await artistProject.owner()).to.be.equal(owner.address)
    })

    it('Should set the right project name', async () => {
      const { artistProject } = await loadFixture(deployArtistProjectFixture)
      expect(await artistProject.name()).to.be.equal(projectName)
    })

    it('Should set the right project description', async () => {
      const { artistProject } = await loadFixture(deployArtistProjectFixture)
      expect(await artistProject.description()).to.be.equal(description)
    })

    it('Should set the right project fees', async () => {
      const { artistProject } = await loadFixture(deployArtistProjectFixture)
      expect(await artistProject.fees()).to.be.equal(fees)
    })

    it('Should set the right Artist address', async () => {
      const { artistProject, owner } = await loadFixture(deployArtistProjectFixture)
      expect(await artistProject.artistAddress()).to.be.equal(owner.address)
    })

    it('Should set the right URI for a given id', async () => {
      const { artistProject } = await loadFixture(deployArtistProjectFixture)

      for (let i = 1; i <= 4; i++) {
        expect(await artistProject.uri(i)).to.be.equal(`${baseUri}${i}.json`)
      }
    })
  })

  describe('Mint', () => {
    it('Should emit TransferSingle', async () => {
      const { artistProject } = await loadFixture(deployArtistProjectFixture)
      await expect(artistProject.mint(1, 5)).to.emit(artistProject, 'TransferSingle')
    })
  })
})