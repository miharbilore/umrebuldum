import { ErrorCode } from "./error-codes";

export class AppError extends Error {
  constructor(
    public message: string,
    public code: ErrorCode,
    public statusCode = 400
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}
