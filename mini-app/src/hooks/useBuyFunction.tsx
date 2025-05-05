// React
import { useCallback } from "react";

// Provider
import { useUpProvider } from "../context/UpProvider";

// Hooks
import { ethers, TransactionReceipt } from "ethers";

// Constants
import { _n, JSON_RPC_PROVIDER, LSP8_MARKETPLACE } from "../constants";

// ABI
import LSP8MarketplaceABI from "../json/LSP8Marketplace.json";
import { LSP8Listing } from "./useAssetsStore";

// Toast
import { toast } from "react-toastify";
import { isNotVisitor } from "./useRole";

function useBuyFunction() {
  const upContext = useUpProvider();

  return useCallback(
    async (listing: LSP8Listing): Promise<boolean> => {
      const buyer = upContext.visitor as `0x${string}`;
      if (isNotVisitor() || !upContext.client) {
        return false;
      }

      upContext.setIsWaitingForTx(true);

      const contract = new ethers.Contract(
        _n(LSP8_MARKETPLACE) as string,
        LSP8MarketplaceABI,
        upContext.client
      );

      const data: string = contract.interface.encodeFunctionData("buy", [
        listing.id,
        buyer,
      ]);

      const buyPromise = new Promise((resolve, reject) => {
        console.log("Starting to buy NFT...");
        upContext.client
          .sendTransaction({
            account: buyer,
            to: _n(LSP8_MARKETPLACE),
            value: listing.price,
            data,
          })
          .then((tx: `0x${string}`) => {
            console.log("TX:", tx);
            return _n(JSON_RPC_PROVIDER).waitForTransaction(tx);
          })
          .then((receipt: TransactionReceipt) => {
            console.log("RECEIPT:", receipt);
            return true;
          })
          .then(resolve)
          .catch((e: unknown) => {
            console.log("Failed to buy the nft.");
            reject(e);
          });
      });

      try {
        await toast.promise(
          buyPromise,
          {
            pending: "Buying NFT...",
            success: "NFT successfully bought!",
            error: "Failed to buy the NFT!",
          },
          {
            position: "bottom-center",
          }
        );
        upContext.setIsWaitingForTx(false);
        return true;
      } catch (e) {
        console.error(e);
        upContext.setIsWaitingForTx(false);
        return false;
      }
    },
    [upContext]
  );
}

export default useBuyFunction;
