import { MutableRefObject, useEffect, useRef } from "react";
import {
  blockSizeOnTexture,
  blockTypes,
  textureBlocks,
} from "../material/blockMaterial";
import texture from "../material/texture.png";

const BLOCK_SIZE = blockSizeOnTexture + "px";

function BlockInventory() {
  const rootRef = useRef() as MutableRefObject<HTMLDivElement>;
  const scrollRef = useRef() as MutableRefObject<HTMLDivElement>;

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

  const onDrag: React.DragEventHandler<HTMLDivElement> = (e) => {
    // @ts-expect-error It exists...
    const index = parseInt(e.target.getAttribute("block-index"));
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const preventDefaultAndStopPropagation: React.MouseEventHandler<
    HTMLDivElement
  > = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 flex items-center justify-center select-none p-4 backdrop-blur-md"
    >
      <div
        className="text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg p-2 flex-col"
        onClick={preventDefaultAndStopPropagation}
      >
        <div className="absolute -top-10 left-0 right-0 m-auto flex items-center justify-center z-20">
          <div className="border-white/50 border-2 shadow-2xl bg-black/60 text-3xl text-white px-4 rounded-t-lg">
            BLOCK INVENTORY
          </div>
        </div>
        <div
          ref={scrollRef}
          className="max-h-[50vh] gap-2 flex flex-wrap items-center justify-center overflow-y-auto py-1"
        >
          {blockTypes.map((block, index) => (
            <div
              key={index}
              className={`relative w-16 h-16 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl overflow-hidden hover:ring-4 hover:ring-green-400 pointer-events-none`}
            >
              <div
                draggable={true}
                onDragStart={onDrag}
                className="rounded-md cursor-grab pointer-events-auto"
                block-index={index}
                style={{
                  backgroundImage: `url(${texture})`,
                  width: BLOCK_SIZE,
                  height: BLOCK_SIZE,
                  maxWidth: BLOCK_SIZE,
                  maxHeight: BLOCK_SIZE,
                  backgroundPositionX: -blockSizeOnTexture * block.x + "px",
                  backgroundPositionY:
                    -blockSizeOnTexture * (textureBlocks - block.y - 1) + "px",
                  scale: "1.7",
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlockInventory;
