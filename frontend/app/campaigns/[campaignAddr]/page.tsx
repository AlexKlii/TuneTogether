'use client'

import IsConnected from '@/components/IsConnected'
import Loader from '@/components/Loader'
import PageTitle from '@/components/layout/PageTitle'
import { crowdfundingCampaignAbi, uscdContractAddress, usdcAbi } from '@/constants'
import { CampaignWithArtist } from '@/interfaces/Campaign'
import { CampaignTierInfo } from '@/interfaces/Campaign/TierInfo'
import { approveAllowance, campaignEndTimestamp, getCampaignWithArtist, readForContractByFunctionName, writeForContractByFunctionName } from '@/utils'
import { Box, Button, Card, CardBody, CardFooter, Heading, Image, Stack, Text, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAccount, useContractEvent } from 'wagmi'

const Campaign = ({ params }: { params: { campaignAddr: `0x${string}` } }) => {
    const { address, isConnected } = useAccount()
    const toast = useToast()

    const [campaign, setCampaign] = useState<CampaignWithArtist>()
    const [campaignTiersInfo, setCampaignTiersInfo] = useState<CampaignTierInfo>({nbTiers: 0, tiers: []})
    const [infoLoading, setInfoLoading] = useState(true)
    const [campaignLoading, setCampaignLoading] = useState(true)
    const [mintId, setMintId] = useState(0)
    const [logOwner, setLogOwner] = useState<`0x${string}`>()
    const [logMint, setLogMint] = useState<`0x${string}`>()
    const [loading, setLoading] = useState(false)
    const [endTimestamp, setEndTimestamp] = useState<number|null>()

    const campaignAddr = params.campaignAddr

    const approveAllowanceForMint = (id: number, price: number): void => {
        approveAllowance(address as `0x${string}`, campaignAddr, BigInt(price)).then(() => {
            setMintId(id)
            setLoading(true)
        }).catch(() => setLoading(false))
    }

    useEffect(() => {
        setInfoLoading(true)
        setCampaignLoading(true)

        if (isConnected) {
            getCampaignWithArtist(address as `0x${string}`, campaignAddr).then(
                campaign => setCampaign(campaign)
            ).catch(err => console.log(err))
            .finally(()=> setCampaignLoading(false))

            campaignEndTimestamp(campaignAddr, address as `0x${string}`).then(timestamp => {
                setEndTimestamp(timestamp)
                if (0 === campaignTiersInfo.tiers.length && timestamp && timestamp > Date.now()) {
                    readForContractByFunctionName<number>(campaignAddr, 'nbTiers', address as `0x${string}`).then(
                        async nbTiers => {
                            campaignTiersInfo.nbTiers = nbTiers
                            campaignTiersInfo.tiers = []
                            for (let i = 1; i <= nbTiers; i++) {
                                await readForContractByFunctionName<string>(campaignAddr, 'uri', address as `0x${string}`, i).then(
                                    async uri => await readForContractByFunctionName<number>(campaignAddr, 'getTierPrice', address as `0x${string}`, i).then(
                                        price => campaignTiersInfo.tiers.push({ id: i, uri, price: Number(price) })
                                    )
                                )
                            }
                        }
                    ).finally(() => {
                        setCampaignTiersInfo(campaignTiersInfo)
                        setInfoLoading(false)
                    })
                } else setInfoLoading(false)
            })
        }
    }, [campaignAddr, address, campaignTiersInfo, isConnected])

    useEffect(() => {
        if (0 !== mintId && logOwner === address) {
            const id = mintId.toString()
            setMintId(0)
            setLogOwner(undefined)

            // Mint NFT after allowance approval
            writeForContractByFunctionName(campaignAddr, 'mint', id, '1').catch(err => {
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
    }, [mintId, logOwner, address, campaignAddr, toast])

    useEffect(() => {
        if (logMint === address) {
            toast({
                title: 'Minted !',
                description: 'Successfully minted! See your NFT in your wallet in a few moments.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            })

            setLoading(false)
            setMintId(0)
            setLogMint(undefined)
            setLogOwner(undefined)
        }
    }, [address, logMint, toast])

    useContractEvent({
        address: campaignAddr,
        abi: crowdfundingCampaignAbi,
        eventName: 'TransferSingle',
        listener(log: any) { setLogMint(log[0].args.operator) }
    })

    useContractEvent({
        address: uscdContractAddress,
        abi: usdcAbi,
        eventName: 'Approval',
        listener(log: any) { setLogOwner(log[0].args.owner) }
    })

    return (
        <IsConnected>
            <Loader isLoading={campaignLoading || loading} message={loading ? 'Mint in progress... Please wait a moment' : undefined}>
                {campaign && <>
                    <PageTitle>Mint Page</PageTitle>

                    <Card
                        direction={{ base: 'column', sm: 'row' }}
                        overflow='hidden'
                        marginBottom='20'
                    >
                        {/* @TODO: Add a campaign.cover field in SmartContract */}
                        <Image
                            objectFit='cover'
                            maxW={{ base: '100%', sm: '30%' }}
                            src='/img/default_campaign_cover.png'
                            alt='Crowdfunding campaign cover'
                        />

                        <Stack className='w-full'>
                            <CardBody>
                                <Heading size='md' padding='2'>
                                    {campaign.boost > Date.now() && <Text className='font-semibold italic text-orange-400'>Boosted</Text>}
                                    {endTimestamp && endTimestamp > Date.now()
                                        ? <Text className='font-semibold italic text-indigo-500 pb-2'>Campaign in progress...</Text>
                                        : <Text className='font-semibold italic text-gray-500 pb-2'>Campaign finished</Text>
                                    }

                                    {campaign.name}
                                </Heading>

                                <Box className='inline-block w-1/2 px-2 mt-4 align-top'>
                                    <Text className='font-semibold italic'>Campaign description:</Text>
                                    <Text py='2'>{campaign.description}</Text>
                                </Box>

                                <Box className='inline-block w-1/2 px-2 mt-4 align-top'>
                                    <Text className='font-semibold italic'>About {campaign.artistName}:</Text>
                                    <Text py='2'>{campaign.artistBio}</Text>
                                </Box>

                                <Box className='w-full px-2 mt-4 align-top'>
                                    <span className='font-semibold italic'>Campaign Objectif:</span>
                                    <span className='px-3'>{campaign.objectif} USDC</span>
                                </Box>
                            </CardBody>

                            
                            {endTimestamp && endTimestamp > Date.now() &&
                                <CardFooter>
                                    <Loader isLoading={infoLoading}>
                                        {campaignTiersInfo.tiers.map((tierInfo, i) =>
                                            <Box key={i} className='w-1/3 text-center'>
                                                <Box className='px-2 mt-4 align-top'>
                                                    <span className='font-semibold italic'>Tier {i+1}:</span>
                                                    <span className='px-3'>{tierInfo.price / 10**6} USDC</span>
                                                </Box>

                                                <Box className='px-2 mt-4 align-top'>
                                                    <Button variant='solid' colorScheme='indigo' onClick={() => approveAllowanceForMint(tierInfo.id, tierInfo.price)}>
                                                        MINT
                                                    </Button>
                                                </Box>
                                            </Box>
                                        )}
                                    </Loader>
                                </CardFooter>
                            }
                        </Stack>
                    </Card>
                </>}
            </Loader>
        </IsConnected>
    )
}
export default Campaign