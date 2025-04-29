import ERC725 from "@erc725/erc725.js";
import { RPC_ENDPOINT } from "../constants";

const IPFS_GATEWAY = "https://ipfs.tuszy.com/ipfs/";
const ERC725Y_HANGOUT_WORLD_KEY = "Hangout:World";

const schemas = [
  {
    name: ERC725Y_HANGOUT_WORLD_KEY,
    key: "0x81b454b80b4472b90cf90000f2208c967df089f60420785795c0a9ba8896b0f6",
    keyType: "Mapping",
    valueType: "bytes",
    valueContent: "VerifiableURI",
  },
];

const myErc725 = new ERC725(schemas);

export const encodeWorldData = (url: string, data: object) => {
  const encodedData = myErc725.encodeData([
    {
      keyName: ERC725Y_HANGOUT_WORLD_KEY,
      value: {
        json: data,
        url,
      },
    },
  ]);

  return [encodedData.keys[0], encodedData.values[0]];
};

export const loadWorld = async (address: `0x${string}`) => {
  const erc725 = new ERC725(schemas, address, RPC_ENDPOINT, {
    ipfsGateway: IPFS_GATEWAY,
  });

  return await erc725
    .fetchData(ERC725Y_HANGOUT_WORLD_KEY)
    .then((data) => data.value)
    .catch(() => null);
};

export const getWorldHash = async (address: `0x${string}`) => {
  const erc725 = new ERC725(schemas, address, RPC_ENDPOINT, {
    ipfsGateway: IPFS_GATEWAY,
  });

  return await erc725
    .getData(ERC725Y_HANGOUT_WORLD_KEY)
    .then((data) => data.value?.verification?.data ?? null)
    .catch(() => null);
};
