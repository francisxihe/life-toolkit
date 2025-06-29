#!/bin/bash

# Life Toolkit Server - 远程服务器部署脚本
# 构建 linux/amd64 镜像并部署到 112.124.21.126

set -e

# 配置
REMOTE_HOST="112.124.21.126"
REMOTE_USER="root"
REMOTE_PATH="/root/project"
IMAGE_NAME="life-toolkit-server"
PROD_IMAGE_TAG="remote"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOCAL_IMAGE_FILE="${IMAGE_NAME}_${PROD_IMAGE_TAG}_amd64_${TIMESTAMP}.tar.gz"

echo "🚀 Life Toolkit Server - 远程服务器部署脚本"
echo "============================================="
echo "目标服务器: ${REMOTE_HOST}"
echo "部署路径: ${REMOTE_PATH}"
echo "镜像架构: linux/amd64"
echo ""

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
    
    # 检查生产环境配置文件
    if [ ! -f ".env.production.local" ]; then
        echo "❌ .env.production.local 文件不存在"
        echo "请创建此文件并配置生产环境变量"
        exit 1
    fi
    
    # 检查 Docker 和 buildx
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker 未运行，请启动 Docker"
        exit 1
    fi
    
    if ! docker buildx version > /dev/null 2>&1; then
        echo "❌ Docker buildx 不可用，请确保 Docker Desktop 已启用 buildx"
        echo "💡 解决方案："
        echo "   1. 更新 Docker Desktop 到最新版本"
        echo "   2. 在 Docker Desktop 设置中启用 'Use Docker Compose V2'"
        echo "   3. 重启 Docker Desktop"
        exit 1
    fi
    
    # 检查 SSH 连接
    echo "🔗 检查 SSH 连接..."
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes ${REMOTE_USER}@${REMOTE_HOST} exit 2>/dev/null; then
        echo "❌ 无法连接到远程服务器 ${REMOTE_HOST}"
        echo "请检查："
        echo "  1. 网络连接"
        echo "  2. SSH 密钥配置"
        echo "  3. 服务器是否可访问"
        exit 1
    fi
    
    echo "✅ 前提条件检查通过"
}

# 构建和保存 AMD64 镜像
build_and_save_image() {
    echo "🔨 构建 linux/amd64 生产镜像..."
    echo "⚠️  注意：跨架构构建可能需要较长时间，请耐心等待..."
    
    # 使用 buildx 构建 AMD64 镜像
    docker buildx build \
        --platform linux/amd64 \
        -t ${IMAGE_NAME}:${PROD_IMAGE_TAG} \
        --load \
        -f docker/config/Dockerfile .
    
    # 验证镜像架构
    BUILT_ARCH=$(docker inspect "${IMAGE_NAME}:${PROD_IMAGE_TAG}" --format '{{.Architecture}}' 2>/dev/null || echo "unknown")
    echo "📋 构建镜像架构: $BUILT_ARCH"
    
    if [ "$BUILT_ARCH" = "amd64" ]; then
        echo "✅ 架构验证通过"
    else
        echo "⚠️  架构验证失败，期望: amd64，实际: $BUILT_ARCH"
    fi
    
    echo "📦 保存镜像为 tar 文件..."
    # 创建保存目录
    mkdir -p docker/images
    
    # 保存为 tar 文件
    TEMP_TAR="docker/images/${LOCAL_IMAGE_FILE%.gz}"
    docker save -o "$TEMP_TAR" ${IMAGE_NAME}:${PROD_IMAGE_TAG}
    
    # 压缩文件
    echo "🗜️  压缩镜像文件..."
    gzip "$TEMP_TAR"
    
    echo "✅ 镜像已保存并压缩: docker/images/${LOCAL_IMAGE_FILE}"
    ls -lh "docker/images/${LOCAL_IMAGE_FILE}"
}

