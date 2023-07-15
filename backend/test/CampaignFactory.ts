import { CampaignFactory, Usdc } from '../typechain-types'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { baseUri, description, fees, campaignName, nbTiers, objectif } from './constants'
import { CampaignFactoryFixture } from './interfaces'

describe('CampaignFactory', () => {
  async function deployFixture(): Promise<CampaignFactoryFixture> {
    const CampaignFactory = await ethers.getContractFactory('CampaignFactory')
    
    // setOwnerContractAddr() expects the address of the TuneTogether contract as a parameter.
    // But contract.connect() need a ContractRunner, so for the sake of simplicity, an address of a wallet will be provided
    const [owner, artist, tuneTogetherContract]: HardhatEthersSigner[] = await ethers.getSigners()

    const campaignFactory: CampaignFactory =  await CampaignFactory.connect(owner).deploy()

    const USDC = await ethers.getContractFactory('Usdc')
    const usdc: Usdc = await USDC.connect(owner).deploy()
    const usdcAddr: string = await usdc.getAddress();
    
    return { campaignFactory, owner, artist, tuneTogetherContract, usdcAddr }
  }

  describe('Set owner contract address', () => {
    it('Should set owner contract address', async () => {
      const { campaignFactory, owner, tuneTogetherContract } = await loadFixture(deployFixture)
      await expect(campaignFactory.connect(owner).setOwnerContractAddr(tuneTogetherContract.address)).to.emit(campaignFactory, 'OwnerContractUpdated').withArgs(tuneTogetherContract.address)
    })

    it('Revert if caller not the owner', async () => {
      const { campaignFactory, artist, tuneTogetherContract } = await loadFixture(deployFixture)
      await expect(campaignFactory.connect(artist).setOwnerContractAddr(tuneTogetherContract.address)).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })

  describe('Create Campaign', () => {
    it('Should create a campaign', async () => {
      const { campaignFactory, owner, tuneTogetherContract, usdcAddr } = await loadFixture(deployFixture)
      await campaignFactory.connect(owner).setOwnerContractAddr(tuneTogetherContract.address)
      await expect(campaignFactory.connect(tuneTogetherContract).createCrowdfundingCampaign(
        baseUri,
        owner.address,
        campaignName,
        fees,
        description,
        nbTiers,
        usdcAddr,
        objectif
      )).to.emit(campaignFactory, 'CrowdfundingCampaignCreated')
    })

    it('Revert if caller not the contract owner', async () => {
      const { campaignFactory, owner, usdcAddr } = await loadFixture(deployFixture)
      await expect(campaignFactory.connect(owner).createCrowdfundingCampaign(
        baseUri,
        owner.address,
        campaignName,
        fees,
        description,
        nbTiers,
        usdcAddr,
        objectif
      )).to.be.revertedWith('You\'re not the owner')
    })
  })
})