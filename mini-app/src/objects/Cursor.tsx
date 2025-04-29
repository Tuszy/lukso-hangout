import * as THREE from "three";
import { MutableRefObject, useCallback, useEffect, useRef } from "react";
import useUiState, {
  isBuilderMode,
  isNotImmersed,
  isVisitorMode,
  UiMode,
  UiState,
} from "../hooks/useUiState";
import { useFrame } from "@react-three/fiber";
import RAPIER, { QueryFilterFlags } from "@dimforge/rapier3d-compat";
import { useRapier } from "@react-three/rapier";
import useWorld, { isBought, Position, WorldAsset } from "../hooks/useWorld";
import useCurrentAsset, {
  AssetType,
  currentAssetNotActive,
} from "../hooks/useCurrentAsset";
import { isVisitor } from "../hooks/useRole";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import useBuyFunction from "../hooks/useBuyFunction";
import { Peer, useServerConnection } from "../hooks/useServerConnection";
import useWalletStore from "../hooks/useWalletStore";
import { LEFT_MOUSE_BUTTON, RIGHT_MOUSE_BUTTON } from "../utils/mouseButtons";
import { fetchAsset } from "../hooks/useAsset";
import { Asset } from "../hooks/assets";

const rotation: [number, number, number][] = [
  [0, -Math.PI / 2, 0],
  [Math.PI / 2, 0, 0],
  [0, Math.PI, 0],
  [0, Math.PI / 2, 0],
  [-Math.PI / 2, 0, 0],
  [0, 0, 0],
];

const dir: [number, number, number][] = [
  [-1, 0, 0],
  [0, -1, 0],
  [0, 0, -1],
  [+1, 0, 0],
  [0, +1, 0],
  [0, 0, +1],
];

const TOP_FACE = 4;
const BOTTOM_FACE = 1;
const SELECTION_COLOR = "red";
const SELECTION_COLOR_OPACITY = 0.2;
const SELECTION_POSITION_OFFSET = [0, 0, 0.5001] as [number, number, number];

