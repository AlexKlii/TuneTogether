import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { ProjectFactory, TuneTogether } from '../typechain-types'

async function main() {
  const [owner]: HardhatEthersSigner[] = await ethers.getSigners()

  /* ****************************************************************** */
  /* **********           Deploy ProjectFactory           ************* */
  /* ****************************************************************** */
  const ProjectFactory = await ethers.getContractFactory('ProjectFactory')
  const projectFactory: ProjectFactory = await ProjectFactory.connect(owner).deploy()

  await projectFactory.waitForDeployment()
  const projectFactoryAddress = await projectFactory.getAddress()

  console.log(`ProjectFactory deployed to ${projectFactoryAddress}`)


  /* ****************************************************************** */
  /* **********            Deploy TuneTogether            ************* */
  /* ****************************************************************** */
  const TuneTogether = await ethers.getContractFactory('TuneTogether')
  const tuneTogether: TuneTogether = await TuneTogether.connect(owner).deploy(projectFactoryAddress)

  await tuneTogether.waitForDeployment()
  const tuneTogetherAddress = await tuneTogether.getAddress()

  console.log(`TuneTogether deployed to ${tuneTogetherAddress}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })