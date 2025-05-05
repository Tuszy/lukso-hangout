// Crypto
import { ethers } from "ethers";
import { ERC725, decodeDataSourceWithHash } from "@erc725/erc725.js";
import { ipfsUrl, LSP8ListingsContract } from "./contractUtils";
import LSP3ProfileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";

// Schemas
import LSP4DigitalAssetSchema from "@erc725/erc725.js/schemas/LSP4DigitalAsset.json";
import LSP8IdentifiableDigitalAssetSchema from "@erc725/erc725.js/schemas/LSP8IdentifiableDigitalAsset.json";
import LSP8IdentifiableDigitalAsset from "@lukso/lsp8-contracts/artifacts/LSP8IdentifiableDigitalAsset.json";
import LSP7DigitalAsset from "@lukso/lsp7-contracts/artifacts/LSP7DigitalAsset.json";
import LSP4DigitalAssetMetadata from "@lukso/lsp4-contracts/artifacts/LSP4DigitalAssetMetadata.json";
import { collectionHandler } from "./collectionHandler";
import { INTERFACE_IDS } from "@lukso/lsp-smart-contracts";
import {
  _n,
  IPFS_GATEWAY,
  JSON_RPC_PROVIDER,
  LSP8_LISTINGS,
  RPC_ENDPOINT,
} from "../constants";
import { blacklist } from "./blacklist";

// DB
import Dexie, { type EntityTable } from "dexie";

const db = new Dexie("lukso-hangout-cache") as Dexie & {
  cache: EntityTable<{ id: number; key: string; value: string }, "id">;
};
db.version(1).stores({
  cache: "++id, key",
});

export type Asset = {
  id: string;
  name: string;
  images: Image[];
  models: string[];
  videos: string[];
  audios: string[];
  metadata: unknown;
  address: `0x${string}`;
  tokenId: `0x${string}` | null;
  listing: LSP8Listing | null;
  link: string;
};

export type LSP8Listing = {
  id: `0x${string}`;
  price: `0x${string}`;
};

export type Image = {
  width: number;
  height: number;
  url: string | null;
};

const ABORT_SIGNAL_TIMEOUT = 300000;

const digitalAssetSchema = [
  ...LSP4DigitalAssetSchema,
  ...LSP8IdentifiableDigitalAssetSchema,
];

async function getLSP8Listing(
  collection: `0x${string}`,
  tokenId: `0x${string}`
): Promise<LSP8Listing | null> {
  const listingIdSlot = ethers.keccak256(
    ethers.concat([
      ethers.solidityPackedKeccak256(
        ["address", "bytes32"],
        [collection, tokenId]
      ),
      ethers.zeroPadValue(ethers.toBeHex(173), 32),
    ])
  );

  const listingId = await _n(JSON_RPC_PROVIDER).getStorage(
    _n(LSP8_LISTINGS),
    listingIdSlot
  );
  if (listingId === ethers.ZeroHash) {
    return null;
  }

  const listingDataSlot = ethers.toBigInt(
    ethers.keccak256(
      ethers.concat([listingId, ethers.zeroPadValue(ethers.toBeHex(172), 32)])
    )
  );

  const [/*owner, */ price, active] = (await Promise.all([
    // _n(JSON_RPC_PROVIDER).getStorage(LSP8_LISTINGS, listingDataSlot + 2n),
    _n(JSON_RPC_PROVIDER).getStorage(_n(LSP8_LISTINGS), listingDataSlot + 4n),
    _n(LSP8ListingsContract).isActiveListing(listingId),
  ])) as `0x${string}`[];

  if (!active) return null;

  return {
    id: listingId as `0x${string}`,
    // owner: ethers.getAddress(ethers.dataSlice(owner, 12)),
    price,
  };
}

const processImages = async (images: unknown[]) => {
  if (!images) return [];
  const processedImages = images
    .flatMap(
      (i: unknown) => i as { width: number; height: number; url: string }
    )
    .filter(Boolean)
    .map((img: { width: number; height: number; url: string }) => ({
      width: img.width,
      height: img.height,
      url: ipfsUrl(img.url),
    })) as Image[];
  processedImages.sort((a, b) => a.width - b.width);
  return processedImages;
};

