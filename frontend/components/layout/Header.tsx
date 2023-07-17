import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Link } from '@chakra-ui/react'

import NextLink from 'next/link'
import AppLogo from '../AppLogo'

const Header = () => {
    const links: string[][] = [
        ['Search a Campaign', '/campaigns'],
        ['Start a Campaign', '/campaigns/create-campaign'],
    ]

    return (
        <header className='bg-gray-950 text-gray-100 border-gray-500 border-b'>
            <nav className='mx-auto flex justify-between text-center py-5'>
                <div className='pt-1 w-1/6'>
                    <AppLogo textSize='text-xl' pbSize='pb-0'/>
                </div>

                <div className='w-4/6 flex justify-start'>
                    {links.map(([title, url], i) => (
                        <Link key={i} as={NextLink} href={url} className="rounded-lg px-5 py-2 font-medium hover:bg-gray-800 hover:text-slate-300" style={{ textDecoration: 'none' }}>
                            {title}
                        </Link>
                    ))}
                </div>

                

                <div className='w-1/6'>
                    <ConnectButton />
                </div>
            </nav>
        </header>
    )
}
export default Header;