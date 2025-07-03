#!/bin/bash

# Life Toolkit Server - 远程发布脚本
# 将已构建的镜像部署到远程服务器 112.124.21.126

set -e

# 配置
REMOTE_HOST="112.124.21.126"
REMOTE_USER="root"
REMOTE_PATH="/root/project"
IMAGE_NAME="life-toolkit-server"
PROD_IMAGE_TAG="remote"

echo "🚀 Life Toolkit Server - 远程发布脚本"
echo "======================================"
echo "目标服务器: ${REMOTE_HOST}"
echo "部署路径: ${REMOTE_PATH}"
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
    
    # 检查生产环境配置文件
    if [ ! -f ".env.production.local" ]; then
        echo "❌ .env.production.local 文件不存在"
        echo "请创建此文件并配置生产环境变量"
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

# 选择镜像文件
select_image_file() {
    echo "🔍 查找可用的镜像文件..."
    
    if [ ! -d "docker/dist" ]; then
        echo "❌ docker/dist 目录不存在"
        echo "请先运行 ./build-remote.sh 构建镜像"
        exit 1
    fi
    
    # 查找镜像文件
    IMAGE_FILES=($(ls -t docker/dist/${IMAGE_NAME}_${PROD_IMAGE_TAG}_amd64_*.tar.gz 2>/dev/null || true))
    
    if [ ${#IMAGE_FILES[@]} -eq 0 ]; then
        echo "❌ 未找到镜像文件"
        echo "请先运行 ./build-remote.sh 构建镜像"
        echo "期望文件格式: docker/dist/${IMAGE_NAME}_${PROD_IMAGE_TAG}_amd64_*.tar.gz"
        exit 1
    fi
    
    if [ ${#IMAGE_FILES[@]} -eq 1 ]; then
        LOCAL_IMAGE_FILE=$(basename "${IMAGE_FILES[0]}")
        echo "✅ 找到镜像文件: $LOCAL_IMAGE_FILE"
    else
        echo "📋 找到多个镜像文件，请选择："
        for i in "${!IMAGE_FILES[@]}"; do
            echo "  $((i+1)). $(basename "${IMAGE_FILES[$i]}")"
        done
        
        while true; do
            read -p "请选择文件编号 (1-${#IMAGE_FILES[@]}): " choice
            if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#IMAGE_FILES[@]} ]; then
                LOCAL_IMAGE_FILE=$(basename "${IMAGE_FILES[$((choice-1))]}")
                echo "✅ 选择了文件: $LOCAL_IMAGE_FILE"
                break
            else
                echo "❌ 无效选择，请输入 1-${#IMAGE_FILES[@]} 之间的数字"
            fi
        done
    fi
}

# 上传文件到远程服务器
upload_files() {
    echo "📤 上传文件到远程服务器..."
    
    # 创建远程目录
    ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_PATH}"
    
    # 上传镜像文件
    echo "  📦 上传镜像文件: $LOCAL_IMAGE_FILE"
    scp "docker/dist/${LOCAL_IMAGE_FILE}" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
    
    # 上传配置文件
    echo "  ⚙️  上传配置文件..."
    scp .env.production.local ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
    
    # 上传 docker-compose 文件（如果存在）
    if [ -f "docker/config/docker-compose.prod.yml" ]; then
        echo "  📋 上传 docker-compose 文件..."
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
        echo '  压缩文件: ${LOCAL_IMAGE_FILE}'
        if [ ! -f \"${LOCAL_IMAGE_FILE}\" ]; then
            echo '❌ 镜像文件不存在: ${LOCAL_IMAGE_FILE}'
            exit 1
        fi
        ls -la ${LOCAL_IMAGE_FILE}
        
        echo '  解压文件...'
        if ! gunzip -f ${LOCAL_IMAGE_FILE}; then
            echo '❌ 解压失败'
            exit 1
        fi
        
        TAR_FILE=\"\${LOCAL_IMAGE_FILE%.gz}\"
        echo '  解压后文件: '\$TAR_FILE
        if [ ! -f \"\$TAR_FILE\" ]; then
            echo '❌ 解压后文件不存在: '\$TAR_FILE
            exit 1
        fi
        ls -la \"\$TAR_FILE\"
        
        echo '  加载镜像...'
        if ! docker load -i \"\$TAR_FILE\"; then
            echo '❌ 镜像加载失败'
            exit 1
        fi
        
        echo '✅ 镜像加载成功'
        docker images | grep ${IMAGE_NAME} || echo '⚠️  未找到加载的镜像'
        
        echo '🚀 启动新容器...'
        if ! docker run -d \\
            --name life-toolkit-server-remote \\
            -p 3000:3000 \\
            --env-file .env.production.local \\
            --restart unless-stopped \\
            ${IMAGE_NAME}:${PROD_IMAGE_TAG}; then
            echo '❌ 容器启动失败'
            echo '📋 可用镜像:'
            docker images
            echo '📋 Docker 状态:'
            docker ps -a
            exit 1
        fi
        
        echo '✅ 容器启动命令执行成功'
        
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
        TAR_FILE=\"\${LOCAL_IMAGE_FILE%.gz}\"
        rm -f \"\$TAR_FILE\"
    "
}

# 显示部署结果
show_result() {
    echo ""
    echo "🎉 远程部署完成！"
    echo "🌐 访问地址: http://${REMOTE_HOST}:3000"
    echo "📋 部署信息:"
    echo "  镜像文件: $LOCAL_IMAGE_FILE"
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
    echo "📋 发布步骤："
    echo "  1. 检查前提条件"
    echo "  2. 选择镜像文件"
    echo "  3. 上传文件到远程服务器"
    echo "  4. 在远程服务器部署"
    echo ""
    
    read -p "🤔 确认开始发布到 ${REMOTE_HOST}？(y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "❌ 发布已取消"
        exit 0
    fi
    
    check_prerequisites
    select_image_file
    upload_files
    deploy_on_remote
    show_result
}

# 如果脚本被直接执行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 