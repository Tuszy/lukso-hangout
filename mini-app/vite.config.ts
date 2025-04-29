import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import glslRawPlugin from "vite-raw-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    glslRawPlugin({
      fileRegex: /\.glsl$/,
    }),
    viteSingleFile(),
  ],
  server: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts: ["universaleverything.io"],
  },
  assetsInclude: ["**/*.gltf", "**/*.glb"],
});
