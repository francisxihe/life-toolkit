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
    records: T[];
    total: number;
    pageNum: number;
    pageSize: number;
  } | null;
  code: number;

  static success<T>({
    records,
    total,
    pageNum,
    pageSize,
  }: {
    records: T[];
    total: number;
    pageNum: number;
    pageSize: number;
  }) {
    return createResponse<{
      records: T[];
      total: number;
      pageNum: number;
      pageSize: number;
    }>({
      code: 200,
      message: "SUCCESS",
      data: {
        records,
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
