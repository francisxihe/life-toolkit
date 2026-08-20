/**
 * Model DTO Composer
 * 将中间态组合为 VO 代码
 */

import { IntermediateState, FieldDefinition } from '../core/intermediate-state';
import fs from 'fs';
import path from 'path';

export class TargetModelComposer {
  /**
   * 生成 Model VO 类型定义
   */
  composeVo(intermediateState: IntermediateState): string {
    const lines: string[] = [];
    const voName = intermediateState.metadata.voName;

    // 检查是否为 WithoutRelations 类型
    if (intermediateState.metadata.className.includes('WithoutRelations')) {
      return this.composeWithoutRelationsVo(intermediateState);
    }

    // 标准 Model VO - 从 Entity 文件解析字段
    const entityFields = this.parseEntityFields(intermediateState);

    if (entityFields.length > 0) {
      return this.generateVoFromEntity(intermediateState, entityFields);
    }

    // 回退：使用 DTO 字段
    return this.generateVoFromDto(intermediateState);
  }

  /**
   * 生成 WithoutRelations VO
   */
  private composeWithoutRelationsVo(intermediateState: IntermediateState): string {
    const lines: string[] = [];
    const baseName = intermediateState.metadata.className
      .replace('Dto', '')
      .replace('Model', '')
      .replace('WithoutRelations', '');
    const voName = `${baseName}WithoutRelationsVo`;

    // 从 Entity 解析字段
    const entityFields = this.parseEntityFields(intermediateState);

    const enumImports = intermediateState.imports
      .filter((item) => item.source === '@true-north/enum' && item.importType === 'named')
      .flatMap((item) => item.specifiers.map((specifier) => specifier.local))
      .filter((name) => entityFields.some((field) => new RegExp(`\\b${name}\\b`).test(field)));
    if (enumImports.length) lines.push(`import { ${enumImports.join(', ')} } from '@true-north/enum';`, '');

    lines.push(`export type ${voName} = {`);

    if (entityFields.length > 0) {
      for (const field of entityFields) {
        lines.push(`  ${field}`);
      }
    }

    lines.push('} & BaseEntityVo;');

    return lines.join('\n');
  }

  /**
   * 从 Entity 文件解析字段
   */
  private parseEntityFields(intermediateState: IntermediateState): string[] {
    const dtoFilePath = intermediateState.metadata.filePath;
    const className = intermediateState.metadata.className;

    // 获取 entity 文件路径
    const entityPath = this.getEntityPath(dtoFilePath, className);

    if (!fs.existsSync(entityPath)) {
      return [];
    }

    const entityContent = fs.readFileSync(entityPath, 'utf-8');
    return this.extractFieldsFromEntity(entityContent, className);
  }

  /**
   * 获取 Entity 文件路径
   */
  private getEntityPath(dtoFilePath: string, className: string): string {
    const dir = path.dirname(dtoFilePath);
    const entityName = className.replace('Dto', '').replace('WithoutRelations', '');
    const entityFileName = `${entityName.toLowerCase()}.entity.ts`;
    return path.join(dir, '..', entityFileName);
  }

  /**
   * 从 Entity 内容中提取字段
   */
  private extractFieldsFromEntity(content: string, className: string): string[] {
    const fields: string[] = [];

    // 找到 WithoutRelations 类定义
    const entityName = className.replace('Dto', '');
    const classRegex = new RegExp(
      `export\\s+class\\s+${entityName}[\\s\\S]*?(?=\\n@Entity|\\nexport\\s+class|$)`,
      'g'
    );
    const classMatch = content.match(classRegex);

    if (!classMatch) return fields;

    const classContent = classMatch[0];

    // Extract class property declarations rather than decorator arguments.
    const fieldRegex = /^\s*(\w+)([!?])?:\s*([^;\n]+);/gm;
    let match;

    while ((match = fieldRegex.exec(classContent)) !== null) {
      const fieldName = match[1];
      const optional = match[2] === '?' ? '?' : '';
      let fieldType = match[3].trim();

      // 转换类型
      fieldType = this.convertEntityTypeToVoType(fieldType);

      fields.push(`${fieldName}${optional}: ${fieldType};`);
    }

    return fields;
  }

