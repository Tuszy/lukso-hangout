import {
  CSSProperties,
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useAssetsStore, { Asset } from "../hooks/useAssetsStore";
import { ethers } from "ethers";
import LuksoLogo from "../assets/lukso logo.svg";
import useUiState, { UiState } from "../hooks/useUiState";
import useCurrentAsset, { AssetType } from "../hooks/useCurrentAsset";
import useWorld from "../hooks/useWorld";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from "react-window";
import { useAsset } from "../hooks/useAsset";

function NftInventory() {
  const rootRef = useRef() as MutableRefObject<HTMLDivElement>;
  const scrollRef = useRef() as MutableRefObject<HTMLDivElement>;
  const currentAssetToPlace = useCurrentAsset((state) => state.asset);
  const setCurrentAssetToPlace = useCurrentAsset((state) => state.setAsset);
  const setUiState = useUiState((state) => state.setUiState);
  const assetIds = useAssetsStore((state) => state.assetIds);
  const placedAssets = useWorld((state) => state.assets);
  const [assetPreview, setAssetPreview] = useState<null | Asset>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const onWheel = (e: WheelEvent) => {
      if (scrollRef.current) {
        let current = e.target;
        while (current) {
          if (current === scrollRef.current) return;
          // @ts-expect-error exists
          current = current?.parentNode;
        }
      }
      e.stopPropagation();
      e.preventDefault();
    };

    const ref = rootRef.current;

    ref.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      ref.removeEventListener("wheel", onWheel);
    };
  }, []);

  const assetIdList = useMemo(() => {
    return [...assetIds].filter((assetId) => !placedAssets[assetId]);
  }, [assetIds, placedAssets]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 flex flex-col items-center justify-center select-none p-4 backdrop-blur-md"
    >
      {assetPreview !== null ? (
        <>
          <div
            className="relative bg-white p-3 rounded-lg flex flex-col items-center justify-center gap-2 border-4 border-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xl font-bold">{assetPreview.name}</div>
            <img
              className="rounded-md w-72 h-72 border-4 border-black object-contain"
              src={assetPreview.images[0].url!}
              loading="lazy"
              draggable={false}
            />
            {assetPreview?.listing && (
              <a href={assetPreview.link} target="_blank" className="z-10">
                <div className="text-xl font-bold flex gap-1 items-center justify-center hover:text-yellow-600 transition-all">
                  <span>Listed for</span>
                  {parseFloat(
                    ethers.formatEther(assetPreview.listing.price)
                  )}{" "}
                  <img src={LuksoLogo} width={24} height={24} />
                </div>
              </a>
            )}

            <div
              className="w-full text-center p-2 text-black bg-white rounded-lg font-bold cursor-pointer hover:bg-gray-300 transition-all border-4 border-black"
              onClick={() => {
                setCurrentAssetToPlace(assetPreview, AssetType.IMAGE);
                setUiState(UiState.IMMERSED);
              }}
            >
              PLACE AS IMAGE
            </div>

            {assetPreview.models.length > 0 && (
              <div
                className="w-full text-center p-2 text-black bg-white rounded-lg font-bold cursor-pointer hover:bg-gray-300 transition-all border-4 border-black"
                onClick={() => {
                  setCurrentAssetToPlace(assetPreview, AssetType.MODEL);
                  setUiState(UiState.IMMERSED);
                }}
              >
                PLACE AS 3D OBJECT
              </div>
            )}

            {assetPreview.videos.length > 0 && (
              <div
                className="w-full text-center p-2 text-black bg-white rounded-lg font-bold cursor-pointer hover:bg-gray-300 transition-all border-4 border-black"
                onClick={() => {
                  setCurrentAssetToPlace(assetPreview, AssetType.VIDEO);
                  setUiState(UiState.IMMERSED);
                }}
              >
                PLACE AS VIDEO
              </div>
            )}

            {assetPreview.audios.length > 0 && (
              <div
                className="w-full text-center p-2 text-black bg-white rounded-lg font-bold cursor-pointer hover:bg-gray-300 transition-all border-4 border-black"
                onClick={() => {
                  setCurrentAssetToPlace(assetPreview, AssetType.AUDIO);
                  setUiState(UiState.IMMERSED);
                }}
              >
                PLACE AS AUDIO
              </div>
            )}

            <div
              className="w-full text-center p-2 text-black bg-white rounded-lg font-bold cursor-pointer hover:bg-gray-300 transition-all border-4 border-black"
              onClick={() => setAssetPreview(null)}
            >
              BACK TO OVERVIEW
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className="text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg p-2 flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-10 left-0 right-0 m-auto flex items-center justify-center z-20">
              <div className="border-white/50 border-2 shadow-2xl bg-black/60 text-3xl text-white px-4 rounded-t-lg">
                NFT INVENTORY
              </div>
            </div>
            <div
              ref={scrollRef}
              className="h-80 w-[85vw] flex-grow flex-shrink flex"
            >
              {assetIdList.length === 0 ? (
                <div className="text-2xl opacity-65">EMPTY</div>
              ) : (
                <AutoSizer>
                  {({ height, width }) => {
                    const count = assetIdList.length;
                    const columnCount = Math.min(
                      count,
                      Math.floor((width - 10) / 128)
                    );
                    const rowCount = Math.ceil(count / columnCount);
                    return (
                      <FixedSizeGrid
                        style={{
                          overflowX: "hidden",
                          scrollbarWidth: "thin",
                        }}
                        height={height}
                        width={width}
                        columnWidth={128}
                        rowHeight={128}
                        columnCount={columnCount}
                        rowCount={rowCount}
                        itemData={{
                          count,
                          columnCount,
                          rowCount,
                          assetIds: assetIdList,
                          currentAssetToPlace: currentAssetToPlace?.id ?? null,
                          select: setAssetPreview,
                        }}
                      >
                        {NftItem}
                      </FixedSizeGrid>
                    );
                  }}
                </AutoSizer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const NftItem = ({
  columnIndex,
  rowIndex,
  style,
  data,
}: {
  columnIndex: number;
  rowIndex: number;
  style: CSSProperties;
  data: {
    count: number;
    rowCount: number;
    columnCount: number;
    assetIds: string[];
    currentAssetToPlace: string | null;
    select: (asset: Asset) => void;
  };
}) => {
  const index = rowIndex * data.columnCount + columnIndex;
  const id = data.assetIds[index];
  const { data: asset, isLoading } = useAsset(index >= data.count ? null : id);

  if (index >= data.count) return null;

  if (isLoading) {
    return (
      <div style={style} className="p-1">
        <div
          className={`relative w-full h-full grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl group animate-pulse`}
        >
          LOADING
        </div>
      </div>
    );
  }

  if (!asset || asset.images.length === 0) return null;

  return (
    <div style={style} className="p-1">
      <div
        className={`relative w-full h-full grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl group hover:ring-4 hover:ring-green-400 cursor-pointer ${
          data.currentAssetToPlace === id ? "ring-4 ring-yellow-400" : ""
        }`}
        onClick={() => data.select(asset)}
      >
        <img
          draggable={false}
          className="rounded-md w-28 h-28 object-contain"
          src={asset.images[0].url!}
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default NftInventory;
