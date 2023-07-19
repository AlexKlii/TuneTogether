'use client'

import React, { FormEvent, useEffect, useState } from 'react'
import { FormControl, FormLabel, FormErrorMessage, FormHelperText, Input, Button, Textarea, Radio, RadioGroup, Stack, Text, useToast } from '@chakra-ui/react'
import { useAccount, useContractEvent } from 'wagmi'
import { useRouter } from 'next/navigation'
import { getArtist, pinFilesToIPFS, uploadFromBuffer, writeContractByFunctionName, writeForContractByFunctionName } from '@/utils'
import { TierPriceReward } from '@/interfaces/TierPrice/TierPriceReward'
import { TierPrice } from '@/interfaces/TierPrice'
import { contractAddress, crowdfundingCampaignAbi, tuneTogetherAbi } from '@/constants'
import PageTitle from '@/components/layout/PageTitle'
import IsConnected from '@/components/IsConnected'

import { debounce } from 'lodash'
import { Artist } from '@/interfaces/Artist'
import Loader from '@/components/Loader'

// extends React's HTMLAttributes
declare module 'react' {
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        directory?: string
        webkitdirectory?: string
    }
}

const CreateCampaign = () => {
    const { address, isConnected } = useAccount()

    const [loading, setLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [artistName, setArtistName] = useState('')
    const [bio, setBio] = useState('')
    const [objectif, setObjectif] = useState(0)
    const [fees, setFees] = useState('0')
    const [updateTierPrice, setUpdateTierPrice] = useState(false)
    const [tierPrices, setTierPrices] = useState<TierPrice[]>([])
    const [artist, setArtist] = useState<Artist>()
    const [campaignAddr, setCampaignAddr] = useState<`0x${string}`>()

    const { push } = useRouter()
    const toast = useToast()

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
        setTierPrices(tierPrices)
        setUpdateTierPrice(true)
    }

    const handleTierNameChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        tierPrices[index].name = e?.target.value
        setTierPrices(tierPrices)
        setUpdateTierPrice(true)
    }

    const handleTierPriceRewardTitle = (tierPriceIndex: number, rewardIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        tierPrices[tierPriceIndex].rewards[rewardIndex].title = e?.target.value
        setTierPrices(tierPrices)
        setUpdateTierPrice(true)
    }

    const handleTierPriceRewardValue = (tierPriceIndex: number, rewardIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        tierPrices[tierPriceIndex].rewards[rewardIndex].value = e?.target.value
        setTierPrices(tierPrices)
        setUpdateTierPrice(true)
    }

    const handleTierPriceImgChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e?.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]

            // File extension need to be `png`
            const fileExtensionRegex = new RegExp('.(png|PNG)')
            if (!fileExtensionRegex.test(selectedFile.name)) {
                tierPrices[id].extensionError = true
            } else {
                tierPrices[id].img = selectedFile
                tierPrices[id].extensionError = false
            }
            
            setTierPrices(tierPrices)
            setUpdateTierPrice(true)
        }
    }

    const addTierPrice = () => {
        if (tierPrices.length < 10) {
            tierPrices.push({ id: tierPrices.length+1, name: '', price: 0, rewards: [], img: new File([], '') })
            setTierPrices(tierPrices)
            setUpdateTierPrice(true)
        }
    }
    
    const removeTierPrice = () => {
        tierPrices.splice(tierPrices.length-1)
        setUpdateTierPrice(true)
    }

    const addTierPriceReward = (tierPrice: TierPrice) => {
        if (tierPrice.rewards.length < 20) {
            tierPrice.rewards.push({ title: '', value: '' })
            setTierPrices(tierPrices)
            setUpdateTierPrice(true)
        }
    }

    const removeTierPriceReward = (tierPrice: TierPrice) => {
        tierPrice.rewards.splice(tierPrice.rewards.length-1)
        setTierPrices(tierPrices)
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

        const wrongTierPricesInfo = tierPrices.find(tierPrice => tierPrice.rewards.length === 0 || tierPrice.name.length < 3 || tierPrice.name.length > 15)

        let wrongFileExtension = false
        const files: File[] = []

        for (let i = 0; i < tierPrices.length; i++) {
            const tierPrice = tierPrices[i];
            if (tierPrice.extensionError) {
                wrongFileExtension = true
                break
            }

            if ('' !== tierPrice.img.name) {
                var file = tierPrice.img
                var blob = file.slice(0, file.size, 'image/png');
                
                // Change img name
                tierPrice.img = new File([blob], `img/${tierPrice.id}.png`, {type: 'image/png'})
                files.push(tierPrice.img)
            }
        }

        if (!hasError && !wrongTierPricesInfo && !wrongFileExtension) {
            if (files.length > 0) {
                // Upload img folder from FormData to pinata
                pinFilesToIPFS(files, name).then(result => {
                    const blobs: Blob[] = []
                    tierPrices.map((tierPrice: TierPrice) => {
                        const attributes: {trait_type: string, value: string}[] = []
                        tierPrice.rewards.map(reward =>
                            attributes.push({
                                trait_type: reward.title,
                                value: reward.value,
                            })
                        )

                        const str = JSON.stringify({
                            description: description,
                            image: `ipfs://${result.IpfsHash}/${tierPrice.id}.png`,
                            name: tierPrice.name,
                            attributes: attributes
                        })

                        const bytes = new TextEncoder().encode(str)
                        const blob = new Blob([bytes], {
                            type: 'application/json;charset=utf-8'
                        })

                        blobs.push(blob)
                    })

                    // Upload json folder from FormData to pinata
                    uploadFromBuffer(blobs, name).then(data => {
                        const uri: string = `ipfs://${data.IpfsHash}/`
                        const objectifInWei = objectif * 10**6
                        // call TuneTogether.createNewCampaign()
                        writeContractByFunctionName('createNewCampaign', name, description, fees, artistName, bio, uri, tierPrices.length.toString(), objectifInWei.toString()).then(() => {
                            console.log('Campaign created')
                            toast({
                                title: 'Campaign created',
                                description: 'Successfully created new campaign',
                                status: 'success',
                                duration: 2000,
                                isClosable: true,
                            })
                        })
                        .catch(err => {
                            // @TODO: unpin folders in pinata if an error occured
                            setLoading(false)
                            toast({
                                title: 'Unable to create campaign',
                                description: err.message,
                                status: 'error',
                                duration: 5000,
                                isClosable: true,
                            })
                        })
                    }).catch(err => {
                        console.log(err)
                        setLoading(false)
                    })

                }).catch(err => {
                    console.log(err)
                    setLoading(false)
                })

            } else setLoading(false)
        } else setLoading(false)
    }

    useContractEvent({
        address: contractAddress,
        abi: tuneTogetherAbi,
        eventName: 'CampaignAdded',
        listener(event: any) {
            if (typeof event[0]?.args != undefined) {
                setCampaignAddr(event[0].args['_campaignAddr'])
                
                const firstTierPrice = tierPrices.find(tierPrice => tierPrice.id === 1)
                if (firstTierPrice) {
                    const priceInWei = firstTierPrice.price * 10**6
                    
                    // Set first tier price
                    writeForContractByFunctionName(event[0].args['_campaignAddr'], 'setTierPrice', (firstTierPrice.id).toString(), priceInWei.toString()).then(() => {
                        console.log(`Tier ${firstTierPrice.id} added`)
                        toast({
                            title: 'Tier Price added',
                            description: `Successfully added tier price ${firstTierPrice.id}`,
                            status: 'success',
                            duration: 2000,
                            isClosable: true,
                        })
                    }).catch(err => {
                        toast({
                            title: 'Unable to add tier price',
                            description: err.message,
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                        })
                        setLoading(false)
                    })
                }
            }            
        }
    })

    useContractEvent({
        address: campaignAddr,
        abi: crowdfundingCampaignAbi,
        eventName: 'TierPriceAdded',
        listener(event: any) {
            // Start campaign when all tier prices was filled
            const tierPriceAddedId: number = event[0].args._id
            if (campaignAddr) {
                if (tierPriceAddedId === tierPrices.length) {
                    writeForContractByFunctionName(campaignAddr, 'startCampaign').then(() => {
                        console.log(`Campaign started at address ${campaignAddr}!`)
                        toast({
                            title: 'Congrats !',
                            description: 'Campaign is now started',
                            status: 'success',
                            duration: 5000,
                            isClosable: true,
                        })
                        push(`/campaigns/${campaignAddr}`)
                    }).catch(err => {
                        toast({
                            title: 'Unable to start campaign',
                            description: err.message,
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                        })
                    }).finally(() => setLoading(false))
                } else {
                    const nextId = tierPriceAddedId + 1
                    const nextTierPrice = tierPrices.find(tierPrice => tierPrice.id === nextId)

                    if (nextTierPrice) {
                        const priceInWei = nextTierPrice.price * 10 ** 6

                        // Set next tier price
                        writeForContractByFunctionName(campaignAddr, 'setTierPrice', nextId.toString(), priceInWei.toString()).then(() => {
                            console.log(`Tier ${nextId} added`)
                            toast({
                                title: 'Tier Price added',
                                description: `Successfully added tier price ${nextId}`,
                                status: 'success',
                                duration: 2000,
                                isClosable: true,
                            })
                        }).catch(err => {
                            toast({
                                title: 'Unable to add tier price',
                                description: err.message,
                                status: 'error',
                                duration: 5000,
                                isClosable: true,
                            })
                            setLoading(false)
                        })
                    }
                }
            }
        }
    })

    useEffect(() => {
        const debounced = debounce(() => {
            setUpdateTierPrice(false)
        }, 100)
        
        debounced()
    }, [updateTierPrice])

    useEffect(() => {
        if (isConnected && address) {
            getArtist(address).then(artist => {
                setArtist(artist)
                setArtistName(artist.name)
                setBio(artist.bio)
            }).catch((err) => console.log(err))
        }
    }, [isConnected, address, loading])

    return (
        <Loader isLoading={loading}>
            <IsConnected>
                {!artist || (artist && artist.campaigns.length < 10) ?
                    <section>
                        <PageTitle>Create a new Campaign</PageTitle>
                        <form className='w-4/6 m-auto text-center' onSubmit={submit}>
                            {artist?.campaigns.length === 0 &&
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
                            }

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
                                {tierPrices.length > 0 &&
                                    <legend className='text-lg text-justify italic text-indigo-200 mb-5'>Campaign Tier Prices</legend>
                                }

                                {isSubmitted && errors.wrongTierPrices &&
                                    <Text color='red.500'>Campaign should have at least one tier price.</Text>
                                }

                                {tierPrices.sort((a, b) => a.id - b.id).map((tierPrice: TierPrice, i) => (
                                    <div key={i} className='text-justify'>
                                        <FormControl isRequired isInvalid={isSubmitted && (tierPrice.price < 1 || tierPrice.price <= tierPrices[i - 1]?.price || tierPrice.price >= tierPrices[i + 1]?.price)} className='pb-10'>
                                            <FormLabel>Price for Tier {tierPrice.id}</FormLabel>
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
                                                            : <FormHelperText>Enter the tier price in USDC.</FormHelperText>
                                                : <FormHelperText>Enter the tier price in USDC.</FormHelperText>
                                            }
                                        </FormControl>

                                        <FormControl isRequired isInvalid={isSubmitted && '' === tierPrice.img?.name} className='pb-10'>
                                            <FormLabel>NFT image for Tier {i+1}</FormLabel>
                                            <input type="file" onChange={event => handleTierPriceImgChange(i, event)}/>

                                            {isSubmitted
                                                ? ('' === tierPrice.img?.name) && <FormErrorMessage>Should have an image.</FormErrorMessage>
                                                : <FormHelperText>Enter the NFT image to upload.</FormHelperText>
                                            }

                                            {tierPrice.extensionError && <Text color='red.500'>File should be an image (.png only).</Text>}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={isSubmitted && (tierPrice.name.length < 3 || tierPrice.name.length > 15)} className='pb-10'>
                                            <FormLabel>Tier {tierPrice.id} name</FormLabel>
                                            <Input type='text' value={tierPrice.name} onChange={event => handleTierNameChange(i, event)} placeholder='Tier name...' />
                                            {isSubmitted
                                                ? tierPrice.name.length > 15
                                                    ? <FormErrorMessage>Tier name should have a maximum of 15 characters.</FormErrorMessage>
                                                    : tierPrice.name.length < 3 && <FormErrorMessage>Tier name should have at least 3 characters.</FormErrorMessage>
                                                : <FormHelperText>Enter the Tier name.</FormHelperText>
                                            }
                                        </FormControl>

                                        {tierPrice.rewards.map((reward: TierPriceReward, j) => (
                                            <div key={j} className='text-justify w-5/6 mx-auto flex'>
                                                <FormControl isRequired isInvalid={isSubmitted && (reward.title.length < 2 || reward.title.length > 30 )} className='pb-10 w-1/2 justify-center px-2'>
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

                                                <FormControl isRequired isInvalid={isSubmitted && (reward.value.length < 2 || reward.value.length > 30 )} className='pb-10 w-1/2 justify-center px-2'>
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
                    : <PageTitle className='text-gray-400 underline'>You have already reached the maximum number of campaigns per artist</PageTitle>
                }
            </IsConnected>
        </Loader> 
    )
}
export default CreateCampaign