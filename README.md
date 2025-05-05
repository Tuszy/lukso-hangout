# Hangout - Lukso - Hack the Grid - Level 3

Immerse yourself into the blocky metaverse and hangout with your friends bragging about your NFTs!

<img src="logo.jpg" alt="logo" height="250"/>

[Showcase - Universal Profile - MAINNET](https://universaleverything.io/0xabb60bBc5D2F01fEce7aeF4eAa1A41B3c440Be53?assetGroup=grid)

[Showcase - Universal Profile - TESTNET](https://universaleverything.io/0xeDe44390389A98441ff2B9dDCe862fFAC9BeB0cd?assetGroup=grid&network=testnet)

[1. DEMO VIDEO](https://youtu.be/_xUwnW1zgiI)

[2. DEMO VIDEO - Multiplayer](https://youtu.be/NbCwuWxaT6U)

## Important Note

To install this mini-app in your grid, please ensure you paste the complete ``<iframe>`` tag into the text field, not just the URL. This ensures the app can request access to the camera and microphone for audio and video chat.

```html
<iframe src="https://lukso-grid-hangout.tuszy.com" allow="camera; microphone"></iframe>
```

## Motivation
This mini-application builds upon and broadens the functionality of my [3D Marketplace](https://github.com/Tuszy/lukso-grid-marketplace) project, awarded during the 1st level of the Hack the Grid hackathon.

Unlike the rigid, auto-generated 3D gallery that simply displayed NFTs available for sale, this application empowers users to build a unique, Minecraft-inspired 3D world and personalize it by placing their NFTs as images, videos, and 3D assets.

Beyond customizing their 3D world and selling NFTs, users can now connect and socialize with friends through seamless peer-to-peer audio and video chat powered by WebRTC directly within their grid.

## Note

I have tried to listen to and implement all the provided feedback to make the experience as smooth as possible though I do not guarantee a seamless experience for every user, since 3D rendered apps do have much higher requirements than simple web apps based on standard tech (HTML/CSS/JS).

In this regard I recommend you to not overbuild your 3D worlds and put too many heavy NFTs (e.g. high quality videos, 4K images and detailed 3d models), since they all have to be loaded and rendered. What may feel smooth and work for you, could be super laggy for someone with an average computer. Try to find the right balance.

The maximum number of users able to interact within a single world has not been fully tested. Given the peer-to-peer nature of WebRTC for audio, video, and position synchronization, initial estimates suggest a capacity of 4 to 8 users, depending on network conditions and media usage. This architecture makes the application almost fully decentralized, with the exception of the centralized signaling server required for the initial exchange of SDP and ICE candidates to setup the peer-to-peer connections.

Moreover this app is not mobile friendly. It is only meant to be used on a desktop computer with a keyboard and mouse.

## Architecture

<img src="arch.png" alt="architecture"/>

# SUPPORTED NFT FILE TYPES

Contained in the LSP4Metadata *images* and *assets* array:
1. **IMAGES**: PNG, JPEG & SVG
2. **VIDEOS**: MP4
3. **3D MODELS**: GLTF & GLB

**ATTENTION: GIFS ARE NOT SUPPORTED - THEY WILL BE SHOWN AS STATIC IMAGES**

# WORLD DATA

The world data is persisted as a JSON file on IPFS and linked to the owner's Universal Profile via the **Hangout:World** key in ERC725Y, storing a verifiable URI that references the corresponding IPFS hash.

Please note: Only the owner has permission to modify and save the world data. All other users may view the world as it is currently saved, but cannot make changes besides buying placed LSP8 NFTs if they are listed on [Universal Page](https://universal.page/).

The mini-app identifies the owner by comparing the context account to the connected account. As a result, users can both view and edit their world through the same interface, without needing a separate mini-app for management tasks.

# LINKS

- UPLOADING WORLD DATA TO IPFS: [https://ipfs-pin-json.tuszy.com](https://ipfs-pin-json.tuszy.com)

- FETCHING WORLD, NFT AND PROFILE DATA FROM IPFS: [https://ipfs-gateway.tuszy.com](https://ipfs-gateway.tuszy.com)

- MINI-APP: [https://lukso-grid-hangout.tuszy.com](https://lukso-grid-hangout.tuszy.com)

- SIGNALING SERVER FOR SETTING UP P2P CONNECTION OVER WEB-RTC: [https://lukso-grid-hangout-backend.tuszy.com](https://lukso-grid-hangout-backend.tuszy.com)

- USED TEXTURE PACK - AyjiPack [https://www.planetminecraft.com/texture-pack/ayjis-pack/](https://www.planetminecraft.com/texture-pack/ayjis-pack/)