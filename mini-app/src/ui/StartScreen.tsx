import { useEffect } from "react";
import Logo from "../assets/logo.jpg";
import { useUpProvider } from "../context/UpProvider";
import useAssets from "../hooks/useAssets";
import useAssetsStore from "../hooks/useAssetsStore";
import useWorld, { SavedState } from "../hooks/useWorld";
import { loadWorld } from "../utils/erc725";
import { LoadingBackdrop } from "./LoadingBackDrop";

export const StartScreen = ({ onJoin }: { onJoin: () => void }) => {
  const upContext = useUpProvider();
  const initializeWorld = useWorld((state) => state.initialize);
  const done = useAssets(upContext.owner);
  const initialized = useAssetsStore((state) => state.initialized);
  const worldInitialized = useWorld((state) => state.owner !== null);

  useEffect(() => {
    if (!upContext.owner) return;
    const owner = upContext.owner;
    loadWorld(owner).then((world) => {
      console.log("WORLD", world);
      initializeWorld(owner, world as null | SavedState);
    });
  }, [upContext.owner, initializeWorld]);

  const join = () => {
    if (!upContext.owner) return;
    onJoin();
  };

  if (!upContext.owner || !initialized || !worldInitialized || !done) {
    return (
      <LoadingBackdrop background="rgba(0,0,0,0.9)">
        LOADING THE ASSETS
      </LoadingBackdrop>
    );
  }

  return (
    <div className="bg-[#121212] w-screen h-screen flex flex-col items-center justify-center text-white select-none px-8">
      <img
        src={Logo}
        draggable={false}
        className="w-full max-w-md shrink-0 grow-0 aspect-auto"
      />
      <div className="flex-grow flex flex-col items-center justify-start w-full max-w-md">
        <div
          className="w-full bg-white text-black text-center p-4 text-3xl font-bold rounded-3xl cursor-pointer transition-all hover:bg-gray-100 hover:scale-105 active:bg-gray-400 active:scale-95"
          onClick={join}
        >
          JOIN
        </div>
      </div>
    </div>
  );
};
