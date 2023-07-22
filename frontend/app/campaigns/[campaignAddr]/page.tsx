'use client'

import IsConnected from '@/components/IsConnected'
import Loader from '@/components/Loader'
import PageTitle from '@/components/layout/PageTitle'
import CampaignManagement from '@/components/artist/CampaignManagement'

import { crowdfundingCampaignAbi, uscdContractAddress, usdcAbi } from '@/constants'
import { CampaignWithArtist } from '@/interfaces/Campaign'
import { CampaignTierInfo } from '@/interfaces/Campaign/TierInfo'
import { approveAllowance, getCampaignBoostedEvent, getCampaignClosedEvent, getCampaignFundWithdrawnEvent, getCampaignWithArtist, readForContractByFunctionName, writeForContractByFunctionName } from '@/utils'
import { Box, Button, Card, CardBody, CardFooter, Heading, Image, Stack, Text, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAccount, useContractEvent } from 'wagmi'
import { useRouter } from 'next/navigation'

const Campaign = ({ params }: { params: { campaignAddr: `0x${string}` } }) => {
    const { address, isConnected } = useAccount()
    const toast = useToast()
    const { push } = useRouter()

    const [campaign, setCampaign] = useState<CampaignWithArtist>()
    const [campaignTiersInfo, setCampaignTiersInfo] = useState<CampaignTierInfo>({nbTiers: 0, tiers: []})
    const [infoLoading, setInfoLoading] = useState(true)
    const [campaignLoading, setCampaignLoading] = useState(true)
    const [mintId, setMintId] = useState(0)
    const [logOwner, setLogOwner] = useState<`0x${string}`>()
    const [logMint, setLogMint] = useState<`0x${string}`>()
    const [loading, setLoading] = useState(false)
    const [isArtist, setIsArtist] = useState(false)
    const [logBoost, setLogBoost] = useState<number>()
    const [logClosed, setLogClosed] = useState<number>()
    const [logWithdraw, setLogWithdraw] = useState<number>()
    const [loadingManagement, setLoadingManagement] = useState(true)
    const [waitingMint, setWaitingMint] = useState(false)

    const campaignAddr = params.campaignAddr

    const approveAllowanceForMint = (id: number, price: number): void => {
        approveAllowance(address as `0x${string}`, campaignAddr, BigInt(price)).then(() => {
            setMintId(id)
            setLoading(true)
        }).catch(() => {
            setLoading(false)
        })
    }

    useEffect(() => {
        const init: boolean = '' === campaign?.name

        if (init) setCampaignLoading(true)
        if (isConnected) {
            getCampaignWithArtist(address as `0x${string}`, campaignAddr).then(
                campaign => {
                    if ('' === campaign.name) {
                        push('/')
                        toast({
                            title: '404 Error',
                            description: 'Campaign does not exist',
                            status: 'warning',
                            duration: 5000,
                            isClosable: true,
                        })
                    }

                    setCampaign(campaign)
                    setIsArtist(address === campaign.artist)

                    if (0 === campaignTiersInfo.tiers.length && !campaign.campaignClosed) {
                        if (init) setInfoLoading(true)
                        const tiersInfo: CampaignTierInfo = { nbTiers: 0, tiers: [] }
                        readForContractByFunctionName<number>(campaignAddr, 'nbTiers', address as `0x${string}`).then(
                            nbTiers => {
                                tiersInfo.nbTiers = nbTiers
                                for (let i = 1; i <= nbTiers; i++) {
                                    readForContractByFunctionName<number>(campaignAddr, 'getTierPrice', address as `0x${string}`, i).then(
                                        price => tiersInfo.tiers.push({ id: i, price: Number(price) })
                                    )
                                }
                            }
                        ).finally(() => {
                            setCampaignTiersInfo(tiersInfo)
                            if (init) setInfoLoading(false)
                        })
                    } else setInfoLoading(false)
                }
            )
            .catch(err => console.log(err))
            .finally(()=> setCampaignLoading(false))
        }
    }, [campaignAddr, address, campaignTiersInfo, isConnected, logBoost, logWithdraw, logClosed, push, toast, campaign?.name])

    useEffect(() => {
        setLoadingManagement(true)
        getCampaignClosedEvent(campaignAddr).then(closedEvent => 
            getCampaignBoostedEvent(campaignAddr).then(boosted => 
                getCampaignFundWithdrawnEvent(campaignAddr).then(fundWithdrawn => {
                    const withdrawnValue = Number(fundWithdrawn[0]?.args._usdcBalance) / 10**6
                    const closedTimestamp = Number(closedEvent[0]?.args._endTimestamp) * 1000
                    const boostedTimestamp = Number(boosted[boosted.length-1]?.args._timestamp) * 1000
                    
                    if (boostedTimestamp > Date.now()) setLogBoost(boostedTimestamp)
                    if (!Number.isNaN(closedTimestamp)) setLogClosed(closedTimestamp)
                    if (!Number.isNaN(withdrawnValue)) setLogWithdraw(withdrawnValue)

                    setLoadingManagement(false)
                })
            )
        )
    }, [campaignAddr, address, isConnected])

    useEffect(() => {
        if (0 !== mintId && logOwner === address) {
            const id = mintId.toString()
            setMintId(0)
            setLogOwner(undefined)

            // Mint NFT after allowance approval
            writeForContractByFunctionName(campaignAddr, 'mint', id, '1')
            .then(() => setWaitingMint(true))
            .catch(err => {
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
        if (waitingMint && logMint === address) {
            toast({
                title: 'Minted !',
                description: 'Successfully minted! See your NFT in your wallet in a few moments.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            })

            setLoading(false)
            setWaitingMint(false)
            setMintId(0)
            setLogMint(undefined)
            setLogOwner(undefined)
        }
    }, [address, logMint, mintId, toast, waitingMint])

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

    useContractEvent({
        address: campaignAddr,
        abi: crowdfundingCampaignAbi,
        eventName: 'Boosted',
        listener(log: any) {
            const boost = Number(log[log.length-1].args._timestamp) * 1000
            setLoadingManagement(false)
            if (boost > Date.now()) setLogBoost(boost)
        }
    })

    useContractEvent({
        address: campaignAddr,
        abi: crowdfundingCampaignAbi,
        eventName: 'FundWithdraw',
        listener(log: any) {
            setLogWithdraw(Number(log[0].args._usdcBalance) / 10**6)
            setLoadingManagement(false)
        }
    })

    useContractEvent({
        address: campaignAddr,
        abi: crowdfundingCampaignAbi,
        eventName: 'CampaignClosed',
        listener(log: any) {
            setLogClosed(Number(log[0].args._endTimestamp))
            setLoadingManagement(false)
        }
    })

    return (
        <IsConnected>
            <Loader isLoading={campaignLoading || loading} message={loading ? 'Mint in progress... Please wait a moment' : undefined}>
                {campaign && <>
                    <PageTitle>Mint Page</PageTitle>

                    {isArtist && <CampaignManagement campaign={campaign} usdcWithdrawn={logWithdraw} isLoading={loadingManagement} />}

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
                                    {!campaign.campaignClosed && campaign.isBoosted && <Text className='font-semibold italic text-orange-400'>Boosted</Text>}
                                    {!campaign.campaignClosed
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

                            
                            {!campaign.campaignClosed &&
                                <CardFooter>
                                    <Loader isLoading={infoLoading}>
                                        {campaignTiersInfo.tiers.map((tierInfo, i) =>
                                            <Box key={i} className='w-full text-center'>
                                                <Box className='px-2 mt-4 align-top'>
                                                    <span className='font-semibold italic'>Tier {i+1}:</span>
                                                    <span className='px-3'>{tierInfo.price / 10**6} USDC</span>
                                                </Box>

                                                <Box className='px-2 mt-4 align-top'>
                                                    <Button variant='solid' isDisabled={mintId !== 0} colorScheme='indigo' onClick={() => approveAllowanceForMint(tierInfo.id, tierInfo.price)}>
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