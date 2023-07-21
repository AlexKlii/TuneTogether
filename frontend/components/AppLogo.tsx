'use client'

import { useRouter } from 'next/navigation'

const AppLogo = ({ textSize, pbSize }: {textSize: 'text-md'|'text-xl'|'text-6xl', pbSize?: 'pb-0'|'pb-2'|'pb-10'}) => {
    const { push } = useRouter()

    return (
        <span className={`text-center ${textSize} ${pbSize} hover:text-purple-600 no-underline cursor-pointer`} onClick={() => push('/')}>
            <span className='font-bold'>Tune</span>
            <span className={`font-semibold text-purple-600`}>Together</span>
        </span>
    )
}
export default AppLogo