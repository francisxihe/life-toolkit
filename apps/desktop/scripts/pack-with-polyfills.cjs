#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 从 package.json 的 extraMetadata.dependencies 中读取需要注入的依赖
 */
function getPolyfills() {
  const pkg = readPackage();
  const extraDeps = pkg.build?.extraMetadata?.dependencies;
  
  if (!extraDeps || Object.keys(extraDeps).length === 0) {
    log('警告: 未找到 build.extraMetadata.dependencies 配置');
    return {};
  }
  
  log(`找到 ${Object.keys(extraDeps).length} 个 polyfill 依赖`);
  return extraDeps;
}

const packagePath = path.join(__dirname, '../package.json');
const backupPath = packagePath + '.backup';

function log(msg) {
  console.log(`[Pack] ${msg}`);
}

function readPackage() {
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

function writePackage(data) {
  fs.writeFileSync(packagePath, JSON.stringify(data, null, 2) + '\n');
}

function backup() {
  fs.copyFileSync(packagePath, backupPath);
  log('已备份 package.json');
}

function restore() {
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, packagePath);
    fs.unlinkSync(backupPath);
    log('已恢复 package.json');
  }
}

function injectPolyfills() {
  const pkg = readPackage();
  const polyfills = getPolyfills();
  
  if (Object.keys(polyfills).length === 0) {
    log('没有找到需要注入的 polyfill 依赖，跳过注入步骤');
    return;
  }
  
  // 注入到 dependencies
  pkg.dependencies = { ...pkg.dependencies, ...polyfills };
  
  writePackage(pkg);
  log(`已注入 ${Object.keys(polyfills).length} 个 polyfill 依赖`);
}

function pack(platform) {
  const commands = {
    mac: 'NODE_ENV=production electron-vite build --mode production && electron-builder --mac',
    win: 'NODE_ENV=production electron-vite build --mode production && electron-builder --win',
    linux: 'NODE_ENV=production electron-vite build --mode production && electron-builder --linux'
  };
  
  const cmd = commands[platform] || commands.mac;
  log(`开始打包 ${platform} 版本...`);
  
  execSync(cmd, { stdio: 'inherit', cwd: path.dirname(packagePath) });
  log('打包完成');
}

function installDependenciesInApp(platform) {
  const appPaths = {
    mac: 'release/mac-arm64/life toolkit.app/Contents/Resources/app',
    win: 'release/win-unpacked/resources/app',
    linux: 'release/linux-unpacked/resources/app'
  };
  
  const appPath = appPaths[platform] || appPaths.mac;
  const fullAppPath = path.join(path.dirname(packagePath), appPath);
  
  if (!fs.existsSync(fullAppPath)) {
    log(`应用路径不存在: ${fullAppPath}`);
    return;
  }
  
  const appPackageJsonPath = path.join(fullAppPath, 'package.json');
  if (!fs.existsSync(appPackageJsonPath)) {
    log(`应用 package.json 不存在: ${appPackageJsonPath}`);
    return;
  }
  
  // 读取应用的 package.json
  const appPkg = JSON.parse(fs.readFileSync(appPackageJsonPath, 'utf8'));
  
  // 移除 workspace 依赖
  const workspaceDeps = [];
  for (const [name, version] of Object.entries(appPkg.dependencies || {})) {
    if (typeof version === 'string' && version.startsWith('workspace:')) {
      workspaceDeps.push(name);
      delete appPkg.dependencies[name];
    }
  }
  
  if (workspaceDeps.length > 0) {
    log(`移除 ${workspaceDeps.length} 个 workspace 依赖: ${workspaceDeps.join(', ')}`);
    fs.writeFileSync(appPackageJsonPath, JSON.stringify(appPkg, null, 2));
  }
  
  // 安装依赖
  log('在应用包中安装依赖...');
  try {
    execSync('npm install --omit=dev --omit=optional', { 
      stdio: 'inherit', 
      cwd: fullAppPath 
    });
    log('依赖安装完成');
  } catch (error) {
    log(`依赖安装失败: ${error.message}`);
  }
}

async function main() {
  const platform = process.argv[2] || 'mac';
  
  // 设置退出处理
  const cleanup = () => {
    restore();
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  try {
    backup();
    injectPolyfills();
    
    log('安装依赖...');
    execSync('pnpm install', { stdio: 'inherit', cwd: path.dirname(packagePath) });
    
    pack(platform);
    installDependenciesInApp(platform);
    log('🎉 打包成功！');
    
  } catch (error) {
    log(`❌ 错误: ${error.message}`);
    process.exit(1);
  } finally {
    restore();
  }
}

if (require.main === module) {
  main();
}
