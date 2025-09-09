import fs from 'fs';
import path from 'path';
import { DtoField } from '../types';
import { dtoAstParser } from './ast-field-parser';
import { parseClassFields } from './field-parser';

/**
 * 从实体文件中解析 WithoutRelations 类的字段 - 使用 AST 解析
 */
export function parseEntityFields(entityContent: string, entityName: string): DtoField[] {
  const withoutRelationsClassName = `${entityName}WithoutRelations`;

  try {
    // 使用 AST 解析器
    return dtoAstParser.parseClassFields(entityContent, withoutRelationsClassName);
  } catch (error) {
    console.warn('AST解析实体字段失败，回退到正则表达式:', error);

    // 回退到正则表达式解析
    const classMatch = entityContent.match(
      new RegExp(`export class ${withoutRelationsClassName}[\\s\\S]*?\\{([\\s\\S]*?)(?=\\n\\s*export|\\n\\s*$|$)`)
    );

    if (classMatch) {
      const classBody = classMatch[1];
      return parseClassFields(classBody, withoutRelationsClassName);
    }

    return [];
  }
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

/**
 * 从 DTO 类名推断实体名称
 * 例如: TodoModelDto -> Todo, TaskFilterDto -> Task
 */
export function inferEntityNameFromDto(dtoClassName: string): string {
  // 移除常见的 DTO 后缀
  const withoutDto = dtoClassName.replace(/Dto$/, '');

  // 移除常见的类型后缀 (Model, Filter, Form 等)
  const entityName = withoutDto.replace(/(Model|Filter|Form|Create|Update)$/, '');

  return entityName;
}

/**
 * 将驼峰命名转换为 kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 构建实体文件路径
 */
export function buildEntityPath(dtoFilePath: string, entityName: string): string {
  // 从 DTO 路径推断实体路径
  // 例如: /path/to/dto/todo-model.dto.ts -> /path/to/todo.entity.ts
  // TodoRepeat -> todo-repeat.entity.ts
  const dtoDir = dtoFilePath.replace(/\/dto\/.*$/, '');
  const entityFileName = `${camelToKebab(entityName)}.entity.ts`;
  return `${dtoDir}/${entityFileName}`;
}
