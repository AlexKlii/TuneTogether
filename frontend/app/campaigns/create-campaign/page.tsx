'use client'

import React, { FormEvent, useEffect, useState } from 'react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText, Input, Button, Textarea, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react'

import PageTitle from '@/components/layout/PageTitle'

import { TierPriceReward } from '@/interfaces/TierPrice/TierPriceReward'
import { TierPrice } from '@/interfaces/TierPrice'

const CreateCampaign = () => {
    const [loading, setLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [artistName, setArtistName] = useState('')
    const [bio, setBio] = useState('')
    const [objectif, setObjectif] = useState(0)
    const [fees, setFees] = useState('0')
    const [updateTierPrice, setUpdateTierPrice] = useState(false)
    const [tierPrices] = useState<TierPrice[]>([])

    const errors = {
        nameTooShort: name.length < 5,
        nameTooLong: name.length > 20,
        artistNameTooShort: artistName.length < 5,
        artistNameTooLong: artistName.length > 20,
        descriptionTooShort: description.length < 10,
        bioTooShort: bio.length < 10,
        objectifTooLow: objectif < 100,
        wrongFees: '0' !== fees && '5' !== fees && '10' !== fees,
        wrongTierPrices: 0 === tierPrices.length || tierPrices.length > 10
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e?.target.value)
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e?.target.value)
    const handleArtistNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setArtistName(e?.target.value)
    const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e?.target.value)
    const handleObjectifChange = (e: React.ChangeEvent<HTMLInputElement>) => setObjectif(+e?.target.value)
    const handleFeesChange = (value: string) => setFees(value)

    const handleTierPriceChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        tierPrices[index].price = +e?.target.value
        setUpdateTierPrice(true)
    }

    const handleTierPriceImgChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e?.target.files && e.target.files[0]) {
            tierPrices[index].img = e?.target.files[0]
            setUpdateTierPrice(true)
        }
    }

    const handleTierPriceRewardTitle = (tierPriceIndex: number, rewardIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        tierPrices[tierPriceIndex].rewards[rewardIndex].title = e?.target.value
        setUpdateTierPrice(true)
    }

    const handleTierPriceRewardValue = (tierPriceIndex: number, rewardIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        tierPrices[tierPriceIndex].rewards[rewardIndex].value = e?.target.value
        setUpdateTierPrice(true)
    }

    const addTierPrice = () => {
        if (tierPrices.length < 10) {
            tierPrices.push({ img: new File([], ''), price: 0, rewards: [] })
            setUpdateTierPrice(true)
        }
    }

    const addTierPriceReward = (tierPrice: TierPrice) => {
        if (tierPrice.rewards.length < 20) {
            tierPrice.rewards.push({ title: '', value: '' })
            setUpdateTierPrice(true)
        }
    }

    const removeTierPriceReward = (tierPrice: TierPrice) => {
        tierPrice.rewards.splice(tierPrice.rewards.length-1)
        setUpdateTierPrice(true)
    }

    const removeTierPrice = () => {
        tierPrices.splice(tierPrices.length-1)
        setUpdateTierPrice(true)
    }

    const submit = (event: FormEvent) => {
        event.preventDefault()
        setIsSubmitted(true)
        setLoading(true)

        let hasError = false
        let key: keyof typeof errors
        for (key in errors) {
            const error = errors[key]
            if (error) {
                hasError = true
                break
            }
        }

        const emptyReward = tierPrices.find(tierPrice => tierPrice.rewards.length === 0)
        if (!hasError && !emptyReward) {

            console.log('submit')
            // Upload img and json folders from forms data to nft.storage
            // Retrieve the generated uri from API nft.storage
            // Call TuneTogether.createNewCampaign()
            setLoading(false)

        } else setLoading(false)
    }

    useEffect(() => {
        setUpdateTierPrice(false)
    }, [updateTierPrice])
    

    return (
        <section>
            <PageTitle>Create a new Campaign</PageTitle>

            <form className="w-4/6 m-auto text-center" onSubmit={submit}>
                <fieldset className='text-justify'>
                    <legend className='text-lg italic text-indigo-200 mb-5'>Artist Informations</legend>

                    <FormControl isRequired isInvalid={isSubmitted && (errors.artistNameTooShort || errors.artistNameTooShort)} className='pb-10'>
                        <FormLabel>Artist name</FormLabel>
                        <Input type='text' value={artistName} onChange={handleArtistNameChange} placeholder='Artist name...' />
                        {isSubmitted
                            ? errors.artistNameTooLong
                                ? <FormErrorMessage>Artist name should have a maximum of 20 characters.</FormErrorMessage>
                                : errors.artistNameTooShort && <FormErrorMessage>Artist name should have at least 5 characters.</FormErrorMessage>
                            : <FormHelperText>Enter you&apos;re artist name.</FormHelperText>
                        }
                    </FormControl>

                    <FormControl isRequired isInvalid={isSubmitted && errors.bioTooShort} className='pb-10'>
                        <FormLabel>Artist Biography</FormLabel>
                        <Textarea
                            value={bio}
                            onChange={handleBioChange}
                            placeholder='Artist biography...'
                            size='xl'
                            className='rounded-md p-4'
                        />
                        {isSubmitted
                            ? errors.bioTooShort && <FormErrorMessage>Artist biography should have at least 10 characters.</FormErrorMessage>
                            : <FormHelperText>Enter you&apos;re artist biography.</FormHelperText>
                        }
                    </FormControl>
                </fieldset>

                <fieldset className='text-justify'>
                    <legend className='text-lg italic text-indigo-200 mb-5'>Campaign Informations</legend>

                    <FormControl isRequired isInvalid={isSubmitted && (errors.nameTooLong || errors.nameTooShort)} className='pb-10'>
                        <FormLabel>Campaign name</FormLabel>
                        <Input type='text' value={name} onChange={handleNameChange} placeholder='Campaign name...' />
                        {isSubmitted
                            ? errors.nameTooLong
                                ? <FormErrorMessage>Campaign name should have a maximum of 20 characters.</FormErrorMessage>
                                : errors.nameTooShort && <FormErrorMessage>Campaign name should have at least 5 characters.</FormErrorMessage>
                            : <FormHelperText>Enter the campaign name.</FormHelperText>
                        }
                    </FormControl>

                    <FormControl isRequired isInvalid={isSubmitted && errors.descriptionTooShort} className='pb-10'>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder='Campaign description...'
                            size='xl'
                            className='rounded-md p-4'
                        />
                        {isSubmitted
                            ? errors.descriptionTooShort && <FormErrorMessage>Campaign description should have at least 10 characters.</FormErrorMessage>
                            : <FormHelperText>Enter a campaign description.</FormHelperText>
                        }
                    </FormControl>

                    <FormControl isRequired isInvalid={isSubmitted && errors.objectifTooLow} className='pb-10'>
                        <FormLabel>Campaign objectif</FormLabel>
                        <Input type='number' value={0 === objectif ? '' : objectif} onChange={handleObjectifChange} placeholder='Objectif in USDC...' />
                        {isSubmitted
                            ? errors.objectifTooLow && <FormErrorMessage>Campaign objectif should be at least at 100 USDC.</FormErrorMessage>
                            : <FormHelperText>Enter the campaign objectif in USDC.</FormHelperText>
                        }
                    </FormControl>

                    <FormControl isRequired isInvalid={isSubmitted && errors.wrongFees} className='pb-10'>
                        <FormLabel>Campaign Fees</FormLabel>
                        <RadioGroup onChange={handleFeesChange} value={fees}>
                            <Stack direction='row'>
                                <Radio value='0'>0% Fees</Radio>
                                <Radio value='5'>5% Fees</Radio>
                                <Radio value='10'>10% Fees</Radio>
                            </Stack>
                        </RadioGroup>
                        {isSubmitted
                            ? errors.wrongFees && <FormErrorMessage>Campaign fees should be at 0, 5 or 10 percent.</FormErrorMessage>
                            : <FormHelperText>Enter the campaign fees.</FormHelperText>
                        }
                    </FormControl>
                </fieldset>

                <fieldset className='text-center'>
                    <legend className='text-lg text-justify italic text-indigo-200 mb-5'>Campaign Tier Prices</legend>

                    {isSubmitted && errors.wrongTierPrices &&
                        <Text color='red.500'>Campaign should have at least one tier price.</Text>
                    }

                    {tierPrices.map((tierPrice: TierPrice, i) => (
                        <div key={i} className='text-justify'>
                            <FormControl isRequired isInvalid={isSubmitted && (tierPrice.price < 1 || tierPrice.price <= tierPrices[i - 1]?.price || tierPrice.price >= tierPrices[i + 1]?.price)} className='pb-10'>
                                <FormLabel>Price for Tier {i+1}</FormLabel>
                                <Input type='number'
                                    value={0 === tierPrice.price ? '' : tierPrice.price}
                                    onChange={event => handleTierPriceChange(i, event)}
                                    placeholder='Price in USDC...'
                                />
                                {isSubmitted
                                    ? (tierPrice.price < 1)
                                        ? <FormErrorMessage>Minimum price should be at least at 1 USDC.</FormErrorMessage>
                                        : (tierPrice.price <= tierPrices[i - 1]?.price)
                                            ? <FormErrorMessage>Price should be higher than the previous tier price.</FormErrorMessage>
                                            : (tierPrice.price >= tierPrices[i + 1]?.price)
                                                ? <FormErrorMessage>Price should be lower than the next tier price.</FormErrorMessage>
                                                : <FormHelperText>Enter the campaign objectif in USDC.</FormHelperText>
                                    : <FormHelperText>Enter the campaign objectif in USDC.</FormHelperText>
                                }
                            </FormControl>

                            <FormControl isRequired isInvalid={isSubmitted && '' === tierPrice.img?.name} className='pb-10'>
                                <FormLabel>NFT image for Tier {i+1}</FormLabel>
                                <input type="file" onChange={event => handleTierPriceImgChange(i, event)}/>

                                {isSubmitted
                                    ? ('' === tierPrice.img?.name) && <FormErrorMessage>Should have an image.</FormErrorMessage>
                                    : <FormHelperText>Enter the NFT image to upload.</FormHelperText>
                                }
                            </FormControl>

                            {tierPrice.rewards.map((reward: TierPriceReward, j) => (
                                <div key={j} className='text-justify'>
                                    <FormControl isRequired isInvalid={isSubmitted && (reward.title.length < 2 || reward.title.length > 30 )} className='pb-10'>
                                        <FormLabel>Reward {j+1} title</FormLabel>
                                        <Input type='text'
                                            value={reward.title}
                                            onChange={event => handleTierPriceRewardTitle(i, j, event)}
                                            placeholder='Title...'
                                        />
                                        {isSubmitted
                                            ? reward.title.length > 30
                                                ? <FormErrorMessage>Title should have a maximum of 30 characters.</FormErrorMessage>
                                                : reward.title.length < 2 && <FormErrorMessage>Title should have at least 2 characters.</FormErrorMessage>
                                            : <FormHelperText>Enter a reward title.</FormHelperText>
                                        }
                                    </FormControl>

                                    <FormControl isRequired isInvalid={isSubmitted && (reward.value.length < 2 || reward.value.length > 30 )} className='pb-10'>
                                        <FormLabel>Reward {j+1} value</FormLabel>
                                        <Input type='text'
                                            value={reward.value}
                                            onChange={event => handleTierPriceRewardValue(i, j, event)}
                                            placeholder='Value...'
                                        />
                                        {isSubmitted
                                            ? reward.value.length > 30
                                                ? <FormErrorMessage>Value should have a maximum of 30 characters.</FormErrorMessage>
                                                : reward.value.length < 2 && <FormErrorMessage>Value should have at least 2 characters.</FormErrorMessage>
                                            : <FormHelperText>Enter a reward value.</FormHelperText>
                                        }
                                    </FormControl>
                                </div>
                            ))}

                            {isSubmitted && tierPrice.rewards.length === 0 &&
                                <Text color='red.500' className='text-center'>Tier Price should have at least one reward.</Text>
                            }

                            <div className='inline-flex justify-center w-full'>
                                <Button
                                    isDisabled={loading || tierPrice.rewards.length >= 20}
                                    bgColor='indigo.700'
                                    color='gray.100'
                                    type='button'
                                    className='w-1/3 mx-2 my-5 hover:text-gray-800'
                                    onClick={() => addTierPriceReward(tierPrice)}
                                >
                                    Add reward
                                </Button>
                                
                                <Button
                                    isDisabled={loading || tierPrice.rewards.length == 0}
                                    bgColor='red.700'
                                    color='gray.100'
                                    type='button'
                                    className='w-1/3 mx-2 my-5 hover:text-gray-800'
                                    onClick={() => removeTierPriceReward(tierPrice)}
                                >
                                    Remove last reward
                                </Button>
                            </div>
                        </div>
                    ))}

                    <div className='inline-flex justify-center w-full'>
                        <Button
                            isDisabled={loading || tierPrices.length >= 10}
                            bgColor='indigo.700'
                            color='gray.100'
                            type='button'
                            className='w-1/2 mx-2 my-5 hover:text-gray-800'
                            onClick={addTierPrice}
                        >
                            Add a tier price
                        </Button>
                            
                        <Button
                            isDisabled={loading || tierPrices.length == 0}
                            bgColor='red.700'
                            color='gray.100'
                            type='button'
                            className='w-1/2 mx-2 my-5 hover:text-gray-800'
                            onClick={removeTierPrice}
                        >
                            Remove last tier price
                        </Button>
                    </div>
                </fieldset>

                <Button
                    isLoading={loading}
                    colorScheme='indigo'
                    loadingText='Submitting Campaign'
                    type='submit'
                    className='w-1/2 my-10'
                >
                    Submit Campaign
                </Button>
            </form>
        </section>
    )
}
export default CreateCampaign;