export type HttpException = {
  status: number;
  message: string;
};

export function createHttpException(status: number, message: string): HttpException {
  return { status, message };
}

export const exception = createHttpException(404, 'Not Found');
