// React
import { useCallback } from "react";

// Provider
import { useUpProvider } from "../context/UpProvider";

// Ethers
import { getAddress, hashMessage } from "ethers";
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
    if (role === Role.NONE || !upContext.client) {
      return;
    }

    upContext.setIsWaitingForTx(true);
    const address = getAddress(upContext.visitor as `0x${string}`);

    const savePromise = new Promise((resolve, reject) => {
      console.log("Starting to verify the identity...");

      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement:
          "I want to verify my identity so other people in this world can be sure that I am not an impostor.",
        uri: window.location.origin,
        version: "1",
        chainId: lukso.id,
        resources: ["https://lukso-grid-hangout.tuszy.com"],
      }).prepareMessage();
      const hash = hashMessage(siweMessage);
      return upContext.client
        .signMessage({ account: address, message: siweMessage })
        .then((signature: string) => resolve({ address, signature, hash }))
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
