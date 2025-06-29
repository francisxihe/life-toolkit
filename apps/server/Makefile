# Life Toolkit Server - 简化 Docker 管理

.PHONY: help build run stop clean logs status check-env prod-run prod-stop prod-logs prod-status prod-save prod-deploy

# 远程服务器配置
REMOTE_HOST = 112.124.21.126
REMOTE_USER = root
REMOTE_PATH = /root/project/life-toolkit-server
IMAGE_NAME = life-toolkit-server
PROD_IMAGE_TAG = production

# 默认目标
help:
	@echo "Life Toolkit Server - Docker 管理命令"
	@echo "===================================="
	@echo "开发环境:"
	@echo "  make build      - 构建应用镜像"
	@echo "  make run        - 运行应用容器"
	@echo "  make run-compose - 使用 Docker Compose 运行"
	@echo "  make stop       - 停止应用容器"
	@echo "  make clean      - 清理容器和镜像"
	@echo "  make logs       - 查看应用日志"
	@echo "  make status     - 查看容器状态"
	@echo "  make check-env  - 检查环境变量文件"
	@echo ""
	@echo "生产环境:"
	@echo "  make prod-run   - 运行生产环境容器"
	@echo "  make prod-stop  - 停止生产环境容器"
	@echo "  make prod-logs  - 查看生产环境日志"
	@echo "  make prod-status - 查看生产环境状态"
	@echo "  make prod-save  - 保存生产镜像为tar文件"
	@echo "  make prod-deploy - 部署到远程服务器 ($(REMOTE_HOST))"
	@echo "  make prod-deploy-script - 使用脚本部署到远程服务器"
	@echo ""
	@echo "远程管理:"
	@echo "  make prod-remote-status - 查看远程服务器状态"
	@echo "  make prod-remote-logs   - 查看远程服务器日志"
	@echo "  make prod-remote-stop   - 停止远程服务器容器"
	@echo "  make clean-image        - 清理本地镜像文件"
	@echo ""
	@echo "注意：需要创建对应的 .env 文件配置环境变量"

# 检查环境变量文件
check-env:
	@if [ ! -f ".env.development.local" ]; then \
		echo "❌ .env.development.local 文件不存在"; \
		echo "请创建此文件并配置以下变量:"; \
		echo "  DB_HOST=host.docker.internal"; \
		echo "  DB_PORT=3306"; \
		echo "  DB_USERNAME=root"; \
		echo "  DB_PASSWORD=your_password"; \
		echo "  DB_DATABASE=life_toolkit"; \
		echo "  JWT_SECRET=your-jwt-secret"; \
		exit 1; \
	else \
		echo "✅ 找到环境变量文件: .env.development.local"; \
		echo "📋 当前配置:"; \
		cat .env.development.local | grep -v '^#' | grep -v '^$$'; \
	fi

# 检查生产环境变量文件
check-prod-env:
	@if [ ! -f ".env.production.local" ]; then \
		echo "❌ .env.production.local 文件不存在"; \
		echo "请参考 env.production.example 创建此文件"; \
		exit 1; \
	else \
		echo "✅ 找到生产环境变量文件: .env.production.local"; \
	fi

# 构建应用镜像
build: check-env
	@echo "🔨 构建应用镜像..."
	@if [ ! -d "dist" ]; then \
		echo "❌ dist 目录不存在，请先运行: pnpm build"; \
		exit 1; \
	fi
	docker build -t life-toolkit-server:simple -f docker/config/Dockerfile .
	@echo "✅ 镜像构建完成"

# 运行应用容器
run: build
	@echo "🚀 启动应用容器..."
	@docker stop life-toolkit-server 2>/dev/null || true
	@docker rm life-toolkit-server 2>/dev/null || true
	docker run -d \
		--name life-toolkit-server \
		-p 3000:3000 \
		--add-host host.docker.internal:host-gateway \
		--env-file .env.development.local \
		-e DB_HOST=host.docker.internal \
		--restart unless-stopped \
		life-toolkit-server:simple
	@echo "✅ 应用已启动！访问地址: http://localhost:3000"
	@echo "💡 使用 .env.development.local 中的配置（DB_HOST 覆盖为 host.docker.internal）"

# 使用 Docker Compose 运行
run-compose: check-env build
	@echo "🚀 使用 Docker Compose 启动..."
	docker-compose -f docker/config/docker-compose.yml up -d --build
	@echo "✅ 应用已启动！访问地址: http://localhost:3000"

# 生产环境运行
prod-run: check-prod-env
	@echo "🚀 启动生产环境..."
	./docker/scripts/run-docker-prod.sh

# 生产环境 Docker Compose 运行
prod-compose: check-prod-env
	@echo "🚀 使用 Docker Compose 启动生产环境..."
	docker-compose -f docker/config/docker-compose.prod.yml up -d --build
	@echo "✅ 生产环境已启动！访问地址: http://localhost:3000"

# 停止容器
stop:
	@echo "🛑 停止容器..."
	@docker stop life-toolkit-server 2>/dev/null || true
	@docker-compose -f docker/config/docker-compose.yml down 2>/dev/null || true
	@echo "✅ 容器已停止"

# 停止生产环境容器
prod-stop:
	@echo "🛑 停止生产环境容器..."
	@docker stop life-toolkit-server-prod 2>/dev/null || true
	@docker-compose -f docker/config/docker-compose.prod.yml down 2>/dev/null || true
	@echo "✅ 生产环境容器已停止"

# 清理容器和镜像
clean: stop
	@echo "🧹 清理容器和镜像..."
	@docker rm life-toolkit-server 2>/dev/null || true
	@docker rmi life-toolkit-server:simple 2>/dev/null || true
	@echo "✅ 清理完成"

