import axios from 'axios'
import { BaseError, ContractFunctionRevertedError, createPublicClient, http, parseAbiItem, parseEther } from 'viem'
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { contractAddress, crowdfundingCampaignAbi, tuneTogetherAbi, JWT, network, genesisBlock, CampaignAdded, usdcAbi, uscdContractAddress, CampaignClosed, Boosted, FundWithdraw } from '@/constants'
import { Artist } from '@/interfaces/Artist'
import { hardhat, sepolia, polygonMumbai, goerli } from 'viem/chains'
import { Campaign, CampaignWithArtist } from '@/interfaces/Campaign'

const usedNetwork = () => {
    switch (network) {
        case 'sepolia': return sepolia
        case 'goerli': return goerli
        case 'hardhat': return hardhat
        case 'mumbai': return polygonMumbai
    }
}

export const client = createPublicClient({
    chain: usedNetwork(),
    transport: http()
})

export const pinFilesToIPFS = async (selectedFiles: File[] | FileList, name: string): Promise<{ IpfsHash: string, PinSize: number, Timestamp: string, isDuplicate?: boolean }> => {
    const formData = new FormData()
    Array.from(selectedFiles).forEach((file) => formData.append('file', file))

    name = `IMG_${name.replace(/ /, '_').toUpperCase()}`
    const metadata = JSON.stringify({ name })
    formData.append('pinataMetadata', metadata)

    const options = JSON.stringify({ cidVersion: 0 })
    formData.append('pinataOptions', options)

    try {
        return await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            maxBodyLength: Infinity,
            headers: { Authorization: JWT }
        }).then(res => res.data)
    } catch (error) {
        throw formattedError(error)
    }
}

export const uploadFromBuffer = async (blobs: Blob[], name: string): Promise<{ IpfsHash: string, PinSize: number, Timestamp: string, isDuplicate?: boolean }> => {
    const formData = new FormData()
    Array.from(blobs).forEach((blob, i) => {
        const jsonFile = new File([blob], `json/${i + 1}.json`)
        formData.append('file', jsonFile)
    })

    name = `JSON_${name.replace(/ /, '_').toUpperCase()}`
    const metadata = JSON.stringify({ name })
    formData.append('pinataMetadata', metadata)

    const options = JSON.stringify({ cidVersion: 1 })
    formData.append('pinataOptions', options)

    try {
        return await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            maxBodyLength: Infinity,
            headers: { Authorization: JWT }
        }).then(res => res.data)
    } catch (error) {
        throw formattedError(error)
    }
}

export const getArtist = async (userAddr: `0x${string}`): Promise<Artist> => {
    return readContractByFunctionName<Artist>('getArtist', userAddr, userAddr)
}

export const userIsArtist = async (userAddr: `0x${string}`): Promise<boolean> => {
    return readContractByFunctionName<boolean>('isArtist', userAddr, userAddr).catch(() => false)
}

export const writeContractByFunctionName = async (functionName: string, ...args: `0x${string}`[]|string[]): Promise<`0x${string}`> => {
    try {
        const { request } = await prepareWriteContract({
            address: contractAddress,
            abi: tuneTogetherAbi,
            functionName: functionName,
            args: args
        })

        const { hash } = await writeContract(request)
        
        return hash
    } catch (err) {
        throw formattedError(err)
    }
}

export const boostCampaign = async (campaignAddr: `0x${string}`): Promise<`0x${string}`> => {
    try {
        const { request } = await prepareWriteContract({
            address: contractAddress,
            abi: tuneTogetherAbi,
            functionName: 'setBoost',
            args: [campaignAddr],
            value: parseEther('0.001'),
        })

        const { hash } = await writeContract(request)
        
        return hash
    } catch (err) {
        throw formattedError(err)
    }
}

export const readContractByFunctionName = async <T>(functionName: string, address: `0x${string}`, ...args: `0x${string}`[]|string[]|number[]): Promise<T> => {
    try {
        const data: Promise<T>|unknown = await readContract({
            address: contractAddress,
            abi: tuneTogetherAbi,
            functionName: functionName,
            account: address,
            args: args
        })

        return data as T
    } catch (err) {
        throw formattedError(err)
    }
}

export const userIsCampaignArtist = async (campaignAddr: `0x${string}`, userAddr: `0x${string}`): Promise<boolean> => {
    return readForContractByFunctionName<`0x${string}`>(campaignAddr, 'artistAddress', userAddr).then(
        hash => hash === userAddr
    ).catch(() => false)
}

export const writeForContractByFunctionName = async (contractAddr: `0x${string}`, functionName: string, ...args: `0x${string}`[]|string[]): Promise<`0x${string}`> => { 
    try {
        const { request } = await prepareWriteContract({
            address: contractAddr,
            abi: crowdfundingCampaignAbi,
            functionName: functionName,
            args: args
        })

        const { hash } = await writeContract(request)
        
        return hash
    } catch (err) {
        throw formattedError(err)
    }
}

