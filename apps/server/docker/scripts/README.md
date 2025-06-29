# Life Toolkit Server - Docker 部署脚本

本目录包含了 Life Toolkit Server 的 Docker 部署脚本，支持开发环境、生产环境本地运行和远程服务器部署三种场景。

## 📋 脚本概览

| 脚本名称 | 用途 | 环境变量文件 | 运行位置 |
|---------|------|-------------|----------|
| `dev-docker.sh` | 开发环境 Docker 运行 | `.env.development.local` | 本地 |
| `prod-docker.sh` | 生产环境 Docker 运行 | `.env.production.local` | 本地 |
| `deploy-remote.sh` | 远程服务器部署 | `.env.production.local` | 远程服务器 |

## 🚀 使用方法

### 前提条件

1. **构建应用**：在项目根目录执行 `pnpm build:server`
2. **Docker 环境**：确保 Docker Desktop 已启动
3. **环境变量文件**：根据需要创建对应的环境变量文件

### 场景一：开发环境本地运行

```bash
# 在 apps/server 目录下执行
./docker/scripts/dev-docker.sh
```

**特点：**
- 使用 `.env.development.local` 环境变量
- 构建镜像标签：`life-toolkit-server:dev`
- 容器名称：`life-toolkit-server-dev`
- 端口映射：`3000:3000`
- 自动检测并配置宿主机数据库连接（macOS/Linux 兼容）

**环境变量文件示例** (`.env.development.local`)：
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=life_toolkit
JWT_SECRET=your-jwt-secret
```

**注意**：脚本会自动将 `DB_HOST` 转换为适合 Docker 容器的地址：
- macOS: `host.docker.internal`
- Linux: 自动检测宿主机网关 IP

### 场景二：生产环境本地运行

```bash
# 在 apps/server 目录下执行
./docker/scripts/prod-docker.sh
```

**特点：**
- 使用 `.env.production.local` 环境变量
- 构建镜像标签：`life-toolkit-server:prod`
- 容器名称：`life-toolkit-server-prod`
- 端口映射：`3000:3000`
- 生产环境配置，隐藏敏感信息显示

**环境变量文件示例** (`.env.production.local`)：
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

### 场景三：远程服务器部署

```bash
# 在 apps/server 目录下执行
./docker/scripts/deploy-remote.sh
```

**特点：**
- 使用 `.env.production.local` 环境变量
- 构建 `linux/amd64` 架构镜像（支持跨架构）
- 自动上传到 `112.124.21.126` 服务器
- 部署到 `/root/project` 目录
- 容器名称：`life-toolkit-server-remote`
- 自动清理本地和远程临时文件

**部署流程：**
1. 构建 linux/amd64 镜像
2. 保存并压缩镜像文件
3. 上传镜像和配置文件到远程服务器
4. 在远程服务器解压、加载镜像并运行容器
5. 清理本地和远程临时文件

## 🔧 常用命令

### 开发环境管理
```bash
# 查看开发容器状态
docker ps | grep life-toolkit-server-dev

# 查看开发容器日志
docker logs -f life-toolkit-server-dev

# 停止开发容器
docker stop life-toolkit-server-dev

# 删除开发容器
docker rm life-toolkit-server-dev

# 进入开发容器
docker exec -it life-toolkit-server-dev sh
```

### 生产环境管理
```bash
# 查看生产容器状态
docker ps | grep life-toolkit-server-prod

# 查看生产容器日志
docker logs -f life-toolkit-server-prod

# 停止生产容器
docker stop life-toolkit-server-prod

# 删除生产容器
docker rm life-toolkit-server-prod
```

### 远程服务器管理
```bash
# 查看远程容器状态
ssh root@112.124.21.126 'docker ps | grep life-toolkit'

# 查看远程容器日志
ssh root@112.124.21.126 'docker logs -f life-toolkit-server-remote'

# 停止远程容器
ssh root@112.124.21.126 'docker stop life-toolkit-server-remote'

# 删除远程容器
ssh root@112.124.21.126 'docker rm life-toolkit-server-remote'
```

## 🐛 故障排除

### 常见问题

1. **Docker 未运行**
   ```
   ❌ Docker 未运行，请启动 Docker
   ```
   **解决方案**：启动 Docker Desktop

2. **dist 目录不存在**
   ```
   ❌ dist 目录不存在，请先构建应用
   ```
   **解决方案**：在项目根目录执行 `pnpm build:server`

3. **环境变量文件不存在**
   ```
   ❌ .env.development.local 文件不存在
   ```
   **解决方案**：创建对应的环境变量文件

4. **Docker buildx 不可用**（仅远程部署）
   ```
   ❌ Docker buildx 不可用
   ```
   **解决方案**：
   - 更新 Docker Desktop 到最新版本
   - 在 Docker Desktop 设置中启用 'Use Docker Compose V2'
   - 重启 Docker Desktop

5. **SSH 连接失败**（仅远程部署）
   ```
   ❌ 无法连接到远程服务器
   ```
   **解决方案**：
   - 检查网络连接
   - 确认 SSH 密钥配置正确
   - 确认服务器 IP 地址可访问

### 日志查看

所有脚本都支持实时日志查看，运行完成后会询问是否查看日志：
```
🔍 查看实时日志？(y/N): y
```

按 `Ctrl+C` 可退出日志查看。

## 📁 文件结构

```
docker/
├── scripts/
│   ├── dev-docker.sh          # 开发环境脚本
│   ├── prod-docker.sh         # 生产环境脚本
│   ├── deploy-remote.sh       # 远程部署脚本
│   └── README.md             # 本文档
├── config/
│   ├── Dockerfile            # Docker 构建文件
│   └── docker-compose.*.yml  # Docker Compose 配置
└── images/                   # 镜像文件保存目录（自动创建）
```

## 🔒 安全注意事项

1. **环境变量文件**：包含敏感信息，请勿提交到版本控制
2. **生产环境密码**：使用强密码和安全的 JWT 密钥
3. **SSH 密钥**：确保 SSH 密钥安全，定期轮换
4. **服务器访问**：限制服务器访问权限，使用防火墙保护

## 📞 支持

如有问题，请检查：
1. Docker Desktop 是否正常运行
2. 环境变量文件是否正确配置
3. 网络连接是否正常（远程部署）
4. 项目是否已正确构建 