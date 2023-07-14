import { task } from 'hardhat/config'

/* ****************************************************************** */
/* **********                Send USDC                  ************* */
/* ****************************************************************** */

task('faucet', 'Send USDC to a recipient')
    .addParam('usdc', 'USDC contract address')
    .addParam('amount', 'Amount to send')
    .addParam('recipient', 'User wallet address')
    .setAction(async (args, hre) => {
        console.log(`Send ${args.amount} USDC to ${args.recipient}...`)

        const usdc = await hre.ethers.getContractAt('Usdc', args.usdc)
        await usdc.faucet(args.recipient, args.amount * 10**6)

        console.log(`USDC sended to ${args.recipient}`)
    })