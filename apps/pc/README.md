# Web浏览器壳

一个基于Electron的简单浏览器壳，可以加载任意网页。默认加载百度首页。

## 项目特点

- 使用electron-vite构建和打包
- 简洁的代码结构
- 支持浏览任意网页
- 跨平台支持（Windows、macOS、Linux）

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 使用构建脚本

我们提供了一个便捷的构建脚本，可以快速进行各种操作：

```bash
# 添加执行权限
chmod +x build.sh

# 查看帮助
./build.sh --help

# 开发模式运行
./build.sh --dev

# 仅构建应用
./build.sh --build

# 构建并启动应用
./build.sh --start

# 打包应用
./build.sh --package

# 打包特定平台
./build.sh --windows
./build.sh --mac
./build.sh --linux

# 清理构建文件
./build.sh --clean
```

### 手动命令

如果您不想使用构建脚本，也可以直接使用pnpm命令：

#### 开发模式

```bash
pnpm dev
```

#### 构建应用

```bash
pnpm build
```

#### 启动应用

```bash
pnpm start
```

#### 打包应用

```bash
# 打包所有平台
pnpm package

# 打包特定平台
pnpm pack-win  # Windows
pnpm pack-mac  # macOS
pnpm pack-linux  # Linux
```

## 修改加载的URL

如果您想要修改默认加载的URL，请编辑`src/main/index.ts`文件中的`DEFAULT_URL`常量:

```typescript
// 默认加载的URL
const DEFAULT_URL = 'https://your-website.com';
```

## 在网页中使用Electron API

您可以通过`window.electronAPI`访问以下功能：

```javascript
// 检查是否在Electron环境中
const isElectron = window.electronAPI.isElectron;

// 获取应用信息
window.electronAPI.getAppInfo().then(info => {
  console.log(`版本: ${info.version}, 平台: ${info.platform}`);
});

// 加载新的URL
window.electronAPI.loadURL('https://example.com')
  .then(result => {
    if (result.success) {
      console.log('URL加载成功');
    } else {
      console.error(`加载失败: ${result.error}`);
    }
  });
```

## 项目结构

```
.
├── dist/                   # 构建输出目录
├── src/                    # 源代码
│   ├── main/               # 主进程代码
│   │   └── index.ts        # 主进程入口
│   ├── preload/            # 预加载脚本
│   │   └── index.ts        # 预加载脚本入口
│   └── types/              # 类型定义
│       └── electron.d.ts   # Electron类型声明
├── build.sh                # 构建脚本
├── electron.vite.config.ts # electron-vite配置
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
└── tsconfig.node.json      # Node.js TypeScript配置
``` 