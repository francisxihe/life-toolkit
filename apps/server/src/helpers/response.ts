export function createResponse<T>({
  message,
  data,
  code,
}: {
  message: string;
  data: T | null;
  code: number;
}) {
  return {
    message,
    data,
    code,
  };
}

export class ResponseDto<T> {
  message: string;
  data: T | null;
  code: number;

  static success<T>({ data }: { data: T }) {
    return createResponse<T>({
      code: 200,
      message: "SUCCESS",
      data,
    });
  }

  static error({ message, code }: { message: string; code: number }) {
    return createResponse<null>({
      code,
      message,
      data: null,
    });
  }
}

export class PaginationResponseDto<T> {
  message: string;
  data: {
    list: T[];
    total: number;
    pageNum: number;
    pageSize: number;
  } | null;
  code: number;

  static success<T>({
    list,
    total,
    pageNum,
    pageSize,
  }: {
    list: T[];
    total: number;
    pageNum: number;
    pageSize: number;
  }) {
    return createResponse<{
      list: T[];
      total: number;
      pageNum: number;
      pageSize: number;
    }>({
      code: 200,
      message: "SUCCESS",
      data: {
        list,
        total,
        pageNum,
        pageSize,
      },
    });
  }

  static error({ message, code }: { message: string; code: number }) {
    return createResponse<null>({
      code,
      message,
      data: null,
    });
  }
}
