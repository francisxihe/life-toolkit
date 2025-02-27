import fs from 'fs';
import path from 'path';
import { FieldInfo, FileUpdateResult } from '../types/index.js';
import { TYPE_DECORATORS, VALIDATOR_DECORATORS } from '../constants/decorators.js';

export class FileUpdateService {
  async updateEntityFile(entityPath: string, fieldInfo: FieldInfo): Promise<FileUpdateResult> {
    try {
      let content = fs.readFileSync(entityPath, 'utf8');
      
      const decorators = this.buildDecorators(fieldInfo);
      const fieldDefinition = this.buildFieldDefinition(fieldInfo, decorators);
      
      const lastPropIndex = content.lastIndexOf('}');
      content = content.slice(0, lastPropIndex) + fieldDefinition + content.slice(lastPropIndex);
      
      fs.writeFileSync(entityPath, content);
      
      return {
        success: true,
        message: 'Entity 文件更新成功',
        path: entityPath
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        success: false,
        message: `Entity 文件更新失败: ${errorMessage}`,
        path: entityPath
      };
    }
  }

  private buildDecorators(fieldInfo: FieldInfo): string[] {
    const decorators = [];
    decorators.push(`/** ${fieldInfo.description} */`);

    let typeDecorator = TYPE_DECORATORS[fieldInfo.fieldType];
    if (fieldInfo.isNullable) {
      typeDecorator = typeDecorator.replace(')', ', { nullable: true })');
    }
    decorators.push(typeDecorator);

    if (fieldInfo.isNullable) {
      decorators.push('@IsOptional()');
    }
    decorators.push(VALIDATOR_DECORATORS[fieldInfo.fieldType]);

    return decorators;
  }

  private buildFieldDefinition(fieldInfo: FieldInfo, decorators: string[]): string {
    return `
  ${decorators.join('\n  ')}
  ${fieldInfo.fieldName}${fieldInfo.isNullable ? '?' : ''}: ${fieldInfo.fieldType};
`;
  }

  // ... 其他文件更新方法 (updateVoInterface, updateMapper, updateDtoFiles)
} 