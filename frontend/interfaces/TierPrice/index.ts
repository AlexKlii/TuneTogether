import { TierPriceReward } from './TierPriceReward'

export interface TierPrice {
    id: number
    name: string
    price: number
    rewards: TierPriceReward[]
}