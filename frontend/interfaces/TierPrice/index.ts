import { TierPriceReward } from "./TierPriceReward"

export interface TierPrice {
    img: File,
    price: number
    rewards: TierPriceReward[]
}