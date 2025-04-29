import { create } from "zustand";
import { combine } from "zustand/middleware";

export enum UiState {
  PAUSE,
  IMMERSED,
  INVENTORY,
  NFT,
}

export enum UiMode {
  VISITOR,
  BUILDER,
}

const useUiState = create(
  combine(
    {
      ui: UiState.PAUSE,
      mode: UiMode.VISITOR,
    },
    (set) => ({
      setUiState: (ui: UiState) =>
        set((state) => {
          if (
            state.ui === ui &&
            (ui === UiState.IMMERSED ||
              ui === UiState.INVENTORY ||
              ui === UiState.NFT)
          ) {
            return { ...state, ui: UiState.IMMERSED };
          } else if (
            (ui === UiState.PAUSE &&
              (state.ui === UiState.INVENTORY || state.ui === UiState.NFT)) ||
            (state.ui === UiState.PAUSE &&
              (ui === UiState.INVENTORY || ui === UiState.NFT))
          ) {
            return state;
          }

          return { ...state, ui };
        }),
      setMode: (mode: UiMode) =>
        set((state) => {
          if (state.mode === mode) return state;
          return { ...state, mode };
        }),
      toggleMode: () =>
        set((state) => {
          return {
            ...state,
            mode:
              state.mode !== UiMode.VISITOR ? UiMode.VISITOR : UiMode.BUILDER,
          };
        }),
    })
  )
);

export const isBuilderMode = () =>
  useUiState.getState().mode === UiMode.BUILDER;
export const isVisitorMode = () =>
  useUiState.getState().mode === UiMode.VISITOR;

export const isImmersed = () => useUiState.getState().ui === UiState.IMMERSED;
export const isNotImmersed = () =>
  useUiState.getState().ui !== UiState.IMMERSED;
export const isPaused = () => useUiState.getState().ui === UiState.PAUSE;
export const isNotPaused = () => useUiState.getState().ui !== UiState.PAUSE;
export const hasOpenedBlockInventory = () =>
  useUiState.getState().ui === UiState.INVENTORY;
export const hasClosedBlockInventory = () =>
  useUiState.getState().ui !== UiState.INVENTORY;
export const hasOpenedNFTInventory = () =>
  useUiState.getState().ui === UiState.NFT;
export const hasClosedNFTInventory = () =>
  useUiState.getState().ui !== UiState.NFT;
export const hasOpenedInventory = () =>
  hasOpenedBlockInventory() || hasOpenedNFTInventory();
export const hasClosedInventory = () =>
  hasClosedBlockInventory() && hasClosedNFTInventory();

export default useUiState;
