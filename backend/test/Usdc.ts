import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { UsdcFixture } from './interfaces'
import { Usdc } from '../typechain-types'

describe('USDC', () => {
  async function deployFixture(): Promise<UsdcFixture> {
    const USDC = await ethers.getContractFactory('Usdc')
    const [owner]: HardhatEthersSigner[] = await ethers.getSigners()
  
    const usdc: Usdc = await USDC.connect(owner).deploy()

    return { usdc, owner }
  }

  describe('Deployment', () => {
    const baseAddr = '0x0000000000000000000000000000000000000000'

    it('Faucet method should emit Transfer event', async () => {
      const { usdc, owner } = await loadFixture(deployFixture)
      await expect(usdc.faucet(owner.address, 10)).to.emit(usdc, 'Transfer').withArgs(baseAddr, owner.address, 10)
    })

    it('Decimals method should return 6', async () => {
        const { usdc } = await loadFixture(deployFixture)
        expect(await usdc.decimals()).to.be.equal(6)
    })

    it('Revert if address 0', async () => {
        const { usdc } = await loadFixture(deployFixture)
        await expect(usdc.faucet(baseAddr, 10)).to.be.revertedWith('ERC20: mint to the zero address')
      })
  })
})