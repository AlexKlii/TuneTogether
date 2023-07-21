'use client'

import { CampaignWithArtist } from '@/interfaces/Campaign'
import { boostCampaign, writeForContractByFunctionName } from '@/utils'
import { Box, Button, Card, CardBody, CardFooter, CardHeader, Heading, SimpleGrid, Text, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import CardLoader from './CardLoader'

const CampaignManagement = ({ campaign, isLoading, usdcWithdrawn }: { campaign: CampaignWithArtist, isLoading: boolean, usdcWithdrawn?: number }) => {
    const [loading, setLoading] = useState(true)
    const toast = useToast()

    const withdraw = () => {
        setLoading(true)
        writeForContractByFunctionName(campaign.campaignAddr, 'withdraw').then(() => {
            toast({
                title: 'Success',
                description: 'Campaign funds have been successfully withdrawn.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            })
        }).catch(err => {
            setLoading(false)
            toast({
                title: 'An error occurred!',
                description: err.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        })
    }

    const boost = () => {
        setLoading(true)
        boostCampaign(campaign.campaignAddr).then(() => {
            toast({
                title: 'Success',
                description: 'Campaign successfully boosted for 1 week.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            })
        }).catch(err => {
            setLoading(false)
            toast({
                title: 'An error occurred!',
                description: err.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        })
    }

    const closeCampaign = () => {
        setLoading(true)
        writeForContractByFunctionName(campaign.campaignAddr, 'closeCampaign').then(() => {
            toast({
                title: 'Success',
                description: 'Campaign successfully closed. Please remember to retrieve campaign funds.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            })
        }).catch(err => {
            setLoading(false)
            toast({
                title: 'An error occurred!',
                description: err.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        })
    }

    useEffect(() => {
        setLoading(isLoading)
    }, [isLoading, campaign, usdcWithdrawn])

    return (<>
        <h2 className='text-center text-3xl font-semibold pb-5 text-indigo-400'>Campaign Management</h2>

        <SimpleGrid spacing={4} className='pl-[8%] mb-20 text-lg' templateColumns='repeat(auto-fill, minmax(10%, 30%))'>
            <Card align="center" bgColor='orange.100'>
                <CardLoader loading={loading} color='orange'>
                    <CardHeader>
                        <Heading size='md' color='orange.700'>Boost Campaign</Heading>
                    </CardHeader>
                    <CardBody>
                        <Text className='pb-2'>Boosting your campaign will improve its visibility for 1 week and being displayed among the top search results.</Text>
                        <Text>Boost your campaign now for only <span className='font-semibold'>0.001 ETH</span>.</Text>

                        {campaign.isBoosted &&
                            <Box className='italic font-semibold text-lg'>
                                <Text className='pt-5 text-orange-800'>Already boosted until:</Text>
                                <Text>{new Date(campaign.boost).toDateString()}</Text>
                            </Box>
                        }
                    </CardBody>
                    <CardFooter>
                        <Button onClick={boost} colorScheme='orange' isDisabled={campaign.campaignClosed || campaign.isBoosted}>
                            Boost
                        </Button>
                    </CardFooter>
                </CardLoader>
            </Card>

            <Card align="center" bgColor='red.100'>
                <CardLoader loading={loading} color='red'>
                    <CardHeader>
                        <Heading size='md' color='red.700'>Close Campaign</Heading>
                    </CardHeader>
                    <CardBody>
                        {!campaign.campaignClosed ?
                            <Text className='pb-2'>
                                This action is final, after closing the campaign, no one will be able to mint new NFTs. Once closed, you will be able to withdraw the funds earned during the campaign.
                            </Text>
                            : <Text className='pb-5 text-center'>Campaign already closed.</Text>
                        }
                        <Text>
                            Campaign end date: <span className='font-semibold'>{new Date(campaign.endTimestamp).toDateString()}</span>
                        </Text>
                    </CardBody>
                    <CardFooter>
                        <Button onClick={closeCampaign} colorScheme='red' isDisabled={campaign.campaignClosed}>
                            Close
                        </Button>
                    </CardFooter>
                </CardLoader>
            </Card>

            <Card align="center" bgColor='green.100'>
                <CardLoader loading={loading} color='green'>
                    <CardHeader>
                        <Heading size='md' color='green.700'>Withdraw Fund</Heading>
                    </CardHeader>
                    <CardBody>
                        {usdcWithdrawn != undefined ?
                            <Box className='text-center'>
                                <Text className='pl-5'>Campaign fund already withdrawn:</Text>
                                <Text className='pt-5 pl-5 font-semibold italic'>{usdcWithdrawn} USDC Withdrawn</Text>
                            </Box>
                            : <>
                                <Text className='pb-4 pl-5'>Retrieve the funds accumulated during the campaign.</Text>
                                <Text className='pl-5 font-semibold italic'>This action can only be performed after the campaign is finished or closed.</Text>
                            </>
                        }
                    </CardBody>
                    <CardFooter>
                        <Button onClick={withdraw} colorScheme='green' isDisabled={!campaign.campaignClosed || usdcWithdrawn != undefined}>
                            Withdraw
                        </Button>
                    </CardFooter>
                </CardLoader>
            </Card>
        </SimpleGrid>
    </>)
}
export default CampaignManagement