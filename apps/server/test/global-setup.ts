export default async (): Promise<void> => {
  console.log('🚀 开始全局测试设置...');
  
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.DB_TYPE = 'sqlite';
  process.env.DB_DATABASE = ':memory:';
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  
  // 清理可能存在的测试文件
  const fs = require('fs');
  const path = require('path');
  
  const testFiles = [
    'test.db',
    'test.db-journal',
    'test.db-wal',
    'test.db-shm',
  ];
  
  for (const file of testFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  清理测试文件: ${file}`);
    }
  }
  
  console.log('✅ 全局测试设置完成');
}; 