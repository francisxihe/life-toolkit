import { defineConfig } from 'electron-vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { productWiki } from '@ylib/product-server/service/vite';
import { labEntryPath, labHtmlPath, labPageRoute } from '@true-north/dev-lab/page/paths';
import type { Plugin } from 'vite';

// 获取当前文件的目录路径
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const srcDir = path.resolve(currentDirPath, 'src');
const productWikiRoot = path.resolve(currentDirPath, '../../packages/product-wiki');
const isProductDev = process.env.TN_DEV_PROFILE === 'product';
const devProfile = isProductDev ? 'product' : 'lab';
const profileDefine = {
  'process.env.TN_DEV_PROFILE': JSON.stringify(devProfile),
};

function resolveProductWikiOutsideRoot(): Plugin {
  const extensions = ['', '.ts', '.tsx', '.js', '.json'];
  return {
    name: 'resolve-product-wiki-outside-root',
    enforce: 'pre',
    resolveId(id, importer) {
      const bare = id.split('?')[0];
      if (bare === './catalog.generated' || bare === './catalog.generated.ts') {
        const generated = path.join(productWikiRoot, 'src/catalog.generated.ts');
        if (fs.existsSync(generated)) return generated;
      }
      if (bare.includes('wiki/') && bare.endsWith('.json')) {
        const fromWikiSrc = path.normalize(path.resolve(path.join(productWikiRoot, 'src'), bare));
        if (fromWikiSrc.startsWith(productWikiRoot) && fs.existsSync(fromWikiSrc)) return fromWikiSrc;
      }
      if (!bare.startsWith('.')) return;
      const raw = importer ? importer.split('?')[0] : '';
      const importerFile = raw.startsWith('file:') ? fileURLToPath(raw) : raw;
      const fromDir = path.isAbsolute(importerFile)
        ? path.dirname(importerFile)
        : path.join(productWikiRoot, 'src');
      if (!fromDir.startsWith(productWikiRoot)) return;
      const base = path.resolve(fromDir, bare);
      for (const ext of extensions) {
        const candidate = !path.extname(base) && ext ? `${base}${ext}` : base;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
      }
      return undefined;
    },
  };
}

function desktopLabPage(): Plugin {
  return {
    name: 'desktop-lab-page',
    configureServer(server) {
      server.watcher.add(path.dirname(labHtmlPath));
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split('?')[0] !== labPageRoute) {
          next();
          return;
        }
        try {
          const entryUrl = `/@fs/${labEntryPath.replace(/\\/g, '/').replace(/^\/+/, '')}`;
          let html = fs.readFileSync(labHtmlPath, 'utf-8');
          html = html.replace('./Lab.tsx', entryUrl);
          html = await server.transformIndexHtml(labPageRoute, html);
          html = html.replace(/<script[^>]*virtual:product-wiki-runtime[^>]*><\/script>/g, '');
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
          '@sue/extract',
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
                ...(isProductDev
                  ? [
                      path.resolve(currentDirPath, '../../packages/product-wiki/src/**/*'),
                      path.resolve(currentDirPath, '../../packages/product-wiki/wiki/**/*'),
                    ]
                  : [path.resolve(currentDirPath, '../../packages/dev-lab/src/**/*')]),
              ],
            }
          : undefined,
    },
    // 开发环境配置
    define: {
      __DEV__: process.env.NODE_ENV === 'development',
      ...profileDefine,
    },
  },
  preload: {
    define: profileDefine,
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
      fs: {
        allow: [
          path.resolve(currentDirPath, '../..'),
        ],
      },
    },
    // 渲染进程配置
    root: path.resolve(srcDir, 'render'),
    define: {
      'import.meta.env.VITE_DEV_PROFILE': JSON.stringify(devProfile),
    },
    plugins: [
      react(),
      tailwindcss(),
      svgr({
        svgrOptions: { exportType: 'default' },
        include: '**/*.svg',
      }),
      ...(isProductDev
        ? [
            resolveProductWikiOutsideRoot(),
            productWiki({
              data: path.resolve(currentDirPath, '../../packages/product-wiki/src/data.ts'),
            }),
          ]
        : [desktopLabPage()]),
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
          find: '@true-north/dev-lab/page',
          replacement: path.resolve(currentDirPath, '../../packages/dev-lab/src/page/index.ts'),
        },
        {
          find: '@true-north/dev-lab/dock',
          replacement: path.resolve(currentDirPath, '../../packages/dev-lab/src/dock.ts'),
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
        'marked',
        'dompurify',
      ],
      exclude: ['@true-north/common-web-utils', 'chinese-holiday-calendar'],
    },
  },
});
