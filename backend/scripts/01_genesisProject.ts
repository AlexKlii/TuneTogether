import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { CrowdfundingCampaign, CampaignFactory, TuneTogether } from '../typechain-types'

async function main() {
  let [owner, artist, investor]: HardhatEthersSigner[] = await ethers.getSigners()

  // On Sepolia or Mumbai testnet, no other signers specified
  if (!artist) artist = owner
  if (!investor) investor = owner

  /* ****************************************************************** */
  /* **********           Deploy CampaignFactory          ************* */
  /* ****************************************************************** */
  const CampaignFactory = await ethers.getContractFactory('CampaignFactory')
  const campaignFactory: CampaignFactory = await CampaignFactory.connect(owner).deploy()

  await campaignFactory.waitForDeployment()
  const campaignFactoryAddress = await campaignFactory.getAddress()

  console.log(`CampaignFactory deployed to ${campaignFactoryAddress}`)

  /* ****************************************************************** */
  /* **********                Lisen Event                ************* */
  /* ****************************************************************** */
  const filter = campaignFactory.filters['CrowdfundingCampaignCreated(address,address,uint256)']
  campaignFactory.on(filter, async (artistAddr, campaignAddr) => {
    console.log(`CrowdfundingCampaign deployed to ${campaignAddr} by ${artistAddr}`)

    /* ****************************************************************** */
    /* **********               Mint some NFT               ************* */
    /* ****************************************************************** */
    const crowdfundingCampaign: CrowdfundingCampaign = await ethers.getContractAt('CrowdfundingCampaign', campaignAddr)

    await crowdfundingCampaign.connect(investor).mint(1, 5)
    await crowdfundingCampaign.connect(investor).mint(2, 1)
    await crowdfundingCampaign.connect(investor).mint(3, 2)
    await crowdfundingCampaign.connect(investor).mint(4, 1)

    console.log(`Mint some NFTs with address: ${investor.address}`)
    process.exit(0)
  })

  /* ****************************************************************** */
  /* **********            Deploy TuneTogether            ************* */
  /* ****************************************************************** */
  const TuneTogether = await ethers.getContractFactory('TuneTogether')
  const tuneTogether: TuneTogether = await TuneTogether.connect(owner).deploy(campaignFactoryAddress)

  await tuneTogether.waitForDeployment()
  const tuneTogetherAddress = await tuneTogether.getAddress()

  console.log(`TuneTogether deployed to ${tuneTogetherAddress}`)

  /* ****************************************************************** */
  /* **********       Deploy a CrowdfundingCampaign       ************* */
  /* ****************************************************************** */
  const tx = await tuneTogether.connect(artist).createNewCampaign(
    'GENESIS Campaign',
    'The Gensis TuneTogether Crowfunding Campaign',
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