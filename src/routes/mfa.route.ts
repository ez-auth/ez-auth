import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { z } from "zod";

import { apiResponse } from "@/lib/api-utils/api-response";
import { jwtAuth } from "@/lib/middlewares/jwt.middleware";
import { baseDescribeRoute } from "@/lib/openapi";
import { updateMFASettingsResponseSchema } from "@/lib/openapi/schemas";
import { updateMFASettingsUsecase } from "@/usecases";

const route = new Hono();

const tags = ["MFA"];

route.post(
  "/settings",
  baseDescribeRoute({ description: "Update MFA settings", tags }, updateMFASettingsResponseSchema),
  jwtAuth,
  validator(
    "json",
    z.strictObject({
      enabledTOTP: z.boolean().optional(),
      enabledEmail: z.boolean().optional(),
      enabledSMS: z.boolean().optional(),
    }),
  ),
  async (c) => {
    const response = await updateMFASettingsUsecase.execute(c.get("user"), c.req.valid("json"));
    return apiResponse(c, { data: response });
  },
);

export const mfaSettingsRoute = route;
