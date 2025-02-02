module.exports = {
  apps: [
    {
      name: "life-toolkit",
      script: "./dist/main.js",
      port: 3000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

