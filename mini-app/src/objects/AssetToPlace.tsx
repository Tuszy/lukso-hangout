import * as THREE from "three";
import { MutableRefObject, useCallback, useEffect, useRef } from "react";
import useCurrentAsset, {
  AssetType,
  blockAttachingIsActive,
  currentAssetNotActive,
} from "../hooks/useCurrentAsset";
import { useFrame } from "@react-three/fiber";
import { Model } from "./Model";
import useUiState, {
  isNotImmersed,
  isVisitorMode,
  UiState,
} from "../hooks/useUiState";
import { isNotOwner } from "../hooks/useRole";
import { ImageFrame } from "./ImageFrame";
import { VideoFrame } from "./VideoFrame";

type KeyMap = {
  arrowUp: boolean;
  arrowDown: boolean;
  arrowLeft: boolean;
  arrowRight: boolean;
};

const FALLBACK_POSITION = [0, -1000, 0] as [number, number, number];
const Y_ROTATION_CHANGE_SPEED = Math.PI / 2;
const OFFSET_CHANGE_SPEED = 1;

function AssetToPlace() {
  const ui = useUiState((state) => state.ui);
  const incrementScale = useCurrentAsset((state) => state.incrementScale);
  const decrementScale = useCurrentAsset((state) => state.decrementScale);
  const resetOffsetYRotationScale = useCurrentAsset(
    (state) => state.resetOffsetYRotationScale
  );
  const setAttachToBlock = useCurrentAsset((state) => state.setAttachToBlock);

  const asset = useCurrentAsset((state) => state.asset);
  const type = useCurrentAsset((state) => state.type);

  const keymap = useRef<KeyMap>({
    arrowUp: false,
    arrowDown: false,
    arrowLeft: false,
    arrowRight: false,
  });
  const assetRef = useRef() as MutableRefObject<
    THREE.Group<THREE.Object3DEventMap>
  >;

  const updateYRotationAndOffset = useCallback((dt: number) => {
    const state = useCurrentAsset.getState();
    if (!keymap.current || state.type !== AssetType.MODEL) return;

    if (keymap.current.arrowRight) {
      state.yRotation += Y_ROTATION_CHANGE_SPEED * dt;
    } else if (keymap.current.arrowLeft) {
      state.yRotation -= Y_ROTATION_CHANGE_SPEED * dt;
    } else if (keymap.current.arrowDown) {
      state.offset -= OFFSET_CHANGE_SPEED * dt;
    } else if (keymap.current.arrowUp) {
      state.offset += OFFSET_CHANGE_SPEED * dt;
    }
  }, []);

  const updatePositionAndRotationAndScale = useCallback(() => {
    if (!assetRef.current) return;
    const state = useCurrentAsset.getState();

    // Position
    assetRef.current.position.set(...(state.position ?? FALLBACK_POSITION));

    // Rotation
    assetRef.current.rotation.set(
      state.rotation[0],
      state.rotation[1] + state.yRotation,
      state.rotation[2]
    );

    // Scale
    assetRef.current.scale.set(
      state.scale,
      state.scale,
      state.type === AssetType.MODEL ? state.scale : 1
    );
  }, []);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (
        isVisitorMode() ||
        isNotImmersed() ||
        isNotOwner() ||
        currentAssetNotActive()
      ) {
        return;
      }

      if (e.code === "BracketRight") {
        incrementScale();
      } else if (e.code === "Slash") {
        decrementScale();
      } else if (e.code === "Digit0") {
        resetOffsetYRotationScale();
      } else if (e.code === "KeyB") {
        setAttachToBlock(!blockAttachingIsActive());
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (
        isVisitorMode() ||
        isNotImmersed() ||
        isNotOwner() ||
        currentAssetNotActive()
      ) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();

      if (e.deltaY > 0) {
        decrementScale();
      } else if (e.deltaY < 0) {
        incrementScale();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp") {
        keymap.current.arrowUp = true;
      } else if (e.code === "ArrowDown") {
        keymap.current.arrowDown = true;
      } else if (e.code === "ArrowLeft") {
        keymap.current.arrowLeft = true;
      } else if (e.code === "ArrowRight") {
        keymap.current.arrowRight = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp") {
        keymap.current.arrowUp = false;
      } else if (e.code === "ArrowDown") {
        keymap.current.arrowDown = false;
      } else if (e.code === "ArrowLeft") {
        keymap.current.arrowLeft = false;
      } else if (e.code === "ArrowRight") {
        keymap.current.arrowRight = false;
      }
    };

    window.addEventListener("keypress", onKeyPress);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("wheel", onWheel);

    return () => {
      window.removeEventListener("keypress", onKeyPress);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  useFrame((state, dt) => {
    if (!assetRef.current || !asset) return;

    updateYRotationAndOffset(dt);

    updatePositionAndRotationAndScale();
  });

  if (ui !== UiState.IMMERSED || asset === null) {
    return null;
  }

  return (
    <group ref={assetRef}>
      {type === AssetType.IMAGE && <ImageFrame asset={asset} />}
      {type === AssetType.VIDEO && <VideoFrame asset={asset} />}
      {type === AssetType.MODEL && <Model asset={asset} />}
    </group>
  );
}

export default AssetToPlace;
