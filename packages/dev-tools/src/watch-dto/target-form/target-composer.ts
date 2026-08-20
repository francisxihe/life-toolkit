/**
 * Form DTO Composer
 * 将中间态组合为 Form VO 代码
 */

import { IntermediateState } from '../core/intermediate-state';
import { filterNonRelationFields } from '../utils/field-utils';

export class TargetFormComposer {
  /**
   * 生成 Form VO 类型定义
   */
  composeVo(intermediateState: IntermediateState): string {
    const className = intermediateState.metadata.className;

    // 判断是 Create 还是 Update
    if (className.startsWith('Update')) {
      return this.composeUpdateVo(intermediateState);
    } else {
      return this.composeCreateVo(intermediateState);
    }
  }

  /**
   * 生成 Create VO
   */
  private composeCreateVo(intermediateState: IntermediateState): string {
    const lines: string[] = [];
    const voName = intermediateState.metadata.voName;

    const pickedFields = this.extractPickFields(intermediateState.code || '');
    if (pickedFields.length) {
      const baseName = intermediateState.metadata.className.replace(/^Create/, '').replace('Dto', '');
      lines.push(`export type ${voName} = Pick<${baseName}Vo,`);
      for (const field of pickedFields) lines.push(`  | '${field}'`);
      lines.push(`> & {`);
    } else {
      lines.push(`export type ${voName} = {`);
    }

    const fieldsArray = Array.from(intermediateState.fields.values());
    const nonRelationFields = filterNonRelationFields(fieldsArray);

    for (const field of nonRelationFields) {
      const optional = field.optional ? '?' : '';
      const voType = this.convertDtoTypeToVo(field.type);
      lines.push(`  ${field.name}${optional}: ${voType};`);
    }

    lines.push('};');

    return lines.join('\n');
  }

  /**
   * 生成 Update VO (Partial<CreateVo>)
   */
  private composeUpdateVo(intermediateState: IntermediateState): string {
    const voName = intermediateState.metadata.voName;
    const baseName = intermediateState.metadata.className.replace('Dto', '').replace('Update', '');
    const createVoName = `Create${baseName}Vo`;

    const statusFields = this.extractPickFields(intermediateState.code || '').filter((field) =>
      ['status', 'doneAt', 'abandonedAt'].includes(field)
    );
    if (!statusFields.length) return `export type ${voName} = Partial<${createVoName}>;`;
    const baseNameWithoutCreate = createVoName.replace(/^Create/, '').replace('Vo', '');
    return [
      `export type ${voName} = Partial<${createVoName}> & {`,
      ...statusFields.map((field) => `  ${field}?: ${baseNameWithoutCreate}Vo['${field}'];`),
      '};',
    ].join('\n');
  }

  private extractPickFields(code: string): string[] {
    const match = code.match(/PickType\([^]*?\[([^\]]+)\]\s+as const\)/);
    return match ? [...match[1].matchAll(/['\"]([^'\"]+)['\"]/g)].map((item) => item[1]) : [];
  }

  /**
   * 转换 DTO 类型到 VO 类型
   */
  private convertDtoTypeToVo(dtoType: string): string {
    return dtoType.replace(/(\w+)Dto\b/g, '$1Vo');
  }
}
