#!/bin/bash

# 定义函数来启动各个应用
start_server() {
  echo "启动服务端..."
  turbo run dev --filter=life-toolkit-server
}

start_web() {
  echo "启动桌面端..."
  turbo run dev --filter=life-toolkit-web
}

start_pc() {
  echo "启动移动端..."
  turbo run dev --filter=life-toolkit-desktop
}

# 询问用户要启动哪个应用
echo "请选择要启动的应用:"
echo "1. 只启动服务端"
echo "2. 启动服务端和桌面端"
echo "3. 启动服务端和移动端"
echo "4. 启动所有应用"
read -p "请输入选项 (默认: 4): " choice

case ${choice:-4} in
  1)
    start_server
    ;;
  2)
    # 在后台启动服务端
    start_server &
    # 等待服务端启动完成
    echo "等待服务端启动..."
    sleep 10
    start_web
    ;;
  3)
    # 在后台启动服务端
    start_server &
    # 等待服务端启动完成
    echo "等待服务端启动..."
    sleep 10
    start_pc
    ;;
  4)
    # 在后台启动服务端
    start_server &
    # 等待服务端启动完成
    echo "等待服务端启动..."
    sleep 10
    # 在后台启动桌面端
    start_web &
    # 等待桌面端启动完成
    echo "等待桌面端启动..."
    sleep 5
    start_pc
    ;;
  *)
    echo "无效选项"
    exit 1
    ;;
esac
