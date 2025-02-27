const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 支持的字段类型
const FIELD_TYPES = [
  'string',
  'number',
  'boolean',
  'Date',
  'enum',
  'object',
  'array'
];

// TypeORM 装饰器映射
const TYPE_DECORATORS = {
  string: '@Column()',
  number: '@Column()',
  boolean: '@Column()',
  Date: '@Column("datetime")',
  enum: '@Column({ type: "enum", enum: TYPE })',
  object: '@Column("json")',
  array: '@Column("simple-array")'
};

// class-validator 装饰器映射
const VALIDATOR_DECORATORS = {
  string: '@IsString()',
  number: '@IsNumber()',
  boolean: '@IsBoolean()',
  Date: '@IsDate()',
  enum: '@IsEnum(TYPE)',
  object: '@IsObject()',
  array: '@IsArray()'
};

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function getFieldInfo() {
  const fieldName = await askQuestion('请输入字段名称: ');
  
  console.log('可用的字段类型:');
  FIELD_TYPES.forEach((type, index) => {
    console.log(`${index + 1}. ${type}`);
  });
  
  const typeIndex = parseInt(await askQuestion('请选择字段类型(输入数字): ')) - 1;
  const fieldType = FIELD_TYPES[typeIndex];
  
  const isNullable = (await askQuestion('是否允许为空? (y/n): ')).toLowerCase() === 'y';
  const description = await askQuestion('请输入字段描述: ');
  
  return {
    fieldName,
    fieldType,
    isNullable,
    description
  };
}

async function updateEntityFile(entityPath, fieldInfo) {
  let content = fs.readFileSync(entityPath, 'utf8');
  
  // 构建新的字段定义
  const decorators = [];
  decorators.push(`/** ${fieldInfo.description} */`);
  
  let typeDecorator = TYPE_DECORATORS[fieldInfo.fieldType];
  if (fieldInfo.isNullable) {
    typeDecorator = typeDecorator.replace(')', ', { nullable: true })');
  }
  decorators.push(typeDecorator);
  
  if (!fieldInfo.isNullable) {
    decorators.push(VALIDATOR_DECORATORS[fieldInfo.fieldType]);
  } else {
    decorators.push('@IsOptional()');
    decorators.push(VALIDATOR_DECORATORS[fieldInfo.fieldType]);
  }
  
  const fieldDefinition = `
  ${decorators.join('\n  ')}
  ${fieldInfo.fieldName}${fieldInfo.isNullable ? '?' : ''}: ${fieldInfo.fieldType};
`;

  // 在类定义的最后一个属性后插入新字段
  const lastPropIndex = content.lastIndexOf('}');
  content = content.slice(0, lastPropIndex) + fieldDefinition + content.slice(lastPropIndex);
  
  fs.writeFileSync(entityPath, content);
  console.log('Entity 文件已更新');
}

async function updateDtoFiles(basePath, fieldInfo) {
  const dtoPath = path.join(basePath, 'dto');
  const files = fs.readdirSync(dtoPath);
  
  for (const file of files) {
    if (file.endsWith('.dto.ts')) {
      const filePath = path.join(dtoPath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 更新 DTO 文件
      // TODO: 根据具体 DTO 类型添加相应的字段
      
      fs.writeFileSync(filePath, content);
    }
  }
  
  console.log('DTO 文件已更新');
}

async function main() {
  try {
    const fieldInfo = await getFieldInfo();
    
    // 更新 Entity
    const entityPath = path.resolve(__dirname, 'src/business/growth/goal/entities/goal.entity.ts');
    await updateEntityFile(entityPath, fieldInfo);
    
    // 更新相关文件
    const basePath = path.resolve(__dirname, 'src/business/growth/goal');
    await updateDtoFiles(basePath, fieldInfo);
    
    console.log('所有文件更新完成');
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    rl.close();
  }
}

main();
