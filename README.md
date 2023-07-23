# Tune Together
----

DApp and smart contract created by Alexandre Caliaro

## Resources 

- [Vercel Deployment](https://tune-together.vercel.app) 
- [Presentation video](https://www.youtube.com/watch?v=qKkz0OwCIAc)

### Technologies 

- NEXT.js
- Hardhat
- RainbowKit
- Wagmi
- Typescript

### Prerequisites

Rename the `.env.example` files to `.env` in the `frontend` and `backend` folders. Then fill in your local environment variables.

By default, the hardhat test network is enabled.
To disable it, modify this value in `frontend/.env`:

```shell
NEXT_PUBLIC_ENABLE_TESTNETS=false
```

----
## DEV Installation
----

### Install Dependencies
  
Run this command from the `frontend` and `backend` directories:

```shell
npm install
```

### Unit Test

#### Compile project
```shell
npx hardhat compile
```

#### Run Unit Test

Open a terminal and run the following command from the `backend` directory:

* Simple usage
```shell
npx hardhat test
```

* With code coverage
```shell
npx hardhat coverage
```

#### Generate doc from natspec

```shell
npx hardhat docgen
```

### Launch the project locally

Open a terminal and run the following command from the `backend` directory:

```shell
npx hardhat node
```

Open a second terminal and run these commands:

```shell
cd backend

# If you're in the development environment
npx hardhat run --network localhost scripts/deploy.ts

# If you're in the test environment (Mumbai)
npx hardhat run --network mumbai scripts/deploy.ts

# OR
npx hardhat run --network sepolia scripts/deploy.ts

# OR
npx hardhat run --network goerli scripts/deploy.ts
```

Modify your `.env` file in the `backend` directory with your local environment variables based on the network you have chosen.

Go back to the terminal and run the following commands:

```shell
cd ../frontend
npm run dev
```

### Run tasks

Some tasks was created to help you in testnet environement:

* Approve Allowance

```shell
npx hardhat approveAllowance --network NETWORK --usdc USDC_ADDR --amount AMOUNT_TO_ALLOW --from USER_ADDR --sender CROWDFUNDING_CAMPAIGN_ADDR
```

* Faucet USDC

```shell
npx hardhat faucet --network NETWORK --usdc USDC_ADDR --amount AMOUNT_TO_SEND --recipient USER_ADDR
```

Open [localhost:3000](http://localhost:3000) on your browser to see the result.
