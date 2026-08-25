import { defineConfig } from 'electron-vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import type { Plugin } from 'vite';

// 获取当前文件的目录路径
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const srcDir = path.resolve(currentDirPath, 'src');
const desktopDevPages = ['ProductWiki', 'Lab'] as const;

function desktopDevPage(): Plugin {
  return {
    name: 'desktop-dev-pages',
    configureServer(server) {
      server.watcher.add(path.resolve(srcDir, 'dev'));
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0];
        const page = desktopDevPages.find((name) => pathname === `/${name}.html`);
        if (!page) {
          next();
          return;
        }
        try {
          const htmlPath = path.resolve(srcDir, `dev/${page}.html`);
          const entryPath = path.resolve(srcDir, `dev/${page}.tsx`);
          const entryUrl = `/@fs/${entryPath.replace(/\\/g, '/').replace(/^\/+/, '')}`;
          let html = fs.readFileSync(htmlPath, 'utf-8');
          html = html.replace(`./${page}.tsx`, entryUrl);
          html = await server.transformIndexHtml(`/${page}.html`, html);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@business': path.resolve(srcDir, 'service'),
        '@db': path.resolve(srcDir, 'service/db'),
        '@': path.resolve(srcDir, 'main'),
        '@true-north/enum': path.resolve(currentDirPath, '../../packages/business/enum/index.ts'),
        '@true-north/vo': path.resolve(currentDirPath, '../../packages/business/vo/index.ts'),
        '@true-north/dev-lab/collector': path.resolve(
          currentDirPath,
          '../../packages/dev-lab/src/collector.ts',
        ),
        '@true-north/dev-lab': path.resolve(currentDirPath, '../../packages/dev-lab/src/index.ts'),
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
                path.resolve(currentDirPath, '../../packages/dev-lab/src/**/*'),
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
      watch:
        process.env.NODE_ENV === 'development'
          ? {
              include: [path.resolve(srcDir, 'preload/**/*')],
            }
          : undefined,
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
      desktopDevPage(),
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
          find: '@true-north/dev-lab/panel',
          replacement: path.resolve(currentDirPath, '../../packages/dev-lab/src/panel/index.ts'),
        },
        {
          find: '@true-north/dev-lab/collector',
          replacement: path.resolve(currentDirPath, '../../packages/dev-lab/src/collector.ts'),
        },
        {
          find: '@true-north/dev-lab',
          replacement: path.resolve(currentDirPath, '../../packages/dev-lab/src/index.ts'),
        },
        {
          find: '@true-north/product-wiki/data',
          replacement: path.resolve(currentDirPath, '../../packages/product-wiki/src/data.ts'),
        },
        {
          find: '@true-north/product-wiki',
          replacement: path.resolve(currentDirPath, '../../packages/product-wiki/src/index.ts'),
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
        input: {
          index: path.resolve(srcDir, 'render/index.html'),
        },
        external: [/^react-dnd/, /^dnd-core/, /^immutability-helper/],
      },
      minify: false, // 禁用压缩以保留 TypeORM 装饰器元数据
      sourcemap: process.env.NODE_ENV !== 'production',
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dnd',
        'react-dnd-html5-backend',
        'mitt',
        'lodash-es',
        'fe-selector',
        'marked',
        'dompurify',
      ],
      exclude: ['@true-north/common-web-utils', 'chinese-holiday-calendar'],
    },
  },
});
