import { FieldInfoService } from "./services/field-info.service.js";
import { FileUpdateService } from "./services/file-update.service.js";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    const fieldInfoService = new FieldInfoService();
    const fileUpdateService = new FileUpdateService();

    console.log(chalk.blue("开始收集字段信息..."));
    const fieldInfo = await fieldInfoService.getFieldInfo();

    console.log(chalk.blue("\n开始更新文件..."));

    // 更新 Entity
    const entityPath = path.resolve(
      process.cwd(),
      `../../apps/server/src/business/${fieldInfo.path}`
    );
    console.log(entityPath);
    const entityResult = await fileUpdateService.updateEntityFile(
      entityPath,
      fieldInfo
    );

    if (entityResult.success) {
      console.log(chalk.green(`✓ ${entityResult.message}`));
    } else {
      console.log(chalk.red(`✗ ${entityResult.message}`));
    }

    // TODO: 添加其他文件更新逻辑

    console.log(chalk.green("\n所有文件更新完成!"));
  } catch (error) {
    console.error(chalk.red("\n发生错误:"), error);
    process.exit(1);
  }
}

main();
