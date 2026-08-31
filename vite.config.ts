import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "path";
import fs from "fs";

// Sync master logo files from kck/public into public
try {
  const masterLogo = path.resolve(__dirname, "../kck/public/KCK-logo-rdec_small.png");
  const masterSecondary = path.resolve(__dirname, "../kck/public/KCK-logo-rdec-sekundaren_small.png");
  const targetDir = path.resolve(__dirname, "public");

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  if (fs.existsSync(masterLogo)) {
    fs.copyFileSync(masterLogo, path.join(targetDir, "KCK-logo-rdec_small.png"));
  }
  if (fs.existsSync(masterSecondary)) {
    fs.copyFileSync(masterSecondary, path.join(targetDir, "KCK-logo-rdec-sekundaren_small.png"));
  }
} catch (e) {
  // ignore
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    optimizeDeps: {
      include: [
        "@radix-ui/react-checkbox",
        "@tanstack/router-core",
        "@tanstack/router-core/ssr/client",
        "seroval",
      ],
    },
  },
});
