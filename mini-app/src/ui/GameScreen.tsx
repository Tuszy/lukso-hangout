import { Suspense } from "react";
import { LoadingBackdrop } from "./LoadingBackDrop";

import { useUpProvider } from "../context/UpProvider";
import useUiState, { UiMode, UiState } from "../hooks/useUiState";
import useRole, { Role } from "../hooks/useRole";
import CurrentMode from "./CurrentMode";
import UnsavedChanges from "./UnsavedChanges";
import { CrossHair } from "./CrossHair";
import AssetToPlacePreview from "./AssetToPlacePreview";
import Slots from "./Slots";
import BlockInventory from "./BlockInventory";
import NftInventory from "./NftInventory";
import BuilderControls from "./BuilderControls";
import HoveredAssetPreview from "./HoveredAssetPreview";
import HoveredPeerPreview from "./HoveredPeerPreview";
import VisitorControls from "./VisitorControls";
import { Bounce, ToastContainer } from "react-toastify";
import VideoPreview from "./VideoPreview";
import Scene from "../objects/Scene";
import { SocketProvider } from "../context/SocketProvider";

export const GameScreen = () => {
  const upContext = useUpProvider();
  const ui = useUiState((state) => state.ui);
  const mode = useUiState((state) => state.mode);
  const role = useRole((state) => state.role);

  return (
    <SocketProvider>
      <Suspense
        fallback={
          <LoadingBackdrop background="rgba(0,0,0,0.9)">
            GENERATING THE WORLD
          </LoadingBackdrop>
        }
      >
        <Scene />
        {!upContext.isWaitingForTx && (
          <>
            {ui !== UiState.PAUSE && <CurrentMode />}

            {(ui === UiState.PAUSE || ui === UiState.IMMERSED) &&
              role === Role.OWNER && <UnsavedChanges />}

            {ui === UiState.IMMERSED && (
              <>
                <CrossHair />
              </>
            )}

            {mode === UiMode.BUILDER && (
              <>
                {ui === UiState.IMMERSED && <AssetToPlacePreview />}
                {(ui === UiState.IMMERSED || ui === UiState.INVENTORY) && (
                  <Slots />
                )}
                {ui === UiState.INVENTORY && <BlockInventory />}
                {ui === UiState.NFT && <NftInventory />}

                <BuilderControls />
              </>
            )}
            {mode === UiMode.VISITOR && (
              <>
                {ui === UiState.IMMERSED && <HoveredAssetPreview />}
                {ui === UiState.IMMERSED && <HoveredPeerPreview />}
                <VisitorControls />
              </>
            )}

            {ui === UiState.PAUSE && (
              <div className="fixed top-0 p-2 text-white text-5xl left-0 right-0 bg-[rgba(0,0,0,0.65)] z-10 grid place-content-center transition-all select-none backdrop-blur-md">
                CLICK TO ENTER THE WORLD
              </div>
            )}
          </>
        )}
      </Suspense>
      {upContext.isWaitingForTx && <LoadingBackdrop />}

      <VideoPreview />

      <ToastContainer
        className={"z-50 text-xl font-bold"}
        closeButton={false}
        closeOnClick={false}
        autoClose={3000}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        theme="colored"
        transition={Bounce}
        draggable={false}
      />
    </SocketProvider>
  );
};
