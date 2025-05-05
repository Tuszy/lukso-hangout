// React
import { useCallback } from "react";

// Provider
import { _n, JSON_RPC_PROVIDER } from "../constants";
import { useUpProvider } from "../context/UpProvider";

// QNA Contract
import LSP0ERC725Account from "@lukso/lsp0-contracts/artifacts/LSP0ERC725Account.json";

// Ethers
import { ethers, TransactionReceipt } from "ethers";

// Toast
import { toast } from "react-toastify";
import useRole, { Role } from "./useRole";
import useWorld, { saveWorld } from "./useWorld";
import { getWorldHash } from "../utils/erc725";

function useSaveWorldFunction() {
  const upContext = useUpProvider();
  const role = useRole((state) => state.role);
  const clearChanges = useWorld((state) => state.clearChanges);

  return useCallback(async () => {
    if (role !== Role.OWNER || !upContext.client) {
      return;
    }

    upContext.setIsWaitingForTx(true);
    const owner = upContext.visitor as `0x${string}`;

    const contract = new ethers.Contract(
      owner,
      LSP0ERC725Account.abi,
      upContext.client
    );

    const savePromise = new Promise((resolve, reject) => {
      console.log("Starting to save the world...");
      saveWorld(owner).then((result) => {
        if (!result) {
          console.log("Failed to save the world in IPFS.");
          reject("Failed to save the world in IPFS.");
        } else {
          return getWorldHash(owner)
            .then((savedWorldHash) => {
              if (savedWorldHash === result.hash) {
                resolve(true);
                clearChanges();
                return true;
              }
              const data: string = contract.interface.encodeFunctionData(
                "setData",
                result.encodedData
              );

              return upContext.client
                .sendTransaction({
                  account: owner,
                  to: owner,
                  data,
                })
                .then((tx: `0x${string}`) => {
                  console.log("TX:", tx);
                  return _n(JSON_RPC_PROVIDER).waitForTransaction(tx);
                })
                .then((receipt: TransactionReceipt) => {
                  console.log("RECEIPT:", receipt);
                  clearChanges();
                  return true;
                })
                .then(resolve)
                .catch((e: unknown) => {
                  console.log("Failed to save the world.");
                  reject(e);
                });
            })
            .catch((e) => {
              console.error(e);
              console.log("Failed to retrieve saved world.");
              reject(e);
            });
        }
      });
    });

    try {
      await toast.promise(
        savePromise,
        {
          pending: "Saving the world...",
          success: "World successfully saved!",
          error: "Failed to save the world!",
        },
        {
          position: "bottom-center",
        }
      );
    } catch (e) {
      console.error(e);
    }

    upContext.setIsWaitingForTx(false);
  }, [upContext, role]);
}

export default useSaveWorldFunction;
