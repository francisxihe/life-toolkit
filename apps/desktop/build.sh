#!/bin/bash

# 构建脚本

# 显示帮助信息
show_help() {
  echo "用法: ./build.sh [选项]"
  echo "选项:"
  echo "  -h, --help     显示帮助信息"
  echo "  -d, --dev      开发模式运行"
  echo "  -b, --build    仅构建应用"
  echo "  -s, --start    构建并启动应用"
  echo "  -p, --package  打包应用为可分发格式"
  echo "  -w, --windows  打包为Windows应用"
  echo "  -m, --mac      打包为macOS应用"
  echo "  -l, --linux    打包为Linux应用"
  echo "  -c, --clean    清理构建文件"
}

# 检查是否安装了pnpm
if ! command -v pnpm &> /dev/null; then
  echo "错误: 未找到pnpm，请先安装pnpm"
  echo "可以使用以下命令安装: npm install -g pnpm"
  exit 1
fi

# 如果没有参数，显示帮助
if [ $# -eq 0 ]; then
  show_help
  exit 0
fi

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -d|--dev)
      echo "正在开发模式运行应用..."
      pnpm dev
      exit 0
      ;;
    -b|--build)
      echo "正在构建应用..."
      pnpm build
      exit 0
      ;;
    -s|--start)
      echo "正在构建并启动应用..."
      pnpm build && pnpm start
      exit 0
      ;;
    -p|--package)
      echo "正在打包应用..."
      pnpm package
      exit 0
      ;;
    -w|--windows)
      echo "正在打包Windows应用..."
      pnpm pack-win
      exit 0
      ;;
    -m|--mac)
      echo "正在打包macOS应用..."
      pnpm pack-mac
      exit 0
      ;;
    -l|--linux)
      echo "正在打包Linux应用..."
      pnpm pack-linux
      exit 0
      ;;
    -c|--clean)
      echo "正在清理构建文件..."
      pnpm clean
      exit 0
      ;;
    *)
      echo "无效的选项: $1"
      show_help
      exit 1
      ;;
  esac
done 