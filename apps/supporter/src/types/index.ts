export interface FieldInfo {
  path: string;
  fieldName: string;
  fieldType: FieldType;
  isNullable: boolean;
  description: string;
  enumValues?: string[];
}

export type FieldType = 
  | "string"
  | "number"
  | "boolean"
  | "Date"
  | "enum"
  | "object"
  | "array";

export interface FileUpdateResult {
  success: boolean;
  message: string;
  path: string;
} 