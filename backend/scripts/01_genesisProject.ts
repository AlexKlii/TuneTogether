import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { CrowdfundingCampaign, CampaignFactory, TuneTogether, Usdc } from '../typechain-types'

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
  /* **********           Deploy USDC Contract            ************* */
  /* ****************************************************************** */
  const Usdc = await ethers.getContractFactory('Usdc')
  const usdc: Usdc = await Usdc.connect(owner).deploy()

  await usdc.waitForDeployment()
  const usdcAddr = await usdc.getAddress()

  await usdc.faucet(investor.address, 420 * 10**6)

  console.log(`USDC deployed to ${usdcAddr}`)

  /* ****************************************************************** */
  /* **********            Deploy TuneTogether            ************* */
  /* ****************************************************************** */
  const TuneTogether = await ethers.getContractFactory('TuneTogether')
  const tuneTogether: TuneTogether = await TuneTogether.connect(owner).deploy(campaignFactoryAddress, usdcAddr)

  await tuneTogether.waitForDeployment()
  const tuneTogetherAddress = await tuneTogether.getAddress()
  
  await campaignFactory.connect(owner).setOwnerContractAddr(tuneTogetherAddress)

  console.log(`TuneTogether deployed to ${tuneTogetherAddress}`)

  /* ****************************************************************** */
  /* **********                Lisen Event                ************* */
  /* ****************************************************************** */
  const filter = tuneTogether.filters['CampaignAdded(address,address)']
  tuneTogether.on(filter, async (artistAddr: string, campaignAddr: string) => {
    console.log(`CrowdfundingCampaign deployed to ${campaignAddr} by ${artistAddr}`)

    const crowdfundingCampaign: CrowdfundingCampaign = await ethers.getContractAt('CrowdfundingCampaign', campaignAddr)
    // 1 USDC - 20 USDC - 50 USDC - 100 USDC 
    const prices: number[] = [1000000, 20000000, 50000000, 100000000]

    for (let i = 1; i <= 4; i++) {
      await crowdfundingCampaign.connect(artist).setTierPrice(i, (prices[i - 1]).toString())
    }

    await crowdfundingCampaign.connect(artist).startCampaign()

    /* ****************************************************************** */
    /* **********               Mint some NFT               ************* */
    /* ****************************************************************** */

    for (let i = 1; i <= 4; i++) {
      await usdc.connect(investor).approve(campaignAddr, prices[i - 1])
      await crowdfundingCampaign.connect(investor).mint(i, 1)
    }

    console.log(`Mint some NFTs with address: ${investor.address}`)
    process.exit(0)
  })

  /* ****************************************************************** */
  /* **********       Deploy a CrowdfundingCampaign       ************* */
  /* ****************************************************************** */
  const tx = await tuneTogether.connect(artist).createNewCampaign(
    'GENESIS Campaign',
    'The Gensis TuneTogether Crowfunding Campaign',
    0,
    'TuneTogether',
    'TuneTogether Artist bio',
    'ipfs://bafybeifs5oytiw5tq3d3wnzcnv5nnre5fqgpprgd7baybkdal3hruvuhlq/',
    4
  )

  console.log(`Create new Campaign...`)

  await tx.wait()
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })