import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

import { ApiCode } from "@/lib/api-utils/api-code";

export const apiResponse = (
  c: Context,
  body?: {
    code?: ApiCode;
    data?: any;
    error?: any;
  },
  status?: StatusCode,
) => {
  return c.json(
    {
      code: body?.code || ApiCode.Success,
      data: body?.data,
      error: body?.error,
    },
    status ?? 200,
  );
};
