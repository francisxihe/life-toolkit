#!/bin/bash

# Life Toolkit Server - 远程服务器一键部署脚本
# 构建 linux/amd64 镜像并部署到 112.124.21.126
# 这是一个便捷脚本，依次执行构建和发布两个步骤

set -e

# 配置
REMOTE_HOST="112.124.21.126"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Life Toolkit Server - 远程服务器一键部署脚本"
echo "=============================================="
echo "目标服务器: ${REMOTE_HOST}"
echo ""
echo "📋 此脚本将依次执行："
echo "  1. 构建 linux/amd64 镜像 (build-remote.sh)"
echo "  2. 发布到远程服务器 (publish-remote.sh)"
echo ""

# 检查脚本是否存在
check_scripts() {
    echo "🔍 检查依赖脚本..."
    
    if [ ! -f "${SCRIPT_DIR}/build-remote.sh" ]; then
        echo "❌ build-remote.sh 脚本不存在"
        exit 1
    fi
    
    if [ ! -f "${SCRIPT_DIR}/publish-remote.sh" ]; then
        echo "❌ publish-remote.sh 脚本不存在"
        exit 1
    fi
    
    echo "✅ 依赖脚本检查通过"
}

# 执行构建脚本
run_build() {
    echo "🔨 执行构建脚本..."
    echo "============================================="
    
    if ! bash "${SCRIPT_DIR}/build-remote.sh"; then
        echo "❌ 构建失败"
        exit 1
    fi
    
    echo "✅ 构建完成"
    echo ""
}

# 执行发布脚本
run_publish() {
    echo "🚀 执行发布脚本..."
    echo "============================================="
    
    if ! bash "${SCRIPT_DIR}/publish-remote.sh"; then
        echo "❌ 发布失败"
        exit 1
    fi
    
    echo "✅ 发布完成"
}

# 显示完成结果
show_result() {
    echo ""
    echo "🎉 一键部署完成！"
    echo "🌐 访问地址: http://${REMOTE_HOST}:3000"
    echo ""
    echo "📋 如需单独执行步骤："
    echo "  构建镜像: ./build-remote.sh"
    echo "  发布部署: ./publish-remote.sh"
    echo ""
}

# 主函数
main() {
    read -p "🤔 确认开始一键部署到 ${REMOTE_HOST}？(y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "❌ 部署已取消"
        exit 0
    fi
    
    check_scripts
    run_build
    run_publish
    show_result
}

# 如果脚本被直接执行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 