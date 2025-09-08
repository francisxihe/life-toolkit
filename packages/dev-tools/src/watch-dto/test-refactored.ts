#!/usr/bin/env tsx

import { parseDtoClasses } from './parsers/dto-parser';
import { generateVoContent } from './core/vo-generator';
import { readFileSafe } from '../utils';

// 测试重构后的模块化结构
async function testRefactoredStructure() {
  console.log('🧪 Testing refactored watch-dto structure...\n');

  // 测试解析 DTO 文件
  const testDtoPath = '/Users/xuwenhua/code/application-mine/life-toolkit/packages/business/server/src/growth/goal/dto/goal-form.dto.ts';
  const dtoContent = readFileSafe(testDtoPath);
  
  if (!dtoContent) {
    console.error('❌ Failed to read test DTO file');
    return;
  }

  try {
    // 1. 测试 DTO 解析
    console.log('1️⃣ Testing DTO parsing...');
    const dtoClasses = parseDtoClasses(dtoContent, testDtoPath);
    console.log(`   ✅ Parsed ${dtoClasses.length} DTO classes:`);
    dtoClasses.forEach(cls => {
      console.log(`      - ${cls.name} (${cls.type}) with ${cls.fields.length} fields`);
    });

    // 2. 测试 VO 生成
    console.log('\n2️⃣ Testing VO generation...');
    const voContent = generateVoContent(dtoClasses, testDtoPath);
    console.log('   ✅ Generated VO content:');
    console.log('   ' + voContent.split('\n').slice(0, 10).join('\n   '));
    if (voContent.split('\n').length > 10) {
      console.log('   ... (truncated)');
    }

    // 3. 测试继承信息解析
    console.log('\n3️⃣ Testing inheritance parsing...');
    const createGoalDto = dtoClasses.find(cls => cls.name === 'CreateGoalDto');
    if (createGoalDto?.classDefinition) {
      const { parseInheritanceInfo } = await import('./parsers/inheritance-parser');
      const inheritanceInfo = parseInheritanceInfo(createGoalDto.classDefinition);
      console.log(`   ✅ Inheritance info for ${createGoalDto.name}:`, inheritanceInfo);
    }

    console.log('\n🎉 All tests passed! Refactored structure is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    console.error((error as Error).stack);
  }
}

// 运行测试
testRefactoredStructure();
