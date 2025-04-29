// React
import { useEffect, useState } from "react";

// Store
import useAssetsStore from "./useAssetsStore";
import { getAssetIDs } from "./assets";

const useAssets = (contextAccount: `0x${string}` | null) => {
  const [fetched, setFetched] = useState<boolean>(false);
  const reset = useAssetsStore((state) => state.reset);
  const setAssetIds = useAssetsStore((state) => state.setAssetIds);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!contextAccount) return;
      reset();
      console.time("FETCH ASSET IDs");
      const assetIds = await getAssetIDs(contextAccount);
      setAssetIds(assetIds);
      console.timeEnd("FETCH ASSET IDs");
      console.log("ASSET ID COUNT:", assetIds.length);
      setFetched(true);
    };

    fetchAssets();
  }, [reset, contextAccount, setAssetIds]);

  return fetched;
};

export default useAssets;
