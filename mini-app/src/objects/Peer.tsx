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
const BLOCK_CENTER = [0, 0, 0] as [number, number, number];
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
  gap: "2px",
} as React.CSSProperties;
const PEER_MOVEMENT_EASING_FACTOR = 0.125;

export const Peer = ({ peer }: { peer: PeerType }) => {
  const audioRef = useRef() as MutableRefObject<THREE.PositionalAudio>;
  const verifiedRef = useRef() as MutableRefObject<HTMLDivElement>;
  const muteRef = useRef() as MutableRefObject<HTMLDivElement>;
  const peerRef = useRef() as MutableRefObject<Group<Object3DEventMap>>;
  const tracksRef = useRef<{
    audio: MediaStreamTrack | null;
    video: MediaStreamTrack | null;
  }>({ audio: null, video: null });
  const [, setTracks] = useState<{
    audio: MediaStreamTrack | null;
    video: MediaStreamTrack | null;
  }>({ audio: null, video: null });
  const peerHeadRef = useRef() as MutableRefObject<Mesh>;
  const spawnPoint = useWorld((state) => state.spawnPoint);
  const addHoveredPeer = useWorld((state) => state.addHoveredPeer);
  const removeHoveredPeer = useWorld((state) => state.removeHoveredPeer);

  const ratio = useMemo(() => peer.data?.img?.ratio ?? 1, [peer]);

  const imageScale = useMemo(
    () =>
      ratio >= 1
        ? [IMAGE_SIZE_FACTOR / ratio, IMAGE_SIZE_FACTOR]
        : ([IMAGE_SIZE_FACTOR, IMAGE_SIZE_FACTOR * ratio] as [number, number]),
    [ratio]
  );

  useFrame((state, dt) => {
    if (
      peer.position &&
      peerRef.current &&
      peerHeadRef.current &&
      verifiedRef.current
    ) {
      verifiedRef.current.style.visibility = peer.verified
        ? "visible"
        : "hidden";
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
      tracksRef.current = { audio: null, video: null };
      setTracks(tracksRef.current);
      audioRef.current?.stop();
      if (muteRef.current) {
        muteRef.current.innerHTML = "";
      }
    } else {
      const video = peer.remoteStream.getVideoTracks()[0] ?? null;
      const audio = peer.remoteStream.getAudioTracks()[0] ?? null;
      if (audio) {
        audio.enabled = !peer.muted;
      }
      tracksRef.current = { audio, video };
      setTracks(tracksRef.current);
      if (audio) {
        if (audioRef.current) {
          audioRef.current.autoplay = true;
        }
        const audioStream = new MediaStream([audio]);
        audioRef.current?.setMediaStreamSource(audioStream);
        audioRef.current?.setRefDistance(1);
        audioRef.current?.setRolloffFactor(8);
        audioRef.current?.setDistanceModel("inverse");
        if (audioRef.current?.hasPlaybackControl) {
          audioRef.current?.setLoop(true);
          audioRef.current?.play();
        }
      }

      if (muteRef.current) {
        muteRef.current.innerHTML = !audio.enabled ? "&#128263;" : "&#128264;";
      }

      audioRef.current?.context?.resume();
    }
  }, [peer.remoteStream]);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (
        !audioRef.current ||
        !isHoveredPeer(peer.id) ||
        !tracksRef.current?.audio
      ) {
        return;
      }

      if (e.code === "KeyM") {
        tracksRef.current.audio.enabled = !tracksRef.current.audio.enabled;
        muteRef.current.innerHTML = !tracksRef.current.audio.enabled
          ? "&#128263;"
          : "&#128264;";
        useServerConnection.getState().peers[peer.id].muted =
          !tracksRef.current.audio.enabled;
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
            visible={
              !tracksRef.current.video || !tracksRef.current.video.enabled
            }
            scale={imageScale}
            position={BLOCK_CENTER_OFFSET}
            rotation={IMAGE_ROTATION}
            url={imgUrl}
          />
        </Suspense>
        {peer.remoteStream && (
          <mesh
            scale={PEER_HEAD_VIDEO_PLANE_SCALE}
            position={
              tracksRef.current.video?.enabled
                ? BLOCK_CENTER_OFFSET
                : BLOCK_CENTER
            }
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
          <positionalAudio
            frustumCulled={false}
            ref={audioRef}
            args={[audioListener]}
            loop
            autoplay
          />
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
          <div ref={muteRef}></div>
          {peer.data?.name ?? peer.address ?? "Anonymous Guest"}
          <div ref={verifiedRef} className="invisible">
            ✅
          </div>
        </h1>
      </Html>
    </group>
  );
};

function VideoMaterial({ src }: { src: MediaStream }) {
  const texture = useVideoTexture(src, { muted: true });

  return <meshBasicMaterial map={texture} toneMapped={false} />;
}
