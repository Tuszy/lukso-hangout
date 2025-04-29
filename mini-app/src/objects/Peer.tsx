import { Html, Image, useVideoTexture } from "@react-three/drei";
import useWorld, { isHoveredPeer } from "../hooks/useWorld";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, Object3DEventMap } from "three";
import {
  MutableRefObject,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Peer as PeerType,
  useServerConnection,
} from "../hooks/useServerConnection";
import { easing } from "maath";
import * as THREE from "three";
import { audioListener } from "./GlobalAudioListener";
import SmileImage from "../assets/smile.jpg";

const PEER_LAYER = 2;
const IMAGE_SIZE_FACTOR = 0.88;
const IMAGE_ROTATION = [0, Math.PI, 0] as [number, number, number];
const BLOCK_CENTER_OFFSET = [0, 0, -0.51] as [number, number, number];
const PEER_BODY_COLOR = "#fff";
const PEER_BODY_RELATIVE_POSITION = [0, -0.45, 0] as [number, number, number];
const PEER_BODY_SIZE = [0.3, 0.55] as [number, number];
const PEER_HEAD_COLOR = "#444";
const PEER_HEAD_SCALE = [0.85, 0.7, 0.7] as [number, number, number];
const PEER_HEAD_RELATIVE_POSITION = [0, 0.55, 0] as [number, number, number];
const PEER_HEAD_VIDEO_PLANE_SCALE = [0.95, 0.95, -0.95] as [
  number,
  number,
  number
];
const PEER_NAME_RELATIVE_POSITION = [0, 1.2, 0] as [number, number, number];
const PEER_NAME_TEXT_STYLE = {
  color: "white",
  fontWeight: "bold",
  textAlign: "center",
  fontSize: "5px",
  background: "black",
  borderRadius: "12px",
  padding: "4px 8px",
  zIndex: -1,
  userSelect: "none",
  display: "flex",
  gap: "4px",
} as React.CSSProperties;
const PEER_MOVEMENT_EASING_FACTOR = 0.125;

export const Peer = ({ peer }: { peer: PeerType }) => {
  const audioRef = useRef() as MutableRefObject<THREE.PositionalAudio>;
  const muteRef = useRef() as MutableRefObject<HTMLDivElement>;
  const peerRef = useRef() as MutableRefObject<Group<Object3DEventMap>>;
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const audioTrack = useRef<MediaStreamTrack | null>(null);
  const peerHeadRef = useRef() as MutableRefObject<Mesh>;
  const spawnPoint = useWorld((state) => state.spawnPoint);
  const addHoveredPeer = useWorld((state) => state.addHoveredPeer);
  const removeHoveredPeer = useWorld((state) => state.removeHoveredPeer);

  const ratio = useMemo(() => peer.data?.img?.ratio ?? 1, [peer]);

  const imageScale = useMemo(
    () => [IMAGE_SIZE_FACTOR, IMAGE_SIZE_FACTOR * ratio] as [number, number],
    [ratio]
  );

  useFrame((state, dt) => {
    if (peer.position && peerRef.current && peerHeadRef.current) {
      easing.dampE(
        peerHeadRef.current.rotation,
        peer.position.rotation,
        PEER_MOVEMENT_EASING_FACTOR,
        dt
      );
      easing.damp3(
        peerRef.current.position,
        peer.position.position,
        PEER_MOVEMENT_EASING_FACTOR,
        dt
      );
    }
  });

  useEffect(() => {
    if (!peer.remoteStream) {
      audioTrack.current = null;
      setVideoTrack(null);
      audioRef.current?.stop();
      if (muteRef.current) {
        muteRef.current.innerHTML = "";
      }
    } else {
      setVideoTrack(peer.remoteStream.getVideoTracks()[0] ?? null);
      const audios = peer.remoteStream.getAudioTracks();
      audioTrack.current = audios[0];
      const audioStream = new MediaStream(audios);
      audioRef.current?.setMediaStreamSource(audioStream);
      audioRef.current?.setRefDistance(1);
      if (audioRef.current?.hasPlaybackControl) {
        audioRef.current?.setLoop(true);
        audioRef.current?.play();
      }

      if (muteRef.current) {
        audioTrack.current.enabled = !peer.muted;
        muteRef.current.innerHTML = !audioTrack.current.enabled
          ? "&#128263;"
          : "&#128264;";
      }

      audioRef.current?.context?.resume();
    }
  }, [peer.remoteStream]);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (!audioRef.current || !isHoveredPeer(peer.id) || !audioTrack.current) {
        return;
      }

      if (e.code === "KeyM") {
        audioTrack.current.enabled = !audioTrack.current.enabled;
        muteRef.current.innerHTML = !audioTrack.current.enabled
          ? "&#128263;"
          : "&#128264;";
        useServerConnection.getState().peers[peer.id].muted =
          !audioTrack.current.enabled;
      }
    };

    window.addEventListener("keypress", onKeyPress);

    return () => {
      window.removeEventListener("keypress", onKeyPress);
    };
  }, []);

  const imgUrl = peer.data?.img?.url ?? SmileImage;

  return (
    <group
      frustumCulled={false}
      layers={PEER_LAYER}
      ref={peerRef}
      position={peer.position?.position ?? spawnPoint.position}
      onPointerMove={(e) => {
        e.stopPropagation();
        addHoveredPeer(peer.id);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        removeHoveredPeer(peer.id);
      }}
    >
      <mesh position={PEER_BODY_RELATIVE_POSITION} layers={PEER_LAYER}>
        <capsuleGeometry args={PEER_BODY_SIZE} />
        <meshLambertMaterial color={PEER_BODY_COLOR} />
      </mesh>

      <mesh
        layers={PEER_LAYER}
        ref={peerHeadRef}
        position={PEER_HEAD_RELATIVE_POSITION}
        scale={PEER_HEAD_SCALE}
      >
        <boxGeometry />
        <meshLambertMaterial color={PEER_HEAD_COLOR} />
        <Suspense>
          <Image
            visible={!videoTrack || !videoTrack.enabled}
            scale={imageScale}
            position={BLOCK_CENTER_OFFSET}
            rotation={IMAGE_ROTATION}
            url={imgUrl}
          />
        </Suspense>
        {peer.remoteStream && videoTrack?.enabled && (
          <mesh
            scale={PEER_HEAD_VIDEO_PLANE_SCALE}
            position={BLOCK_CENTER_OFFSET}
          >
            <planeGeometry />
            <Suspense
              fallback={<meshBasicMaterial wireframe color={PEER_HEAD_COLOR} />}
            >
              <VideoMaterial src={peer.remoteStream} />
            </Suspense>
          </mesh>
        )}
        {peer.remoteStream && (
          <positionalAudio ref={audioRef} args={[audioListener]} />
        )}
      </mesh>

      <Html
        as="div"
        center
        position={PEER_NAME_RELATIVE_POSITION}
        distanceFactor={10}
        occlude
        zIndexRange={[0, 10]}
      >
        <h1 style={PEER_NAME_TEXT_STYLE}>
          {peer.data?.name ?? peer.address ?? "Anonymous Guest"}
          <div ref={muteRef}></div>
        </h1>
      </Html>
    </group>
  );
};

function VideoMaterial({ src }: { src: MediaStream }) {
  const texture = useVideoTexture(src, { muted: true });

  return <meshBasicMaterial map={texture} toneMapped={false} />;
}