# 上传文件到远程服务器
upload_files() {
    echo "📤 上传文件到远程服务器..."
    
    # 创建远程目录
    ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_PATH}"
    
    # 上传镜像文件
    echo "  📦 上传镜像文件..."
    scp "docker/images/${LOCAL_IMAGE_FILE}" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
    
    # 上传配置文件
    echo "  ⚙️  上传配置文件..."
    scp .env.production.local ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
    
    # 上传 docker-compose 文件（如果存在）
    if [ -f "docker/config/docker-compose.prod.yml" ]; then
        scp docker/config/docker-compose.prod.yml ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
    fi
    
    echo "✅ 文件上传完成"
}

# 在远程服务器部署
deploy_on_remote() {
    echo "🔄 在远程服务器执行部署..."
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        cd ${REMOTE_PATH}
        
        echo '🔄 停止旧容器...'
        docker stop life-toolkit-server-remote 2>/dev/null || true
        docker rm life-toolkit-server-remote 2>/dev/null || true
        
        echo '🧹 清理旧镜像...'
        docker rmi ${IMAGE_NAME}:${PROD_IMAGE_TAG} 2>/dev/null || true
        
        echo '📦 解压并加载新镜像...'
        gunzip -f ${LOCAL_IMAGE_FILE}
        docker load -i \${LOCAL_IMAGE_FILE%.gz}
        
        echo '🚀 启动新容器...'
        docker run -d \\
            --name life-toolkit-server-remote \\
            -p 3000:3000 \\
            --env-file .env.production.local \\
            --restart unless-stopped \\
            ${IMAGE_NAME}:${PROD_IMAGE_TAG}
        
        echo '⏳ 等待容器启动...'
        sleep 5
        
        echo '📊 检查容器状态:'
        if docker ps | grep -q 'life-toolkit-server-remote'; then
            docker ps --filter 'name=life-toolkit-server-remote' --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'
            echo '✅ 容器启动成功！'
        else
            echo '❌ 容器启动失败！'
            echo '📋 错误日志:'
            docker logs life-toolkit-server-remote
            exit 1
        fi
        
        echo '🧹 清理镜像文件...'
        rm -f ${LOCAL_IMAGE_FILE}
        rm -f \${LOCAL_IMAGE_FILE%.gz}
    "
}

# 清理本地文件
cleanup_local() {
    echo "🧹 清理本地镜像文件..."
    rm -f "docker/images/${LOCAL_IMAGE_FILE}"
    # 清理本地镜像
    docker rmi ${IMAGE_NAME}:${PROD_IMAGE_TAG} 2>/dev/null || true
    echo "✅ 本地清理完成"
}

# 显示部署结果
show_result() {
    echo ""
    echo "🎉 远程部署完成！"
    echo "🌐 访问地址: http://${REMOTE_HOST}:3000"
    echo "📋 部署信息:"
    echo "  目标架构: linux/amd64"
    echo "  容器名称: life-toolkit-server-remote"
    echo "  部署路径: ${REMOTE_PATH}"
    echo ""
    echo "📋 有用的命令："
    echo "  查看远程状态: ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker ps | grep life-toolkit'"
    echo "  查看远程日志: ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker logs -f life-toolkit-server-remote'"
    echo "  停止远程容器: ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker stop life-toolkit-server-remote'"
    echo ""
    echo "🔍 立即查看远程日志？(y/N): "
    read -r show_logs
    if [[ $show_logs =~ ^[Yy]$ ]]; then
        echo "📋 远程服务器日志 (Ctrl+C 退出)："
        ssh ${REMOTE_USER}@${REMOTE_HOST} "docker logs -f life-toolkit-server-remote"
    fi
}

# 主函数
main() {
    echo "📋 远程部署步骤："
    echo "  1. 检查前提条件"
    echo "  2. 构建 linux/amd64 镜像并保存"
    echo "  3. 上传文件到远程服务器"
    echo "  4. 在远程服务器部署"
    echo "  5. 清理本地文件"
    echo ""
    echo "⚠️  注意：此脚本将构建跨架构镜像，可能需要较长时间"
    echo ""
    
    read -p "🤔 确认开始部署到 ${REMOTE_HOST}？(y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "❌ 部署已取消"
        exit 0
    fi
    
    check_prerequisites
    build_and_save_image
    upload_files
    deploy_on_remote
    cleanup_local
    show_result
}

# 如果脚本被直接执行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 