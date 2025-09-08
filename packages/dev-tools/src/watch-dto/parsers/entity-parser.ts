import fs from 'fs';
import path from 'path';
import { DtoField } from '../types/index';
import { parseClassFields } from './field-parser';

/**
 * 解析实体文件中的字段定义
 */
export function parseEntityFields(dtoFilePath: string, entityName: string): DtoField[] {
  // 从 DTO 文件路径推断实体文件路径
  // 例如: packages/business/server/src/growth/goal/dto/goal-model.dto.ts
  // 推断为: packages/business/server/src/growth/goal/goal.entity.ts
  
  const dtoDir = path.dirname(dtoFilePath);
  const moduleDir = path.dirname(dtoDir); // 去掉 /dto
  const entityFilePath = path.join(moduleDir, `${entityName.toLowerCase()}.entity.ts`);
  
  if (!fs.existsSync(entityFilePath)) {
    console.warn(`Entity file not found: ${entityFilePath}`);
    return [];
  }
  
  const entityContent = fs.readFileSync(entityFilePath, 'utf-8');
  
  // 查找 WithoutRelations 类定义
  const withoutRelationsClassName = `${entityName}WithoutRelations`;
  const classRegex = new RegExp(
    `export\\s+class\\s+${withoutRelationsClassName}[\\s\\S]*?\\{([\\s\\S]*?)(?=\\n\\s*export|\\n\\s*$|$)`
  );
  
  const match = entityContent.match(classRegex);
  if (!match) {
    console.warn(`${withoutRelationsClassName} class not found in ${entityFilePath}`);
    return [];
  }
  
  const classBody = match[1];
  return parseClassFields(classBody);
}

/**
 * 从 DTO 类名推断实体名
 */
export function getEntityNameFromDto(dtoClassName: string): string {
  return dtoClassName
    .replace('WithoutRelationsDto', '')
    .replace('Dto', '')
    .replace('Model', '')
    .replace('Create', '')
    .replace('Update', '')
    .replace('Filter', '')
    .replace('Page', '');
}
