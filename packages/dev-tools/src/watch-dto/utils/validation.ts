import { DtoClass, DtoField } from '../types/index';

/**
 * 验证 DTO 类是否有效
 */
export function validateDtoClass(dtoClass: DtoClass): boolean {
  if (!dtoClass.name || dtoClass.name.trim() === '') {
    return false;
  }

  if (!['model', 'filter', 'form'].includes(dtoClass.type)) {
    return false;
  }

  return true;
}

/**
 * 验证字段是否有效
 */
export function validateDtoField(field: DtoField): boolean {
  if (!field.name || field.name.trim() === '') {
    return false;
  }

  if (!field.type || field.type.trim() === '') {
    return false;
  }

  return true;
}

/**
 * 检查类名是否为 DTO 类
 */
export function isDtoClass(className: string): boolean {
  return className.endsWith('Dto');
}

/**
 * 检查是否为 WithoutRelations 类
 */
export function isWithoutRelationsClass(className: string): boolean {
  return className.includes('WithoutRelations');
}

/**
 * 检查是否为 Filter 类
 */
export function isFilterClass(className: string): boolean {
  return className.includes('Filter') || 
         className.includes('Page') || 
         className.includes('Search');
}

/**
 * 检查是否为 Form 类
 */
export function isFormClass(className: string): boolean {
  return className.includes('Create') || 
         className.includes('Update') || 
         className.includes('Form');
}
