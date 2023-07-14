import { task } from 'hardhat/config'

/* ****************************************************************** */
/* **********            Approve Allowance              ************* */
/* ****************************************************************** */

task('approveAllowance', 'Approve Allowance amount for an address')
    .addParam('usdc', 'USDC contract address')
    .addParam('amount', 'Amount to allow')
    .addParam('from', 'User wallet address')
    .addParam('sender', 'CrowfundingCampaign contract address')
    .setAction(async (args, hre) => {
        console.log('Approve allowance...')

        const usdc = await hre.ethers.getContractAt('Usdc', args.usdc)
        await usdc.approve(args.sender, args.amount * 10**6, {from: args.from})

        console.log(`Allowance approved for ${args.sender} by ${args.from}`)
    })