const processModels = async (models: unknown[]) => {
  if (!models) return [];
  const processedModels = models
    .flatMap((a: unknown) => a as { fileType: null | string; url: string })
    .filter(Boolean)
    .map(
      (asset: { fileType: null | string; url: string }) => asset.url
    ) as string[];

  const validModels = [];
  for (let i = 0; i < processedModels.length; i++) {
    try {
      const response = await fetch(ipfsUrl(processedModels[i]), {
        method: "GET",
        headers: {
          Range: "bytes=0-5",
        },
        signal: AbortSignal.timeout(ABORT_SIGNAL_TIMEOUT),
      });
      const data = await response.text();

      const type = data.toLowerCase();
      if (type.startsWith("gltf")) {
        validModels.push(ipfsUrl(processedModels[i]));
      }
    } catch (e) {}
  }

  return validModels;
};

const processVideos = async (videos: unknown[]) => {
  if (!videos) return [];
  const processedVideos = videos
    .flatMap((a: unknown) => a as { fileType: null | string; url: string })
    .filter(Boolean)
    .map(
      (asset: { fileType: null | string; url: string }) => asset.url
    ) as string[];

  const validVideos = [];
  for (let i = 0; i < processedVideos.length; i++) {
    try {
      const response = await fetch(ipfsUrl(processedVideos[i]), {
        method: "GET",
        headers: {
          Range: "bytes=0-1024",
        },
        signal: AbortSignal.timeout(ABORT_SIGNAL_TIMEOUT),
      });
      const data = await response.text();

      const type = data.toLowerCase();
      if (type.includes("mpeg-4") || type.includes("video")) {
        validVideos.push(ipfsUrl(processedVideos[i]));
      }
    } catch (e) {
      console.error(e);
    }
  }

  return validVideos;
};

const processAudios = async (audios: unknown[]) => {
  if (!audios) return [];
  const processedAudios = audios
    .flatMap((a: unknown) => a as { fileType: null | string; url: string })
    .filter(Boolean)
    .map(
      (asset: { fileType: null | string; url: string }) => asset.url
    ) as string[];

  const validAudios = [];
  for (let i = 0; i < processedAudios.length; i++) {
    try {
      const response = await fetch(ipfsUrl(processedAudios[i]), {
        method: "GET",
        headers: {
          Range: "bytes=0-256",
        },
        signal: AbortSignal.timeout(ABORT_SIGNAL_TIMEOUT),
      });
      const data = await response.text();

      const type = data.toLowerCase();
      if (type.includes("mpeg-3")) {
        validAudios.push(ipfsUrl(processedAudios[i]));
      }
    } catch (e) {}
  }

  return validAudios;
};

const fetchMetadata = async (metadataUrl: string, tokenName: string | null) => {
  const cachedData = await db.cache.get({
    key: metadataUrl,
  });
  if (cachedData) return JSON.parse(cachedData.value);
  try {
    const fetchedMetadata = await fetch(ipfsUrl(metadataUrl), {
      signal: AbortSignal.timeout(ABORT_SIGNAL_TIMEOUT),
    }).then((response) => response.json());
    if (!fetchedMetadata || !fetchedMetadata.LSP4Metadata) return null;
    const metadata = fetchedMetadata.LSP4Metadata;

    const name = metadata.name?.trim() || tokenName?.trim();
    const images = await processImages(metadata.images);
    const models = await processModels(metadata.assets ?? []);
    const videos = await processVideos(metadata.assets ?? []);
    const audios = await processAudios(metadata.assets ?? []);

    delete metadata.icon;
    delete metadata.backgroundImage;
    delete metadata.name;
    delete metadata.images;
    delete metadata.assets;

    const data = {
      name,
      images,
      models,
      videos,
      audios,
      metadata,
    };

    await db.cache.add({ key: metadataUrl, value: JSON.stringify(data) });

    return data;
  } catch (e) {
    console.error(
      "FAILED TO FETCH METADATA",
      metadataUrl,
      tokenName,
      e.toString()
    );
    throw e;
  }
};

