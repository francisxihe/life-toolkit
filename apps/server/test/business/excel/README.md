# Excel模块测试

## 概述

Excel模块提供Excel文件处理功能的测试，包括文件上传下载、数据解析和Excel生成。

## 目录结构

```
test/business/excel/
├── README.md                    # 测试文档
├── unit/                        # 单元测试
│   ├── excel.service.spec.ts    # Excel服务测试 (待开发)
│   ├── excel.parser.spec.ts     # Excel解析器测试 (待开发)
│   └── excel.controller.spec.ts # Excel控制器测试 (待开发)
├── integration/                 # 集成测试
│   └── excel.integration.spec.ts # Excel集成测试 (待开发)
└── utils/                       # 测试工具
    ├── excel.factory.ts         # Excel测试数据工厂 (待开发)
    └── test-files/              # 测试文件目录 (待创建)
        ├── valid.xlsx           # 有效Excel文件
        ├── invalid.xlsx         # 无效Excel文件
        └── large.xlsx           # 大文件测试
```

## 当前状态

### 📋 计划中
- **测试数据工厂**: Excel测试数据工厂设计
- **单元测试**: Excel服务和控制器测试
- **集成测试**: 文件处理端到端测试
- **测试文件**: 各种场景的Excel测试文件

## 功能覆盖计划

### 文件上传处理
- [ ] **文件验证**: Excel文件格式验证
- [ ] **大小限制**: 文件大小限制检查
- [ ] **类型检查**: MIME类型验证
- [ ] **安全扫描**: 文件安全性检查
- [ ] **临时存储**: 上传文件临时存储

### Excel解析功能
- [ ] **数据读取**: Excel数据读取和解析
- [ ] **工作表处理**: 多工作表处理
- [ ] **数据类型**: 各种数据类型识别
- [ ] **格式处理**: 单元格格式处理
- [ ] **错误处理**: 解析错误处理

### Excel生成功能
- [ ] **数据导出**: 数据导出为Excel
- [ ] **格式设置**: 单元格格式设置
- [ ] **样式应用**: 表格样式应用
- [ ] **图表生成**: Excel图表生成
- [ ] **模板使用**: Excel模板应用

### 文件下载处理
- [ ] **文件生成**: 动态Excel文件生成
- [ ] **流式下载**: 大文件流式下载
- [ ] **缓存管理**: 生成文件缓存
- [ ] **清理机制**: 临时文件清理
- [ ] **权限控制**: 下载权限验证

## 测试工具计划

### ExcelTestFactory (待开发)
计划提供Excel测试数据的创建方法：

```typescript
// 创建基础Excel数据
const excelData = ExcelTestFactory.createBasicExcelData();

// 创建多工作表数据
const multiSheetData = ExcelTestFactory.createMultiSheetData();

// 创建大数据集
const largeDataSet = ExcelTestFactory.createLargeDataSet();

// 创建格式化数据
const formattedData = ExcelTestFactory.createFormattedData();

// 创建测试文件缓冲区
const fileBuffer = ExcelTestFactory.createTestFileBuffer();

// 创建边界值测试数据
const boundaryData = ExcelTestFactory.createBoundaryTestData();
```

### 测试文件管理
```typescript
// 创建测试Excel文件
const testFile = ExcelTestFactory.createTestExcelFile();

// 创建损坏的Excel文件
const corruptedFile = ExcelTestFactory.createCorruptedFile();

// 创建大型Excel文件
const largeFile = ExcelTestFactory.createLargeExcelFile();

// 创建空Excel文件
const emptyFile = ExcelTestFactory.createEmptyExcelFile();
```

## 计划中的测试用例

### Excel服务测试 (ExcelService)

#### 文件解析测试
```typescript
describe('ExcelService', () => {
  describe('parseExcelFile', () => {
    // 解析有效Excel文件
    // 处理多工作表文件
    // 处理空文件
    // 处理损坏文件
  });

  describe('validateExcelFile', () => {
    // 验证文件格式
    // 检查文件大小
    // 验证MIME类型
  });
});
```

#### 数据处理测试
```typescript
describe('DataProcessing', () => {
  describe('extractData', () => {
    // 提取单元格数据
    // 处理数据类型转换
    // 处理空值和错误值
  });

  describe('formatData', () => {
    // 数据格式化
    // 日期格式处理
    // 数字格式处理
  });
});
```

#### Excel生成测试
```typescript
describe('ExcelGeneration', () => {
  describe('generateExcel', () => {
    // 生成基础Excel文件
    // 应用样式和格式
    // 创建多工作表
  });

  describe('exportData', () => {
    // 导出数据为Excel
    // 大数据量导出
    // 自定义模板导出
  });
});
```

### 控制器测试 (ExcelController)

