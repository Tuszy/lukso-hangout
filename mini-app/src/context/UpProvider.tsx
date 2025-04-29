/**
 * @component UpProvider
 * @description Context provider that manages Universal Profile (UP) wallet connections and state
 * for LUKSO blockchain interactions on Grid. It handles wallet connection status, account management, and chain
 * information while providing real-time updates through event listeners.
 *
 * @provides {UpProviderContext} Context containing:
 * - provider: UP-specific wallet provider instance
 * - client: Viem wallet client for blockchain interactions
 * - chainId: Current blockchain network ID
 * - accounts: Array of connected wallet addresses
 * - contextAccounts: Array of Universal Profile accounts
 */
"use client";

import { createClientUPProvider } from "@lukso/up-provider";
import { createWalletClient, custom } from "viem";
import { lukso } from "viem/chains";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import useUiState, { UiMode } from "../hooks/useUiState";
import useRole, { Role } from "../hooks/useRole";
import useWalletStore from "../hooks/useWalletStore";

interface UpProviderContext {
  provider: any;
  client: any;
  chainId: number;
  accounts: Array<`0x${string}`>;
  contextAccounts: Array<`0x${string}`>;
  isWaitingForTx: boolean;
  setIsWaitingForTx: (waiting: boolean) => void;
  isConnected: boolean;
  visitor: `0x${string}` | null;
  owner: `0x${string}` | null;
}

export const UpContext = createContext<UpProviderContext | undefined>(
  undefined
);

export function useUpProvider() {
  const context = useContext(UpContext);
  if (!context) {
    throw new Error("useUpProvider must be used within a UpProvider");
  }
  return context;
}

interface UpProviderProps {
  children: ReactNode;
}

const provider = createClientUPProvider();
const client = createWalletClient({
  chain: lukso,
  transport: custom(provider),
});

export function UpProvider({ children }: UpProviderProps) {
  const setWallet = useWalletStore((state) => state.setWallet);
  const setMode = useUiState((state) => state.setMode);
  const setRole = useRole((state) => state.setRole);
  const [isWaitingForTx, setIsWaitingForTx] = useState<boolean>(false);

  const [chainId, setChainId] = useState<number>(lukso.id);
  const [accounts, setAccounts] = useState<Array<`0x${string}`>>([]);
  const [contextAccounts, setContextAccounts] = useState<Array<`0x${string}`>>(
    []
  );

  const visitor = accounts[0] ?? null;
  const owner = contextAccounts[0] ?? null;

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        if (!client || !provider) return;

        const _chainId = (await client.getChainId()) as number;
        if (!mounted) return;
        setChainId(_chainId);

        const _accounts = (await client.getAddresses()) as Array<`0x${string}`>;
        if (!mounted) return;
        setAccounts(_accounts);

        const _contextAccounts = provider.contextAccounts;
        if (!mounted) return;
        setContextAccounts(_contextAccounts);

        setWallet(_accounts.length > 0 ? _accounts[0] : null);
      } catch (error) {
        console.error(error);
      }
    }

    init();

    if (provider) {
      const accountsChanged = (_accounts: Array<`0x${string}`>) => {
        setAccounts(_accounts);
        setWallet(_accounts.length > 0 ? _accounts[0] : null);
      };

      const contextAccountsChanged = (_accounts: Array<`0x${string}`>) => {
        setContextAccounts(_accounts);
      };

      const chainChanged = (_chainId: number) => {
        setChainId(_chainId);
      };

      provider.on("accountsChanged", accountsChanged);
      provider.on("chainChanged", chainChanged);
      provider.on("contextAccountsChanged", contextAccountsChanged);

      return () => {
        mounted = false;
        provider.removeListener("accountsChanged", accountsChanged);
        provider.removeListener(
          "contextAccountsChanged",
          contextAccountsChanged
        );
        provider.removeListener("chainChanged", chainChanged);
      };
    }
  }, []);

  const isConnected = accounts.length > 0 && contextAccounts.length > 0;

  const isOwner = isConnected && owner.toUpperCase() === visitor.toUpperCase();

  const isVisitor =
    isConnected && owner.toUpperCase() !== visitor.toUpperCase();

  useEffect(() => {
    if (!isOwner) {
      setMode(UiMode.VISITOR);
    }
    if (isOwner) {
      setRole(Role.OWNER);
    } else if (isVisitor) {
      setRole(Role.VISITOR);
    } else {
      setRole(Role.NONE);
    }
  }, [setMode, setRole, isOwner, isVisitor]);

  return (
    <UpContext.Provider
      value={{
        provider,
        client,
        chainId,
        accounts,
        contextAccounts,
        isWaitingForTx,
        setIsWaitingForTx,
        visitor,
        owner,
        isConnected,
      }}
    >
      <div className="min-h-screen flex flex-col items-center justify-start bg-gray-200">
        {children}
      </div>
    </UpContext.Provider>
  );
}
