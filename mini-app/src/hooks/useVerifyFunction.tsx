// React
import { useCallback } from "react";

// Provider
import { useUpProvider } from "../context/UpProvider";

// Ethers
import { getAddress } from "ethers";
import { SiweMessage } from "siwe";
import { lukso } from "viem/chains";
// Toast
import { toast } from "react-toastify";
import useRole, { Role } from "./useRole";
import { useServerConnection } from "./useServerConnection";

function useVerifyFunction() {
  const upContext = useUpProvider();
  const role = useRole((state) => state.role);

  return useCallback(async () => {
    const socketId = useServerConnection.getState().socket?.id;
    if (role === Role.NONE || !socketId || !upContext.client) {
      return;
    }

    upContext.setIsWaitingForTx(true);
    const address = getAddress(upContext.visitor as `0x${string}`);

    const savePromise = new Promise((resolve, reject) => {
      console.log("Starting to verify the identity...");
      const nonce = socketId.replace(/[^a-zA-Z0-9]/g, "");
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement:
          "I want to verify my identity so other people in this world can be sure that I am not an impostor.",
        uri: window.location.origin,
        version: "1",
        chainId: upContext.chainId,
        resources: ["https://lukso-grid-hangout.tuszy.com"],
        nonce,
      }).prepareMessage();
      return upContext.client
        .signMessage({ account: address, message })
        .then((signature: string) => resolve({ signature, message }))
        .catch((e: unknown) => {
          console.log("Failed to verify your identity.");
          reject(e);
        });
    });

    try {
      const data = await toast.promise(
        savePromise,
        {
          pending: "Verifying your identity...",
          success: "Identity successfully verified!",
          error: "Failed to verify your identity!",
        },
        {
          position: "bottom-center",
        }
      );

      console.log("VERIFICATION", data);
      useServerConnection.getState().socket?.emit("verify", data);
    } catch (e) {
      console.error(e);
    }

    upContext.setIsWaitingForTx(false);
  }, [upContext, role]);
}

export default useVerifyFunction;
