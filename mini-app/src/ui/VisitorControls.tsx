import useRole, { Role } from "../hooks/useRole";
import useUiState, { UiState } from "../hooks/useUiState";

function VisitorControls() {
  const role = useRole((state) => state.role);
  const ui = useUiState((state) => state.ui);

  if (ui === UiState.IMMERSED)
    return (
      <>
        <div className="fixed top-0.5 px-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 select-none">
          PRESS ESC TO EXIT
        </div>
      </>
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

            {role === Role.OWNER && (
              <>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                    B
                  </div>
                </div>
                <div className="flex items-center justify-center col-span-2">
                  SWITCH MODE
                </div>
              </>
            )}

            {role !== Role.NONE && (
              <>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                    V
                  </div>
                </div>
                <div className="flex items-center justify-center col-span-2">
                  VIDEO CHAT
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                    C
                  </div>
                </div>
                <div className="flex items-center justify-center col-span-2">
                  AUDIO CHAT
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 grid place-content-center bg-gray-200 text-black p-1 rounded-xl border-gray-400 border-2 font-bold text-xl">
                    T
                  </div>
                </div>
                <div className="flex items-center justify-center col-span-2">
                  VERIFICATION
                </div>
              </>
            )}

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

export default VisitorControls;
