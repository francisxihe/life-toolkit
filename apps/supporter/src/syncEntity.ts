import { FieldInfoService } from "./services/field-info.service.js";
import { FileUpdateService } from "./services/file-update.service.js";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { FileUpdateResult } from "./types/index.js";
import { resolveProjectPath } from "./utils/path.js";
import { updateEntityFile } from "./services/updateEntityFile.js";
import { updateDtoFiles } from "./services/updateDtoFiles.js";
import { updateMapper } from "./services/updateMapper.js";
import { updateVoInterface } from "./services/updateVoInterface.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const VO_PATH = "packages/vo";

async function main() {
  try {
    const fieldInfoService = new FieldInfoService();

    console.log(chalk.blue("开始收集字段信息..."));
    const fieldInfo = await fieldInfoService.getFieldInfo();
    
    console.log(chalk.blue("\n开始更新文件..."));

    const entityNameArray = fieldInfo.entityName.split("/");
    const entityName = entityNameArray[entityNameArray.length - 1];

    // 获取基础路径
    const entityPath = resolveProjectPath(
      "apps/server/src/business",
      `${fieldInfo.entityName}/entities/${entityName}.entity.ts`
    );

    // 更新 Entity
    console.log(chalk.blue("\n正在更新 Entity..."));
    const entityResult = await updateEntityFile(entityPath, fieldInfo);
    logUpdateResult(entityResult);

    const dtoPath = resolveProjectPath(
      "apps/server/src/business",
      `${fieldInfo.entityName}/dto`
    );
    // 更新 DTO
    console.log(chalk.blue("\n正在更新 DTO..."));
    const dtoResult = await updateDtoFiles(dtoPath, fieldInfo);
    logUpdateResult(dtoResult);

    const voPath = resolveProjectPath(VO_PATH, `${fieldInfo.entityName}`);
    // 更新 VO
    console.log(chalk.blue("\n正在更新 VO..."));
    const voResult = await updateVoInterface(voPath, fieldInfo);
    logUpdateResult(voResult);

    const mapperPath = resolveProjectPath(
      "apps/server/src/business",
      `${fieldInfo.entityName}/mapper/${entityName}.mapper.ts`
    );
    // 更新 Mapper
    console.log(chalk.blue("\n正在更新 Mapper..."));
    const mapperResult = await updateMapper(mapperPath, fieldInfo);
    logUpdateResult(mapperResult);

    console.log(chalk.green("\n所有文件更新完成!"));
  } catch (error) {
    console.error(chalk.red("\n发生错误:"), error);
    process.exit(1);
  }
}

function logUpdateResult(result: FileUpdateResult) {
  if (result.success) {
    console.log(chalk.green(`✓ ${result.message}`));
  } else {
    console.log(chalk.red(`✗ ${result.message}`));
  }
}

main();
