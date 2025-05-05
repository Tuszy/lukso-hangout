import { create } from "zustand";
import { combine } from "zustand/middleware";
import { _n, JSON_RPC_PROVIDER } from "../constants";

type WalletState = {
  wallet: `0x${string}` | null;
  balance: bigint;
};

const useWalletStore = create(
  combine(
    {
      wallet: null,
      balance: 0n,
    } as WalletState,
    (set) => ({
      setWallet: (wallet: `0x${string}` | null) =>
        set((state) => {
          if (wallet) {
            _n(JSON_RPC_PROVIDER)
              .getBalance(wallet)
              .then(useWalletStore.getState().setWalletBalance);
          }
          return { ...state, wallet, balance: 0n };
        }),
      updateWalletBalance: () =>
        set((state) => {
          if (state.wallet) {
            _n(JSON_RPC_PROVIDER)
              .getBalance(state.wallet)
              .then(useWalletStore.getState().setWalletBalance);
          }
          return state;
        }),
      setWalletBalance: (balance: bigint) =>
        set((state) => {
          return { ...state, balance };
        }),
    })
  )
);

export default useWalletStore;
