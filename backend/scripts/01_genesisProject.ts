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
  const latestBlock = await ethers.provider.getBlock("latest")
  const tuneTogetherAddress = await tuneTogether.getAddress()
  
  const setOwnerTx = await campaignFactory.connect(owner).setOwnerContractAddr(tuneTogetherAddress)
  await setOwnerTx.wait()

  console.log(`TuneTogether deployed to ${tuneTogetherAddress} at block ${latestBlock?.number}`)

  /* ****************************************************************** */
  /* **********                Lisen Event                ************* */
  /* ****************************************************************** */
  const filter = tuneTogether.filters['CampaignAdded(address,address)']
  tuneTogether.on(filter, async (artistAddr: string, campaignAddr: string) => {
    console.log(`CrowdfundingCampaign deployed to ${campaignAddr} by ${artistAddr}`)

    const crowdfundingCampaign: CrowdfundingCampaign = await ethers.getContractAt('CrowdfundingCampaign', campaignAddr)
    // 1 USDC - 20 USDC - 50 USDC - 100 USDC 
    const prices: number[] = [1000000, 20000000, 50000000, 100000000]

    console.log('Set Tier Prices...')
    for (let i = 1; i <= 4; i++) {
      console.log(`Tier Price ${i}...`)
      const setTierPriceTx = await crowdfundingCampaign.connect(artist).setTierPrice(i, (prices[i - 1]).toString())
      await setTierPriceTx.wait()
    }

    const startCampaignTx = await crowdfundingCampaign.connect(artist).startCampaign()
    await startCampaignTx.wait()

    console.log(`Minting NFT with address: ${investor.address}...`)
    /* ****************************************************************** */
    /* **********               Mint some NFT               ************* */
    /* ****************************************************************** */

    for (let i = 1; i <= 4; i++) {
      console.log(`Mint NFT ${i}...`)
      const approveTx = await usdc.connect(investor).approve(campaignAddr, prices[i - 1])
      await approveTx.wait()

      const mintTx = await crowdfundingCampaign.connect(investor).mint(i, 1)
      await mintTx.wait()
    }

    console.log(`NFTs minted !`)
    process.exit(0)
  })

  /* ****************************************************************** */
  /* **********       Deploy a CrowdfundingCampaign       ************* */
  /* ****************************************************************** */
  const createCampaignTx = await tuneTogether.connect(artist).createNewCampaign(
    'GENESIS Campaign',
    'The Gensis TuneTogether Crowfunding Campaign',
    0,
    'TuneTogether',
    'TuneTogether Artist bio',
    'ipfs://bafybeifs5oytiw5tq3d3wnzcnv5nnre5fqgpprgd7baybkdal3hruvuhlq/',
    4,
    100*10**6
  )

  console.log(`Create new Campaign...`)

  await createCampaignTx.wait()
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })