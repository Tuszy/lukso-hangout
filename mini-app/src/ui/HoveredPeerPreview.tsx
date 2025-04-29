import { useMemo } from "react";
import useWorld from "../hooks/useWorld";
import { useServerConnection } from "../hooks/useServerConnection";

function HoveredPeerPreview() {
  const hoveredPeerId = useWorld((state) => state.hoveredPeer);
  const peers = useServerConnection((state) => state.peers);
  const peer = useMemo(() => {
    if (!hoveredPeerId) return null;
    return peers[hoveredPeerId];
  }, [peers, hoveredPeerId]);

  if (peer === null) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-2 right-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 z-10 select-none">
        <div>
          <div className="border-b-2 border-white/50 w-full text-center text-md">
            <span>MOUSE CONTROLS</span>
          </div>
          <div className="grid grid-cols-3 w-full text-sm gap-1.5 p-2">
            {peer.address && (
              <>
                <div className="flex items-center justify-center">
                  <div className="relative w-10 h-14 grid place-content-center bg-gray-200 text-black p-1 rounded-full border-gray-400 border-2 font-bold text-xl">
                    <div className="absolute bg-red-900 w-4 h-6 top-0.5 right-[1.5px] rounded-tr-3xl border border-black/65"></div>
                    <div className="absolute bg-black/10 w-4 h-6 top-0.5 left-[1.5px] rounded-tl-3xl border border-black/65"></div>
                    <div className="absolute bg-gray-300 w-2 h-5 top-1 left-0 right-0 m-auto rounded-full border border-black/65"></div>
                    <div className="absolute text-[8px] bottom-1 m-auto left-0 right-0 text-center">
                      CLICK
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center col-span-2">
                  OPEN ON
                  <br />
                  UNIVERSAL PAGE
                </div>
              </>
            )}

            {peer.remoteStream && (
              <>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                    M
                  </div>
                </div>
                <div className="flex items-center col-span-2">
                  UNMUTE / MUTE
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-2 left-2 max-w-100 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 z-10 select-none">
        <div>
          <div className={`w-full text-center text-md p-1 px-2`}>
            <span>{peer.data?.name ?? peer.address ?? "Anonymous Guest"}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default HoveredPeerPreview;
