import { defineConfig } from "electron-vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// 获取当前文件的目录路径
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

export default defineConfig({
  main: {
    // 主进程配置
    build: {
      outDir: "dist/main",
      rollupOptions: {
        input: {
          index: path.resolve(currentDirPath, "src/main/index.ts"),
        },
        external: ["electron", "electron-devtools-installer"],
      },
      minify: process.env.NODE_ENV === "production",
      sourcemap: process.env.NODE_ENV !== "production",
    },
  },
  preload: {
    // 预加载脚本配置
    build: {
      outDir: "dist/preload",
      rollupOptions: {
        input: {
          index: path.resolve(currentDirPath, "src/preload/index.ts"),
        },
        external: ["electron"],
        output: {
          format: "cjs",
          entryFileNames: "[name].cjs"
        }
      },
      minify: process.env.NODE_ENV === "production",
      sourcemap: process.env.NODE_ENV !== "production",
    },
  },
});
