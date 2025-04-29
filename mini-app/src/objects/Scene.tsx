// React
import { RefAttributes, useCallback, useEffect, useRef } from "react";
import * as React from "react";

// Provider
import { useUpProvider } from "../context/UpProvider";

// 3D
import { Canvas } from "@react-three/fiber";
import {
  PointerLockControls,
  KeyboardControls,
  PointerLockControlsProps,
  Sky,
  Stats,
  Preload,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Player } from "./Player";
import { Ground } from "./Ground";
import useUiState, {
  isNotImmersed,
  isNotPaused,
  isVisitorMode,
  UiState,
} from "../hooks/useUiState";
import useCurrentAsset, { currentAssetActive } from "../hooks/useCurrentAsset";
import AssetToPlace from "./AssetToPlace";
import { Assets } from "./Assets";
import { SpawnPoint } from "./SpawnPoint";
import { isNotOwner } from "../hooks/useRole";
import { Peers } from "./Peers";
import { Cursor } from "./Cursor";
import { InstancedBlocks } from "./InstancedBlocks";

enum Controls {
  forward = "forward",
  backward = "backward",
  left = "left",
  right = "right",
  jump = "jump",
  sprint = "sprint",
}

const map = [
  { name: Controls.forward, keys: ["KeyW"] },
  { name: Controls.backward, keys: ["KeyS"] },
  { name: Controls.left, keys: ["KeyA"] },
  { name: Controls.right, keys: ["KeyD"] },
  { name: Controls.jump, keys: ["Space"] },
  { name: Controls.sprint, keys: ["Shift"] },
];

const debug = localStorage.getItem("debug");

function Scene() {
  const pointerLockRef = useRef() as React.MutableRefObject<
    // @ts-expect-error ref type
    IntrinsicAttributes &
      Omit<PointerLockControlsProps, "ref"> &
      RefAttributes<typeof PointerLockControls>
  >;
  const upContext = useUpProvider();
  const ui = useUiState((state) => state.ui);
  const setUiState = useUiState((state) => state.setUiState);
  const setCurrentAssetToPlace = useCurrentAsset((state) => state.setAsset);

  const onUnlock = useCallback(
    () => pointerLockRef.current?.unlock(),
    [pointerLockRef]
  );

  const onLock = useCallback(
    () => pointerLockRef.current?.lock(),
    [pointerLockRef]
  );

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (isNotOwner() || currentAssetActive() || isVisitorMode()) {
        return;
      }

      if (e.code === "KeyI") {
        setUiState(UiState.INVENTORY);
      } else if (e.code === "KeyN") {
        setUiState(UiState.NFT);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Escape" && isNotImmersed() && isNotPaused()) {
        setUiState(UiState.IMMERSED);
      }
    };

    window.addEventListener("keypress", onKeyPress);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keypress", onKeyPress);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (ui === UiState.IMMERSED) {
      onLock();
    } else {
      setCurrentAssetToPlace(null);
      onUnlock();
    }
  }, [ui, onLock, onUnlock, setCurrentAssetToPlace]);

  return (
    <div className="h-screen w-screen">
      <KeyboardControls map={map}>
        <Canvas
          onCreated={(state) => {
            state.camera.layers.enableAll();
            state.raycaster.layers.set(2);
          }}
        >
          <Sky sunPosition={[100, 20, 100]} />
          <ambientLight intensity={0.6} />
          <directionalLight castShadow position={[50, 100, 50]} />
          <Physics gravity={[0, -30, 0]}>
            <SpawnPoint />
            <Cursor />
            <Ground />
            <Player />
            <InstancedBlocks />
            <Assets />
            <AssetToPlace />
            <Peers />
          </Physics>
          <PointerLockControls
            enabled={!upContext.isWaitingForTx}
            makeDefault
            ref={pointerLockRef}
            onLock={() => setUiState(UiState.IMMERSED)}
            onUnlock={() => setUiState(UiState.PAUSE)}
          />
          {debug && <Stats />}
          <Preload all />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}

export default Scene;
