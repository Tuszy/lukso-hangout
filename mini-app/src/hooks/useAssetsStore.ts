import { create } from "zustand";
import { combine } from "zustand/middleware";

export type AssetIDs = string[];

export type Asset = {
  id: string;
  name: string;
  images: Image[];
  models: string[];
  audios: string[];
  videos: string[];
  metadata: unknown;
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

const useAssetsStore = create(
  combine(
    {
      initialized: false,
      assetIds: new Set<string>(),
    },
    (set) => ({
      setAssetIds: (assetIds: AssetIDs) =>
        set((state) => ({
          ...state,
          assetIds: new Set<string>(assetIds),
          initialized: true,
        })),
      reset: () =>
        set((state) => ({
          ...state,
          assetIds: new Set<string>(),
          initialized: false,
        })),
    })
  )
);

export default useAssetsStore;
