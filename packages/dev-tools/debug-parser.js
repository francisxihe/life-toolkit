const fs = require('fs');

// 简化的解析函数用于调试
function debugParseClassFields(classBody) {
  const fields = [];
  const lines = classBody.split('\n');
  let inComment = false;
  
  console.log('=== Parsing class body ===');
  console.log('Total lines:', lines.length);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    console.log(`Line ${i+1}: "${trimmed}"`);
    
    // 跳过空行
    if (!trimmed) {
      console.log('  -> Skip: empty line');
      continue;
    }
    
    // 处理多行注释
    if (trimmed.startsWith('/*')) {
      inComment = true;
      console.log('  -> Skip: comment start');
      continue;
    }
    if (trimmed.endsWith('*/')) {
      inComment = false;
      console.log('  -> Skip: comment end');
      continue;
    }
    if (inComment) {
      console.log('  -> Skip: in comment');
      continue;
    }
    
    // 跳过单行注释
    if (trimmed.startsWith('//')) {
      console.log('  -> Skip: single line comment');
      continue;
    }
    
    // 跳过装饰器
    if (trimmed.startsWith('@')) {
      console.log('  -> Skip: decorator');
      continue;
    }
    
    // 跳过方法定义（包含括号的行）
    if (trimmed.includes('(') && trimmed.includes(')')) {
      console.log('  -> Skip: method definition');
      continue;
    }
    
    // 跳过代码块开始
    if (trimmed.includes('{') && !trimmed.includes(':')) {
      console.log('  -> Skip: code block');
      continue;
    }
    
    // 尝试解析属性定义
    const fieldMatch = trimmed.match(/^(\w+)(\?)?:\s*([^;]+);?$/);
    if (fieldMatch) {
      const [, name, optional, typeStr] = fieldMatch;
      let type = typeStr.trim();
      let isArray = false;
      
      if (type.endsWith('[]')) {
        isArray = true;
        type = type.slice(0, -2);
      }
      
      const field = {
        name,
        type,
        optional: !!optional,
        isArray,
      };
      
      fields.push(field);
      console.log(`  -> Found field: ${name}${optional || ''}: ${type}${isArray ? '[]' : ''}`);
    } else {
      console.log('  -> Skip: not a field definition');
    }
  }
  
  return fields;
}

// 读取并解析 DTO 文件
const content = fs.readFileSync('/Users/xuwenhua/code/application-mine/life-toolkit/packages/business/server/src/growth/goal/dto/goal-model.dto.ts', 'utf8');

// 提取类体 - 修复正则表达式
const classRegex = /export\s+class\s+(\w+Dto)\s*(?:extends\s+([^{]+?))?\s*{([\s\S]*?)^}/gm;
let match;

while ((match = classRegex.exec(content)) !== null) {
  const [, className, extendsClause, classBody] = match;
  console.log(`\n=== Processing class: ${className} ===`);
  console.log('Extends:', extendsClause?.trim() || 'none');
  
  const fields = debugParseClassFields(classBody);
  console.log(`\nFound ${fields.length} fields:`);
  fields.forEach(field => {
    console.log(`  ${field.name}${field.optional ? '?' : ''}: ${field.type}${field.isArray ? '[]' : ''}`);
  });
}
