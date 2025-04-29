import { ethers } from "ethers";

export const IPFS_GATEWAY = "https://ipfs-gateway.tuszy.com/ipfs/";
export const IPFS_PIN_JSON_API = "https://ipfs-pin-json.tuszy.com";
export const RPC_ENDPOINT = "https://rpc.mainnet.lukso.network";
export const SOCKET_IO_URL = "https://lukso-grid-hangout-backend.tuszy.com";

export const JSON_RPC_PROVIDER = new ethers.JsonRpcProvider(RPC_ENDPOINT);

export const LSP8_MARKETPLACE: `0x${string}` =
  "0x6807c995602eaf523a95a6b97acc4da0d3894655";

export const LSP8_LISTINGS: `0x${string}` =
  "0x4faab47b234c7f5da411429ee86cb15cb0754354";

export const LSP7_MARKETPLACE: `0x${string}` =
  "0xe04cf97440cd191096c4103f9c48abd96184fb8d";

export const LSP7_LISTINGS: `0x${string}` =
  "0xe7f5c709d62bcc3701f4c0cb871eb77e301283b5";