export const readForContractByFunctionName = async <T>(contractAddr: `0x${string}`, functionName: string, address: `0x${string}`, ...args: `0x${string}`[]|string[]|number[]): Promise<T> => {

    try {
        const data: Promise<T>|unknown = await readContract({
            address: contractAddr,
            abi: crowdfundingCampaignAbi,
            functionName: functionName,
            account: address,
            args: args
        })

        return data as T
    } catch (err) {
        throw formattedError(err)
    }
}

export const getCampaignAddedEvents = async (): Promise<any> => {
    try {
        return await client.getLogs({
            address: contractAddress,
            event: parseAbiItem(CampaignAdded),
            fromBlock: BigInt(genesisBlock),
            toBlock: 'latest'
        })
    } catch (err) {
        throw formattedError(err)
    }
}

export const getCampaignClosedEvent = async (campaignAddr: `0x${string}`): Promise<any> => {
    try {
        return await client.getLogs({
            address: campaignAddr,
            event: parseAbiItem(CampaignClosed),
            fromBlock: BigInt(genesisBlock),
            toBlock: 'latest'
        })
    } catch (err) {
        throw formattedError(err)
    }
}

export const getCampaignBoostedEvent = async (campaignAddr: `0x${string}`): Promise<any> => {
    try {
        return await client.getLogs({
            address: campaignAddr,
            event: parseAbiItem(Boosted),
            fromBlock: BigInt(genesisBlock),
            toBlock: 'latest'
        })
    } catch (err) {
        throw formattedError(err)
    }
}

export const getCampaignFundWithdrawnEvent = async (campaignAddr: `0x${string}`): Promise<any> => {
    try {
        return await client.getLogs({
            address: campaignAddr,
            event: parseAbiItem(FundWithdraw),
            fromBlock: BigInt(genesisBlock),
            toBlock: 'latest'
        })
    } catch (err) {
        throw formattedError(err)
    }
}

export const getCampaignWithArtist = async (userAddress: `0x${string}`, campaignAddr: `0x${string}`): Promise<CampaignWithArtist> => {
    return readContractByFunctionName<Campaign>('getOneCampaign', userAddress, campaignAddr).then(
        async campaign => readContractByFunctionName<Artist>('getArtist', userAddress, campaign.artist).then(
            async artist => campaignEndTimestamp(campaignAddr, userAddress).then(
                async endTimestamp => campaignInProgress(campaignAddr, userAddress).then(
                    async inProgress => campaignFundIsWithdrawn(campaignAddr, userAddress).then(
                        async fundWithdrawn => {
                            const campaignWithArtist: CampaignWithArtist = {
                                name: campaign.name,
                                description: campaign.description,
                                boost: Number(campaign.boost) * 1000, // Convert to milliseconds
                                fees: Number(campaign.fees),
                                objectif: Number(campaign.objectif) / 10**6, // Remove USDC decimals
                                nbTiers: Number(campaign.nbTiers),
                                artist: campaign.artist,
                                artistBio: artist.bio,
                                artistCampaigns: artist.campaigns,
                                artistName: artist.name,
                                campaignAddr,
                                endTimestamp: Number(endTimestamp),
                                campaignClosed: !inProgress || (endTimestamp ? endTimestamp < Date.now() : false),
                                isBoosted: Number(campaign.boost) * 1000 > Date.now(),
                                fundWithdrawn
                            }
                
                            return campaignWithArtist
                        }
                    )
                )
            )
        )
    )
}

export const campaignEndTimestamp = async (campaignAddr: `0x${string}`, userAddr: `0x${string}`): Promise<number|null> => {
    return readForContractByFunctionName<number>(campaignAddr, 'endTimestamp', userAddr).then(
        timestamp => Number(timestamp) * 1000
    ).catch(() => null)
}

export const campaignFundIsWithdrawn = async (campaignAddr: `0x${string}`, userAddr: `0x${string}`): Promise<boolean> => {
    return readForContractByFunctionName<boolean>(campaignAddr, 'fundWithdrawn', userAddr).catch(() => false)
}

export const campaignInProgress = async (campaignAddr: `0x${string}`, userAddr: `0x${string}`): Promise<boolean> => {
    return readForContractByFunctionName<boolean>(campaignAddr, 'campaignInProgress', userAddr).catch(() => false)
}

export const approveAllowance = async (userAddress: `0x${string}`, ...args: unknown[]): Promise<`0x${string}`> => {
    try {
        const { request } = await prepareWriteContract({
            address: uscdContractAddress,
            abi: usdcAbi,
            functionName: 'approve',
            account: userAddress,
            args: args
        })

        const { hash } = await writeContract(request)
        
        return hash
    } catch (err) {
        throw formattedError(err)
    }
}

const formattedError = (err: any): Error => {
    if (err instanceof BaseError) {
        // Option 1: checking the instance of the error
        if (err.cause instanceof ContractFunctionRevertedError) {
            const cause: ContractFunctionRevertedError = err.cause
            const error = cause.reason ?? 'Unknown error'

            throw new Error(error)
        }

        // Option 2: using `walk` method from `BaseError`
        const revertError: any = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError) {
            const error = revertError.data?.message ?? 'Unknown error'

            throw new Error(error)
        }
    }

    if (typeof err === 'string') throw new Error(err)
    if (err instanceof String) throw new Error(err.toString())
    throw new Error(err.message)
}