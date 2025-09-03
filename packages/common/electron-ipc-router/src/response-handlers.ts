// 标准响应格式
export interface StandardResponse<T = any> {
  data: T;
  message: string;
  code: number;
}

// 响应包装器配置
export interface ResponseHandlerConfig {
  successCode?: number;
  successMessage?: string;
  defaultErrorCode?: number;
  defaultErrorMessage?: string;
}

// 默认配置
const DEFAULT_CONFIG: Required<ResponseHandlerConfig> = {
  successCode: 200,
  successMessage: 'success',
  defaultErrorCode: 500,
  defaultErrorMessage: 'Internal Server Error'
};

// 响应包装器类
export class ResponseHandler {
  private config: Required<ResponseHandlerConfig>;

  constructor(config: ResponseHandlerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // 包装成功响应
  success<T>(data: T, message?: string): StandardResponse<T> {
    return {
      data,
      message: message || this.config.successMessage,
      code: this.config.successCode
    };
  }

  // 包装错误响应
  error<T = any>(
    data: T = null as T,
    message?: string,
    code?: number
  ): StandardResponse<T> {
    return {
      data,
      message: message || this.config.defaultErrorMessage,
      code: code || this.config.defaultErrorCode
    };
  }

  // 包装 Controller 方法的返回值
  async wrapControllerResult(handler: () => Promise<any>): Promise<StandardResponse> {
    try {
      const result = await handler();
      
      // 如果结果已经是标准响应格式，直接返回
      if (this.isStandardResponse(result)) {
        return result;
      }
      
      // 否则包装为成功响应
      return this.success(result);
    } catch (error) {
      // 处理错误情况
      return this.handleError(error);
    }
  }

  // 检查是否已经是标准响应格式
  private isStandardResponse(obj: any): obj is StandardResponse {
    return (
      obj &&
      typeof obj === 'object' &&
      'data' in obj &&
      'message' in obj &&
      'code' in obj &&
      typeof obj.message === 'string' &&
      typeof obj.code === 'number'
    );
  }

  // 处理错误
  private handleError(error: any): StandardResponse {
    if (error && typeof error === 'object') {
      // 如果错误对象有 code 和 message 属性
      if ('code' in error && 'message' in error) {
        return this.error(null, error.message, error.code);
      }
      
      // 如果是标准 Error 对象
      if (error instanceof Error) {
        return this.error(null, error.message);
      }
      
      // 如果错误对象有 message 属性
      if ('message' in error && typeof error.message === 'string') {
        return this.error(null, error.message);
      }
    }
    
    // 其他情况，使用默认错误信息
    return this.error(null, String(error));
  }
}

// 默认响应包装器实例
export const defaultResponseHandler = new ResponseHandler();
