import { AddressLike, ethers } from "ethers";
import { lukso, luksoTestnet } from "viem/chains";

export const IPFS_GATEWAY = "https://ipfs-gateway.tuszy.com/ipfs/";
export const IPFS_PIN_JSON_API = "https://ipfs-pin-json.tuszy.com";
export const SOCKET_IO_URL = "https://lukso-grid-hangout-backend.tuszy.com";

export const _n = <T>(obj: Record<number, T>) =>
  obj[parseInt(window.lukso.chainId as string)];

export const RPC_ENDPOINT: Record<number, string> = {
  [lukso.id]: "https://rpc.mainnet.lukso.network",
  [luksoTestnet.id]: "https://rpc.testnet.lukso.network",
};

export const JSON_RPC_PROVIDER: Record<number, ethers.JsonRpcProvider> = {
  [lukso.id]: new ethers.JsonRpcProvider(RPC_ENDPOINT[lukso.id]),
  [luksoTestnet.id]: new ethers.JsonRpcProvider(RPC_ENDPOINT[luksoTestnet.id]),
};

export const LSP8_MARKETPLACE: Record<number, AddressLike> = {
  [lukso.id]: "0x6807c995602eaf523a95a6b97acc4da0d3894655",
  [luksoTestnet.id]: "0x6364738eb197115aece87591dff51d554535d1f8",
};

export const LSP8_LISTINGS: Record<number, AddressLike> = {
  [lukso.id]: "0x4faab47b234c7f5da411429ee86cb15cb0754354",
  [luksoTestnet.id]: "0x1dabeddbc94847b4ca9027073e545f67917a84f6",
};

export const LSP7_MARKETPLACE: Record<number, AddressLike> = {
  [lukso.id]: "0xe04cf97440cd191096c4103f9c48abd96184fb8d",
  [luksoTestnet.id]: "0x61c3dd3476a88de7a2bae7e2bc55889185faea1e",
};

export const LSP7_LISTINGS: Record<number, AddressLike> = {
  [lukso.id]: "0xe7f5c709d62bcc3701f4c0cb871eb77e301283b5",
  [luksoTestnet.id]: "0xf3a20e7bc566940ed1e707c6d7d05497cf6527f1",
};
