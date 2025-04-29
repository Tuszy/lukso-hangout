import { PropsWithChildren } from "react";
import useWorld, { WorldAsset } from "../hooks/useWorld";
import { Model } from "./Model";
import { ImageFrame } from "./ImageFrame";
import { AssetType } from "../hooks/useCurrentAsset";
import { VideoFrame } from "./VideoFrame";
import { useAsset } from "../hooks/useAsset";

function Asset({
  worldAsset,
}: PropsWithChildren<{
  worldAsset: WorldAsset;
}>) {
  const bought = useWorld(
    (state) => state.boughtAssets[worldAsset.id] ?? false
  );
  const { data: asset } = useAsset(worldAsset.id);

  if (!asset) return null;
  if (worldAsset.type === AssetType.IMAGE && asset.images.length === 0) {
    return null;
  }
  if (worldAsset.type === AssetType.MODEL && asset.models.length === 0) {
    return null;
  }
  if (worldAsset.type === AssetType.AUDIO && asset.audios.length === 0) {
    return null;
  }
  if (worldAsset.type === AssetType.VIDEO && asset.videos.length === 0) {
    return null;
  }

  return (
    <group
      position={worldAsset.position}
      rotation={worldAsset.rotation}
      scale={[
        worldAsset.scale,
        worldAsset.scale,
        worldAsset.type === AssetType.MODEL ? worldAsset.scale : 1,
      ]}
    >
      {worldAsset.type === AssetType.IMAGE && (
        <ImageFrame
          assetId={worldAsset.id}
          asset={asset}
          rigidBody={true}
          bought={bought}
        />
      )}

      {worldAsset.type === AssetType.VIDEO && (
        <VideoFrame
          assetId={worldAsset.id}
          asset={asset}
          rigidBody={true}
          bought={bought}
        />
      )}

      {worldAsset.type === AssetType.MODEL && (
        <Model
          assetId={worldAsset.id}
          asset={asset}
          rigidBody={true}
          bought={bought}
        />
      )}
    </group>
  );
}

export default Asset;
