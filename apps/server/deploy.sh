#!/bin/bash

# 定义变量
LOCAL_DIR="./"
ECS_USERNAME="root"
ECS_IP="112.124.21.126"
ECS_PATH="/root/project/life_toolkit"

# 清空远程目录
ssh -p 22 $ECS_USERNAME@$ECS_IP "cd $ECS_PATH && rm -rf *" || { echo "清空远程目录失败！"; exit 1; }

# 使用 rsync 同步文件
/opt/homebrew/bin/rsync -avz --include 'dist/***' --include '.env.production.local' --include 'package.json' --include 'ecosystem.config.js' --exclude '*' -e "ssh" "$LOCAL_DIR" "${ECS_USERNAME}@${ECS_IP}:$ECS_PATH"

# 安装node_modules
ssh -p 22 $ECS_USERNAME@$ECS_IP "cd $ECS_PATH && pnpm install" || { echo "安装node_modules失败！"; exit 1; }

# 重启服务
ssh -p 22 $ECS_USERNAME@$ECS_IP "cd $ECS_PATH && pm2 start ./ecosystem.config.js" || { echo "服务重启失败！"; exit 1; }

echo "同步完成"