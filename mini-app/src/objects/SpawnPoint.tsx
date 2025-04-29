import { DoubleSide } from "three";
import useWorld from "../hooks/useWorld";
import { Html } from "@react-three/drei";
import useUiState, { UiMode } from "../hooks/useUiState";

const SPAWN_POINT_LAYER = 4;
const SPAWN_POINT_COLOR = "#ff0";
const SPAWN_POINT_COLOR_OPACITY = 0.25;
const SPAWN_POINT_HEIGHT = 1.5;
const SPAWN_POINT_RADIUS = 0.5;
const SPAWN_POINT_Y_OFFSET = -0.25;
const SPAWN_POINT_TEXT_Y_OFFSET = SPAWN_POINT_HEIGHT / 2;
const SPAWN_POINT_TEXT_STYLE = {
  color: SPAWN_POINT_COLOR,
  fontWeight: "bold",
  textAlign: "center",
  zIndex: -1,
} as React.CSSProperties;

export function SpawnPoint() {
  const spawnPoint = useWorld((state) => state.spawnPoint);
  const mode = useUiState((state) => state.mode);

  return (
    <group
      visible={mode !== UiMode.VISITOR}
      name="spawn-point"
      position={spawnPoint.position}
      layers={SPAWN_POINT_LAYER}
    >
      <mesh
        layers={SPAWN_POINT_LAYER}
        position={[0, SPAWN_POINT_Y_OFFSET, 0]}
        scale={[SPAWN_POINT_RADIUS, SPAWN_POINT_HEIGHT, SPAWN_POINT_RADIUS]}
      >
        <cylinderGeometry />
        <meshPhongMaterial
          color={SPAWN_POINT_COLOR}
          side={DoubleSide}
          transparent={true}
          opacity={SPAWN_POINT_COLOR_OPACITY}
        />
      </mesh>

      {mode !== UiMode.VISITOR && (
        <Html
          as="div"
          center
          position={[0, SPAWN_POINT_TEXT_Y_OFFSET, 0]}
          distanceFactor={10}
          color={SPAWN_POINT_COLOR}
          zIndexRange={[0, 10]}
          layers={SPAWN_POINT_LAYER}
        >
          <h1 style={SPAWN_POINT_TEXT_STYLE}>
            SPAWN
            <br />
            POSITION
          </h1>
        </Html>
      )}
    </group>
  );
}
