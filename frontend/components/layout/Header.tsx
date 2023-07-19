import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Link } from '@chakra-ui/react'

import NextLink from 'next/link'
import AppLogo from '../AppLogo'
import { useAccount } from 'wagmi'

const Header = () => {
    const { isConnected } = useAccount()

    return (
        <header className='bg-gray-950 text-gray-100 border-gray-500 border-b'>
            <nav className='mx-auto flex justify-between text-center py-5'>
                <div className='pt-1 w-1/6'>
                    <AppLogo textSize='text-xl' pbSize='pb-0'/>
                </div>

                <div className={`flex justify-start ${isConnected ? 'w-3/6' : 'w-4/6'}`}>
                    {isConnected && <>
                        <Link as={NextLink} href='/campaigns' className='rounded-lg px-5 py-2 font-medium hover:bg-gray-800 hover:text-slate-300' style={{ textDecoration: 'none' }}>
                        Search a Campaign
                        </Link>

                        <Link as={NextLink} href='/campaigns/create-campaign' className='rounded-lg px-5 py-2 font-medium hover:bg-gray-800 hover:text-slate-300' style={{ textDecoration: 'none' }}>
                            Start a Campaign
                        </Link>
                    </>}
                </div>

                {isConnected &&
                    <div className='w-2/6'>
                        <ConnectButton />
                    </div>
                }
            </nav>
        </header>
    )
}
export default Header