import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: [
      "@radix-ui/react-checkbox",
      "@tanstack/router-core",
      "@tanstack/router-core/ssr/client",
      "seroval",
    ],
  },
});