const getLSP7Asset = async (
  address: `0x${string}`,
  metadataUrl: string,
  tokenName: string | null
): Promise<Asset | null> => {
  const data = await fetchMetadata(metadataUrl, tokenName);
  if (!data) return null;

  return {
    ...data,
    id: address,
    link: createLSP7UniversalPageLink(address),
    listing: null,
    address,
    tokenId: null,
  };
};

const getLSP7AssetID = async (
  account: `0x${string}`,
  address: `0x${string}`
) => {
  const assetContract = new ethers.Contract(
    address,
    LSP7DigitalAsset.abi,
    _n(JSON_RPC_PROVIDER)
  );

  const balance = await assetContract.balanceOf(account);
  if (!(balance > 0n)) return null;

  return address;
};

const getLSP8Asset = async (
  collection: `0x${string}`,
  id: `0x${string}`,
  name: string,
  idFormat: number,
  baseUri: string | null
): Promise<Asset | null> => {
  try {
    const listing = await getLSP8Listing(collection, id);
    if (collection in collectionHandler) {
      const data = await collectionHandler[collection](id);
      return {
        ...data,
        id: collection + id,
        listing,
        link: createLSP8UniversalPageLink(collection, id),
        address: collection,
        tokenId: id,
      };
    } else {
      const tokenMetadataUrl = await getTokenMetadataUrl(
        collection,
        id,
        idFormat,
        baseUri
      );

      const data = await fetchMetadata(tokenMetadataUrl, name);
      if (!data) return null;
      return {
        ...data,
        id: collection + id,
        listing,
        link: createLSP8UniversalPageLink(collection, id),
        address: collection,
        tokenId: id,
      };
    }
  } catch (e) {
    console.error(
      "FAILED TO GET LSP8 ASSET",
      name,
      collection,
      id,
      idFormat,
      baseUri,
      e.toString()
    );
    throw e;
  }
};

const getLSP8AssetsIDs = async (
  account: `0x${string}`,
  collection: `0x${string}`
): Promise<string[]> => {
  const assetContract = new ethers.Contract(
    collection,
    LSP8IdentifiableDigitalAsset.abi,
    _n(JSON_RPC_PROVIDER)
  );
  const tokenIds = await assetContract.tokenIdsOf(account);

  return tokenIds.map((id: `0x${string}`) => collection + id);
};

export const getAssetIDs = async (
  account: `0x${string}`
): Promise<string[]> => {
  const erc725js = new ERC725(LSP3ProfileSchema, account, _n(RPC_ENDPOINT));

  console.time("FETCHING LSP5ReceivedAssets[]");
  const receivedAssets = await erc725js.getData("LSP5ReceivedAssets[]");
  const assetAddresses = receivedAssets.value as `0x${string}`[];
  console.timeEnd("FETCHING LSP5ReceivedAssets[]");

  return (
    await Promise.all(
      assetAddresses
        .filter(
          (address) => !blacklist.has(address.toLowerCase() as `0x${string}`)
        )
        .map(async (address) => {
          try {
            const assetData = await getAssetData(address);
            if (!assetData) return null;
            const { isLSP7, isLSP8 } = assetData;

            if (isLSP8) {
              // console.time("getLSP8AssetsIDs(" + address + ")");
              const lsp8AssetIDs = await getLSP8AssetsIDs(account, address);
              // console.timeEnd("getLSP8AssetsIDs(" + address + ")");
              return lsp8AssetIDs;
            } else if (isLSP7) {
              // console.time("getLSP7AssetID(" + address + ")");
              const lsp7AssetID = await getLSP7AssetID(account, address);
              // console.timeEnd("getLSP7AssetID(" + address + ")");
              return lsp7AssetID;
            } else {
              return null;
            }
          } catch (e) {
            console.error("getAssetIDs", address, e);
            return null;
          }
        })
    )
  )
    .flatMap((a) => a)
    .filter(Boolean) as string[];
};