  /**
   * 转换 Entity 类型到 VO 类型
   */
  private convertEntityTypeToVoType(entityType: string): string {
    if (entityType === 'Date') return 'string';
    if (entityType.includes('[]')) {
      const baseType = entityType.replace('[]', '').trim();
      return this.convertEntityTypeToVoType(baseType) + '[]';
    }
    return entityType;
  }

  /**
   * 从 Entity 生成完整 VO
   */
  private generateVoFromEntity(intermediateState: IntermediateState, entityFields: string[]): string {
    const lines: string[] = [];
    const baseName = intermediateState.metadata.className.replace('Dto', '');
    const voName = `${baseName}Vo`;
    const withoutRelationsVoName = `${baseName}WithoutRelationsVo`;

    const enumImports = intermediateState.imports
      .filter((item) => item.source === '@true-north/enum' && item.importType === 'named')
      .flatMap((item) => item.specifiers.map((specifier) => specifier.local))
      .filter((name) => entityFields.some((field) => new RegExp(`\\b${name}\\b`).test(field)));
    if (enumImports.length) lines.push(`import { ${enumImports.join(', ')} } from '@true-north/enum';`, '');

    lines.push(`export type ${withoutRelationsVoName} = {`);
    for (const field of entityFields) {
      lines.push(`  ${field}`);
    }
    lines.push('} & BaseEntityVo;');
    lines.push('');

    // 生成完整 VO（包含关系字段）
    lines.push(`export type ${voName} = ${withoutRelationsVoName} & {`);

    // 添加关系字段 - 从 DTO 字段中提取
    const relationFields = this.extractRelationFields(intermediateState);
    for (const field of relationFields) {
      lines.push(`  ${field}`);
    }

    lines.push('};');

    return lines.join('\n');
  }

  /**
   * 提取关系字段
   */
  private extractRelationFields(intermediateState: IntermediateState): string[] {
    const fields: string[] = [];

    for (const [name, field] of intermediateState.fields) {
      // 检查是否为关系字段（通常是对象或数组类型）
      if (this.isRelationField(field)) {
        const voType = this.convertDtoTypeToVo(field.type);
        const optional = field.optional ? '?' : '';
        fields.push(`${name}${optional}: ${voType};`);
      }
    }

    return fields;
  }

  /**
   * 判断是否为关系字段
   */
  private isRelationField(field: FieldDefinition): boolean {
    // 关系字段通常是对象或数组类型
    const type = field.type;
    return type.endsWith('Dto') || type.endsWith('Dto[]') || type.endsWith('Entity') || type.endsWith('Entity[]');
  }

  /**
   * 从 DTO 生成 VO（回退方案）
   */
  private generateVoFromDto(intermediateState: IntermediateState): string {
    const lines: string[] = [];
    const voName = intermediateState.metadata.voName;

    lines.push(`export type ${voName} = {`);

    for (const field of intermediateState.fields.values()) {
      const fieldLine = this.composeField(field);
      lines.push(`  ${fieldLine}`);
    }

    lines.push('};');

    return lines.join('\n');
  }

  /**
   * 组合单个字段
   */
  private composeField(field: FieldDefinition): string {
    const optional = field.optional ? '?' : '';
    const voType = this.convertDtoTypeToVo(field.type);
    return `${field.name}${optional}: ${voType};`;
  }

  /**
   * 转换 DTO 类型到 VO 类型
   */
  private convertDtoTypeToVo(dtoType: string): string {
    return dtoType
      .replace(/(\w+)Dto\b/g, '$1Vo')
      .replace(/(\w+)Entity\b/g, '$1Vo')
      .replace(/\bDate\b/g, 'string');
  }
}
