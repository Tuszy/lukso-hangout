import { useMemo } from "react";
import useAssetsStore from "../hooks/useAssetsStore";
import useWorld from "../hooks/useWorld";
import Asset from "./Asset";

export const Assets = () => {
  const assetIds = useAssetsStore((state) => state.assetIds);
  const assets = useWorld((state) => state.assets);

  const ownedAssets = useMemo(
    () => Object.values(assets).filter((asset) => assetIds.has(asset.id)),
    [assetIds, assets]
  );

  return ownedAssets.map((asset) => (
    <Asset key={asset.id} worldAsset={asset} />
  ));
};
