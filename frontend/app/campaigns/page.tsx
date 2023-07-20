'use client'

import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import { CampaignWithArtist } from '@/interfaces/Campaign'
import { getCampaignAddedEvents, getCampaignWithArtist } from '@/utils'

import { Card, CardBody, CardFooter, Divider, Heading, Image, Link, Stack, Text } from '@chakra-ui/react'
import PageTitle from '@/components/layout/PageTitle'
import IsConnected from '@/components/IsConnected'

const Campaigns = () => {
    const { address, isConnected } = useAccount()
    const [campaigns, setCampaigns] = useState<CampaignWithArtist[]>([])

    useEffect(() => {
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
                    })
                }
            })
        }
    }, [address, isConnected])

    return (
        <section>
            <PageTitle>All Campaigns</PageTitle>

            <IsConnected>
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
                                    <Heading size='md'>{campaign.name} - by {campaign.artistName}</Heading>
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
            </IsConnected>
        </section>
    )
}
export default Campaigns;