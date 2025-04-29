import useUiState, { UiState } from "../hooks/useUiState";
import useWorld from "../hooks/useWorld";

function BuilderControls() {
  const ui = useUiState((state) => state.ui);
  const changes = useWorld((state) => state.changes.size);

  if (ui === UiState.IMMERSED)
    return (
      <>
        <div className="fixed top-0.5 px-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 select-none">
          PRESS ESC TO EXIT
        </div>
        {changes > 0 && (
          <div className="fixed top-0.5 right-8 px-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 select-none">
            PRESS U TO SAVE
          </div>
        )}
      </>
    );

  if (ui === UiState.INVENTORY)
    return (
      <div className="fixed top-0.5 px-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 select-none">
        PRESS ESC OR I TO CLOSE BLOCK INVENTORY
      </div>
    );

  if (ui === UiState.NFT)
    return (
      <div className="fixed top-0.5 px-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 select-none">
        PRESS ESC OR N TO CLOSE NFT INVENTORY
      </div>
    );

  const preventDefaultAndStopPropagation: React.MouseEventHandler<
    HTMLDivElement
  > = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <div
        className="fixed bottom-2 right-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 z-10 select-none"
        onClick={preventDefaultAndStopPropagation}
      >
        <div>
          <div className="border-b-2 border-white/50 w-full text-center text-md">
            <span>MOUSE CONTROLS</span>
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
              PLACE BLOCK
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
              DESTROY BLOCK
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
              CHANGE BLOCK
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-10 h-14 grid place-content-center bg-gray-200 text-black p-1 rounded-full border-gray-400 border-2 font-bold text-xl">
                <div className="absolute bg-black/10 w-4 h-6 top-0.5 left-[1.5px] rounded-tl-3xl border border-black/65"></div>
                <div className="absolute bg-black/10 w-4 h-6 top-0.5 right-[1.5px] rounded-tr-3xl border border-black/65"></div>
                <div className="absolute bg-red-900 w-2 h-5 top-1 left-0 right-0 m-auto rounded-full border border-black/65"></div>
                <div className="absolute text-[8px] bottom-1 m-auto left-0 right-0 text-center">
                  CLICK
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              SET SPAWN
            </div>
          </div>
        </div>
      </div>
      <div
        className="fixed bottom-2 left-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 z-10 select-none"
        onClick={preventDefaultAndStopPropagation}
      >
        <div>
          <div className="border-b-2 border-white/50 w-full text-center text-md">
            <span>KEYBOARD CONTROLS</span>
          </div>
          <div className="grid grid-cols-3 w-full text-sm gap-1.5 p-2">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                W
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              MOVE FORWARD
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                A
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              MOVE LEFT
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                S
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              MOVE BACKWARD
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                D
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              MOVE RIGHT
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-8 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xs">
                SPACE
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              JUMP
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-8 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xs">
                SHIFT
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              SPRINT
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                1-9
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              CHANGE BLOCK
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                I / N
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              OPEN INVENTORY
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                B
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              SWITCH MODE
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-md">
                ESC
              </div>
            </div>
            <div className="flex items-center justify-center col-span-2">
              EXIT
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BuilderControls;
