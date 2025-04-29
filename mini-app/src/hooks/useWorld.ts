import { create } from "zustand";
import { combine } from "zustand/middleware";
import { IPFS_PIN_JSON_API } from "../constants";
import { encodeWorldData } from "../utils/erc725";
import { AssetType } from "./useCurrentAsset";
import { prefetchAsset } from "./useAsset";

export type Slots = {
  1: number | null;
  2: number | null;
  3: number | null;
  4: number | null;
  5: number | null;
  6: number | null;
  7: number | null;
  8: number | null;
  9: number | null;
};

export type CurrentSlot = keyof Slots;

export type Position = [x: number, y: number, z: number];
export type Rotation = [x: number, y: number, z: number];
export type Quaternion = [x: number, y: number, z: number, w: number];

export type Block = {
  id: string;
  p: Position;
  t: number;
};

export type WorldAsset = {
  id: string;
  type: AssetType;
  position: Position;
  rotation: Rotation;
  scale: number;
};

export type WorldAssetMap = Record<string, WorldAsset>;
export type BoughtAssetMap = Record<string, boolean>;
export type BlockMap = Record<string, Block>;
export type ChangeSet = Set<string>;
export const SPAWNPOINT_CHANGE_ID = "SPAWNPOINT";

export type SpawnPoint = {
  position: Position;
  rotation: Quaternion;
};

export enum ChangeType {
  ADD,
  REMOVE,
  CHANGE,
}

export enum ChangeTarget {
  BLOCK = "blocks",
  ASSET = "assets",
  SPAWNPOINT = "spawnPoint",
}

export type Change = {
  id: string;
  type: ChangeType;
  target: ChangeTarget;
};

export type State = {
  slots: Slots;
  currentSlot: CurrentSlot;
  spawnPoint: SpawnPoint;
  blocks: BlockMap;
  assets: WorldAssetMap;
  boughtAssets: BoughtAssetMap;
  owner: `0x${string}` | null;
  lastBlockAction: Change | null;
  hoveredAsset: string | null;
  hoveredPeer: string | null;
  changes: ChangeSet;
  initData: SavedState | null;
};

export type SavedState = {
  owner: `0x${string}` | null;
  spawnPoint: SpawnPoint;
  blocks: BlockMap;
  assets: WorldAssetMap;
};

// const LOCAL_STORAGE_KEY = "CACHED_WORLD";

const DEFAULT_STATE = {
  slots: {
    1: 0,
    2: 1,
    3: 9,
    4: 21,
    5: 14,
    6: 15,
    7: 16,
    8: 17,
    9: 18,
  } as Slots,
  currentSlot: 1 as CurrentSlot,
  boughtAssets: {} as BoughtAssetMap,
  spawnPoint: {
    position: [0, 0.99, 0],
    rotation: [0, 0, 0, 1],
  },
  blocks: {} as BlockMap,
  assets: {} as WorldAssetMap,
  owner: null,
  lastBlockAction: null,
  hoveredAsset: null,
  hoveredPeer: null,
  changes: new Set<string>(),
  initData: null,
} as State;

export const getPositionKey = (p: Position) => `${p[0]}:${p[1]}:${p[2]}`;

const isEqual = (arr1: number[], arr2: number[]) =>
  arr1.every((value, index) => value === arr2[index]);
const isSpawnPointEqual = (a: SpawnPoint | null, b: SpawnPoint | null) =>
  (!a && !b) ||
  (!!a &&
    !!b &&
    isEqual(a.position, b.position) &&
    isEqual(a.rotation, b.rotation));
const isBlockEqual = (a: Block | null, b: Block | null) =>
  (!a && !b) ||
  (!!a && !!b && a.id === b.id && a.t === b.t && isEqual(a.p, b.p));
const isWorldAssetEqual = (a: WorldAsset | null, b: WorldAsset | null) =>
  (!a && !b) ||
  (!!a &&
    !!b &&
    a.id === b.id &&
    a.type === b.type &&
    a.scale === b.scale &&
    isEqual(a.position, b.position) &&
    isEqual(a.rotation, b.rotation));

const addChange = (state: State, change: Change) => {
  if (state.initData) {
    if (change.target === ChangeTarget.ASSET) {
      if (
        isWorldAssetEqual(
          state.initData.assets[change.id],
          state.assets[change.id]
        )
      ) {
        state.changes.delete(change.id);
      } else {
        state.changes.add(change.id);
      }
    } else if (change.target === ChangeTarget.BLOCK) {
      if (
        isBlockEqual(state.initData.blocks[change.id], state.blocks[change.id])
      ) {
        state.changes.delete(change.id);
      } else {
        state.changes.add(change.id);
      }
    } else if (change.target === ChangeTarget.SPAWNPOINT) {
      if (isSpawnPointEqual(state.initData.spawnPoint, state.spawnPoint)) {
        state.changes.delete(change.id);
      } else {
        state.changes.add(change.id);
      }
    }
  } else {
    if (change.type === ChangeType.ADD || change.type === ChangeType.CHANGE) {
      state.changes.add(change.id);
    } else if (change.type === ChangeType.REMOVE) {
      state.changes.delete(change.id);
    }
  }
  return state.changes;
};

