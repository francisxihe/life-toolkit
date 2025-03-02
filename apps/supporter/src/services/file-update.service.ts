import fs from "fs";
import path from "path";
import { FieldInfo, FileUpdateResult } from "../types/index.js";
import {
  TYPE_DECORATORS,
  VALIDATOR_DECORATORS,
} from "../constants/decorators.js";
import { resolveProjectPath } from "../utils/path.js";

export class FileUpdateService {
  buildDecorators(fieldInfo: FieldInfo): string[] {
    const decorators = [];
    decorators.push(`/** ${fieldInfo.description} */`);

    let typeDecorator = TYPE_DECORATORS[fieldInfo.fieldType];
    if (fieldInfo.isNullable) {
      typeDecorator = typeDecorator.replace(")", ", { nullable: true })");
    }
    decorators.push(typeDecorator);

    if (fieldInfo.isNullable) {
      decorators.push("@IsOptional()");
    }
    decorators.push(VALIDATOR_DECORATORS[fieldInfo.fieldType]);

    return decorators;
  }

  buildFieldDefinition(fieldInfo: FieldInfo, decorators: string[]): string {
    return `
  ${decorators.join("\n  ")}
  ${fieldInfo.fieldName}${fieldInfo.isNullable ? "?" : ""}: ${fieldInfo.fieldType};
`;
  }
}
