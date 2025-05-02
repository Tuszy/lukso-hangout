import { useEffect } from "react";
import { currentAssetActive } from "../hooks/useCurrentAsset";
import useRole, { isNotOwner, Role } from "../hooks/useRole";
import useUiState, { isNotImmersed, UiMode } from "../hooks/useUiState";

function CurrentMode() {
  const verified = useRole((state) => state.verified);
  const role = useRole((state) => state.role);
  const mode = useUiState((state) => state.mode);
  const toggleMode = useUiState((state) => state.toggleMode);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (isNotOwner() || currentAssetActive() || isNotImmersed()) {
        return;
      }
      if (e.code === "KeyB") {
        toggleMode();
      }
    };

    window.addEventListener("keypress", onKeyPress);

    return () => {
      window.removeEventListener("keypress", onKeyPress);
    };
  }, []);

  return (
    <div className="fixed top-0.5 left-8 px-2 text-white font-bold border-2 border-white/50 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 select-none text-center">
      {mode === UiMode.BUILDER ? "BUILDER MODE" : "VISITOR MODE"}
      <br />
      {mode === UiMode.VISITOR && role !== Role.NONE && (
        <span
          className={
            "text-[10px] -mt-1 rounded-2xl px-3 py-0.5 m-1 border-white border " +
            (verified ? "bg-green-900" : "bg-red-900")
          }
        >
          {verified ? "VERIFIED" : "NOT VERIFIED"}
          <br />
          {!verified && <span>PRESS T TO VERIFY</span>}
        </span>
      )}
    </div>
  );
}

export default CurrentMode;
