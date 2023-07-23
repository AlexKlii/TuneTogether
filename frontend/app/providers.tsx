'use client'

import * as React from 'react'

import { connectorsForWallets, darkTheme, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { argentWallet, ledgerWallet, trustWallet } from '@rainbow-me/rainbowkit/wallets'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { hardhat, sepolia, polygonMumbai, goerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { alchemyId } from '@/constants'

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [
        sepolia,
        goerli,
        polygonMumbai,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [hardhat] : [])
    ],
    [
        publicProvider(),
        alchemyProvider({ apiKey: alchemyId })
    ]
)

const projectId: string = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

const { wallets } = getDefaultWallets({
    appName: 'TuneTogether',
    projectId: projectId,
    chains
})

const appInfo = {
    appName: 'TuneTogether'
}

const connectors = connectorsForWallets([
    ...wallets,
    {
        groupName: 'Other',
        wallets: [
            argentWallet({ projectId, chains }),
            trustWallet({ projectId, chains }),
            ledgerWallet({ projectId, chains })
        ]
    }
])

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient
})

const theme = extendTheme({
    colors: {
        indigo: {
            500: '#6366f1',
            600: '#4844bb',
            700: '#312e81'
        }
    }
})

const Providers = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])

    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains} appInfo={appInfo} theme={darkTheme({ borderRadius: 'medium' })}>
                <ChakraProvider theme={theme}>
                    {mounted && children}
                </ChakraProvider>
            </RainbowKitProvider>
        </WagmiConfig>
    )
}
export default Providers