import {
  MutableRefObject,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { Html, useVideoTexture } from "@react-three/drei";
import { easing } from "maath";
import { useFrame } from "@react-three/fiber";
import { isHoveredAsset } from "../hooks/useWorld";
import { audioListener } from "./GlobalAudioListener";
import { Asset } from "../hooks/useAssetsStore";
import { currentAssetActive } from "../hooks/useCurrentAsset";
import { isNotImmersed } from "../hooks/useUiState";

const FRAME_COLOR = "#222";
const FRAME_HOVER_COLOR = "#b80";
const FRAME_HOVER_BOUGHT_COLOR = "#070";
const FRAME_THICKNESS_FACTOR = [1, 1, 0.02] as [number, number, number];
const FRAME_OFFSET = [0, 0, 0.2] as [number, number, number];
const FRAME_SIZE_FACTOR = 0.95;

const VIDEO_RELATIVE_THICKNESS_FACTOR = 0.9;
const VIDEO_OFFSET = [0, 0, 0.7] as [number, number, number];
const VIDEO_SIZE_FACTOR = 0.88;

const BLOCK_CENTER_OFFSET = [0, 0, 0.51] as [number, number, number];

const EASING_SMOOTH_FACTOR = 0.1;

export const VideoFrame = ({
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
  const [videoUrl] = useState(asset.videos[0] + "?timestamp=" + Date.now());
  const frame = useRef() as MutableRefObject<THREE.Mesh>;

  const userData = useMemo(() => ({ assetId }), [assetId]);

  const ratio = 1;

  const { frameScale, videoScale } = useMemo(
    () => ({
      frameScale: [
        FRAME_SIZE_FACTOR,
        FRAME_SIZE_FACTOR * ratio,
        VIDEO_RELATIVE_THICKNESS_FACTOR,
      ] as [number, number, number],
      videoScale: [
        VIDEO_SIZE_FACTOR,
        VIDEO_SIZE_FACTOR * ratio,
        VIDEO_SIZE_FACTOR,
      ] as [number, number, number],
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
        <Suspense
          fallback={<meshBasicMaterial wireframe color={FRAME_COLOR} />}
        >
          <mesh
            scale={videoScale}
            position={VIDEO_OFFSET}
            frustumCulled={false}
          >
            <planeGeometry />
            <VideoMaterial id={assetId} url={videoUrl} play={true} />
          </mesh>
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
      <Suspense fallback={<meshBasicMaterial wireframe color={FRAME_COLOR} />}>
        <mesh scale={videoScale} position={VIDEO_OFFSET} frustumCulled={false}>
          <planeGeometry />
          <VideoMaterial id={assetId} url={videoUrl} play={false} />
        </mesh>
      </Suspense>
    </mesh>
  );
};

function VideoMaterial({
  id,
  url,
  play,
}: {
  id?: string;
  url: string;
  play: boolean;
}) {
  const controlsRef = useRef() as MutableRefObject<HTMLDivElement>;
  const playtimeRef = useRef() as MutableRefObject<HTMLDivElement>;
  const playtimeTextRef = useRef() as MutableRefObject<HTMLSpanElement>;
  const muteRef = useRef() as MutableRefObject<HTMLDivElement>;
  const audioRef = useRef() as MutableRefObject<THREE.PositionalAudio>;
  const texture = useVideoTexture(url, {
    muted: true,
    autoplay: false,
    loop: true,
    start: false,
  });

  useEffect(() => {
    if (!texture || !play) return;
    const video = texture.source.data;

    if (audioRef.current && !audioRef.current?.source) {
      audioRef.current?.setMediaElementSource(video);
      audioRef.current?.setRefDistance(1);
      audioRef.current?.setRolloffFactor(8);
      audioRef.current?.setDistanceModel("inverse");
      audioRef.current?.context?.resume();
    }

    video.muted = false;
    video.pause();

    return () => {
      video.pause();
    };
  }, [texture, play]);

  useEffect(() => {
    const video = texture.source.data;

    const onKeyPress = (e: KeyboardEvent) => {
      if (currentAssetActive() || isNotImmersed() || !isHoveredAsset(id)) {
        return;
      }

      if (e.code === "KeyP") {
        if (video.playing) {
          video.pause();
        } else {
          video.play();
        }
      } else if (e.code === "KeyM") {
        video.muted = !video.muted;
        muteRef.current.innerHTML = video.muted ? "&#128263;" : "&#128264;";
      } else if (e.code === "KeyR") {
        video.currentTime = 0;
        video.play();
      }
    };

    window.addEventListener("keypress", onKeyPress);

    return () => {
      window.removeEventListener("keypress", onKeyPress);
    };
  }, []);

  useFrame(() => {
    const video = texture.source.data;
    if (
      !controlsRef.current ||
      !playtimeRef.current ||
      !playtimeTextRef.current ||
      !video
    ) {
      return;
    }
    controlsRef.current.style.visibility = isHoveredAsset(id)
      ? "visible"
      : "hidden";
    playtimeRef.current.style.right =
      100 - (video.currentTime / video.duration) * 100 + "%";
    playtimeTextRef.current.innerText =
      Math.round((video.currentTime / video.duration) * 100) + "%";
  });

  return (
    <>
      <Html
        as="div"
        center
        position={[0, 0.6, 0]}
        distanceFactor={2}
        color={"black"}
        zIndexRange={[0, 10]}
        occlude
        transform
      >
        <div
          ref={controlsRef}
          className="flex gap-2 w-52 items-center justify-center select-none"
        >
          <div className="relative h-2 flex-grow flex-shrink bg-black flex items-center justify-center text-[6px] text-gray-400">
            <div
              ref={playtimeRef}
              className="absolute inset-0 right-[100%] bg-yellow-300"
            ></div>
            <span className={"z-10"} ref={playtimeTextRef}>
              0%
            </span>
          </div>
          <div ref={muteRef} className="flex-shrink-0">
            &#128264;
          </div>
        </div>
      </Html>
      <positionalAudio ref={audioRef} args={[audioListener]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </>
  );
}

Object.defineProperty(HTMLMediaElement.prototype, "playing", {
  get: function () {
    return !!(
      this.currentTime > 0 &&
      !this.paused &&
      !this.ended &&
      this.readyState > 2
    );
  },
});
