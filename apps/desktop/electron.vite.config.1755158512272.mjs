// electron.vite.config.ts
import { defineConfig } from "electron-vite";
import path from "path";
import { fileURLToPath } from "url";
var __electron_vite_injected_import_meta_url = "file:///Users/xuwenhua/code/application-mine/life-toolkit/apps/desktop/electron.vite.config.ts";
var currentFilePath = fileURLToPath(__electron_vite_injected_import_meta_url);
var currentDirPath = path.dirname(currentFilePath);
var electron_vite_config_default = defineConfig({
  main: {
    // 主进程配置
    build: {
      outDir: "dist/main",
      rollupOptions: {
        input: {
          index: path.resolve(currentDirPath, "src/main/index.ts")
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
          /^immutability-helper/
        ]
      },
      minify: process.env.NODE_ENV === "production",
      sourcemap: process.env.NODE_ENV !== "production"
    }
  },
  preload: {
    // 预加载脚本配置
    build: {
      outDir: "dist/preload",
      rollupOptions: {
        input: {
          index: path.resolve(currentDirPath, "src/preload/index.ts")
        },
        external: [
          "electron",
          /^@life-toolkit\/components-repeat/,
          /^react-dnd/,
          /^dnd-core/,
          /^immutability-helper/
        ],
        output: {
          format: "cjs",
          entryFileNames: "[name].cjs"
        }
      },
      minify: process.env.NODE_ENV === "production",
      sourcemap: process.env.NODE_ENV !== "production"
    }
  }
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
export {
  electron_vite_config_default as default
};
