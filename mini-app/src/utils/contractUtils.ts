// Crypto
import { ethers } from "ethers";

// Provider
import {
  IPFS_GATEWAY,
  JSON_RPC_PROVIDER,
  LSP7_LISTINGS,
  LSP7_MARKETPLACE,
  LSP8_LISTINGS,
  LSP8_MARKETPLACE,
} from "../constants";

// Contract
import LSP0ERC725Account from "@lukso/lsp0-contracts/artifacts/LSP0ERC725Account.json";
import LSP8Listings from "../json//LSP8Listings.json";
import LSP8Marketplace from "../json//LSP8Marketplace.json";

import LSP7Listings from "../json//LSP7Listings.json";
import LSP7Marketplace from "../json//LSP7Marketplace.json";

export const LSP8MarketplaceContract = new ethers.Contract(
  LSP8_MARKETPLACE,
  LSP8Marketplace,
  JSON_RPC_PROVIDER
);

export const LSP8ListingsContract = new ethers.Contract(
  LSP8_LISTINGS,
  LSP8Listings,
  JSON_RPC_PROVIDER
);

export const LSP7MarketplaceContract = new ethers.Contract(
  LSP7_MARKETPLACE,
  LSP7Marketplace,
  JSON_RPC_PROVIDER
);

export const LSP7ListingsContract = new ethers.Contract(
  LSP7_LISTINGS,
  LSP7Listings,
  JSON_RPC_PROVIDER
);

export const getProfileContract = (profileContractAddress: `0x${string}`) =>
  new ethers.Contract(
    profileContractAddress,
    LSP0ERC725Account.abi,
    JSON_RPC_PROVIDER
  );

export const ipfsUrl = (url: string) =>
  url.replace(/([^:])\/{2,}/g, "$1/").replace("ipfs://", IPFS_GATEWAY);
