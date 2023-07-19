'use client'

import { Spinner, Box, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'

const Loader = ({ children, isLoading, message }: { children: ReactNode, isLoading: boolean, message?: string }) => {
    return (!isLoading ? children :
        <Box className='container flex-row justify-center text-center mt-5'>
            {message && <Text className='font-bold text-xl text-indigo-400 mb-5'>{message}</Text>}
            <Spinner thickness='4px' speed='0.42s' emptyColor='gray.500' color='indigo.600' size='xl' />
        </Box>
    )
}
export default Loader