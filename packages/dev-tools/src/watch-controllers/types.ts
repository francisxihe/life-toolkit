// 解析方法的装饰器信息
export interface MethodDecoratorInfo {
  name: string;
  verb: string;
  path: string;
  paramStyle: "none" | "id" | "id+body" | "query" | "body";
  description?: string;
  paramTypes?: {
    idType?: string;
    bodyType?: string;
    queryType?: string;
  };
  returnType?: string;
  fullSignature?: string;
}
