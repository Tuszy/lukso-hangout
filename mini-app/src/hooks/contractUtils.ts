// Crypto
import { ethers } from "ethers";
import { lukso, luksoTestnet } from "viem/chains";

// Provider
import {
  _n,
  IPFS_GATEWAY,
  JSON_RPC_PROVIDER,
  LSP7_LISTINGS,
  LSP7_MARKETPLACE,
  LSP8_LISTINGS,
  LSP8_MARKETPLACE,
} from "../constants";

// Contract
import LSP0ERC725Account from "@lukso/lsp0-contracts/artifacts/LSP0ERC725Account.json";
import LSP8Listings from "../json/LSP8Listings.json";
import LSP8Marketplace from "../json/LSP8Marketplace.json";

import LSP7Listings from "../json/LSP7Listings.json";
import LSP7Marketplace from "../json/LSP7Marketplace.json";

export const LSP8MarketplaceContract: Record<number, ethers.Contract> = {
  [lukso.id]: new ethers.Contract(
    LSP8_MARKETPLACE[lukso.id] as string,
    LSP8Marketplace,
    JSON_RPC_PROVIDER[lukso.id]
  ),
  [luksoTestnet.id]: new ethers.Contract(
    LSP8_MARKETPLACE[luksoTestnet.id] as string,
    LSP8Marketplace,
    JSON_RPC_PROVIDER[luksoTestnet.id]
  ),
};

export const LSP8ListingsContract: Record<number, ethers.Contract> = {
  [lukso.id]: new ethers.Contract(
    LSP8_LISTINGS[lukso.id] as string,
    LSP8Listings,
    JSON_RPC_PROVIDER[lukso.id]
  ),
  [luksoTestnet.id]: new ethers.Contract(
    LSP8_LISTINGS[luksoTestnet.id] as string,
    LSP8Listings,
    JSON_RPC_PROVIDER[luksoTestnet.id]
  ),
};

export const LSP7MarketplaceContract: Record<number, ethers.Contract> = {
  [lukso.id]: new ethers.Contract(
    LSP7_MARKETPLACE[lukso.id] as string,
    LSP7Marketplace,
    JSON_RPC_PROVIDER[lukso.id]
  ),
  [luksoTestnet.id]: new ethers.Contract(
    LSP7_MARKETPLACE[luksoTestnet.id] as string,
    LSP7Marketplace,
    JSON_RPC_PROVIDER[luksoTestnet.id]
  ),
};

export const LSP7ListingsContract: Record<number, ethers.Contract> = {
  [lukso.id]: new ethers.Contract(
    LSP7_LISTINGS[lukso.id] as string,
    LSP7Listings,
    JSON_RPC_PROVIDER[lukso.id]
  ),
  [luksoTestnet.id]: new ethers.Contract(
    LSP7_LISTINGS[luksoTestnet.id] as string,
    LSP7Listings,
    JSON_RPC_PROVIDER[luksoTestnet.id]
  ),
};

export const getProfileContract = (profileContractAddress: `0x${string}`) =>
  new ethers.Contract(
    profileContractAddress,
    LSP0ERC725Account.abi,
    _n(JSON_RPC_PROVIDER)
  );

export const ipfsUrl = (url: string) =>
  url.replace(/([^:])\/{2,}/g, "$1/").replace("ipfs://", IPFS_GATEWAY);
