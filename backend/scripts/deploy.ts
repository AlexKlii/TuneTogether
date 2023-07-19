import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { CampaignFactory, TuneTogether, Usdc } from '../typechain-types'

async function main() {
  const [owner]: HardhatEthersSigner[] = await ethers.getSigners()

  /* ****************************************************************** */
  /* **********           Deploy CampaignFactory           ************* */
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

  await usdc.faucet(owner.address, 420 * 10**6)

  console.log(`USDC deployed to ${usdcAddr}`)

  /* ****************************************************************** */
  /* **********            Deploy TuneTogether            ************* */
  /* ****************************************************************** */
  const TuneTogether = await ethers.getContractFactory('TuneTogether')
  const tuneTogether: TuneTogether = await TuneTogether.connect(owner).deploy(campaignFactoryAddress, usdcAddr)

  await tuneTogether.waitForDeployment()
  const latestBlock = await ethers.provider.getBlock('latest')
  const tuneTogetherAddress = await tuneTogether.getAddress()

  await campaignFactory.setOwnerContractAddr(tuneTogetherAddress)

  console.log(`TuneTogether deployed to ${tuneTogetherAddress} at block ${latestBlock?.number}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })