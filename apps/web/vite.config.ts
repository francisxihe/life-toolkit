import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from '@arco-plugins/vite-plugin-svgr';
import vitePluginForArco from '@arco-plugins/vite-react';
import setting from './src/settings.json';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname);

  return {
    base: '/',
    resolve: {
      alias: [{ find: '@', replacement: '/src' }],
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
            // 配置 EJS 模板的选项
            rmWhitespace: true, // 可选：是否移除空格
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
  };
});