# 清理生产环境
prod-clean: prod-stop
	@echo "🧹 清理生产环境容器和镜像..."
	@docker rm life-toolkit-server-prod 2>/dev/null || true
	@docker rmi life-toolkit-server:production 2>/dev/null || true
	@echo "✅ 生产环境清理完成"

# 查看日志
logs:
	@echo "📋 查看应用日志..."
	@if docker ps | grep -q life-toolkit-server; then \
		docker logs -f life-toolkit-server; \
	else \
		echo "❌ 容器未运行"; \
	fi

# 查看生产环境日志
prod-logs:
	@echo "📋 查看生产环境日志..."
	@if docker ps | grep -q life-toolkit-server-prod; then \
		docker logs -f life-toolkit-server-prod; \
	else \
		echo "❌ 生产环境容器未运行"; \
	fi

# 查看状态
status:
	@echo "📊 容器状态:"
	@echo "============"
	@docker ps --filter "name=life-toolkit-server" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "无运行中的容器"

# 查看生产环境状态
prod-status:
	@echo "📊 生产环境容器状态:"
	@echo "=================="
	@docker ps --filter "name=life-toolkit-server-prod" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "无运行中的生产环境容器"

# 保存生产镜像
prod-save: check-prod-env
	@echo "💾 保存生产镜像..."
	@if [ ! -d "dist" ]; then \
		echo "❌ dist 目录不存在，请先运行: pnpm build"; \
		exit 1; \
	fi
	@echo "🔨 构建生产镜像..."
	docker build -t $(IMAGE_NAME):$(PROD_IMAGE_TAG) -f docker/config/Dockerfile .
	@echo "📦 保存镜像为 tar 文件..."
	docker save -o $(IMAGE_NAME)-$(PROD_IMAGE_TAG).tar $(IMAGE_NAME):$(PROD_IMAGE_TAG)
	@echo "✅ 生产镜像已保存: $(IMAGE_NAME)-$(PROD_IMAGE_TAG).tar"
	@ls -lh $(IMAGE_NAME)-$(PROD_IMAGE_TAG).tar

# 部署到远程服务器
prod-deploy: prod-save
	@echo "🚀 部署到远程服务器 $(REMOTE_HOST)..."
	@echo "📋 部署步骤:"
	@echo "  1. 上传镜像文件"
	@echo "  2. 上传配置文件"
	@echo "  3. 在远程服务器加载镜像"
	@echo "  4. 启动容器"
	@echo ""
	@read -p "确认部署到 $(REMOTE_HOST)？(y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		$(MAKE) _do-deploy; \
	else \
		echo "❌ 部署已取消"; \
	fi

# 执行部署
_do-deploy:
	@echo "📤 上传镜像文件到远程服务器..."
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) "mkdir -p $(REMOTE_PATH)"
	@scp $(IMAGE_NAME)-$(PROD_IMAGE_TAG).tar $(REMOTE_USER)@$(REMOTE_HOST):$(REMOTE_PATH)/
	@echo "📤 上传配置文件..."
	@scp .env.production.local $(REMOTE_USER)@$(REMOTE_HOST):$(REMOTE_PATH)/
	@scp docker/config/docker-compose.prod.yml $(REMOTE_USER)@$(REMOTE_HOST):$(REMOTE_PATH)/
	@echo "🔄 在远程服务器执行部署..."
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) "\
		cd $(REMOTE_PATH) && \
		echo '🔄 停止旧容器...' && \
		docker stop life-toolkit-server-prod 2>/dev/null || true && \
		docker rm life-toolkit-server-prod 2>/dev/null || true && \
		echo '📦 加载新镜像...' && \
		docker load -i $(IMAGE_NAME)-$(PROD_IMAGE_TAG).tar && \
		echo '🚀 启动新容器...' && \
		docker run -d \
			--name life-toolkit-server-prod \
			-p 3000:3000 \
			--env-file .env.production.local \
			--restart unless-stopped \
			$(IMAGE_NAME):$(PROD_IMAGE_TAG) && \
		echo '✅ 部署完成！' && \
		echo '📊 容器状态:' && \
		docker ps --filter 'name=life-toolkit-server-prod' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' \
	"
	@echo "🎉 远程部署完成！"
	@echo "🌐 访问地址: http://$(REMOTE_HOST):3000"

# 检查远程服务器状态
prod-remote-status:
	@echo "📊 检查远程服务器状态..."
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) "\
		echo '📊 远程服务器容器状态:' && \
		docker ps --filter 'name=life-toolkit-server-prod' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || echo '无运行中的容器' \
	"

# 查看远程服务器日志
prod-remote-logs:
	@echo "📋 查看远程服务器日志..."
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) "\
		docker logs -f life-toolkit-server-prod \
	"

# 停止远程服务器容器
prod-remote-stop:
	@echo "🛑 停止远程服务器容器..."
	@ssh $(REMOTE_USER)@$(REMOTE_HOST) "\
		docker stop life-toolkit-server-prod 2>/dev/null || true && \
		echo '✅ 远程容器已停止' \
	"

# 使用脚本部署到远程服务器
prod-deploy-script:
	@echo "🚀 使用脚本部署到远程服务器..."
	@./docker/scripts/deploy-remote.sh

# 清理本地镜像文件
clean-image:
	@echo "🧹 清理本地镜像文件..."
	@rm -f $(IMAGE_NAME)-$(PROD_IMAGE_TAG).tar
	@echo "✅ 镜像文件已清理" 