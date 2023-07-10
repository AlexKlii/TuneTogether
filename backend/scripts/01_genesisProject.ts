import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { ArtistProject, ProjectFactory, TuneTogether } from '../typechain-types'

async function main() {
  let [owner, artist, investor]: HardhatEthersSigner[] = await ethers.getSigners()

  // On Sepolia or Mumbai testnet, no other signers specified
  if (!artist) artist = owner
  if (!investor) investor = owner

  /* ****************************************************************** */
  /* **********           Deploy ProjectFactory           ************* */
  /* ****************************************************************** */
  const ProjectFactory = await ethers.getContractFactory('ProjectFactory')
  const projectFactory: ProjectFactory = await ProjectFactory.connect(owner).deploy()

  await projectFactory.waitForDeployment()
  const projectFactoryAddress = await projectFactory.getAddress()

  console.log(`ProjectFactory deployed to ${projectFactoryAddress}`)

  /* ****************************************************************** */
  /* **********                Lisen Event                ************* */
  /* ****************************************************************** */
  const filter = projectFactory.filters['ArtistProjectCreated(address,address,uint256)']
  projectFactory.on(filter, async (artistAddr, projectAddr) => {
    console.log(`ArtistProject deployed to ${projectAddr} by ${artistAddr}`)

    /* ****************************************************************** */
    /* **********               Mint some NFT               ************* */
    /* ****************************************************************** */
    const artistProject: ArtistProject = await ethers.getContractAt('ArtistProject', projectAddr)

    await artistProject.connect(investor).mint(1, 5)
    await artistProject.connect(investor).mint(2, 1)
    await artistProject.connect(investor).mint(3, 2)
    await artistProject.connect(investor).mint(4, 1)

    console.log(`Mint some NFTs with address: ${investor.address}`)
    process.exit(0)
  })

  /* ****************************************************************** */
  /* **********            Deploy TuneTogether            ************* */
  /* ****************************************************************** */
  const TuneTogether = await ethers.getContractFactory('TuneTogether')
  const tuneTogether: TuneTogether = await TuneTogether.connect(owner).deploy(projectFactoryAddress)

  await tuneTogether.waitForDeployment()
  const tuneTogetherAddress = await tuneTogether.getAddress()

  console.log(`TuneTogether deployed to ${tuneTogetherAddress}`)

  /* ****************************************************************** */
  /* **********          Deploy an ArtistProject          ************* */
  /* ****************************************************************** */
  const tx = await tuneTogether.connect(artist).createNewProject(
    'GENESIS Project',
    'The Gensis TuneTogether Project',
    0,
    'TuneTogether',
    'TuneTogether Artist bio',
    'ipfs://bafybeifs5oytiw5tq3d3wnzcnv5nnre5fqgpprgd7baybkdal3hruvuhlq/'
  )

  await tx.wait()
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })