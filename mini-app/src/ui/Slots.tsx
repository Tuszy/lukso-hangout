import { useEffect, useState } from "react";
import useWorld, { CurrentSlot } from "../hooks/useWorld";
import {
  blockSizeOnTexture,
  blockTypes,
  textureBlocks,
} from "../material/blockMaterial";
import texture from "../material/texture.png";
import useCurrentAsset, { currentAssetActive } from "../hooks/useCurrentAsset";
import useUiState, {
  hasClosedBlockInventory,
  isNotImmersed,
  isVisitorMode,
  UiState,
} from "../hooks/useUiState";
import { isNotOwner } from "../hooks/useRole";

const BLOCK_SIZE = blockSizeOnTexture + "px";
const SLOT_COUNT = 9;

function Slots() {
  const [dragOverIndex, setDragOverIndex] = useState<null | number>(null);
  const assetToPlace = useCurrentAsset((state) => state.asset);
  const currentSlot = useWorld((state) => state.currentSlot);
  const setCurrentSlot = useWorld((state) => state.setCurrentSlot);
  const decrementCurrentSlot = useWorld((state) => state.decrementCurrentSlot);
  const incrementCurrentSlot = useWorld((state) => state.incrementCurrentSlot);
  const slots = useWorld((state) => state.slots);
  const assignBlockTypeToSlot = useWorld(
    (state) => state.assignBlockTypeIndexToSlot
  );

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (
        isNotOwner() ||
        currentAssetActive() ||
        isVisitorMode() ||
        (isNotImmersed() && hasClosedBlockInventory())
      ) {
        return;
      }

      if (e.code.startsWith("Digit")) {
        const index = parseInt(e.code.substring(5));
        if (isNaN(index) || index < 1 || index > SLOT_COUNT) return;
        setCurrentSlot(index as CurrentSlot);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (isVisitorMode() || isNotImmersed() || currentAssetActive()) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();

      if (e.deltaY > 0) {
        incrementCurrentSlot();
      } else if (e.deltaY < 0) {
        decrementCurrentSlot();
      }
    };

    window.addEventListener("keypress", onKeyPress);
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("keypress", onKeyPress);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // @ts-expect-error It exists...
    const slot = parseInt(e.target.getAttribute("slot-index")) as CurrentSlot;
    setDragOverIndex(null);
    try {
      const index = parseInt(e.dataTransfer.getData("text/plain"));
      if (isNaN(index) || index < 0 || index >= blockTypes.length)
        throw "UNKNOWN BLOCK TYPE";
      assignBlockTypeToSlot(slot, index);
    } catch (e) {
      console.error(e);
    }
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) =>
    e.preventDefault();

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setDragOverIndex(null);
  };

  const preventDefaultAndStopPropagation: React.MouseEventHandler<
    HTMLDivElement
  > = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (assetToPlace !== null) return null;

  return (
    <div
      className="fixed bottom-2 left-2 right-2 flex items-center justify-center z-10 select-none"
      onClick={preventDefaultAndStopPropagation}
    >
      <div className="text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden gap-2 flex items-start justify-start p-2">
        {Array(SLOT_COUNT)
          .fill(0)
          .map((block, index) => {
            const currentSlotIndex = (index + 1) as CurrentSlot;
            const currentBlockIndex = slots[currentSlotIndex];
            return (
              <div
                slot-index={index + 1}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDragLeave={onDragLeave}
                key={index}
                className={`relative w-16 h-16 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl overflow-hidden ${
                  currentSlot === index + 1 && dragOverIndex !== index
                    ? "ring-4 ring-yellow-400"
                    : ""
                } ${dragOverIndex === index ? "ring-4 ring-green-400" : ""}`}
                onClick={() => setCurrentSlot(currentSlotIndex)}
              >
                {currentBlockIndex !== null && (
                  <div
                    slot-index={index + 1}
                    className="rounded-md pointer-events-none"
                    style={{
                      backgroundImage: `url(${texture})`,
                      width: BLOCK_SIZE,
                      height: BLOCK_SIZE,
                      maxWidth: BLOCK_SIZE,
                      maxHeight: BLOCK_SIZE,
                      backgroundPositionX:
                        -blockSizeOnTexture * blockTypes[currentBlockIndex].x +
                        "px",
                      backgroundPositionY:
                        -blockSizeOnTexture *
                          (textureBlocks -
                            blockTypes[currentBlockIndex].y -
                            1) +
                        "px",
                      scale: "1.7",
                    }}
                  ></div>
                )}
                <div className="absolute text-sm bottom-0 right-0 font-bold bg-white shadow-2xl rounded-tl-xl rounded-br-xl h-5 w-5 grid place-content-center pointer-events-none">
                  {index + 1}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Slots;
