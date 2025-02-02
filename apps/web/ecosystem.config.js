module.exports = {
  script: 'serve',
  name: 'life-toolkit-web',
  env: {
    PM2_SERVE_PATH: './dist',
    PM2_SERVE_PORT: 8080,
    PM2_SERVE_SPA: 'true',
  },
};
