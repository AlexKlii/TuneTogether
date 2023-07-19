export interface CampaignTierInfo {
    nbTiers: number,
    tiers: TierInfo[]
}

export interface TierInfo {
    id: number,
    uri: string,
    price: number
}