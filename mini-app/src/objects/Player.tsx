import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { CapsuleCollider, RigidBody, useRapier } from "@react-three/rapier";
import { QueryFilterFlags } from "@dimforge/rapier3d-compat";
import useAssetsStore from "../hooks/useAssetsStore";
import useWorld from "../hooks/useWorld";
import { isImmersed, isNotImmersed, isVisitorMode } from "../hooks/useUiState";
import { currentAssetActive } from "../hooks/useCurrentAsset";
import { easing } from "maath";
import { useServerConnection } from "../hooks/useServerConnection";
import { isNotOwner } from "../hooks/useRole";
import { MIDDLE_MOUSE_BUTTON } from "../utils/mouseButtons";
import { audioListener } from "./GlobalAudioListener";

const SPRINT_SPEED = 10;
const SPEED = 5;
const POSITION_UPDATE_RATE_IN_SECONDS = 0.1;
const JUMP_POWER = 8.5;
const GROUND_RAY_DIR = { x: 0, y: -1, z: 0 };
const GROUND_COLLISION_LAYERS = 0xffffffff ^ 4;
const BODY_WIDTH = 0.5;
const GROUND_COLLISION_RAY_CENTER_OFFSET = BODY_WIDTH - 0.1;
const JUMP_GROUND_DISTANCE_THRESHOLD = 1;
const GROUND_COLLISION_RAY_MAX_DISTANCE = JUMP_GROUND_DISTANCE_THRESHOLD + 1.5;
const CAMERA_MOVEMENT_EASING_FACTOR = 0.05;
const CAMERA_Y_OFFSET = 0.5;

export function Player() {
  const [init, setInit] = useState<string>("NO");

  const direction = useRef(new THREE.Vector3());
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());
  const dtSum = useRef(0);

  const camera = useThree((state) => state.camera);
  const assetsInitialized = useAssetsStore((state) => state.initialized);
  const spawnPoint = useWorld((state) => state.spawnPoint);
  const setSpawnPoint = useWorld((state) => state.setSpawnPoint);
  const ref = useRef() as MutableRefObject<RAPIER.RigidBody>;
  const rapier = useRapier();
  const [, get] = useKeyboardControls();

  const sendPositionToPeers = useCallback((dt: number) => {
    dtSum.current += dt;
    if (dtSum.current >= POSITION_UPDATE_RATE_IN_SECONDS) {
      dtSum.current -= POSITION_UPDATE_RATE_IN_SECONDS;
      const position = ref.current.translation();
      const rotation = camera.rotation;

      const stringifiedPosition = JSON.stringify({
        position: [position.x, position.y, position.z],
        rotation: [rotation.x, rotation.y, rotation.z],
      });
      const peers = useServerConnection.getState().peers;
      for (const peer in peers) {
        if (peers[peer].channel?.readyState !== "open") {
          continue;
        }
        peers[peer].channel?.send(stringifiedPosition);
      }
    }
  }, []);

  useFrame((state, dt) => {
    if (!ref.current) return;
    const { forward, backward, left, right, jump, sprint } = get();
    const velocity = ref.current.linvel();
    // update camera
    const newPos = ref.current.translation();
    easing.damp3(
      state.camera.position,
      [newPos.x, newPos.y + CAMERA_Y_OFFSET, newPos.z],
      CAMERA_MOVEMENT_EASING_FACTOR,
      dt
    );
    // movement
    if (isImmersed() && assetsInitialized) {
      frontVector.current.set(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
      sideVector.current.set((left ? 1 : 0) - (right ? 1 : 0), 0, 0);
      direction.current
        .subVectors(frontVector.current, sideVector.current)
        .normalize()
        .multiplyScalar(sprint ? SPRINT_SPEED : SPEED)
        .applyEuler(state.camera.rotation);
      ref.current.setLinvel(
        { x: direction.current.x, y: velocity.y, z: direction.current.z },
        true
      );
      // jumping
      if (jump) {
        const position = ref.current.translation();
        for (let i = 0; i < 4; i++) {
          const ray = rapier.world.castRay(
            new RAPIER.Ray(
              {
                x:
                  position.x +
                  (i % 2) *
                    (i >= 2
                      ? -GROUND_COLLISION_RAY_CENTER_OFFSET
                      : GROUND_COLLISION_RAY_CENTER_OFFSET),
                y: position.y,
                z:
                  position.z +
                  ((i + 1) % 2) *
                    (i >= 2
                      ? -GROUND_COLLISION_RAY_CENTER_OFFSET
                      : GROUND_COLLISION_RAY_CENTER_OFFSET),
              },
              GROUND_RAY_DIR
            ),
            GROUND_COLLISION_RAY_MAX_DISTANCE,
            true,
            QueryFilterFlags.ONLY_FIXED,
            GROUND_COLLISION_LAYERS
          );
          if (
            ray &&
            ray.collider &&
            Math.abs(ray.timeOfImpact) <= JUMP_GROUND_DISTANCE_THRESHOLD
          ) {
            ref.current.setLinvel({ x: 0, y: JUMP_POWER, z: 0 }, true);
            break;
          }
        }
      }
    }

    sendPositionToPeers(dt);
  });

  useEffect(() => {
    if (!ref.current || !assetsInitialized) return;
    camera.setRotationFromQuaternion(
      new THREE.Quaternion(
        spawnPoint.rotation[0],
        spawnPoint.rotation[1],
        spawnPoint.rotation[2],
        spawnPoint.rotation[3]
      )
    );

    setInit("YES");
  }, [camera, assetsInitialized, spawnPoint]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (
        isNotOwner() ||
        isVisitorMode() ||
        isNotImmersed() ||
        currentAssetActive()
      ) {
        return;
      }

      if (e.button === MIDDLE_MOUSE_BUTTON) {
        const position = ref.current.translation();
        const quaternion = camera.getWorldQuaternion(new THREE.Quaternion());

        setSpawnPoint({
          position: [position.x, position.y, position.z],
          rotation: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
        });
      }
    };

    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [camera, setSpawnPoint]);

  useEffect(() => {
    if (!camera) return;
    camera.add(audioListener);
  }, [camera]);

  return (
    <RigidBody
      key={init}
      ref={ref}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[
        spawnPoint.position[0],
        spawnPoint.position[1] + 1,
        spawnPoint.position[2],
      ]}
      enabledRotations={[false, false, false]}
      friction={0}
    >
      <CapsuleCollider args={[BODY_WIDTH, BODY_WIDTH]} friction={0} />
    </RigidBody>
  );
}
