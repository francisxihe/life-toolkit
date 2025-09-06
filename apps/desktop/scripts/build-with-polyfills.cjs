#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 从 package.json 的 extraMetadata.dependencies 中读取需要注入的依赖
 */
function getPolyfillDependencies() {
  const packageData = readPackageJson();
  const extraDeps = packageData.build?.extraMetadata?.dependencies;
  
  if (!extraDeps || Object.keys(extraDeps).length === 0) {
    console.log('[BuildScript] 警告: 未找到 build.extraMetadata.dependencies 配置');
    return {};
  }
  
  console.log(`[BuildScript] 找到 ${Object.keys(extraDeps).length} 个 polyfill 依赖`);
  return extraDeps;
}

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJsonBackupPath = path.join(__dirname, '../package.json.backup');

/**
 * 读取 package.json
 */
function readPackageJson() {
  const content = fs.readFileSync(packageJsonPath, 'utf8');
  return JSON.parse(content);
}

/**
 * 写入 package.json
 */
function writePackageJson(packageData) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2) + '\n');
}

/**
 * 备份 package.json
 */
function backupPackageJson() {
  fs.copyFileSync(packageJsonPath, packageJsonBackupPath);
  console.log('📦 已备份 package.json');
}

/**
 * 恢复 package.json
 */
function restorePackageJson() {
  if (fs.existsSync(packageJsonBackupPath)) {
    fs.copyFileSync(packageJsonBackupPath, packageJsonPath);
    fs.unlinkSync(packageJsonBackupPath);
    console.log('🔄 已恢复 package.json');
  }
}

/**
 * 注入 polyfill 依赖
 */
function injectPolyfills() {
  const packageData = readPackageJson();
  const polyfills = getPolyfillDependencies();
  
  if (Object.keys(polyfills).length === 0) {
    console.log('⚠️  没有找到需要注入的 polyfill 依赖，跳过注入步骤');
    return;
  }
  
  // 确保 dependencies 存在
  if (!packageData.dependencies) {
    packageData.dependencies = {};
  }

  // 添加 polyfill 依赖到 dependencies
  Object.assign(packageData.dependencies, polyfills);
  
  writePackageJson(packageData);
  console.log(`✅ 已注入 ${Object.keys(polyfills).length} 个 polyfill 依赖到 dependencies`);
}

/**
 * 安装依赖
 */
function installDependencies() {
  console.log('📥 安装依赖中...');
  try {
    execSync('pnpm install', { stdio: 'inherit', cwd: path.dirname(packageJsonPath) });
    console.log('✅ 依赖安装完成');
  } catch (error) {
    console.error('❌ 依赖安装失败:', error.message);
    throw error;
  }
}

/**
 * 执行构建
 */
function build(target = 'mac') {
  console.log(`🔨 开始构建 ${target} 版本...`);
  try {
    const buildCommand = target === 'mac' ? 'build:mac' : 
                        target === 'win' ? 'build:win' : 
                        target === 'linux' ? 'build:linux' : 'build:mac';
    
    execSync(`pnpm run ${buildCommand}`, { stdio: 'inherit', cwd: path.dirname(packageJsonPath) });
    console.log('✅ 构建完成');
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    throw error;
  }
}

/**
 * 清理临时文件
 */
function cleanup() {
  // 删除备份文件
  if (fs.existsSync(packageJsonBackupPath)) {
    fs.unlinkSync(packageJsonBackupPath);
  }
  console.log('🧹 清理完成');
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'mac'; // 默认构建 mac 版本
  
  console.log('🚀 开始打包流程...');
  console.log(`📋 目标平台: ${target}`);
  
  try {
    // 1. 备份原始 package.json
    backupPackageJson();
    
    // 2. 注入 polyfill 依赖
    injectPolyfills();
    
    // 3. 安装依赖
    installDependencies();
    
    // 4. 执行构建
    build(target);
    
    console.log('🎉 打包完成！');
    
  } catch (error) {
    console.error('💥 打包过程中出现错误:', error.message);
    process.exit(1);
  } finally {
    // 5. 恢复原始 package.json
    restorePackageJson();
    
    // 6. 清理临时文件
    cleanup();
  }
}

// 处理进程退出信号
process.on('SIGINT', () => {
  console.log('\n⚠️  收到中断信号，正在清理...');
  restorePackageJson();
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  收到终止信号，正在清理...');
  restorePackageJson();
  cleanup();
  process.exit(0);
});

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  injectPolyfills,
  restorePackageJson,
  getPolyfillDependencies
};
