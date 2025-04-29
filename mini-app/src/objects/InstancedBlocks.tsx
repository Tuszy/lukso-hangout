import { InstancedRigidBodies } from "@react-three/rapier";
import useWorld, { Block, ChangeType, Position } from "../hooks/useWorld";
import { blockTypes } from "../material/blockMaterial";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { InstancedBufferAttribute, InstancedMesh, Matrix4 } from "three";
import { blockMaterial } from "../material/blockMaterial";
import { ThreeEvent } from "@react-three/fiber";

type InstanceType = {
  key: string;
  position: Position;
  userData: { position: Position; blockIndex: number[] };
}[];

const BLOCK_LAYER = 2;
const PRELOAD_BLOCK_POSITION = [0, -100, 0] as [number, number, number];

const createBlockInstance = (block: Block) => ({
  key: block.id,
  position: block.p,
  userData: {
    position: block.p,
    blockIndex: [blockTypes[block.t].x, blockTypes[block.t].y],
  },
});

const stopPropagation = (e: ThreeEvent<PointerEvent>) => e.stopPropagation();

export const InstancedBlocks = () => {
  const instancedMeshRef = useRef() as MutableRefObject<InstancedMesh>;
  const instancedAttributeRef =
    useRef() as MutableRefObject<InstancedBufferAttribute>;
  const lastBlockAction = useWorld((state) => state.lastBlockAction);
  const instancesRef = useRef<null | InstanceType>(null);

  const instances = useMemo(() => {
    if (!instancesRef.current) {
      instancesRef.current = Object.values(useWorld.getState().blocks).map(
        createBlockInstance
      );
    } else if (lastBlockAction) {
      if (lastBlockAction.type === ChangeType.ADD) {
        const block = useWorld.getState().blocks[lastBlockAction.id];
        if (block) {
          instancesRef.current = [
            ...instancesRef.current,
            createBlockInstance(block),
          ];
        }
      } else if (lastBlockAction.type === ChangeType.REMOVE) {
        instancesRef.current = instancesRef.current.filter(
          (i) => i.key !== lastBlockAction.id
        );
      }
    }

    return instancesRef.current;
  }, [lastBlockAction]);

  useEffect(() => {
    if (!instancedMeshRef.current || !instancedAttributeRef.current) return;
    for (let i = 0; i < instances.length; i++) {
      instancedMeshRef.current.setMatrixAt(
        i,
        new Matrix4().setPosition(...instances[i].position)
      );
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [instances]);

  return (
    <>
      <InstancedRigidBodies
        instances={instances}
        colliders={"cuboid"}
        type="fixed"
        friction={0}
      >
        <instancedMesh
          ref={instancedMeshRef}
          key={instances.length}
          args={[undefined, blockMaterial, instances.length]}
          count={instances.length}
          layers={BLOCK_LAYER}
          onPointerOver={stopPropagation}
          frustumCulled={false}
        >
          <boxGeometry>
            <instancedBufferAttribute
              ref={instancedAttributeRef}
              attach={"attributes-blockIndex"}
              array={
                new Float32Array(
                  instances.map((i) => i.userData.blockIndex).flatMap((i) => i)
                )
              }
              itemSize={2}
            />
          </boxGeometry>
        </instancedMesh>
      </InstancedRigidBodies>

      <mesh
        name={"preload-block"}
        position={PRELOAD_BLOCK_POSITION}
        material={blockMaterial}
      >
        <boxGeometry />
      </mesh>
    </>
  );
};
