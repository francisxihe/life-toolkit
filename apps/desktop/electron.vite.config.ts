import { defineConfig } from 'electron-vite';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

// 获取当前文件的目录路径
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const srcDir = path.resolve(currentDirPath, 'src');

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@business': path.resolve(srcDir, 'service'),
        '@db': path.resolve(srcDir, 'service/db'),
        '@': path.resolve(srcDir, 'main'),
        '@true-north/enum': path.resolve(currentDirPath, '../../packages/business/enum/index.ts'),
        '@true-north/vo': path.resolve(currentDirPath, '../../packages/business/vo/index.ts'),
      },
      extensions: ['.ts', '.js', '.json'],
    },
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          index: path.resolve(srcDir, 'main/index.ts'),
        },
        external: [
          'electron',
          'electron-devtools-installer',
          'sqlite3',
          'typeorm',
          'typeorm-naming-strategies',
          'reflect-metadata',
          'class-validator',
          'class-transformer',
          'uuid',
          /^react-dnd/,
          /^dnd-core/,
          /^immutability-helper/,
          'chinese-holiday-calendar',
          // 只保留必要的外部依赖，让 @true-north 包被正确打包
          '@true-north/electron-typeorm',
        ],
      },
      minify: false, // 禁用压缩以保留 TypeORM 装饰器元数据
      sourcemap: process.env.NODE_ENV !== 'production',
      watch:
        process.env.NODE_ENV === 'development'
          ? {
              include: [
                path.resolve(srcDir, 'main/**/*'),
                path.resolve(srcDir, 'service/**/*'),
              ],
            }
          : undefined,
    },
    // 开发环境配置
    define: {
      __DEV__: process.env.NODE_ENV === 'development',
    },
  },
  preload: {
    // 预加载脚本配置
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          index: path.resolve(srcDir, 'preload/index.ts'),
        },
        external: [
          'electron',
          'sqlite3',
          'typeorm',
          'reflect-metadata',
          'class-validator',
          'class-transformer',
          'uuid',
          /^react-dnd/,
          /^dnd-core/,
          /^immutability-helper/,
        ],
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs',
        },
      },
      minify: false, // 禁用压缩以保留 TypeORM 装饰器元数据
      sourcemap: process.env.NODE_ENV !== 'production',
    },
  },
  renderer: {
    server: {
      port: 8100,
    },
    // 渲染进程配置
    root: path.resolve(srcDir, 'render'),
    plugins: [
      react(),
      tailwindcss(),
      svgr({
        svgrOptions: { exportType: 'default' },
        include: '**/*.svg',
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
      devSourcemap: true,
    },
    resolve: {
      alias: [
        {
          find: /^@\/(.*)$/,
          replacement: path.resolve(srcDir, 'render/$1'),
        },
        {
          find: '@',
          replacement: path.resolve(srcDir, 'render'),
        },
        {
          find: '@true-north/enum',
          replacement: path.resolve(currentDirPath, '../../packages/business/enum/index.ts'),
        },
        {
          find: '@true-north/vo',
          replacement: path.resolve(currentDirPath, '../../packages/business/vo/index.ts'),
        },
        {
          find: '@true-north/common-web-utils',
          replacement: path.resolve(currentDirPath, '../../packages/common-web/utils/src/index.ts'),
        },
        // TODO 临时处理，后续需要修改
        {
          find: /^lodash$/,
          replacement: 'lodash-es',
        },
      ],
    },
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: path.resolve(srcDir, 'render/index.html'),
        external: [/^react-dnd/, /^dnd-core/, /^immutability-helper/],
      },
      minify: false, // 禁用压缩以保留 TypeORM 装饰器元数据
      sourcemap: process.env.NODE_ENV !== 'production',
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dnd', 'react-dnd-html5-backend', 'mitt', 'lodash-es'],
      exclude: ['@true-north/common-web-utils', 'chinese-holiday-calendar'],
    },
  },
});
