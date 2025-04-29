import { create } from "zustand";
import { combine } from "zustand/middleware";
import { Asset } from "./useAssetsStore";
import { Position, Rotation, WorldAsset } from "./useWorld";

export enum AssetType {
  IMAGE = "IMAGE",
  MODEL = "MODEL",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
}

export type State = {
  asset: Asset | null;
  type: AssetType;
  position: Position | null;
  rotation: Rotation;
  scale: number;
  yRotation: number;
  offset: number;
  attachToBlock: boolean;
};

const DEFAULT_SCALE = 1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 10;

const DEFAULT_STATE = {
  asset: null,
  type: AssetType.IMAGE,
  position: null,
  rotation: [0, 0, 0],
  scale: DEFAULT_SCALE,
  offset: 0,
  yRotation: 0,
  attachToBlock: false,
} as State;

const useCurrentAsset = create(
  combine(DEFAULT_STATE, (set) => ({
    setAsset: (asset: Asset | null, type: AssetType = AssetType.IMAGE) =>
      set((state) => {
        return {
          ...state,
          asset,
          position: null,
          rotation: [0, 0, 0],
          scale: DEFAULT_SCALE,
          yRotation: 0,
          offset: 0,
          attachToBlock: type !== AssetType.MODEL,
          type,
        };
      }),
    setAssetWithWorldAsset: (
      asset: Asset | null,
      worldAsset: WorldAsset,
      yRotation: number = 0
    ) =>
      set((state) => {
        return {
          ...state,
          asset,
          position: worldAsset.position,
          rotation: [0, 0, 0],
          scale: worldAsset.scale,
          yRotation: worldAsset.type === AssetType.MODEL ? yRotation : 0,
          offset: 0,
          attachToBlock: worldAsset.type !== AssetType.MODEL,
          type: worldAsset.type,
        };
      }),
    setPosition: (position: Position | null) =>
      set((state) => {
        if (state.asset === null) return state;
        state.position = position;
        return state;
      }),
    resetOffsetYRotationScale: () =>
      set((state) => {
        return { ...state, scale: DEFAULT_SCALE, yRotation: 0, offset: 0 };
      }),
    incrementScale: () =>
      set((state) => {
        return {
          ...state,
          scale: state.scale >= MAX_SCALE ? MAX_SCALE : state.scale + 0.1,
        };
      }),
    decrementScale: () =>
      set((state) => {
        return {
          ...state,
          scale: state.scale <= MIN_SCALE ? MIN_SCALE : state.scale - 0.1,
        };
      }),
    setAttachToBlock: (attachToBlock: boolean) =>
      set((state) => {
        return { ...state, attachToBlock };
      }),
  }))
);

export const currentAssetNotActive = () => !useCurrentAsset.getState().asset;
export const currentAssetActive = () =>
  Boolean(useCurrentAsset.getState().asset);
export const blockAttachingIsActive = () =>
  useCurrentAsset.getState().attachToBlock;

export default useCurrentAsset;
