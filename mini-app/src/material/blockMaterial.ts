import * as THREE from "three";
import sprite from "./texture.png";

export const textureBlocks = 16;
export const textureSize = 512;
export const blockSizeOnTexture = textureSize / textureBlocks;

export type BlockType = {
  x: number;
  y: number;
  uvs: Float32Array;
};

export const blockTypes: BlockType[] = [
  { x: 0, y: 14 },
  { x: 0, y: 15 },
  { x: 0, y: 13 },
  { x: 0, y: 12 },
  { x: 0, y: 11 },
  { x: 0, y: 6 },
  { x: 0, y: 5 },
  { x: 0, y: 4 },
  { x: 0, y: 3 },
  { x: 0, y: 2 },

  { x: 1, y: 15 },
  { x: 1, y: 14 },
  { x: 1, y: 13 },
  { x: 1, y: 8 },
  { x: 1, y: 7 },
  { x: 1, y: 6 },
  { x: 1, y: 5 },
  { x: 1, y: 4 },
  { x: 1, y: 3 },
  { x: 1, y: 2 },
  { x: 1, y: 1 },

  { x: 2, y: 15 },
  { x: 2, y: 14 },
  { x: 2, y: 13 },
  { x: 2, y: 12 },
  { x: 2, y: 11 },
  { x: 2, y: 8 },
  { x: 2, y: 7 },
  { x: 2, y: 6 },
  { x: 2, y: 5 },
  { x: 2, y: 4 },
  { x: 2, y: 3 },
  { x: 2, y: 2 },

  { x: 3, y: 14 },
  { x: 3, y: 12 },
  { x: 3, y: 11 },

  { x: 4, y: 15 },
  { x: 4, y: 14 },
  { x: 4, y: 13 },
  { x: 4, y: 12 },
  { x: 4, y: 8 },
  { x: 4, y: 7 },

  { x: 5, y: 15 },
  { x: 5, y: 13 },
  { x: 5, y: 11 },
  { x: 5, y: 8 },

  { x: 6, y: 15 },
  { x: 6, y: 14 },
  { x: 6, y: 11 },
  { x: 6, y: 10 },

  { x: 7, y: 15 },
  { x: 7, y: 14 },
  { x: 7, y: 10 },
  { x: 7, y: 9 },

  { x: 8, y: 15 },
  { x: 8, y: 14 },
  { x: 8, y: 13 },
  { x: 8, y: 11 },
  { x: 8, y: 9 },

  { x: 9, y: 15 },
  { x: 9, y: 14 },
  { x: 9, y: 9 },
  { x: 9, y: 8 },

  { x: 10, y: 15 },
  { x: 10, y: 11 },

  { x: 11, y: 13 },
  { x: 11, y: 9 },

  { x: 14, y: 12 },

  { x: 15, y: 2 },
  { x: 15, y: 0 },
].map((type) => {
  const { x, y } = type;
  const uvs = [];
  for (let i = 0; i < 6; i++) {
    uvs.push(
      ...[
        x / textureBlocks,
        (y + 1) / textureBlocks,
        (x + 1) / textureBlocks,
        (y + 1) / textureBlocks,
        x / textureBlocks,
        y / textureBlocks,
        (x + 1) / textureBlocks,
        y / textureBlocks,
      ]
    );
  }
  return { ...type, uvs: new Float32Array(uvs) };
});

export const blockMaterial = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load(sprite, (texture) => {
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
  }),
});

blockMaterial.onBeforeCompile = (
  parameters: THREE.WebGLProgramParametersWithUniforms
) => {
  parameters.vertexShader = parameters.vertexShader.replace(
    "varying vec3 vViewPosition;",
    `
      varying vec3 vViewPosition;
      varying vec2 vUv;
      attribute vec2 blockIndex;
      `
  );

  parameters.vertexShader = parameters.vertexShader.replace(
    "#include <uv_vertex>",
    `
      if(gl_VertexID % 4 == 0){
        vUv = vec2(blockIndex.x/16.0,(blockIndex.y+1.0)/16.0);
      }else if(gl_VertexID % 4 == 1){
        vUv = vec2((blockIndex.x+1.0)/16.0,(blockIndex.y+1.0)/16.0);
      }else if(gl_VertexID % 4 == 2){
        vUv = vec2(blockIndex.x/16.0,blockIndex.y/16.0);
      }else if(gl_VertexID % 4 == 3){
        vUv = vec2((blockIndex.x+1.0)/16.0,blockIndex.y/16.0);
      }
      `
  );

  parameters.fragmentShader = parameters.fragmentShader.replace(
    "#include <uv_pars_fragment>",
    `
      varying vec2 vUv;
      `
  );

  parameters.fragmentShader = parameters.fragmentShader.replace(
    "#include <map_fragment>",
    `
      vec4 texelColor = texture2D( map, vUv );
        
        diffuseColor *= texelColor;
      `
  );
};
