# Tune Together
----

DApp and smart contract created by Alexandre Caliaro

## Resources 

- [Vercel Deployment](https://tune-together.vercel.app) 

### Technologies 

- NEXT.js
- Hardhat
- RainbowKit
- Wagmi
- Typescript

----
## DEV Installation
----

### Install Dependencies
  
Run this command from the `frontend` and `backend` directories:

```shell
npm install
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

# If you're in the test environment (Sepolia)
npx hardhat run --network sepolia scripts/deploy.ts
```


Modify your `.env` file in the `backend` directory with your local environment variables based on the network you have chosen.

Go back to the terminal and run the following commands:

```shell
cd ../frontend
npm run dev
```

Open [localhost:3000](http://localhost:3000) on you're browser to see the result.