const getAssetData = async (address: `0x${string}`) => {
  const lsp4Metadata = new ERC725(
    digitalAssetSchema,
    address,
    _n(RPC_ENDPOINT),
    {
      ipfsGateway: IPFS_GATEWAY,
    }
  );

  const cachedData = await db.cache.get({
    key: address,
  });
  if (cachedData) {
    const formattedData = JSON.parse(cachedData.value);
    if (!formattedData.metadataUrl) return null;
    return formattedData;
  } else {
    const data = await lsp4Metadata.getData([
      "SupportedStandards:LSP4DigitalAsset",
      "LSP4TokenName",
      "LSP8TokenMetadataBaseURI",
      "LSP8TokenIdFormat",
      "LSP4TokenType",
      "LSP4Metadata",
    ]);

    if (data[0].value !== "0xa4d96624") {
      throw new Error(
        `ASSET ${address} IS NOT SUPPORTING THE LSP4DigitalAsset STANDARD`
      );
    }

    const assetContract = new ethers.Contract(
      address,
      LSP4DigitalAssetMetadata.abi,
      _n(JSON_RPC_PROVIDER)
    );

    const isLSP8 = await assetContract.supportsInterface(
      INTERFACE_IDS.LSP8IdentifiableDigitalAsset
    );

    const tokenName = data[1].value as string;
    const baseUri =
      address in collectionHandler || !data[2].value?.url
        ? null
        : ipfsUrl(data[2].value?.url);
    const tokenIdFormat = data[3].value as number;
    const metadataUrl = data[5].value?.url;

    const formattedData = {
      tokenName,
      metadataUrl,
      tokenIdFormat,
      baseUri,
      isLSP7: !isLSP8,
      isLSP8,
    };

    await db.cache.add({ key: address, value: JSON.stringify(formattedData) });

    if (!formattedData.metadataUrl) return null;
    return formattedData;
  }
};

const getTokenMetadataUrl = async (
  address: string,
  tokenId: `0x${string}`,
  idFormat: number,
  baseUri: string | null
) => {
  if (baseUri) {
    return (
      baseUri! + (idFormat === 0 ? parseInt(tokenId) : tokenId.substring(2))
    );
  } else {
    const collectionContract = new ethers.Contract(
      address,
      LSP8IdentifiableDigitalAsset.abi,
      _n(JSON_RPC_PROVIDER)
    );
    const data = await collectionContract.getDataForTokenId(
      tokenId,
      "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e"
    );
    if (!data || data === "0x")
      throw (
        "LSP8 METADATA NOT AVAILABLE FOR " + tokenId + " OF ASSET " + address
      );
    return decodeDataSourceWithHash(data).url;
  }
};

export const getAssetById = async (
  id: string | null
): Promise<Asset | null> => {
  if (!id) return null;

  let address: `0x${string}` | null = null;
  let tokenId: `0x${string}` | null = null;
  if (id.length === 42) {
    // LSP7
    address = id.substring(0, 42) as `0x${string}`;
  } else if (id.length === 108) {
    // LSP8
    address = id.substring(0, 42) as `0x${string}`;
    tokenId = id.substring(42) as `0x${string}`;
  } else {
    console.error(`ASSET WITH ID ${id} IS INVALID`);
    return null;
  }

  try {
    const assetData = await getAssetData(address);
    if (!assetData) return null;
    const { tokenName, tokenIdFormat, baseUri, metadataUrl, isLSP8 } =
      assetData;

    if (isLSP8 && tokenId) {
      // console.time("getLSP8Asset(" + address + ")");
      const lsp8Asset = await getLSP8Asset(
        address,
        tokenId,
        tokenName ?? id,
        tokenIdFormat,
        baseUri
      );
      // console.timeEnd("getLSP8Asset(" + address + ")");
      return lsp8Asset;
    } else {
      // console.time("getLSP7Asset(" + address + ")");
      const lsp7Asset = await getLSP7Asset(address, metadataUrl, tokenName);
      // console.timeEnd("getLSP7Asset(" + address + ")");
      return lsp7Asset;
    }
  } catch (e) {
    console.error("getAssets", address, e);
    throw new Error(`ASSET WITH ID ${id} THREW AN ERROR`, e);
  }
};

const createLSP8UniversalPageLink = (
  collection: `0x${string}`,
  id: `0x${string}`
) => `https://universal.page/collections/lukso/${collection}/${id}`;

const createLSP7UniversalPageLink = (address: `0x${string}`) =>
  `https://universal.page/assets/lukso/${address}`;
