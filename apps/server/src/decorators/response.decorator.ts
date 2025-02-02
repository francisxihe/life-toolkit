import { ResponseDto, PaginationResponseDto } from "@/helpers/response";

export function Response() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);

        // 如果返回值已经是 ResponseDto 的实例，直接返回
        if (result instanceof ResponseDto) {
          return result;
        }

        // 否则包装成功响应
        return ResponseDto.success({
          data: result,
        });
      } catch (error) {
        return ResponseDto.error(error);
      }
    };

    return descriptor;
  };
}

export function PageResponse(data: any) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);

        // 如果返回值已经是 PaginationResponseDto 的实例，直接返回
        if (result instanceof PaginationResponseDto) {
          return result;
        }

        // 否则包装成功响应
        return PaginationResponseDto.success({
          records: result.records,
          total: result.total,
          pageNum: result.pageNum,
          pageSize: result.pageSize,
        });
      } catch (error) {
        return ResponseDto.error(error);
      }
    };

    return descriptor;
  };
}
