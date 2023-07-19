'use client'

import IsConnected from "@/components/IsConnected"
import PageTitle from "@/components/layout/PageTitle"
import { CampaignWithArtist } from "@/interfaces/Campaign"
import { getCampaignWithArtist } from "@/utils"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

const Campaign = ({ params }: { params: { campaignAddr: `0x${string}` } }) => {
    const { address, isConnected } = useAccount()
    const [campaign, setCampaign] = useState<CampaignWithArtist>()

    const campaignAddr = params.campaignAddr

    useEffect(() => {
        getCampaignWithArtist(address as `0x${string}`, campaignAddr).then(
            campaign => setCampaign(campaign)
        ).catch(err => console.log(err))
    }, [campaignAddr, address])

    return (
        <IsConnected>
            {campaign && <PageTitle>{campaign.name}</PageTitle>}
            TODO
        </IsConnected>
    )
}
export default Campaign