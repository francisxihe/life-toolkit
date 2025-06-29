#!/bin/bash

# Life Toolkit Server - 生产环境 Docker 脚本
# 使用 .env.production.local 环境变量构建镜像并在本地运行

set -e

echo "🚀 Life Toolkit Server - 生产环境 Docker"
echo "======================================="

# 检查前提条件
check_prerequisites() {
    echo "🔍 检查前提条件..."
    
    # 检查是否在正确的目录
    if [ ! -f "package.json" ] || [ ! -f "docker/config/Dockerfile" ]; then
        echo "❌ 请在 apps/server 目录下运行此脚本"
        echo "💡 当前目录: $(pwd)"
        echo "💡 正确路径: /path/to/life-toolkit/apps/server"
        exit 1
    fi
    
    # 检查 dist 目录
    if [ ! -d "dist" ]; then
        echo "❌ dist 目录不存在，请先构建应用："
        echo "   cd ../../ && pnpm build:server"
        exit 1
    fi
    
    # 检查环境变量文件
    if [ ! -f ".env.production.local" ]; then
        echo "❌ .env.production.local 文件不存在"
        echo "请创建此文件并配置以下变量:"
        echo "  NODE_ENV=production"
        echo "  PORT=3000"
        echo "  DB_HOST=your-production-db-host"
        echo "  DB_PORT=3306"
        echo "  DB_USERNAME=your-production-username"
        echo "  DB_PASSWORD=your-production-password"
        echo "  DB_DATABASE=life_toolkit"
        echo "  JWT_SECRET=your-production-jwt-secret"
        echo ""
        echo "⚠️  注意：生产环境请使用强密码和安全的JWT密钥"
        exit 1
    fi
    
    # 检查 Docker
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker 未运行，请启动 Docker"
        exit 1
    fi
    
    echo "✅ 前提条件检查通过"
}

# 显示生产环境配置（隐藏敏感信息）
show_config() {
    echo "🔍 生产环境配置检查:"
    if [ -f ".env.production.local" ]; then
        echo "  NODE_ENV: $(grep '^NODE_ENV=' .env.production.local | cut -d'=' -f2 || echo '未设置')"
        echo "  PORT: $(grep '^PORT=' .env.production.local | cut -d'=' -f2 || echo '未设置')"
        echo "  DB_HOST: $(grep '^DB_HOST=' .env.production.local | cut -d'=' -f2 || echo '未设置')"
        echo "  DB_PORT: $(grep '^DB_PORT=' .env.production.local | cut -d'=' -f2 || echo '未设置')"
        echo "  DB_DATABASE: $(grep '^DB_DATABASE=' .env.production.local | cut -d'=' -f2 || echo '未设置')"
        echo "  DB_USERNAME: $(grep '^DB_USERNAME=' .env.production.local | cut -d'=' -f2 || echo '未设置')"
        echo "  DB_PASSWORD: *** (已隐藏)"
        echo "  JWT_SECRET: *** (已隐藏)"
    fi
}

# 构建生产镜像
build_image() {
    echo "🔨 构建生产环境镜像..."
    docker build -t life-toolkit-server:prod -f docker/config/Dockerfile .
    echo "✅ 生产镜像构建完成"
}

# 运行生产容器
run_container() {
    echo "🧹 清理旧容器..."
    docker stop life-toolkit-server-prod 2>/dev/null || true
    docker rm life-toolkit-server-prod 2>/dev/null || true

    echo "🚀 启动生产环境容器..."
    
    # 检查是否需要本地数据库连接
    DB_HOST_FROM_ENV=$(grep '^DB_HOST=' .env.production.local | cut -d'=' -f2 || echo "")
    if [[ "$DB_HOST_FROM_ENV" == "localhost" || "$DB_HOST_FROM_ENV" == "127.0.0.1" ]]; then
        # 如果配置的是本地数据库，获取宿主机 IP
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            HOST_IP="host.docker.internal"
        else
            # Linux
            HOST_IP=$(ip route show default | awk '/default/ {print $3}' | head -1)
            if [ -z "$HOST_IP" ]; then
                HOST_IP="172.17.0.1"  # Docker 默认网关
            fi
        fi
        echo "📡 检测到本地数据库配置，使用数据库主机: $HOST_IP"
        
        docker run -d \
            --name life-toolkit-server-prod \
            -p 3000:3000 \
            --add-host host.docker.internal:host-gateway \
            -e DB_HOST=$HOST_IP \
            --env-file .env.production.local \
            --restart unless-stopped \
            life-toolkit-server:prod
    else
        # 使用远程数据库
        docker run -d \
            --name life-toolkit-server-prod \
            -p 3000:3000 \
            --env-file .env.production.local \
            --restart unless-stopped \
            life-toolkit-server:prod
    fi

    # 等待容器启动
    echo "⏳ 等待容器启动..."
    sleep 5

    # 检查容器状态
    if docker ps | grep -q "life-toolkit-server-prod"; then
        echo "✅ 生产环境应用已启动！"
        echo "🌐 访问地址: http://localhost:3000"
        echo "💡 使用 .env.production.local 中的配置"
        echo ""
        echo "📊 容器状态:"
        docker ps --filter "name=life-toolkit-server-prod" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        echo "📋 有用的命令："
        echo "  查看日志: docker logs -f life-toolkit-server-prod"
        echo "  停止应用: docker stop life-toolkit-server-prod"
        echo "  删除容器: docker rm life-toolkit-server-prod"
        echo "  进入容器: docker exec -it life-toolkit-server-prod sh"
        echo ""
        echo "🔍 查看实时日志？(y/N): "
        read -r show_logs
        if [[ $show_logs =~ ^[Yy]$ ]]; then
            echo "📋 实时日志 (Ctrl+C 退出):"
            docker logs -f life-toolkit-server-prod
        fi
    else
        echo "❌ 容器启动失败！"
        echo "📋 错误日志:"
        docker logs life-toolkit-server-prod
        exit 1
    fi
}

# 主函数
main() {
    echo "📋 生产环境 Docker 部署步骤："
    echo "  1. 检查前提条件"
    echo "  2. 显示配置信息"
    echo "  3. 构建生产镜像"
    echo "  4. 运行生产容器"
    echo ""
    
    check_prerequisites
    show_config
    
    echo ""
    read -p "🤔 确认使用生产环境配置启动容器？(y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "❌ 部署已取消"
        exit 0
    fi
    
    build_image
    run_container
}

# 如果脚本被直接执行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 