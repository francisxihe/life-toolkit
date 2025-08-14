import { defineConfig } from "electron-vite";
import path from "path";
import { fileURLToPath } from "url";

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
        external: [
          "electron",
          "electron-devtools-installer",
          "sqlite3",
          "typeorm",
          "reflect-metadata",
          "class-validator",
          "class-transformer",
          "uuid",
          /^@life-toolkit\/components-repeat/,
          /^react-dnd/,
          /^dnd-core/,
          /^immutability-helper/,
        ],
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
        external: [
          "electron",
          /^@life-toolkit\/components-repeat/,
          /^react-dnd/,
          /^dnd-core/,
          /^immutability-helper/,
        ],
        output: {
          format: "cjs",
          entryFileNames: "[name].cjs",
        },
      },
      minify: process.env.NODE_ENV === "production",
      sourcemap: process.env.NODE_ENV !== "production",
    },
  },
  // renderer: {
  //   // 渲染进程配置
  //   root: path.resolve(currentDirPath, "src/renderer"),
  //   build: {
  //     outDir: "dist/renderer",
  //     rollupOptions: {
  //       external: [
  //         /^@life-toolkit\/components-repeat/,
  //         /^react-dnd/,
  //         /^dnd-core/,
  //         /^immutability-helper/,
  //       ],
  //     },
  //     minify: process.env.NODE_ENV === "production",
  //     sourcemap: process.env.NODE_ENV !== "production",
  //   },
  // },
});
