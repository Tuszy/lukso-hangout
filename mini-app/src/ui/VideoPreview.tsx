import { MouseEventHandler, MutableRefObject, useEffect, useRef } from "react";
import {
  localVideoIsActive,
  useServerConnection,
} from "../hooks/useServerConnection";
import { toast } from "react-toastify";
import { isImmersed } from "../hooks/useUiState";
import useRole, { Role } from "../hooks/useRole";

function VideoPreview() {
  const videoRef = useRef() as MutableRefObject<HTMLVideoElement | null>;
  const setLocalStream = useServerConnection((state) => state.setLocalStream);
  const stream = useServerConnection((state) => state.localStream);

  const preventDefaultAndStopPropagation: React.MouseEventHandler<
    HTMLDivElement
  > = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onTurnOff: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalStream(null);
  };

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current!.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (useRole.getState().role !== Role.VISITOR) {
        setLocalStream(null);
        return;
      }
      if (e.code === "KeyV") {
        if (
          localVideoIsActive() &&
          (useServerConnection.getState().localStream?.getVideoTracks()
            .length ?? 0) > 0
        ) {
          setLocalStream(null);
        } else if (isImmersed()) {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then(setLocalStream)
            .catch((error) => {
              console.error(error);
              toast.error(`Failed to open video chat`, {
                position: "bottom-center",
                pauseOnFocusLoss: false,
              });
            });
        }
      } else if (e.code === "KeyC") {
        if (localVideoIsActive()) {
          setLocalStream(null);
        } else if (isImmersed()) {
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(setLocalStream)
            .catch((error) => {
              console.error(error);
              toast.error(`Failed to open audio chat`, {
                position: "bottom-center",
                pauseOnFocusLoss: false,
              });
            });
        }
      }
    };

    window.addEventListener("keypress", onKeyPress);

    return () => {
      window.removeEventListener("keypress", onKeyPress);
    };
  }, []);

  const withVideo = (stream?.getVideoTracks().length ?? 0) > 0;

  return (
    <div
      className={`fixed right-1 top-16 select-none ${
        !stream ? "invisible" : ""
      }`}
      onClick={preventDefaultAndStopPropagation}
    >
      <div className="flex flex-col items-center justify-center overflow-y-auto border-2 border-black rounded-xl overflow-hidden bg-black text-white group">
        <div>{withVideo ? "VIDEO CHAT" : "AUDIO CHAT"}</div>
        <div className="relative w-40">
          <video
            id={"local-video"}
            autoPlay={true}
            className="z-10"
            ref={videoRef}
            muted={true}
          />
          {!withVideo && (
            <div className="absolute bottom-0 flex flex-col items-center text-4xl justify-center bg-black/30 group-hover:opacity-0 backdrop-blur-sm w-full h-full cursor-pointer">
              &#127908;
            </div>
          )}

          <div
            className="absolute bottom-0 opacity-0 flex flex-col items-center justify-center group-hover:opacity-100 bg-black/30 backdrop-blur-sm w-full h-full transition-opacity cursor-pointer"
            onClick={onTurnOff}
          >
            <div className="">TURN OFF</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPreview;