#### 文件上传测试
```typescript
describe('POST /excel/upload', () => {
  // 上传有效Excel文件
  // 处理文件大小超限
  // 处理无效文件格式
  // 处理上传错误
});

describe('POST /excel/parse', () => {
  // 解析上传的Excel文件
  // 返回解析结果
  // 处理解析错误
});
```

#### 文件下载测试
```typescript
describe('GET /excel/download/:id', () => {
  // 下载生成的Excel文件
  // 处理文件不存在
  // 验证下载权限
});

describe('POST /excel/export', () => {
  // 导出数据为Excel
  // 自定义导出格式
  // 处理导出错误
});
```

## 性能测试计划

### 文件处理性能
- **小文件解析**: < 100ms (< 1MB)
- **中等文件解析**: < 1s (1-10MB)
- **大文件解析**: < 10s (10-100MB)
- **超大文件**: 流式处理 (> 100MB)

### 数据处理性能
- **1000行数据**: < 500ms
- **10000行数据**: < 2s
- **100000行数据**: < 10s
- **内存使用**: < 512MB

### 并发处理
- **并发上传**: 支持10个并发文件上传
- **并发解析**: 支持5个并发文件解析
- **并发下载**: 支持20个并发文件下载

## 安全测试计划

### 文件安全
- [ ] **文件类型验证**: 严格的文件类型检查
- [ ] **恶意文件检测**: 恶意Excel文件检测
- [ ] **宏病毒防护**: Excel宏病毒防护
- [ ] **文件大小限制**: 防止DoS攻击

### 数据安全
- [ ] **敏感数据处理**: 敏感数据脱敏
- [ ] **访问权限**: 文件访问权限控制
- [ ] **数据泄露防护**: 防止数据泄露
- [ ] **审计日志**: 文件操作审计

## 错误处理测试

### 文件错误
- [ ] **格式错误**: 处理非Excel格式文件
- [ ] **损坏文件**: 处理损坏的Excel文件
- [ ] **密码保护**: 处理密码保护的文件
- [ ] **版本兼容**: 处理不同Excel版本

### 数据错误
- [ ] **数据类型错误**: 处理数据类型不匹配
- [ ] **空数据**: 处理空工作表和空单元格
- [ ] **特殊字符**: 处理特殊字符和编码
- [ ] **公式错误**: 处理Excel公式错误

## 运行测试计划

```bash
# 运行Excel模块所有测试 (待开发)
npm test -- test/business/excel

# 运行Excel服务测试 (待开发)
npm test -- test/business/excel/unit/excel.service.spec.ts

# 运行Excel解析器测试 (待开发)
npm test -- test/business/excel/unit/excel.parser.spec.ts

# 运行Excel控制器测试 (待开发)
npm test -- test/business/excel/unit/excel.controller.spec.ts

# 运行集成测试 (待开发)
npm test -- test/business/excel/integration

# 生成覆盖率报告
npm test -- test/business/excel --coverage
```

## 开发优先级

### 高优先级 (第1周)
1. **测试数据工厂**: 创建ExcelTestFactory
2. **基础解析测试**: Excel文件解析功能测试
3. **文件验证测试**: 文件格式和安全验证测试

### 中优先级 (第2-3周)
1. **数据处理测试**: 数据提取和格式化测试
2. **Excel生成测试**: Excel文件生成功能测试
3. **控制器测试**: 文件上传下载API测试

### 低优先级 (第4周及以后)
1. **集成测试**: 端到端文件处理测试
2. **性能测试**: 大文件和高并发测试
3. **安全测试**: 文件安全和数据保护测试

## 技术依赖

### 核心库
- **ExcelJS**: Excel文件处理库
- **Multer**: 文件上传中间件
- **Stream**: 流式文件处理
- **Buffer**: 文件缓冲区处理

### 测试工具
- **Supertest**: API测试
- **Mock-fs**: 文件系统模拟
- **Sinon**: 函数模拟
- **Chai**: 断言库

## 注意事项

1. **内存管理**: 大文件处理时的内存控制
2. **临时文件**: 及时清理临时文件
3. **并发限制**: 控制并发文件处理数量
4. **错误恢复**: 完善的错误处理和恢复
5. **用户体验**: 文件处理进度反馈

## 扩展计划

### 高级功能测试
- [ ] **Excel模板**: 模板系统测试
- [ ] **图表生成**: Excel图表功能测试
- [ ] **数据验证**: Excel数据验证规则测试
- [ ] **条件格式**: 条件格式化功能测试

### 集成功能测试
- [ ] **数据库集成**: Excel数据导入数据库测试
- [ ] **API集成**: 与其他模块的数据交换测试
- [ ] **批量处理**: 批量文件处理测试
- [ ] **定时任务**: 定时Excel处理任务测试

---

*最后更新时间: 2024年12月* 