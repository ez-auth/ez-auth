import type { StatusCode } from "hono/utils/http-status";

import { ApiCode } from "@/lib/api-utils/api-code";

export const httpStatusToApiCode = (status: StatusCode): ApiCode => {
  switch (status) {
    case 200:
      return ApiCode.Success;
    case 400:
      return ApiCode.BadRequest;
    case 401:
      return ApiCode.Unauthorized;
    case 403:
      return ApiCode.Forbidden;
    case 404:
      return ApiCode.NotFound;
    default:
      return ApiCode.InternalError;
  }
};
