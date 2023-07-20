'use client'

import { Skeleton, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const CardLoader = ({ loading, color, children }: { loading: boolean, color: string, children: React.ReactNode }) => {
    const [startColor, setStartColor] = useState<string>()
    const [endColor, setEndColor] = useState<string>()

    useEffect(() => {
        setStartColor(`${color}.600`)
        setEndColor(`${color}.600`)
    }, [color])

    return (!loading ? children
        : <Stack className='my-auto p-20'>
            <Skeleton startColor={startColor} endColor={endColor} height='10px' width='sm' />
            <Skeleton startColor={startColor} endColor={endColor} height='10px' width='sm' />
            <Skeleton startColor={startColor} endColor={endColor} height='10px' width='xs' />
            <Skeleton startColor={startColor} endColor={endColor} height='10px' width='sm' />
            <Skeleton startColor={startColor} endColor={endColor} height='10px' width='sm' />
            <Skeleton startColor={startColor} endColor={endColor} height='10px' width='xs' />
            <Skeleton startColor={startColor} endColor={endColor} height='10px' width='sm' />
            <Skeleton startColor={startColor} endColor={endColor} height='10px' width='sm' />
            <Skeleton startColor={startColor} endColor={endColor} height='10px' width='xs' />
            <Skeleton startColor={startColor} endColor={endColor} height='10px' width='sm' />
            <Skeleton startColor={startColor} endColor={endColor} height='10px' width='sm' />
        </Stack>
    )
}
export default CardLoader