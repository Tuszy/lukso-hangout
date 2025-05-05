import { ethers } from "ethers";
import BurntPixFractalABI from "../json/BurntPixFractal.json";
import { _n, JSON_RPC_PROVIDER } from "../constants";
import { Image } from "./assets";

const getAddressFromBytes32 = (bytes32: `0x${string}`) =>
  ethers.AbiCoder.defaultAbiCoder().decode(
    ["address"],
    bytes32
  )[0] as `0x${string}`;

const burntPixHandler = async (id: `0x${string}`) => {
  const fractal = new ethers.Contract(
    getAddressFromBytes32(id),
    BurntPixFractalABI,
    _n(JSON_RPC_PROVIDER)
  );
  const svg = await fractal.image();
  const img = new Blob([svg], { type: "image/svg+xml" });

  return {
    name: "Burnt Pix",
    images: [{ width: 2048, height: 2048, url: URL.createObjectURL(img) }],
    models: [],
    audios: [],
    videos: [],
    metadata: null,
  };
};

export const collectionHandler: Record<
  `0x${string}`,
  (id: `0x${string}`) => Promise<{
    name: string;
    images: Image[];
    models: string[];
    audios: string[];
    videos: string[];
    metadata: unknown;
  }>
> = {
  "0x3983151E0442906000DAb83c8b1cF3f2D2535F82": burntPixHandler,
};
