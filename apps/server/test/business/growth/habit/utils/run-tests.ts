#!/usr/bin/env node

/**
 * 习惯功能测试运行脚本
 * 
 * 使用方法：
 * npm run test:habit
 * npm run test:habit:unit
 * npm run test:habit:integration
 * npm run test:habit:coverage
 */

import { execSync } from 'child_process';
import * as path from 'path';

const HABIT_TEST_DIR = path.join(__dirname, '..');
const ROOT_DIR = path.join(__dirname, '../../../../../..');

interface TestOptions {
  type?: 'unit' | 'integration' | 'all';
  coverage?: boolean;
  watch?: boolean;
  verbose?: boolean;
  pattern?: string;
}

class HabitTestRunner {
  private options: TestOptions;

  constructor(options: TestOptions = {}) {
    this.options = {
      type: 'all',
      coverage: false,
      watch: false,
      verbose: false,
      ...options,
    };
  }

  /**
   * 运行测试
   */
  async run(): Promise<void> {
    console.log('🧪 开始运行习惯功能测试...\n');

    try {
      switch (this.options.type) {
        case 'unit':
          await this.runUnitTests();
          break;
        case 'integration':
          await this.runIntegrationTests();
          break;
        case 'all':
        default:
          await this.runAllTests();
          break;
      }

      console.log('\n✅ 所有测试运行完成！');
    } catch (error) {
      console.error('\n❌ 测试运行失败：', error);
      process.exit(1);
    }
  }

  /**
   * 运行单元测试
   */
  private async runUnitTests(): Promise<void> {
    console.log('📋 运行单元测试...');
    
    const testFiles = [
      'unit/habit.simple.spec.ts',
      'unit/habit.service.enhanced.spec.ts',
      'unit/habit.controller.spec.ts',
      'unit/habit-log.controller.spec.ts',
    ];

    for (const testFile of testFiles) {
      await this.runTestFile(testFile, '单元测试');
    }
  }

  /**
   * 运行集成测试
   */
  private async runIntegrationTests(): Promise<void> {
    console.log('🔗 运行集成测试...');
    
    const testFiles = [
      'integration/habit.integration.spec.ts',
    ];

    for (const testFile of testFiles) {
      await this.runTestFile(testFile, '集成测试');
    }
  }

  /**
   * 运行所有测试
   */
  private async runAllTests(): Promise<void> {
    await this.runUnitTests();
    await this.runIntegrationTests();
  }

  /**
   * 运行单个测试文件
   */
  private async runTestFile(testFile: string, testType: string): Promise<void> {
    const testPath = path.join(HABIT_TEST_DIR, testFile);
    
    if (!require('fs').existsSync(testPath)) {
      console.log(`⚠️  跳过不存在的测试文件: ${testFile}`);
      return;
    }

    console.log(`  🔍 运行 ${testType}: ${testFile}`);

    const jestCommand = this.buildJestCommand(testPath);
    
    try {
      execSync(jestCommand, {
        cwd: ROOT_DIR,
        stdio: this.options.verbose ? 'inherit' : 'pipe',
      });
      console.log(`  ✅ ${testFile} 测试通过`);
    } catch (error) {
      console.error(`  ❌ ${testFile} 测试失败`);
      if (this.options.verbose) {
        console.error(error);
      }
      throw error;
    }
  }

  /**
   * 构建Jest命令
   */
  private buildJestCommand(testPath?: string): string {
    const commands = ['npx jest'];

    if (testPath) {
      commands.push(`"${testPath}"`);
    } else if (this.options.pattern) {
      commands.push(`--testPathPattern="${this.options.pattern}"`);
    } else {
      commands.push('--testPathPattern="habit"');
    }

    if (this.options.coverage) {
      commands.push('--coverage');
      commands.push('--coverageDirectory=coverage/habit');
      commands.push('--collectCoverageFrom="src/business/growth/habit/**/*.ts"');
      commands.push('--coverageReporters=text,html,lcov');
    }

    if (this.options.watch) {
      commands.push('--watch');
    }

    if (this.options.verbose) {
      commands.push('--verbose');
    }

    // 添加其他Jest配置
    commands.push('--detectOpenHandles');
    commands.push('--forceExit');
    commands.push('--maxWorkers=1');

    return commands.join(' ');
  }

  /**
   * 生成测试报告
   */
  async generateReport(): Promise<void> {
    console.log('📊 生成测试报告...');

    const reportCommand = this.buildJestCommand();
    const fullCommand = `${reportCommand} --coverage --coverageReporters=html,text-summary`;

    try {
      execSync(fullCommand, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
      });
      console.log('✅ 测试报告已生成到 coverage/habit 目录');
    } catch (error) {
      console.error('❌ 生成测试报告失败：', error);
      throw error;
    }
  }

  /**
   * 清理测试环境
   */
  async cleanup(): Promise<void> {
    console.log('🧹 清理测试环境...');
    
    try {
      // 清理测试数据库文件
      const testDbFiles = [
        'test.db',
        'test.db-journal',
        'test.db-wal',
        'test.db-shm',
      ];

      for (const file of testDbFiles) {
        const filePath = path.join(ROOT_DIR, file);
        if (require('fs').existsSync(filePath)) {
          require('fs').unlinkSync(filePath);
          console.log(`  🗑️  删除测试文件: ${file}`);
        }
      }

      console.log('✅ 测试环境清理完成');
    } catch (error) {
      console.error('❌ 清理测试环境失败：', error);
    }
  }
}

/**
 * 解析命令行参数
 */
function parseArgs(): TestOptions {
  const args = process.argv.slice(2);
  const options: TestOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--unit':
        options.type = 'unit';
        break;
      case '--integration':
        options.type = 'integration';
        break;
      case '--coverage':
        options.coverage = true;
        break;
      case '--watch':
        options.watch = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--pattern':
        options.pattern = args[++i];
        break;
    }
  }

  return options;
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(`
习惯功能测试运行器

使用方法:
  node run-tests.js [选项]

选项:
  --unit          只运行单元测试
  --integration   只运行集成测试
  --coverage      生成覆盖率报告
  --watch         监听模式
  --verbose       详细输出
  --pattern <p>   指定测试文件模式
  --help          显示帮助信息

示例:
  node run-tests.js --unit --coverage
  node run-tests.js --integration --verbose
  node run-tests.js --pattern="habit.service"
  `);
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const options = parseArgs();
  const runner = new HabitTestRunner(options);

  try {
    await runner.run();
    
    if (options.coverage) {
      await runner.generateReport();
    }
  } finally {
    await runner.cleanup();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('运行测试时发生错误：', error);
    process.exit(1);
  });
}

export { HabitTestRunner, parseArgs, showHelp }; 