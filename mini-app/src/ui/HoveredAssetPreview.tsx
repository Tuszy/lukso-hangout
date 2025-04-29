import { useMemo } from "react";
import useWorld from "../hooks/useWorld";
import { ethers } from "ethers";
import LuksoLogo from "../assets/lukso logo.svg";
import useRole, { Role } from "../hooks/useRole";
import React from "react";
import { useAsset } from "../hooks/useAsset";
import { AssetType } from "../hooks/useCurrentAsset";

function HoveredAssetPreview() {
  const role = useRole((state) => state.role);
  const hoveredAssetId = useWorld((state) => state.hoveredAsset);
  const bought = useWorld((state) =>
    state.hoveredAsset ? state.boughtAssets[state.hoveredAsset] ?? false : false
  );
  const worldAsset = useWorld((state) =>
    state.hoveredAsset ? state.assets[state.hoveredAsset] : null
  );
  const { data: asset } = useAsset(hoveredAssetId);

  const attributes = useMemo(
    () =>
      (asset ? asset.metadata?.attributes ?? [] : []) as {
        key: string;
        value: string;
      }[],
    [asset]
  );

  const listingPrice = useMemo(
    () =>
      asset?.listing
        ? parseFloat(ethers.formatEther(asset.listing.price))
        : null,
    [asset]
  );

  if (!asset) {
    return null;
  }

  const isListed = asset.listing;

  return (
    <>
      <div className="fixed bottom-2 right-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 z-10 select-none">
        <div>
          <div className="border-b-2 border-white/50 w-full text-center text-md">
            <span>CONTROLS</span>
          </div>
          <div className="grid grid-cols-3 w-full text-sm gap-1.5 p-2">
            {isListed && role === Role.VISITOR && (
              <>
                <div className="flex items-center justify-center">
                  <div className="relative w-10 h-14 grid place-content-center bg-gray-200 text-black p-1 rounded-full border-gray-400 border-2 font-bold text-xl">
                    <div className="absolute bg-red-900 w-4 h-6 top-0.5 left-[1.5px] rounded-tl-3xl border border-black/65"></div>
                    <div className="absolute bg-black/10 w-4 h-6 top-0.5 right-[1.5px] rounded-tr-3xl border border-black/65"></div>
                    <div className="absolute bg-gray-300 w-2 h-5 top-1 left-0 right-0 m-auto rounded-full border border-black/65"></div>
                    <div className="absolute text-[8px] bottom-1.5 m-auto left-0 right-0 text-center leading-none">
                      CLICK
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center col-span-2">
                  BUY LISTED NFT
                </div>
              </>
            )}

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

            {(worldAsset?.type === AssetType.VIDEO ||
              worldAsset?.type === AssetType.AUDIO) && (
              <>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                    P
                  </div>
                </div>
                <div className="flex items-center col-span-2">PLAY / PAUSE</div>
              </>
            )}

            {(worldAsset?.type === AssetType.VIDEO ||
              worldAsset?.type === AssetType.AUDIO) && (
              <>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                    R
                  </div>
                </div>
                <div className="flex items-center col-span-2">RESTART</div>
              </>
            )}

            {(worldAsset?.type === AssetType.VIDEO ||
              worldAsset?.type === AssetType.AUDIO) && (
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

      <div className="fixed bottom-2 left-2 max-w-md text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 z-10 select-none">
        <div>
          <div
            className={`w-full text-center text-md p-1 px-2 ${
              attributes.length > 0 ? "border-b-2 border-white/50" : ""
            }`}
          >
            <span>{asset.name}</span>
          </div>
          {attributes.length > 0 && (
            <div className="grid grid-cols-2 p-2 text-sm gap-x-2">
              {attributes.map((attribute, index) => (
                <React.Fragment key={attribute.key + index}>
                  <div>{attribute.key}</div>
                  <div className="break-words break-all">
                    {typeof attribute.value === "boolean"
                      ? attribute.value
                        ? "YES"
                        : "NO"
                      : attribute.value}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
          {isListed && !bought && (
            <div className="text-center flex items-center justify-center border-t-2 border-white/50 py-1 gap-1 px-2">
              <span>Listed for {listingPrice}</span>{" "}
              <img src={LuksoLogo} width={18} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default HoveredAssetPreview;
