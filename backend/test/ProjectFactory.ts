import { ProjectFactory } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { baseUri, description, fees, projectName } from './constants'

describe('ProjectFactory', () => {
  async function deployProjectFactoryFixture(): Promise<{ projectFactory: ProjectFactory, owner: HardhatEthersSigner }> {
    const ProjectFactory = await ethers.getContractFactory('ProjectFactory')
    const [owner]: HardhatEthersSigner[] = await ethers.getSigners()

    const projectFactory: ProjectFactory =  await ProjectFactory.connect(owner).deploy()
    return { projectFactory, owner }
  }

  describe('Deployment', () => {
    it('Should create a project', async () => {
      const { projectFactory, owner } = await loadFixture(deployProjectFactoryFixture)
      await expect(projectFactory.createArtistProject(
        baseUri,
        owner.address,
        projectName,
        fees,
        description
      )).to.emit(projectFactory, 'ArtistProjectCreated')
    })
  })
})