'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Text } from '@chakra-ui/react'
import { userIsCampaignArtist } from '@/utils'

import Loader from './Loader'
import AppLogo from './AppLogo'

const IsConnected = ({ children, asArtist, campaignAddr }: {
    children: ReactNode,
    asArtist?: boolean,
    campaignAddr?: `0x${string}`
}) => {
    const { address, isConnected } = useAccount()
    const [isArtist, setIsArtist] = useState(false)
    const [loading, setLoading] = useState(true)

    const { push } = useRouter()
    const pathName = usePathname()

    useEffect(() => {
        setLoading(true)
        setIsArtist(false)
        if (isConnected) {
            if (asArtist && campaignAddr) userIsCampaignArtist(campaignAddr, address as `0x${string}`).then(
                isArtist => {
                    if (!isArtist && asArtist) push('/')
                    else setIsArtist(isArtist)
                }
            ).catch(() => push('/')).finally(() => setLoading(false))
            else setLoading(false)
        } else if (pathName !== '/') push('/')
        else setLoading(false)
    }, [address, asArtist, campaignAddr, isConnected, pathName, push])

    return (
        <Loader isLoading={loading}>
            {isConnected ?
                ((isArtist && asArtist) || (!asArtist)) ? children : (
                    <div className='mx-auto w-3/4 rounded h-auto min-h-[50px] text-center bg-gradient-to-r from-rose-700 to-rose-600 text-zinc-200 shadow-lg drop-shadow-lg border-gray-800 border'>
                        <div className='p-6 font-semibold text-md'>
                            {!isConnected && 'Please connect your Wallet !'}
                            {isConnected && asArtist && !isArtist && 'Artist area is restricted !'}
                        </div>
                    </div>
                )
                :
                <div className='flex flex-col mx-auto w-1/2 rounded h-auto text-center bg-gray-800 text-zinc-200 shadow-lg drop-shadow-lg border-gray-800 border p-5'>
                    <Text>
                        Please connect your wallet to access at <span className='inline-flex'><AppLogo textSize='text-md' pbSize='pb-0'/></span>
                    </Text>

                    <div className='justify-center mx-auto h-auto mt-10'>
                        <ConnectButton />
                    </div>
                </div>
            }
        </Loader>
    )
}
export default IsConnected