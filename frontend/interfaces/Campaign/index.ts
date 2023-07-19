export interface Campaign {
    name: string
    description: string
    fees: number
    nbTiers: number
    boost: number
    objectif: number
    artist: `0x${string}`
}

export interface CampaignWithArtist extends Campaign {
    artistName: string
    artistBio: string
    artistCampaigns: `0x${string}`[]
}