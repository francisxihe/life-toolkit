/**
 * DTO 类定义
 */
export interface DtoClass {
  name: string;
  type: 'model' | 'filter' | 'form';
  fields: DtoField[];
  imports: string[];
  classDefinition?: string; // 保存原始类定义
  extends?: string;
}

/**
 * DTO 字段定义
 */
export interface DtoField {
  name: string;
  type: string;
  optional: boolean;
  isArray: boolean;
  decorators: string[];
}

/**
 * 继承信息类型
 */
export interface InheritanceInfo {
  type: 'simple' | 'pick' | 'intersection';
  info: any;
}

/**
 * PickType 信息
 */
export interface PickTypeInfo {
  sourceClass: string;
  fields: string[];
}

/**
 * IntersectionType 信息
 */
export interface IntersectionTypeInfo {
  types: string[];
}

/**
 * VO 生成配置
 */
export interface VoGenerationConfig {
  generateImports: boolean;
  preserveComments: boolean;
  useTypeComposition: boolean;
}

/**
 * 类型映射配置
 */
export interface TypeMappingConfig {
  entityToVo: Record<string, string>;
  dtoToVo: Record<string, string>;
  primitiveTypes: Record<string, string>;
}
