import useCurrentAsset, { AssetType } from "../hooks/useCurrentAsset";

function AssetToPlacePreview() {
  const assetToPlace = useCurrentAsset((state) => state.asset);
  const model = useCurrentAsset((state) => state.type === AssetType.MODEL);

  if (assetToPlace === null) return null;

  return (
    <>
      <div className="fixed bottom-2 right-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 z-10 select-none">
        <div>
          <div className="border-b-2 border-white/50 w-full text-center text-md">
            <span>CONTROLS</span>
          </div>
          <div className="grid grid-cols-3 w-full text-sm gap-1.5 p-2">
            <div className="flex items-center justify-center">
              <div className="relative w-10 h-14 grid place-content-center bg-gray-200 text-black p-1 rounded-full border-gray-400 border-2 font-bold text-xl">
                <div className="absolute bg-red-900 w-4 h-6 top-0.5 left-[1.5px] rounded-tl-3xl border border-black/65"></div>
                <div className="absolute bg-black/10 w-4 h-6 top-0.5 right-[1.5px] rounded-tr-3xl border border-black/65"></div>
                <div className="absolute bg-gray-300 w-2 h-5 top-1 left-0 right-0 m-auto rounded-full border border-black/65"></div>
                <div className="absolute text-[8px] bottom-1 m-auto left-0 right-0 text-center">
                  CLICK
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              PLACE NFT
            </div>

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
              CANCEL PLACEMENT
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-10 h-14 grid place-content-center bg-gray-200 text-black p-1 rounded-full border-gray-400 border-2 font-bold text-xl">
                <div className="absolute bg-black/10 w-4 h-6 top-0.5 left-[1.5px] rounded-tl-3xl border border-black/65"></div>
                <div className="absolute bg-black/10 w-4 h-6 top-0.5 right-[1.5px] rounded-tr-3xl border border-black/65"></div>
                <div className="absolute bg-red-900 w-2 h-5 top-1 left-0 right-0 m-auto rounded-full border border-black/65"></div>
                <div className="absolute text-[8px] bottom-1 m-auto left-0 right-0 text-center">
                  SCROLL
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              CHANGE NFT SIZE
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-lg">
                + / -
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              CHANGE NFT SIZE
            </div>

            {model ? (
              <>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-[10px] text-center">
                    RIGHT
                    <br />
                    ARROW
                  </div>
                </div>
                <div className="flex items-center justify-center col-span-2 text-center">
                  ROTATE RIGHT
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-[10px] text-center">
                    LEFT
                    <br />
                    ARROW
                  </div>
                </div>
                <div className="flex items-center justify-center col-span-2 text-center">
                  ROTATE LEFT
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-[10px] text-center">
                    UP
                    <br />
                    ARROW
                  </div>
                </div>
                <div className="flex items-center justify-center col-span-2 text-center">
                  MOVE AWAY
                  <br />
                  FROM CAMERA
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-[10px] text-center">
                    DOWN
                    <br />
                    ARROW
                  </div>
                </div>
                <div className="flex items-center justify-center col-span-2 text-center">
                  MOVE TOWARDS
                  <br />
                  CAMERA
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl text-center">
                    B
                  </div>
                </div>
                <div className="flex items-center justify-center col-span-2 text-center">
                  TOGGLE
                  <br />
                  "ATTACH TO BLOCK"
                </div>
              </>
            )}
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                0
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              RESET CHANGES
            </div>
          </div>
        </div>
      </div>

      {"images" in assetToPlace && (assetToPlace.images?.length ?? 0) > 0 && (
        <div className="fixed bottom-2 left-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 z-10 select-none">
          <div>
            <div className="border-b-2 border-white/50 w-full text-center text-md">
              <span>NFT</span>
            </div>
            <div className="p-2">
              <img
                className="rounded-md w-40 h-40 border-4 border-black object-contain"
                src={assetToPlace.images[0].url!}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AssetToPlacePreview;
