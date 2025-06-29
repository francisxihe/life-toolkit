# Life Toolkit Server - 部署指南

## 🚀 远程服务器部署指南

本指南将帮助你将 Life Toolkit Server 部署到远程服务器 `112.124.21.126`。

## 📋 部署前准备

### 1. 环境准备

**本地环境**：
- Docker 已安装并运行
- 已构建应用：`pnpm build`
- SSH 密钥已配置到目标服务器

**远程服务器**：
- 已安装 Docker
- SSH 服务正常运行
- 有足够的磁盘空间（建议至少 2GB）

### 2. 配置生产环境变量

```bash
# 1. 复制配置示例
cp env.production.example .env.production.local

# 2. 编辑生产环境配置
vim .env.production.local
```

**重要配置项**：
```bash
# 数据库配置（填入真实的生产数据库信息）
DB_HOST=your-production-db-host.com
DB_PORT=3306
DB_USERNAME=your_production_username
DB_PASSWORD=your_strong_production_password
DB_DATABASE=life_toolkit

# JWT 密钥（必须使用强密钥）
JWT_SECRET=your-very-strong-production-jwt-secret-key-at-least-32-characters

# OpenAI API（如果使用AI功能）
OPENAI_API_KEY=your-production-openai-api-key
```

## 🎯 部署方法

### 方法1：使用部署脚本（推荐）

```bash
# 一键部署
make prod-deploy-script

# 或直接运行脚本
./deploy-remote.sh
```

**脚本功能**：
- ✅ 自动检查前提条件
- 🔨 构建生产镜像
- 📤 上传镜像和配置到远程服务器
- 🚀 在远程服务器启动容器
- 🧹 自动清理临时文件

### 方法2：使用 Makefile 命令

```bash
# 完整部署流程
make prod-deploy

# 或分步执行
make prod-save          # 只保存镜像
make prod-deploy        # 部署到远程
```

### 方法3：手动部署

```bash
# 1. 保存镜像
make prod-save

# 2. 手动上传文件
scp life-toolkit-server-production.tar root@112.124.21.126:/root/project/life-toolkit-server/
scp .env.production.local root@112.124.21.126:/root/project/life-toolkit-server/

# 3. 在远程服务器执行
ssh root@112.124.21.126
cd /root/project/life-toolkit-server
docker load -i life-toolkit-server-production.tar
docker run -d --name life-toolkit-server-prod -p 3000:3000 --env-file .env.production.local --restart unless-stopped life-toolkit-server:production
```

## 🛠️ 远程服务器管理

### 查看状态
```bash
# 查看容器状态
make prod-remote-status

# 等价命令
ssh root@112.124.21.126 "docker ps --filter 'name=life-toolkit-server-prod'"
```

### 查看日志
```bash
# 查看实时日志
make prod-remote-logs

# 等价命令
ssh root@112.124.21.126 "docker logs -f life-toolkit-server-prod"
```

### 停止服务
```bash
# 停止远程容器
make prod-remote-stop

# 等价命令
ssh root@112.124.21.126 "docker stop life-toolkit-server-prod"
```

### 重新部署
```bash
# 重新部署（会自动停止旧容器）
make prod-deploy-script
```

## 🔍 故障排除

### 常见问题

**1. SSH 连接失败**
```bash
# 检查 SSH 连接
ssh root@112.124.21.126

# 如果失败，检查：
# - 网络连接
# - SSH 密钥配置
# - 服务器防火墙设置
```

**2. Docker 镜像加载失败**
```bash
# 在远程服务器检查 Docker
ssh root@112.124.21.126 "docker info"

# 检查磁盘空间
ssh root@112.124.21.126 "df -h"
```

**3. 容器启动失败**
```bash
# 查看容器日志
ssh root@112.124.21.126 "docker logs life-toolkit-server-prod"

# 检查环境变量配置
ssh root@112.124.21.126 "cat /root/project/life-toolkit-server/.env.production.local"
```

**4. 数据库连接失败**
- 检查数据库服务器是否运行
- 验证数据库连接信息
- 检查防火墙和网络配置

### 清理和重置

```bash
# 清理本地镜像文件
make clean-image

# 清理远程容器（如果需要完全重置）
ssh root@112.124.21.126 "
  docker stop life-toolkit-server-prod 2>/dev/null || true
  docker rm life-toolkit-server-prod 2>/dev/null || true
  docker rmi life-toolkit-server:production 2>/dev/null || true
"
```

## 📊 部署验证

### 1. 检查服务状态
```bash
# 方法1：使用 make 命令
make prod-remote-status

# 方法2：直接访问
curl http://112.124.21.126:3000/health
```

### 2. 查看应用日志
```bash
make prod-remote-logs
```

### 3. 测试 API 接口
```bash
# 测试基础接口
curl http://112.124.21.126:3000/api/health

# 测试认证接口
curl -X POST http://112.124.21.126:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

## 🔒 安全建议

1. **强密码策略**：
   - JWT_SECRET 至少 32 位随机字符
   - 数据库密码使用强密码
   - 定期更换敏感密钥

2. **网络安全**：
   - 配置防火墙规则
   - 使用 HTTPS（建议配置反向代理）
   - 限制数据库访问 IP

3. **监控和备份**：
   - 定期备份数据库
   - 监控容器资源使用
   - 设置日志轮转

## 📝 部署清单

- [ ] 本地 Docker 环境正常
- [ ] 应用已构建（`pnpm build`）
- [ ] SSH 密钥已配置
- [ ] 远程服务器 Docker 已安装
- [ ] 生产环境配置文件已创建
- [ ] 数据库连接信息已确认
- [ ] JWT 密钥已设置
- [ ] 防火墙规则已配置
- [ ] 部署成功验证
- [ ] 日志监控已设置

---

**🎉 部署完成后，应用将在 http://112.124.21.126:3000 运行！** 