import { defineConfig } from 'electron-vite';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import svgrPlugin from '@arco-plugins/vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import { vitePluginForArco } from '@arco-plugins/vite-react';

// 获取当前文件的目录路径
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@business': path.resolve(currentDirPath, '../../packages/business/server/src'),
        '@database': path.resolve(currentDirPath, 'src/database'),
        '@': path.resolve(currentDirPath, 'src/main'),
        '@life-toolkit/enum': path.resolve(currentDirPath, '../../packages/business/enum/index.ts'),
        '@life-toolkit/vo': path.resolve(currentDirPath, '../../packages/business/vo/index.ts'),
      },
      extensions: ['.ts', '.js', '.json'],
    },
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          index: path.resolve(currentDirPath, 'src/main/index.ts'),
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
          /^francis-types-repeat/,
          /^francis-helper-repeat/,
          /^react-dnd/,
          /^dnd-core/,
          /^immutability-helper/,
          'chinese-holiday-calendar',
          // 只保留必要的外部依赖，让 @life-toolkit 包被正确打包
          '@life-toolkit/electron-typeorm',
        ],
      },
      minify: false, // 禁用压缩以保留 TypeORM 装饰器元数据
      sourcemap: process.env.NODE_ENV !== 'production',
      // 监听整个 src 目录的变化
      watch:
        process.env.NODE_ENV === 'development'
          ? {
              include: [
                path.resolve(currentDirPath, 'src/main/**/*'),
                path.resolve(currentDirPath, 'src/database/**/*'),
                path.resolve(currentDirPath, '../../packages/business/server/**/*'),
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
          index: path.resolve(currentDirPath, 'src/preload/index.ts'),
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
    root: path.resolve(currentDirPath, 'src/render'),
    plugins: [
      react(),
      tailwindcss(),
      svgrPlugin({
        svgrOptions: {},
      }),
      vitePluginForArco({
        theme: '@arco-themes/react-francis',
        modifyVars: {
          // 'arcoblue-6': setting.themeColor,
        },
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
          replacement: path.resolve(currentDirPath, '../../packages/business/web/src/$1'),
        },
        {
          find: '@',
          replacement: path.resolve(currentDirPath, 'src/render'),
        },
        {
          find: '@life-toolkit/enum',
          replacement: path.resolve(currentDirPath, '../../packages/business/enum/index.ts'),
        },
        {
          find: '@life-toolkit/vo',
          replacement: path.resolve(currentDirPath, '../../packages/business/vo/index.ts'),
        },
        {
          find: '@life-toolkit/common-web-utils',
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
        input: path.resolve(currentDirPath, 'src/render/index.html'),
        external: [
          /^react-dnd/,
          /^dnd-core/,
          /^immutability-helper/,
          'chinese-holiday-calendar',
          /^francis-helper-repeat/,
        ],
      },
      minify: false, // 禁用压缩以保留 TypeORM 装饰器元数据
      sourcemap: process.env.NODE_ENV !== 'production',
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dnd', 'react-dnd-html5-backend', 'mitt', 'lodash-es'],
      exclude: ['@life-toolkit/common-web-utils', 'chinese-holiday-calendar', 'francis-helper-repeat'],
    },
  },
});
