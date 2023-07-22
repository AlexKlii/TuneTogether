'use client'

import NextLink from 'next/link'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'

import { CampaignWithArtist } from '@/interfaces/Campaign'
import { getArtist, getCampaignWithArtist } from '@/utils'

import { Card, CardBody, CardFooter, Divider, Heading, Image, Link, Stack, Text, useToast } from '@chakra-ui/react'
import PageTitle from '@/components/layout/PageTitle'
import IsConnected from '@/components/IsConnected'
import Loader from '@/components/Loader'

const ArtistCampaigns = () => {
    const { address, isConnected } = useAccount()
    const [campaigns, setCampaigns] = useState<CampaignWithArtist[]>([])
    const [loading, setLoading] = useState(true)
    const toast = useToast()
    const { push } = useRouter()

    useEffect(() => {
        setLoading(true)
        if (isConnected) {
            getArtist(address as `0x${string}`).then(artist => {
                if (0 === artist.campaigns.length) {
                    push('/')
                    toast({
                        title: '404 Error',
                        description: 'Artist does not exist',
                        status: 'warning',
                        duration: 5000,
                        isClosable: true,
                    })
                }
                let data: CampaignWithArtist[] = []
                artist.campaigns.forEach((campaignAddr, i) => {
                    getCampaignWithArtist(address as `0x${string}`, campaignAddr).then(
                        campaign => data = [...data, campaign]
                    ).catch(err =>
                        console.log(err)
                    ).finally(() => {
                        setCampaigns(data.sort((a) => a.isBoosted ? 1 : -1).sort((a) => a.campaignClosed ? 1 : -1))
                        if (i === artist.campaigns.length-1) setLoading(false)
                    })
                })
            })
        }
    }, [address, isConnected, push, toast])

    return (
        <IsConnected>
            <Loader isLoading={loading}>
                <PageTitle>My Campaigns</PageTitle>

                {campaigns.map((campaign: CampaignWithArtist, i) => (
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
                                        {campaign.campaignClosed && <Text className='font-semibold italic text-gray-500 text-sm'>Campaign finished</Text>}
                                        {campaign.name}
                                        {!campaign.campaignClosed && campaign.isBoosted && <Text className='font-semibold italic text-orange-400 text-sm'>Boosted</Text>}
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
export default ArtistCampaigns;