import fs from "fs";
import path from "path";
import { FieldInfo } from "../types/index.js";
import { FileUpdateResult } from "../types/index.js";
import { VALIDATOR_DECORATORS } from "../constants/decorators.js";

export async function updateDtoFiles(
  basePath: string,
  fieldInfo: FieldInfo
): Promise<FileUpdateResult> {
  try {
    const dtoPath = basePath;
    const dtoFiles = {
      "goal.dto.ts": ["GoalDto", "CreateGoalDto", "UpdateGoalDto"],
      "goal-filter.dto.ts": ["GoalPageFilterDto", "GoalListFilterDto"],
    };

    for (const [file, dtoClasses] of Object.entries(dtoFiles)) {
      const filePath = path.join(dtoPath, file);
      let content = fs.readFileSync(filePath, "utf8");

      for (const dtoClass of dtoClasses) {
        const dtoFieldDefinition = `\n/** ${fieldInfo.description} */\n${fieldInfo.fieldName}${fieldInfo.isNullable ? "?" : ""}: ${fieldInfo.fieldType};\n`;

        const classEndIndex = content.indexOf(
          "}",
          content.indexOf(`export class ${dtoClass}`)
        );
        content =
          content.slice(0, classEndIndex) +
          dtoFieldDefinition +
          content.slice(classEndIndex);
      }

      fs.writeFileSync(filePath, content);
    }

    return {
      success: true,
      message: "DTO 文件更新成功",
      path: basePath,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    return {
      success: false,
      message: `DTO 文件更新失败: ${errorMessage}`,
      path: basePath,
    };
  }
}