const useWorld = create(
  combine(DEFAULT_STATE, (set) => ({
    initialize: (owner: `0x${string}`, initData: null | SavedState) =>
      set((state) => {
        if (state.owner === owner) return state;
        let newState = { ...state, owner, changes: new Set<string>() };
        if (initData !== null) {
          for (const assetId of Object.keys(initData.assets)) {
            prefetchAsset(assetId);
          }
          newState = {
            ...newState,
            ...initData,
            initData,
            owner,
            changes: new Set<string>(),
          };
        }
        return newState;
      }),
    addBlock: (p: [x: number, y: number, z: number]) =>
      set((state) => {
        if (state.slots[state.currentSlot] === null) return state;

        const id = getPositionKey(p);
        const change = {
          type: ChangeType.ADD,
          target: ChangeTarget.BLOCK,
          id,
        } as Change;
        const newState = {
          ...state,
          lastBlockAction: change,
          blocks: {
            ...state.blocks,
            [id]: {
              id,
              t: state.slots[state.currentSlot]!,
              p,
            },
          },
        };
        addChange(newState, change);
        //localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      }),
    removeBlock: (p: [x: number, y: number, z: number]) =>
      set((state) => {
        const newBlocks = {
          ...state.blocks,
        };
        const id = getPositionKey(p);
        delete newBlocks[id];
        const change = {
          type: ChangeType.REMOVE,
          target: ChangeTarget.BLOCK,
          id,
        } as Change;
        const newState = {
          ...state,
          blocks: newBlocks,
          lastBlockAction: change,
        };
        addChange(newState, change);
        //localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      }),
    setCurrentSlot: (slot: CurrentSlot) =>
      set((state) => {
        return { ...state, currentSlot: slot };
      }),
    setSpawnPoint: (spawnPoint: SpawnPoint) =>
      set((state) => {
        const change = {
          type: ChangeType.CHANGE,
          id: SPAWNPOINT_CHANGE_ID,
          target: ChangeTarget.SPAWNPOINT,
        } as Change;
        const newState = {
          ...state,
          spawnPoint,
        };
        addChange(newState, change);
        //localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      }),
    incrementCurrentSlot: () =>
      set((state) => {
        return {
          ...state,
          currentSlot: (state.currentSlot === 9
            ? 1
            : state.currentSlot + 1) as CurrentSlot,
        };
      }),
    decrementCurrentSlot: () =>
      set((state) => {
        return {
          ...state,
          currentSlot: (state.currentSlot === 1
            ? 9
            : state.currentSlot - 1) as CurrentSlot,
        };
      }),
    assignBlockTypeIndexToSlot: (slot: CurrentSlot, blockTypeIndex: number) =>
      set((state) => {
        return {
          ...state,
          slots: { ...state.slots, [slot]: blockTypeIndex },
        };
      }),
    setHoveredAsset: (hoveredAsset: string | null) =>
      set((state) => {
        return { ...state, hoveredAsset };
      }),
    addHoveredPeer: (hoveredPeer: string) =>
      set((state) => {
        return { ...state, hoveredPeer };
      }),
    removeHoveredPeer: (hoveredPeer: string) =>
      set((state) => {
        if (state.hoveredPeer !== hoveredPeer) return state;
        return { ...state, hoveredPeer: null };
      }),
    clearHoveredPeer: () =>
      set((state) => {
        if (!state.hoveredPeer) return state;
        return { ...state, hoveredPeer: null };
      }),
    addAsset: (worldAsset: WorldAsset) =>
      set((state) => {
        const change = {
          type: ChangeType.ADD,
          id: worldAsset.id,
          target: ChangeTarget.ASSET,
        } as Change;
        const newState = {
          ...state,
          assets: {
            ...state.assets,
            [worldAsset.id]: worldAsset,
          },
        };
        addChange(newState, change);
        //localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      }),
    removeAsset: (worldAssetId: string) =>
      set((state) => {
        const newAssets = {
          ...state.assets,
        };
        delete newAssets[worldAssetId];
        const change = {
          type: ChangeType.REMOVE,
          id: worldAssetId,
          target: ChangeTarget.ASSET,
        } as Change;
        const newState = {
          ...state,
          assets: newAssets,
        };
        addChange(newState, change);
        //localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      }),
    addBoughtAsset: (id: string) =>
      set((state) => {
        const newState = {
          ...state,
          boughtAssets: {
            ...state.boughtAssets,
            [id]: true,
          },
        };
        return newState;
      }),
    addBoughtAssetById: (worldAssetId: string) =>
      set((state) => {
        const newState = {
          ...state,
          boughtAssets: {
            ...state.boughtAssets,
            [worldAssetId]: true,
          },
        };
        return newState;
      }),
    clearChanges: () =>
      set((state) => {
        return {
          ...state,
          changes: new Set<string>(),
        };
      }),
  }))
);

export const saveWorld = async (owner: `0x${string}`) => {
  const { blocks, assets, spawnPoint } = useWorld.getState();
  return fetch(IPFS_PIN_JSON_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      owner,
      blocks,
      assets,
      spawnPoint,
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      const encodedData = encodeWorldData(json.ipfsUrl, json.data);
      return {
        ...json,
        encodedData,
      };
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
};

export const hasUnsavedChanges = () => useWorld.getState().changes.size > 0;
export const hasNoUnsavedChanges = () => useWorld.getState().changes.size === 0;

export const isHoveredAsset = (assetId: string | null | undefined) =>
  assetId && useWorld.getState().hoveredAsset === assetId;

export const isHoveredPeer = (peerId: string | null | undefined) =>
  peerId && useWorld.getState().hoveredPeer === peerId;

export const isBought = (assetId: string) =>
  useWorld.getState().boughtAssets[assetId];

export default useWorld;
