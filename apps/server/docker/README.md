# Docker 配置目录

这个目录包含了 Life Toolkit Server 的所有 Docker 相关配置和脚本。

## 📁 目录结构

```
docker/
├── config/                 # Docker 配置文件
│   ├── Dockerfile         # Docker 镜像构建配置
│   ├── docker-compose.yml # 开发环境 Docker Compose 配置
│   └── docker-compose.prod.yml # 生产环境 Docker Compose 配置
├── scripts/               # Docker 脚本文件
│   ├── build-amd64-image.sh    # AMD64 架构镜像构建脚本
│   ├── run-docker.sh           # 开发环境 Docker 运行脚本
│   ├── run-docker-prod.sh      # 生产环境 Docker 运行脚本
│   └── deploy-remote.sh        # 远程服务器部署脚本
├── images/                # Docker 镜像文件存储
│   └── *.tar.gz          # 导出的镜像文件
├── docs/                  # Docker 相关文档
│   └── DOCKER_DEPLOYMENT.md  # Docker 部署文档
└── README.md             # 本文档
```

## 🚀 快速开始

### 开发环境

1. **使用 Makefile（推荐）**：
   ```bash
   # 在 apps/server 目录下执行
   make run        # 构建并运行开发环境
   make logs       # 查看日志
   make stop       # 停止容器
   ```

2. **使用脚本**：
   ```bash
   # 在 apps/server 目录下执行
   ./docker/scripts/run-docker.sh
   ```

3. **使用 Docker Compose**：
   ```bash
   # 在 apps/server 目录下执行
   make run-compose
   ```

### 生产环境

1. **使用 Makefile（推荐）**：
   ```bash
   # 在 apps/server 目录下执行
   make prod-run      # 运行生产环境
   make prod-logs     # 查看生产环境日志
   make prod-stop     # 停止生产环境
   ```

2. **使用脚本**：
   ```bash
   # 在 apps/server 目录下执行
   ./docker/scripts/run-docker-prod.sh
   ```

## 🔧 高级功能

### AMD64 架构镜像构建

适用于在 M1/M2 Mac 上构建 linux/amd64 镜像：

```bash
# 在 apps/server 目录下执行
./docker/scripts/build-amd64-image.sh -s  # 构建并保存镜像
```

### 远程服务器部署

部署到远程服务器：

```bash
# 在 apps/server 目录下执行
make prod-deploy-script
# 或者
./docker/scripts/deploy-remote.sh
```

### 镜像管理

```bash
# 保存生产镜像
make prod-save

# 清理本地镜像文件
make clean-image
```

## 📋 环境变量

### 开发环境
创建 `.env.development.local` 文件：
```env
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=life_toolkit
JWT_SECRET=your-jwt-secret
```

### 生产环境
创建 `.env.production.local` 文件：
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_PORT=3306
DB_USERNAME=your-production-username
DB_PASSWORD=your-production-password
DB_DATABASE=life_toolkit
JWT_SECRET=your-production-jwt-secret
```

## 🛠️ 常用命令

### 查看状态
```bash
make status           # 开发环境状态
make prod-status      # 生产环境状态
make prod-remote-status  # 远程服务器状态
```

### 查看日志
```bash
make logs             # 开发环境日志
make prod-logs        # 生产环境日志
make prod-remote-logs # 远程服务器日志
```

### 清理
```bash
make clean            # 清理开发环境
make prod-clean       # 清理生产环境
make clean-image      # 清理镜像文件
```

## 📚 文档

- [Docker 部署文档](docs/DOCKER_DEPLOYMENT.md) - 详细的部署说明
- [Makefile 命令参考](../Makefile) - 所有可用的 make 命令

## 🔍 故障排除

### 常见问题

1. **容器无法启动**
   - 检查环境变量文件是否存在
   - 检查端口是否被占用
   - 查看容器日志：`make logs` 或 `make prod-logs`

2. **数据库连接失败**
   - 确认数据库服务是否运行
   - 检查环境变量中的数据库配置
   - 对于开发环境，确保使用 `host.docker.internal` 作为数据库主机

3. **镜像构建失败**
   - 确保已运行 `pnpm build` 构建项目
   - 检查 Docker 是否正常运行
   - 查看构建日志中的错误信息

### 获取帮助

```bash
# 查看所有可用命令
make help

# 查看脚本帮助
./docker/scripts/build-amd64-image.sh --help
``` 