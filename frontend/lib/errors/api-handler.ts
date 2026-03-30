import { NextResponse } from "next/server";
import { AppError } from "./AppError";
// We use a modular approach. Sentry might not be fully initialized yet, so we try-catch it if needed.
// However, the standard allows directly importing. 
// import * as Sentry from "@sentry/nextjs"; 
const Sentry = {
  captureMessage: (...args: any[]) => console.warn("[Sentry Mock]", ...args),
  captureException: (...args: any[]) => console.error("[Sentry Mock]", ...args)
};
import { ERROR_CODES } from "./error-codes";

type HandlerFunc = (req: Request, ...args: any[]) => Promise<Response>;

export const withErrorHandler = (handler: HandlerFunc): HandlerFunc => {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args);
    } catch (err: any) {
      // Handle known operational 400-level errors
      if (err instanceof AppError) {
        if (process.env.NODE_ENV === "development") {
          console.error(`[AppError ${err.code}]:`, err.message);
        } else {
          Sentry.captureMessage(`[${err.code}] ${err.message}`, "warning");
        }

        return NextResponse.json(
          {
            success: false,
            error: { message: err.message, code: err.code },
          },
          { status: err.statusCode }
        );
      }

      // Handle unexpected 500-level system errors
      if (process.env.NODE_ENV === "development") {
        console.error("[System Error]:", err);
      } else {
        Sentry.captureException(err);
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin.",
            code: ERROR_CODES.INTERNAL_ERROR,
          },
        },
        { status: 500 }
      );
    }
  };
};
