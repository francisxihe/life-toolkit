import { FieldType } from '../types/index.js';

export const TYPE_DECORATORS: Record<FieldType, string> = {
  string: "@Column()",
  number: "@Column()",
  boolean: "@Column()",
  Date: '@Column("datetime")',
  enum: '@Column({ type: "enum", enum: TYPE })',
  object: '@Column("json")',
  array: '@Column("simple-array")',
};

export const VALIDATOR_DECORATORS: Record<FieldType, string> = {
  string: "@IsString()",
  number: "@IsNumber()",
  boolean: "@IsBoolean()",
  Date: "@IsDate()",
  enum: "@IsEnum(TYPE)",
  object: "@IsObject()",
  array: "@IsArray()",
}; 