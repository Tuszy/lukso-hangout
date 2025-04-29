import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { MutableRefObject, Suspense, useMemo, useRef } from "react";
import { Box3 } from "three";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { isHoveredAsset } from "../hooks/useWorld";
import { Asset } from "../hooks/useAssetsStore";

const OBJECT_SCALE_ALONG_MAX_AXIS = 2;
const MODEL_LAYER = 2;
const RIGIDBODY_GROUP = 4;
const HOVER_COLOR = "#b80";
const HOVER_BOUGHT_COLOR = "#070";
const EASING_SMOOTH_FACTOR = 0.1;
const BOUNDING_BOX_OPACITY_ON_HOVER = 0.25;

export const Model = ({
  assetId,
  asset,
  rigidBody = false,
  bought = false,
}: {
  assetId?: string;
  asset: Asset;
  rigidBody?: boolean;
  bought?: boolean;
}) => {
  const boundingBoxRef = useRef() as MutableRefObject<THREE.Mesh>;
  const { scene } = useGLTF(asset.models[0]);
  const userData = useMemo(() => ({ assetId }), [assetId]);

  useFrame((state, dt) => {
    if (!boundingBoxRef.current || !rigidBody) return;

    const hovered = assetId && isHoveredAsset(assetId);
    easing.damp(
      boundingBoxRef.current.material,
      "opacity",
      hovered ? BOUNDING_BOX_OPACITY_ON_HOVER : 0,
      EASING_SMOOTH_FACTOR,
      dt
    );

    easing.dampC(
      // @ts-expect-error color exists on material
      boundingBoxRef.current.material.color,
      !bought ? HOVER_COLOR : HOVER_BOUGHT_COLOR,
      EASING_SMOOTH_FACTOR,
      dt
    );
  });

  const { box3, boxGeo, scale, rotation } = useMemo(() => {
    scene.layers.set(MODEL_LAYER);
    const box3 = new Box3();
    box3.setFromObject(scene);

    const dimensions = new THREE.Vector3().subVectors(box3.max, box3.min);
    const boxGeo = new THREE.BoxGeometry(
      dimensions.x,
      dimensions.y,
      dimensions.z
    );

    const scale =
      OBJECT_SCALE_ALONG_MAX_AXIS /
      Math.max(Math.max(dimensions.x, dimensions.y), dimensions.z);

    const rotation = new THREE.Euler(
      ...[0, dimensions.z > dimensions.x ? Math.PI / 2 : 0, 0]
    );

    const zOffset = Math.min(dimensions.x, dimensions.z) / 2 + 0.05 / scale;

    const matrix = new THREE.Matrix4().setPosition(
      dimensions.addVectors(box3.min, box3.max).multiplyScalar(0.5)
    );
    boxGeo.applyMatrix4(matrix);
    return { box3, boxGeo, scale, rotation, dimensions, zOffset };
  }, []);

  const obj = useMemo(() => scene.clone(), []);

  return (
    <group
      position={[0, -box3.min.y * scale, 0]}
      scale={scale}
      rotation={rotation}
      frustumCulled={false}
    >
      <Suspense>
        <primitive
          object={obj}
          solverGroups={RIGIDBODY_GROUP}
          collisionGroups={RIGIDBODY_GROUP}
          frustumCulled={false}
        />
      </Suspense>
      {rigidBody ? (
        <RigidBody
          type="fixed"
          name="asset"
          userData={userData}
          friction={0}
          solverGroups={RIGIDBODY_GROUP}
          collisionGroups={RIGIDBODY_GROUP}
        >
          <mesh ref={boundingBoxRef} geometry={boxGeo} frustumCulled={false}>
            <meshLambertMaterial transparent={true} opacity={0} />
          </mesh>
        </RigidBody>
      ) : (
        <mesh ref={boundingBoxRef} geometry={boxGeo} frustumCulled={false}>
          <meshBasicMaterial color="red" wireframe />
        </mesh>
      )}
    </group>
  );
};
