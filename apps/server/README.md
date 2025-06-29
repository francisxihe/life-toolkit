# Life Toolkit Server

基于 NestJS 的后端服务，提供个人成长、任务管理、习惯追踪、财务管理等功能的API接口。

## 📋 目录

- [快速开始](#快速开始)
- [开发环境](#开发环境)
- [Docker 部署](#docker-部署)
- [API 文档](#api-文档)
- [项目结构](#项目结构)
- [环境配置](#环境配置)
- [部署指南](#部署指南)

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test
```

### 环境要求

- Node.js 18+
- pnpm 8+
- MySQL 8.0+ 或 SQLite（开发环境）

## 🛠️ 开发环境

### 数据库配置

开发环境默认使用 SQLite，生产环境使用 MySQL。

### 环境变量

创建 `.env.development.local` 文件：

```bash
# 应用配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=life_toolkit

# JWT 配置
JWT_SECRET=your-jwt-secret

# OpenAI API 配置
OPENAI_API_KEY=your-openai-api-key
```

## 🐳 Docker 部署

简化的 Docker 配置，专注于应用本身，数据库保持独立。

### 前提条件

1. **应用已构建**：
   ```bash
   pnpm build
   ```

2. **环境变量文件**：创建对应的环境变量文件
3. **数据库运行**：确保对应的数据库可访问

### 开发环境

```bash
# 检查环境变量文件
make check-env

# 构建并运行
make run

# 查看状态
make status

# 查看日志
make logs

# 停止
make stop
```

### 生产环境

1. **创建生产环境配置**：
   ```bash
   # 复制示例文件
   cp env.production.example .env.production.local
   
   # 编辑配置文件
   vim .env.production.local
   ```

2. **本地运行生产环境**：
   ```bash
   # 使用脚本（推荐）
   make prod-run
   
   # 查看状态
   make prod-status
   
   # 查看日志
   make prod-logs
   
   # 停止
   make prod-stop
   ```

3. **部署到远程服务器**：
   ```bash
   # 方法1：使用部署脚本（推荐）
   make prod-deploy-script
   
   # 方法2：使用 Makefile 命令
   make prod-deploy
   
   # 方法3：只保存镜像
   make prod-save
   ```

### 远程服务器管理

部署到远程服务器 `112.124.21.126` 后，可以使用以下命令管理：

```bash
# 查看远程服务器状态
make prod-remote-status

# 查看远程服务器日志
make prod-remote-logs

# 停止远程服务器容器
make prod-remote-stop

# 清理本地镜像文件
make clean-image
```

### 生产环境配置示例

```bash
# .env.production.local
NODE_ENV=production
PORT=3000

# 生产数据库配置
DB_HOST=your-production-db-host.com
DB_PORT=3306
DB_USERNAME=your_production_username
DB_PASSWORD=your_strong_production_password
DB_DATABASE=life_toolkit

# JWT 配置（请使用强密钥）
JWT_SECRET=your-very-strong-production-jwt-secret-key
JWT_EXPIRES_IN=7d

# OpenAI API 配置
OPENAI_API_KEY=your-production-openai-api-key
```

### Docker 文件说明

```
apps/server/
├── Dockerfile                   # 应用镜像构建文件
├── docker-compose.yml           # 开发环境配置
├── docker-compose.prod.yml      # 生产环境配置
├── Makefile                     # 命令管理
├── run-docker.sh                # 开发环境启动脚本
├── run-docker-prod.sh           # 生产环境启动脚本
├── deploy-remote.sh             # 远程服务器部署脚本
└── env.production.example       # 生产环境配置示例
```

### 部署流程

**远程部署流程**：
1. 检查前提条件（dist目录、环境配置、Docker、SSH连接）
2. 构建生产镜像并保存为tar文件
3. 上传镜像和配置文件到远程服务器
4. 在远程服务器加载镜像并启动容器
5. 清理本地临时文件

**前提条件**：
- 已配置SSH密钥到目标服务器
- 目标服务器已安装Docker
- 已创建`.env.production.local`文件

## 📊 API 文档

### 主要模块

- **认证模块** (`/auth`): 用户登录、注册、JWT验证
- **用户模块** (`/users`): 用户信息管理
- **成长模块** (`/growth`): 
  - 待办事项 (`/todo`)
  - 任务管理 (`/task`)
  - 目标管理 (`/goal`)
  - 习惯追踪 (`/habit`)
  - 时间追踪 (`/track-time`)
- **财务模块** (`/expenses`): 支出记录和预算管理
- **AI模块** (`/ai`): AI助手服务
- **日历模块** (`/calendar`): 日历事件管理
- **Excel模块** (`/excel`): Excel文件处理

### 访问地址

- **开发环境**：http://localhost:3000
- **生产环境**：http://localhost:3000 (Docker)

## 🏗️ 项目结构

```
src/
├── business/                    # 业务模块
│   ├── auth/                   # 认证授权
│   ├── users/                  # 用户管理
│   ├── growth/                 # 个人成长
│   │   ├── todo/              # 待办事项
│   │   ├── task/              # 任务管理
│   │   ├── goal/              # 目标管理
│   │   ├── habit/             # 习惯追踪
│   │   └── track-time/        # 时间追踪
│   ├── expenses/              # 财务管理
│   ├── ai/                    # AI服务
│   ├── calendar/              # 日历模块
│   └── excel/                 # Excel处理
├── base/                       # 基础类和接口
├── common/                     # 通用模块
├── config/                     # 配置文件
├── decorators/                 # 装饰器
├── helpers/                    # 助手函数
└── interceptor/                # 拦截器
```

### 业务模块结构

每个业务模块遵循标准结构：

```
{module}/
├── entities/                   # 数据实体 (TypeORM)
├── dto/                       # 数据传输对象
├── mappers/                   # 对象映射器
├── {module}.controller.ts     # 控制器
├── {module}.service.ts        # 业务服务
└── {module}.module.ts         # 模块定义
```

## ⚙️ 环境配置

### 开发环境变量

```bash
# .env.development.local
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=life_toolkit
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
TZ=Asia/Shanghai
```

### 生产环境变量

```bash
# .env.production.local
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host.com
DB_PORT=3306
DB_USERNAME=your_production_username
DB_PASSWORD=your_strong_production_password
DB_DATABASE=life_toolkit
JWT_SECRET=your-very-strong-production-jwt-secret-key
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your-production-openai-api-key
TZ=Asia/Shanghai
```

## 🔒 安全注意事项

### 生产环境

1. **强密码**：使用强密码和复杂的JWT密钥
2. **网络安全**：确保数据库网络访问安全
3. **SSL/TLS**：生产环境建议启用HTTPS
4. **日志管理**：定期清理和备份日志
5. **资源监控**：监控容器资源使用情况
6. **定期更新**：定期更新依赖和镜像

### 开发环境

- 不要在开发环境使用生产密钥
- 定期更新开发依赖
- 使用环境变量文件管理敏感信息

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行特定模块测试
pnpm test:watch

# 测试覆盖率
pnpm test:cov
```

测试文件位于 `test/` 目录，按业务模块组织。

## 📝 开发规范

- 使用 TypeScript 严格模式
- 遵循 NestJS 最佳实践
- 使用 class-validator 进行数据验证
- 使用 TypeORM 进行数据库操作
- 统一的错误处理和响应格式

## 📖 部署指南

详细的生产环境部署指南请参考：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

包含以下内容：
- 🚀 远程服务器部署步骤
- 🛠️ 远程服务器管理
- 🔍 故障排除
- 🔒 安全建议
- 📝 部署清单

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

