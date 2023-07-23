import { HardhatUserConfig, task } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'solidity-docgen'
require('dotenv').config()

import './tasks/approveAllowance'
import './tasks/faucet'

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      chainId: 11155111
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      chainId: 5
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`,
      accounts: [`${process.env.PRIVATE_KEY}`]
    }
  },
  docgen: { 
    pages: 'files'
  }
}

export default config