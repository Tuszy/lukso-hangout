import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import grass from "../material/grass.jpg";
import { MutableRefObject, useRef } from "react";

export const size = 51;
export const halfSize = size / 2;
export const thickness = 2;
export const wallDistance = halfSize + thickness;
export const maxRayDistance = 6;

export function Ground() {
  const ground = useRef() as MutableRefObject<THREE.Mesh>;
  const texture = useTexture(grass);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <RigidBody type="fixed" colliders={false} name="ground">
        <mesh
          name="ground"
          ref={ground}
          position={[0, 0, 0]}
          rotation-x={-Math.PI / 2}
        >
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial map={texture} map-repeat={[size, size]} />
        </mesh>
        <CuboidCollider
          args={[size, thickness, size]}
          position={[0, -thickness, 0]}
        />
        <CuboidCollider
          args={[thickness, size, size]}
          position={[wallDistance, 0, 0]}
        />
        <CuboidCollider
          args={[thickness, size, size]}
          position={[-wallDistance, 0, 0]}
        />
        <CuboidCollider
          args={[size, size, thickness]}
          position={[0, 0, wallDistance]}
        />
        <CuboidCollider
          args={[size, size, thickness]}
          position={[0, 0, -wallDistance]}
        />
      </RigidBody>
    </>
  );
}
