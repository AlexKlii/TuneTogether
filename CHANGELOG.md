# Changelog

## 0.3.0 (2023-07-10)

### feat: Implement Mumbai deployement

- Implement Mumbai deployement
  - Change solidity version beacause an error occured in Mumbai (see [Invalid opcode: opcode 0x5f not defined](https://ethereum.stackexchange.com/questions/150281/invalid-opcode-opcode-0x5f-not-defined))
  - Update/Add deploy scripts
  - Update `hardhat.config`
  - Update `.env` file
- Add new feature on TuneTogether
  - isArtist
  - getArtist
  - getOneProject
---

## 0.2.0 (2023-07-10)

### feat: Basic implementation of smart contracts

- Basic implementation of smart contracts
  - ProjectFactory: Create an ERC-1155 NFT collection from another contract
  - ArtistProject: The ERC-1155 NFT collection (created by ProjectFactory)
  - TuneTogether: Main contract
- Update deploy script

---

## 0.1.0 (2023-07-07)

### feat: Init project 

- Init project with 
  - NEXT.js
  - Hardhat
  - RainbowKit
  - Wagmi
  - ChakraUI
- Setup RainbowKit with first button

---