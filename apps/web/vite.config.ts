import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from '@arco-plugins/vite-plugin-svgr';
import vitePluginForArco from '@arco-plugins/vite-react';
import setting from './src/settings.json';
import { createHtmlPlugin } from 'vite-plugin-html';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: '/',
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [
      react(),
      svgrPlugin({
        svgrOptions: {},
      }),
      vitePluginForArco({
        theme: '@arco-themes/react-francis',
        modifyVars: {
          // 'arcoblue-6': setting.themeColor,
        },
      }),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            VITE_APP_STATIC_PATH: env.VITE_APP_STATIC_PATH || '/',
          },
          ejsOptions: {
            rmWhitespace: true,
          },
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
    server: {
      port: Number(env.VITE_APP_PORT),
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      target: 'es2020',
      minify: 'terser',
      cssMinify: true,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            arco: ['@arco-design/web-react'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: [],
    },
  };
});
