import fs from "fs";
import { FieldInfo } from "../types/index.js";
import { FileUpdateResult } from "../types/index.js";
import { FileUpdateService } from "./file-update.service.js";

export async function updateEntityFile(
  entityPath: string,
  fieldInfo: FieldInfo
): Promise<FileUpdateResult> {
  try {
    let content = fs.readFileSync(entityPath, "utf8");
    const fileUpdateService = new FileUpdateService();

    const decorators = fileUpdateService.buildDecorators(fieldInfo);
    const fieldDefinition = fileUpdateService.buildFieldDefinition(
      fieldInfo,
      decorators
    );

    const lastPropIndex = content.lastIndexOf("}");
    content =
      content.slice(0, lastPropIndex) +
      fieldDefinition +
      content.slice(lastPropIndex);

    fs.writeFileSync(entityPath, content);

    return {
      success: true,
      message: "Entity 文件更新成功",
      path: entityPath,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    return {
      success: false,
      message: `Entity 文件更新失败: ${errorMessage}`,
      path: entityPath,
    };
  }
}
