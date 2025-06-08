#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';

/**
 * 运行所有业务模块测试的脚本
 */
class TestRunner {
  private readonly testModules = [
    'growth/habit',
    'users',
    'expenses',
    'auth',
    'calendar',
    'ai',
    'excel',
  ];

  /**
   * 运行指定模块的测试
   */
  private runModuleTests(module: string): void {
    console.log(`\n🧪 运行 ${module} 模块测试...`);
    try {
      const testPath = path.join('test/business', module);
      const command = `npm test -- ${testPath}`;
      
      console.log(`执行命令: ${command}`);
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      
      console.log(`✅ ${module} 模块测试完成`);
    } catch (error) {
      console.error(`❌ ${module} 模块测试失败:`, error);
    }
  }

  /**
   * 运行所有模块测试
   */
  public runAllTests(): void {
    console.log('🚀 开始运行所有业务模块测试...\n');
    
    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;

    for (const module of this.testModules) {
      try {
        this.runModuleTests(module);
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`模块 ${module} 测试失败`);
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n📊 测试总结:');
    console.log(`✅ 成功: ${successCount} 个模块`);
    console.log(`❌ 失败: ${failCount} 个模块`);
    console.log(`⏱️  总耗时: ${duration.toFixed(2)} 秒`);

    if (failCount > 0) {
      process.exit(1);
    }
  }

  /**
   * 运行指定模块测试
   */
  public runSpecificModule(moduleName: string): void {
    if (!this.testModules.includes(moduleName)) {
      console.error(`❌ 未知模块: ${moduleName}`);
      console.log('可用模块:', this.testModules.join(', '));
      process.exit(1);
    }

    this.runModuleTests(moduleName);
  }

  /**
   * 生成测试覆盖率报告
   */
  public generateCoverageReport(): void {
    console.log('📈 生成测试覆盖率报告...');
    try {
      execSync('npm test -- --coverage test/business', {
        encoding: 'utf8',
        stdio: 'inherit',
      });
      console.log('✅ 覆盖率报告生成完成');
    } catch (error) {
      console.error('❌ 覆盖率报告生成失败:', error);
    }
  }

  /**
   * 显示帮助信息
   */
  public showHelp(): void {
    console.log(`
🧪 业务模块测试运行器

用法:
  ts-node test/run-all-tests.ts [选项] [模块名]

选项:
  --help, -h        显示帮助信息
  --coverage, -c    生成覆盖率报告
  --all, -a         运行所有模块测试 (默认)

模块名:
  ${this.testModules.join('\n  ')}

示例:
  ts-node test/run-all-tests.ts                    # 运行所有测试
  ts-node test/run-all-tests.ts users              # 运行用户模块测试
  ts-node test/run-all-tests.ts --coverage         # 生成覆盖率报告
    `);
  }
}

// 主函数
function main() {
  const runner = new TestRunner();
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--all') || args.includes('-a')) {
    runner.runAllTests();
  } else if (args.includes('--help') || args.includes('-h')) {
    runner.showHelp();
  } else if (args.includes('--coverage') || args.includes('-c')) {
    runner.generateCoverageReport();
  } else {
    const moduleName = args[0];
    runner.runSpecificModule(moduleName);
  }
}

// 运行主函数
if (require.main === module) {
  main();
} 