'use client'

import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import { CampaignWithArtist } from '@/interfaces/Campaign'
import { getCampaignAddedEvents, getCampaignWithArtist } from '@/utils'

import { Box, Card, CardBody, CardFooter, Divider, Heading, Image, Link, Stack, Text } from '@chakra-ui/react'
import PageTitle from '@/components/layout/PageTitle'
import IsConnected from '@/components/IsConnected'
import Loader from '@/components/Loader'

const Campaigns = () => {
    const { address, isConnected } = useAccount()
    const [campaigns, setCampaigns] = useState<CampaignWithArtist[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        if (isConnected) {
            let data: CampaignWithArtist[] = []
            getCampaignAddedEvents().then(events => {
                for (let i = 0; i < events.length; i++) {
                    getCampaignWithArtist(address as `0x${string}`, events[i].args._campaignAddr).then(
                        campaign => data = [...data, campaign]
                    ).catch(err =>
                        console.log(err)
                    ).finally(() => {
                        setCampaigns(data)
                        if (i === events.length-1) setLoading(false)
                    })
                }
            })
        }
    }, [address, isConnected])

    return (
        <IsConnected>
            <Loader isLoading={loading}>
                {0 === campaigns.length ?
                    <Box className='text-center text-slate-200'>
                        <PageTitle>No campaigns yet...</PageTitle>
                        <Text className='text-2xl font-semibold text-indigo-300 pb-20'>Create your own right here and become the first legend</Text>

                        <Link as={NextLink} href='/campaigns/create-campaign' className='rounded-lg p-5 font-medium hover:bg-indigo-800 hover:text-slate-300 bg-indigo-500' style={{ textDecoration: 'none' }}>
                            Start the first campaign of TuneTogheter
                        </Link>
                    </Box>
                    : <PageTitle>All Campaigns</PageTitle>
                }

                {campaigns.sort((a, b) => b.boost - a.boost).map((campaign: CampaignWithArtist, i) => (
                    <article key={i} className='w-1/3 p-5 inline-block'>
                        <Card maxW='sm'>
                            <CardBody>
                                <Image
                                    // @TODO: Add a campaign.cover field in SmartContract 
                                    src='/img/default_campaign_cover.png'
                                    alt='Crowdfunding campaign cover'
                                    borderRadius='lg'
                                />
                                <Stack mt='6' spacing='3'>
                                    <Heading size='md'>
                                        {campaign.name} - by {campaign.artistName}
                                        {!campaign.campaignClosed && campaign.isBoosted && <Text className='font-semibold italic text-orange-400 text-xs'>Boosted</Text>}
                                    </Heading>
                                    <Text className='w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>{campaign.description}</Text>
                                    <Text color='indigo.600' fontSize='2xl'>
                                        Objectif: {campaign.objectif} USDC
                                    </Text>
                                </Stack>
                            </CardBody>
                            <Divider />
                            <CardFooter>
                                <Link as={NextLink} href={`/campaigns/${campaign.campaignAddr}`} className='rounded-lg px-5 py-2 font-medium bg-indigo-500 hover:bg-indigo-800 hover:text-slate-300' style={{ textDecoration: 'none' }}>
                                    See mint
                                </Link>
                            </CardFooter>
                        </Card>
                    </article>
                ))}
            </Loader>
        </IsConnected>
    )
}
export default Campaigns;