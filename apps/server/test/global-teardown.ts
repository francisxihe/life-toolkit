export default async (): Promise<void> => {
  console.log('🧹 开始全局测试清理...');
  
  // 清理测试文件
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
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️  清理测试文件: ${file}`);
      } catch (error: any) {
        console.warn(`⚠️  无法删除测试文件 ${file}:`, error.message);
      }
    }
  }
  
  // 等待一段时间确保所有异步操作完成
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('✅ 全局测试清理完成');
}; 