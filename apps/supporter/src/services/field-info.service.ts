import inquirer from "inquirer";
import { FieldInfo, FieldType } from "../types/index.js";

export class FieldInfoService {
  private static readonly FIELD_TYPES: FieldType[] = [
    "string",
    "number",
    "boolean",
    "Date",
    "enum",
    "object",
    "array",
  ];

  async getFieldInfo(): Promise<FieldInfo> {
    const questions = [
      {
        type: "input",
        name: "entityName",
        message: "请输入模块名:",
        transform: (input: string) => input.trim(),
      },
      {
        type: "input",
        name: "fieldName",
        message: "请输入字段名称:",
        validate: (input: string) => {
          if (!input.trim()) {
            return "字段名称不能为空";
          }
          return true;
        },
      },
      {
        type: "list",
        name: "fieldType",
        message: "请选择字段类型:",
        choices: FieldInfoService.FIELD_TYPES,
      },
      {
        type: "confirm",
        name: "isNullable",
        message: "是否允许为空?",
        default: false,
      },
      {
        type: "input",
        name: "description",
        message: "请输入字段描述:",
        validate: (input: string) => {
          if (!input.trim()) {
            return "字段描述不能为空";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "enumValues",
        message: "请输入枚举值(用逗号分隔):",
        when: (answers: any) => answers.fieldType === "enum",
        filter: (input: string) => input.split(",").map((v) => v.trim()),
      },
    ];

    try {
      const answers = await inquirer.prompt(questions);
      return answers;
    } catch (error) {
      console.error("获取字段信息失败:", error);
      throw error;
    }
  }
}
