# 使用 Node.js 20 Alpine 版本
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 并安装依赖
COPY package.json ./
RUN pnpm install --prod --prefer-offline && \
    pnpm store prune && \
    rm -rf ~/.npm

# 复制构建好的应用
COPY dist ./dist

# 暴露端口
EXPOSE 3000

# 设置基本环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["node", "dist/main.js"] 