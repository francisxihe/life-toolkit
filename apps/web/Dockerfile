# 使用官方 Nginx 镜像作为基础镜像
FROM nginx:latest

# 将本地 dist 文件夹复制到 Nginx 默认静态文件目录
COPY ./dist /usr/share/nginx/html

# 将自定义 Nginx 配置复制到容器中
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 Nginx 的默认端口
EXPOSE 80

# 启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]