import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HTTPResponseError } from "hono/types";

import { ApiCode } from "@/lib/api-utils/api-code";
import { logger } from "@/lib/logger";
import { apiResponse } from "./api-response";
import { httpStatusToApiCode } from "./http-status-to-api-code";
import { isUsecaseError } from "./usecase-error";

export const appErrorHandler = (error: Error | HTTPResponseError, c: Context) => {
  const message = error.message === "" ? undefined : error.message;

  // UsecaseError
  if (isUsecaseError(error)) {
    return apiResponse(c, {
      code: error.code,
      error: message,
    });
  }

  // Hono HTTPException
  if (error instanceof HTTPException) {
    return apiResponse(
      c,
      {
        code: httpStatusToApiCode(error.status),
        error: message,
      },
      error.status || 500,
    );
  }

  // Could not catch error
  logger.error(error);
  return apiResponse(
    c,
    {
      code: ApiCode.InternalError,
      error: message,
    },
    500,
  );
};

export const appNotFoundHandler = (c: Context) => {
  return apiResponse(
    c,
    {
      code: ApiCode.NotFound,
    },
    404,
  );
};
