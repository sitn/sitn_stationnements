import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";

export default defineConfig({
  base: "/stationnement/", // for local use '', for test use: '/web/test_stationnement/', for production (docker) use '/stationnement/'
  publicDir: "public",

  plugins: [
    vue({
      template: {
        transformAssetUrls,
      },
    }),
    quasar(),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets/", import.meta.url)),
      "@public": fileURLToPath(new URL("./public/", import.meta.url)),
    },
  },

  build: {
    sourcemap: true,
  },
});
