import fs from "fs";
import { FieldInfo } from "../types/index.js";
import { FileUpdateResult } from "../types/index.js";
import { resolve } from "path";

export async function updateVoInterface(
  basePath: string,
  fieldInfo: FieldInfo
): Promise<FileUpdateResult> {
  try {
    const voPath = resolve(basePath, "goal-model.vo.ts");
    let content = fs.readFileSync(voPath, "utf8");

    const voFieldDefinition = `
  /** ${fieldInfo.description} */
  ${fieldInfo.fieldName}${fieldInfo.isNullable ? "?" : ""}: ${fieldInfo.fieldType};`;

    // 更新 GoalVo 接口
    const goalVoEndIndex = content.indexOf(
      "}",
      content.indexOf("export type GoalVo")
    );
    content =
      content.slice(0, goalVoEndIndex) +
      voFieldDefinition +
      content.slice(goalVoEndIndex);

    // 更新 GoalModelVo 接口
    const itemVoEndIndex = content.indexOf(
      "}",
      content.indexOf("export type GoalModelVo")
    );
    content =
      content.slice(0, itemVoEndIndex) +
      voFieldDefinition +
      content.slice(itemVoEndIndex);

    fs.writeFileSync(voPath, content);

    return {
      success: true,
      message: "VO 接口更新成功",
      path: voPath,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    return {
      success: false,
      message: `VO 接口更新失败: ${errorMessage}`,
      path: basePath,
    };
  }
}
