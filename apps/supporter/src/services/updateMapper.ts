import fs from "fs";
import { FieldInfo } from "../types/index.js";
import { FileUpdateResult } from "../types/index.js";

export async function updateMapper(
  mapperPath: string,
  fieldInfo: FieldInfo
): Promise<FileUpdateResult> {
  try {
    let content = fs.readFileSync(mapperPath, "utf8");

    // 更新 entityToModelDto 方法
    const modelDtoMapping = `    dto.${fieldInfo.fieldName} = entity.${fieldInfo.fieldName};`;
    const modelDtoEndIndex = content.indexOf(
      "return dto;",
      content.indexOf("entityToModelDto")
    );
    content =
      content.slice(0, modelDtoEndIndex) +
      modelDtoMapping +
      "\n    " +
      content.slice(modelDtoEndIndex);

    // 更新 dtoToItemVo 方法
    const voMapping = `      ${fieldInfo.fieldName}: dto.${fieldInfo.fieldName},`;
    const voEndIndex = content.indexOf(
      "return vo;",
      content.indexOf("dtoToItemVo")
    );
    content =
      content.slice(0, voEndIndex) +
      voMapping +
      "\n      " +
      content.slice(voEndIndex);

    fs.writeFileSync(mapperPath, content);

    return {
      success: true,
      message: "Mapper 文件更新成功",
      path: mapperPath,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    return {
      success: false,
      message: `Mapper 文件更新失败: ${errorMessage}`,
      path: mapperPath,
    };
  }
}
