import { useEffect } from "react";
import { currentAssetActive } from "../hooks/useCurrentAsset";
import { isNotOwner } from "../hooks/useRole";
import useWorld, { hasNoUnsavedChanges } from "../hooks/useWorld";
import useSaveWorldFunction from "../hooks/useSaveWorldFunction";
import useUiState, { UiState } from "../hooks/useUiState";

function UnsavedChanges() {
  const setUiState = useUiState((state) => state.setUiState);
  const saveWorld = useSaveWorldFunction();
  const changes = useWorld((state) => state.changes.size);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (isNotOwner() || currentAssetActive() || hasNoUnsavedChanges()) {
        return;
      }

      if (e.code === "KeyU") {
        setUiState(UiState.PAUSE);
        saveWorld();
      }
    };

    window.addEventListener("keypress", onKeyPress);

    return () => {
      window.removeEventListener("keypress", onKeyPress);
    };
  }, []);

  if (changes === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-2 px-2 text-red-600 font-bold border-2 border-red-600 shadow-2xl backdrop-blur-lg bg-black/40 rounded-lg overflow-hidden flex flex-col items-center justify-center gap-1 select-none animate-pulse">
      UNSAVED CHANGES - PRESS U TO SAVE
    </div>
  );
}

export default UnsavedChanges;
