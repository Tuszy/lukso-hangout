import { MutableRefObject, Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { Image } from "@react-three/drei";
import { easing } from "maath";
import { useFrame } from "@react-three/fiber";
import { isHoveredAsset } from "../hooks/useWorld";
import { Asset } from "../hooks/useAssetsStore";

const FRAME_COLOR = "#222";
const FRAME_HOVER_COLOR = "#b80";
const FRAME_HOVER_BOUGHT_COLOR = "#070";
const FRAME_THICKNESS_FACTOR = [1, 1, 0.02] as [number, number, number];
const FRAME_OFFSET = [0, 0, 0.2] as [number, number, number];
const FRAME_SIZE_FACTOR = 0.95;

const IMAGE_RELATIVE_THICKNESS_FACTOR = 0.9;
const IMAGE_OFFSET = [0, 0, 0.7] as [number, number, number];
const IMAGE_SIZE_FACTOR = 0.88;

const BLOCK_CENTER_OFFSET = [0, 0, 0.51] as [number, number, number];

const EASING_SMOOTH_FACTOR = 0.1;

export const ImageFrame = ({
  assetId,
  asset,
  rigidBody = false,
  bought = false,
}: {
  assetId?: string;
  asset: Asset;
  bought?: boolean;
  rigidBody?: boolean;
}) => {
  const frame = useRef() as MutableRefObject<THREE.Mesh>;

  const userData = useMemo(() => ({ assetId }), [assetId]);
  const ratio = useMemo(
    () => asset.images[0].height / asset.images[0].width,
    [asset]
  );
  const { frameScale, imageScale } = useMemo(
    () => ({
      frameScale: [
        FRAME_SIZE_FACTOR,
        FRAME_SIZE_FACTOR * ratio,
        IMAGE_RELATIVE_THICKNESS_FACTOR,
      ] as [number, number, number],
      imageScale: [IMAGE_SIZE_FACTOR, IMAGE_SIZE_FACTOR * ratio] as [
        number,
        number
      ],
    }),
    [ratio]
  );

  useFrame((state, dt) => {
    if (!rigidBody || !frame.current) return;
    easing.dampC(
      // @ts-expect-error color exists on material
      frame.current.material.color,
      assetId && isHoveredAsset(assetId)
        ? !bought
          ? FRAME_HOVER_COLOR
          : FRAME_HOVER_BOUGHT_COLOR
        : FRAME_COLOR,
      EASING_SMOOTH_FACTOR,
      dt
    );
  });

  const imageUrl = asset.images[0]?.url;
  if (!imageUrl) return null;

  return rigidBody ? (
    <RigidBody type="fixed" name="asset" userData={userData} friction={0}>
      <mesh
        scale={FRAME_THICKNESS_FACTOR}
        position={BLOCK_CENTER_OFFSET}
        frustumCulled={false}
      >
        <mesh
          ref={frame}
          scale={frameScale}
          position={FRAME_OFFSET}
          frustumCulled={false}
        >
          <boxGeometry />
          <meshBasicMaterial toneMapped={false} color={FRAME_COLOR} />
        </mesh>
        <Suspense>
          <Image
            scale={imageScale}
            position={IMAGE_OFFSET}
            url={imageUrl}
            frustumCulled={false}
          />
        </Suspense>
      </mesh>
    </RigidBody>
  ) : (
    <mesh scale={FRAME_THICKNESS_FACTOR} position={BLOCK_CENTER_OFFSET}>
      <mesh
        ref={frame}
        scale={frameScale}
        position={FRAME_OFFSET}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} color={FRAME_COLOR} />
      </mesh>
      <Suspense>
        <Image
          scale={imageScale}
          position={IMAGE_OFFSET}
          url={imageUrl}
          frustumCulled={false}
        />
      </Suspense>
    </mesh>
  );
};