export function Cursor() {
  const rapier = useRapier();
  const buy = useBuyFunction();
  const cameraXZDirection = useRef(new THREE.Vector3(0, 0, 0));
  const mode = useUiState((state) => state.mode);
  const ui = useUiState((state) => state.ui);
  const setUiState = useUiState((state) => state.setUiState);
  const currentBlockPosition = useRef<Position | null>(null);
  const newBlockPosition = useRef<Position | null>(null);
  const addBlock = useWorld((state) => state.addBlock);
  const addBoughtAsset = useWorld((state) => state.addBoughtAsset);
  const removeAsset = useWorld((state) => state.removeAsset);
  const removeBlock = useWorld((state) => state.removeBlock);
  const setHoveredAsset = useWorld((state) => state.setHoveredAsset);
  const clearHoveredPeer = useWorld((state) => state.clearHoveredPeer);
  const updateBalance = useWalletStore((state) => state.updateWalletBalance);
  const currentAsset = useCurrentAsset((state) => state.asset);
  const setCurrentAsset = useCurrentAsset((state) => state.setAsset);
  const setAssetWithWorldAsset = useCurrentAsset(
    (state) => state.setAssetWithWorldAsset
  );

  const addWorldAsset = useWorld((state) => state.addAsset);
  const selectionRef = useRef() as MutableRefObject<THREE.Group>;
  const selectionPlane = useRef() as MutableRefObject<THREE.Mesh>;

  const onHoverBlock = useCallback(
    (
      blockPosition: [x: number, y: number, z: number],
      faceIndex: number,
      hitPoint: RAPIER.Vector
    ) => {
      selectionRef.current?.rotation?.set(...rotation[faceIndex]);
      selectionRef.current?.position?.set(...blockPosition);
      currentBlockPosition.current = [...blockPosition];
      newBlockPosition.current = null;
      newBlockPosition.current = [
        blockPosition[0] + dir[faceIndex][0],
        blockPosition[1] + dir[faceIndex][1],
        blockPosition[2] + dir[faceIndex][2],
      ];

      if (faceIndex !== BOTTOM_FACE && faceIndex !== TOP_FACE) {
        useCurrentAsset.getState().position =
          useCurrentAsset.getState().type !== AssetType.MODEL
            ? useCurrentAsset.getState().attachToBlock
              ? blockPosition
              : [
                  hitPoint.x - dir[faceIndex][0] / 2,
                  hitPoint.y - dir[faceIndex][1] / 2,
                  hitPoint.z - dir[faceIndex][2] / 2,
                ]
            : [
                hitPoint.x +
                  cameraXZDirection.current.x *
                    (useCurrentAsset.getState().offset ?? 0),
                hitPoint.y,
                hitPoint.z +
                  cameraXZDirection.current.z *
                    (useCurrentAsset.getState().offset ?? 0),
              ];
        useCurrentAsset.getState().rotation = rotation[faceIndex];
      } else if (
        faceIndex === TOP_FACE &&
        useCurrentAsset.getState().type === AssetType.MODEL
      ) {
        useCurrentAsset.getState().position = [
          hitPoint.x +
            cameraXZDirection.current.x *
              (useCurrentAsset.getState().offset ?? 0),
          blockPosition[1] + 0.5,
          hitPoint.z +
            cameraXZDirection.current.z *
              (useCurrentAsset.getState().offset ?? 0),
        ];
        useCurrentAsset.getState().rotation = [
          0,
          Math.atan2(cameraXZDirection.current.x, cameraXZDirection.current.z) +
            Math.PI,
          0,
        ];
      } else {
        useCurrentAsset.getState().position = null;
      }

      useWorld.getState().hoveredAsset = null;
    },
    []
  );

  const onHoverAsset = useCallback(
    (assetId: string) => {
      setHoveredAsset(assetId);
      selectionRef.current?.position?.set(0, -1000, 0);
      currentBlockPosition.current = null;
      newBlockPosition.current = null;
      useCurrentAsset.getState().position = null;
    },
    [setHoveredAsset]
  );

  const onHoverGround = useCallback(
    (faceIndex: number, hitPoint: RAPIER.Vector) => {
      selectionRef.current?.rotation?.set(...rotation[faceIndex]);
      selectionRef.current?.position?.set(
        Math.round(hitPoint.x),
        -0.5,
        Math.round(hitPoint.z)
      );
      currentBlockPosition.current = null;
      newBlockPosition.current = [
        Math.round(hitPoint.x),
        0.5,
        Math.round(hitPoint.z),
      ];
      if (useCurrentAsset.getState().type === AssetType.MODEL) {
        useCurrentAsset.getState().position = [
          hitPoint.x +
            cameraXZDirection.current.x *
              (useCurrentAsset.getState().offset ?? 0),
          0,
          hitPoint.z +
            cameraXZDirection.current.z *
              (useCurrentAsset.getState().offset ?? 0),
        ];
        useCurrentAsset.getState().rotation = [
          0,
          Math.atan2(cameraXZDirection.current.x, cameraXZDirection.current.z) +
            Math.PI,
          0,
        ];
      } else {
        useCurrentAsset.getState().position = null;
      }
      useWorld.getState().hoveredAsset = null;
    },
    []
  );

  const onHoverNothing = useCallback(() => {
    setHoveredAsset(null);
    selectionRef.current?.position?.set(0, -1000, 0);
    currentBlockPosition.current = null;
    newBlockPosition.current = null;
    useCurrentAsset.getState().position = null;
  }, [setHoveredAsset]);

  useFrame((state) => {
    if (ui !== UiState.IMMERSED) {
      setHoveredAsset(null);
      clearHoveredPeer();
      return;
    }
    const direction = new THREE.Vector3(0, 0, -1).applyEuler(
      state.camera.rotation
    );
    if (mode === UiMode.BUILDER) {
      cameraXZDirection.current = new THREE.Vector3(
        direction.x,
        0,
        direction.z
      ).normalize();
      const ray = new RAPIER.Ray(state.camera.position, direction);
      const hit = rapier.world.castRayAndGetNormal(
        ray,
        10,
        true,
        QueryFilterFlags.ONLY_FIXED
      );

      if (hit?.collider) {
        const hitPoint = ray.pointAt(hit.timeOfImpact);
        const faceIndex = hit?.featureId as number;

        const userData = hit.collider.parent()?.userData as undefined | object;
        if (userData && "position" in userData) {
          onHoverBlock(
            userData.position as [x: number, y: number, z: number],
            faceIndex,
            hitPoint
          );
          return;
        } else if (
          userData &&
          "assetId" in userData &&
          currentAssetNotActive()
        ) {
          onHoverAsset(userData.assetId as string);
          return;
        } else if (faceIndex === TOP_FACE) {
          onHoverGround(faceIndex, hitPoint);
          return;
        }
      }
    } else if (!useWorld.getState().hoveredPeer) {
      const ray = new RAPIER.Ray(state.camera.position, direction);
      const hit = rapier.world.castRay(
        ray,
        10,
        true,
        QueryFilterFlags.ONLY_FIXED
      );

      if (hit?.collider) {
        const userData = hit.collider.parent()?.userData as undefined | object;
        if (userData && "assetId" in userData) {
          onHoverAsset(userData.assetId as string);
          return;
        }
      }
    }

    onHoverNothing();
  });

  const onBuy = useCallback(
    async (asset: Asset) => {
      const listing = asset?.listing;
      if (!isVisitor() || !listing || isBought(asset.id)) return false;
      const balance = useWalletStore.getState().balance;
      if (balance < BigInt(listing.price)) {
        toast.error(
          `You only have ${Math.abs(
            parseFloat(ethers.formatEther(balance))
          )} LYX`,
          { position: "bottom-center", pauseOnFocusLoss: false }
        );
        return false;
      }
      setUiState(UiState.PAUSE);
      return buy(listing).then((success) => {
        if (success) {
          addBoughtAsset(asset.id);
          useServerConnection.getState().socket?.emit("buy", asset.id);
          updateBalance();
        }

        return success;
      });
    },
    [addBoughtAsset, updateBalance, buy, setUiState]
  );

  const onAddWorldAsset = useCallback(() => {
    const asset = useCurrentAsset.getState().asset;
    const assetType = useCurrentAsset.getState().type;
    const currentAssetPosition = useCurrentAsset.getState().position;
    const currentAssetRotation = useCurrentAsset.getState().rotation;
    const currentAssetYRotation = useCurrentAsset.getState().yRotation;
    const currentAssetScale = useCurrentAsset.getState().scale;

    if (
      !asset ||
      !currentAssetScale ||
      !currentAssetPosition ||
      !currentAssetRotation
    ) {
      return;
    }

    addWorldAsset({
      id: asset.id,
      position: currentAssetPosition,
      rotation:
        assetType !== AssetType.MODEL
          ? currentAssetRotation
          : [
              currentAssetRotation[0],
              currentAssetRotation[1] + (currentAssetYRotation ?? 0),
              currentAssetRotation[2],
            ],
      scale: currentAssetScale,
      type: assetType,
    });
    setCurrentAsset(null);
  }, [setCurrentAsset, addWorldAsset]);

  const onReplaceWorldAsset = useCallback(
    async (worldAsset: WorldAsset) => {
      const asset = await fetchAsset(worldAsset.id);
      if (!asset) return;
      removeAsset(useWorld.getState().hoveredAsset!);
      useWorld.getState().hoveredAsset = null;
      const yRotation =
        worldAsset.rotation[1] -
        Math.atan2(cameraXZDirection.current.x, cameraXZDirection.current.z) +
        Math.PI;
      setAssetWithWorldAsset(asset, worldAsset, yRotation);
    },
    [removeAsset, setAssetWithWorldAsset]
  );

  const onAddBlock = useCallback(() => {
    if (!newBlockPosition.current) return;
    addBlock(newBlockPosition.current);
    newBlockPosition.current = null;
  }, [addBlock]);

  const onRemoveBlock = useCallback(() => {
    if (!currentBlockPosition.current) return;
    removeBlock(currentBlockPosition.current);
    currentBlockPosition.current = null;
  }, [removeBlock]);

  const onRemoveWorldAsset = useCallback(() => {
    if (!useWorld.getState().hoveredAsset) return;
    removeAsset(useWorld.getState().hoveredAsset!);
    useWorld.getState().hoveredAsset = null;
  }, [removeAsset]);

  const onResetCurrentAsset = useCallback(() => {
    setCurrentAsset(null);
  }, [setCurrentAsset]);

  useEffect(() => {
    const onMouseDown = async (e: MouseEvent) => {
      if (isNotImmersed()) return;
      const hoveredAsset = useWorld.getState().hoveredAsset;
      const hoveredPeer = useWorld.getState().hoveredPeer
        ? useServerConnection.getState().peers[useWorld.getState().hoveredPeer!]
        : null;
      if (isBuilderMode()) {
        const hasCurrentAsset = Boolean(useCurrentAsset.getState().asset);
        if (!hasCurrentAsset) {
          if (e.button === LEFT_MOUSE_BUTTON) {
            if (newBlockPosition.current) {
              onAddBlock();
            } else if (hoveredAsset && e.shiftKey) {
              onReplaceWorldAsset(useWorld.getState().assets[hoveredAsset!]);
            }
          } else if (e.button === RIGHT_MOUSE_BUTTON) {
            if (hoveredAsset) {
              onRemoveWorldAsset();
            } else if (currentBlockPosition.current) {
              onRemoveBlock();
            }
          }
        } else {
          if (e.button === LEFT_MOUSE_BUTTON) {
            onAddWorldAsset();
          } else if (e.button === RIGHT_MOUSE_BUTTON) {
            onResetCurrentAsset();
          }
        }
      } else if (isVisitorMode() && hoveredAsset) {
        const worldAsset = useWorld.getState().assets[hoveredAsset!];
        if (!worldAsset) return;
        const asset = await fetchAsset(worldAsset.id);
        if (!asset) return;

        if (e.button === LEFT_MOUSE_BUTTON) {
          onBuy(asset);
        } else if (e.button === RIGHT_MOUSE_BUTTON) {
          onOpenUniversalPageOfAsset(asset);
        }
      } else if (isVisitorMode() && hoveredPeer && hoveredPeer.address) {
        if (e.button === RIGHT_MOUSE_BUTTON) {
          onOpenUniversalPageOfProfile(hoveredPeer);
        }
      }
    };

    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  return (
    <group ref={selectionRef}>
      <mesh
        name="selection"
        ref={selectionPlane}
        position={SELECTION_POSITION_OFFSET}
        visible={
          mode === UiMode.BUILDER && ui === UiState.IMMERSED && !currentAsset
        }
      >
        <planeGeometry />
        <meshPhongMaterial
          color={SELECTION_COLOR}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={SELECTION_COLOR_OPACITY}
        />
      </mesh>
    </group>
  );
}

const onOpenUniversalPageOfAsset = (asset: Asset) =>
  window.open(asset.link, "_blank");

const onOpenUniversalPageOfProfile = (peer: Peer) => {
  if (!peer.address) return;
  window.open(
    `https://universal.page/profiles/lukso/${peer.address}`,
    "_blank"
  );
};
