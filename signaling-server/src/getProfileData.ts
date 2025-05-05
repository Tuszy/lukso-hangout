import { ERC725 } from "@erc725/erc725.js";
import { ethers } from "ethers";

export const IPFS_GATEWAY = "https://ipfs-gateway.tuszy.com/ipfs/";

export const LUKSO_MAINNET_CHAIN_ID = 42;
export const LUKSO_TESTNET_CHAIN_ID = 4201;

export const RPC_ENDPOINT: Record<number, string> = {
  [LUKSO_MAINNET_CHAIN_ID]: "https://rpc.mainnet.lukso.network",
  [LUKSO_TESTNET_CHAIN_ID]: "https://rpc.testnet.lukso.network",
};

export const JSON_RPC_PROVIDER: Record<number, ethers.JsonRpcProvider> = {
  [LUKSO_MAINNET_CHAIN_ID]: new ethers.JsonRpcProvider(
    RPC_ENDPOINT[LUKSO_MAINNET_CHAIN_ID]
  ),
  [LUKSO_TESTNET_CHAIN_ID]: new ethers.JsonRpcProvider(
    RPC_ENDPOINT[LUKSO_TESTNET_CHAIN_ID]
  ),
};

export const ipfsUrl = (url: string) =>
  url.replace(/([^:])\/{2,}/g, "$1/").replace("ipfs://", IPFS_GATEWAY);

type ProfileImage = {
  url: string;
  width: number;
  height: number;
  ratio: number;
};

export type ProfileData = {
  name: string;
  img?: ProfileImage;
};

const erc725schema = [
  {
    name: "LSP3Profile",
    key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    keyType: "Singleton",
    valueType: "bytes",
    valueContent: "VerifiableURI",
  },
];

export const getProfileData = async (
  address: `0x${string}` | null,
  chainId: number
): Promise<ProfileData> => {
  if (address === null) {
    return {
      name: "Anonymous Guest",
    };
  }

  try {
    const erc725 = new ERC725(erc725schema, address, RPC_ENDPOINT[chainId], {
      ipfsGateway: IPFS_GATEWAY,
    });
    const { value } = await erc725.fetchData("LSP3Profile");
    if (!value || typeof value !== "object" || !("LSP3Profile" in value)) {
      throw "PROFILE DATA NOT AVAILABLE";
    }
    const profileData = value.LSP3Profile;
    const images =
      profileData.profileImage && profileData.profileImage.length > 0
        ? profileData.profileImage
        : undefined;
    const processedImages = images
      .flatMap(
        (i: unknown) => i as { width: number; height: number; url: string }
      )
      .map((img: { width: number; height: number; url: string }) => ({
        width: img.width,
        height: img.height,
        ratio: img.height / img.width,
        url: ipfsUrl(img.url),
      })) as ProfileImage[];
    processedImages.sort((a, b) => a.width - b.width);

    return {
      name: profileData.name,
      img:
        profileData.profileImage && profileData.profileImage.length > 0
          ? processedImages[0]
          : undefined,
    };
  } catch (e) {
    console.log("FAILED TO GET PROFILE DATA", address, e);
    return {
      name: address,
    };
  }
};
