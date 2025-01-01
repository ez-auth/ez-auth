import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { z } from "zod";

import { apiResponse } from "@/lib/api-utils/api-response";
import { baseDescribeRoute } from "@/lib/openapi";
import { CredentialsType } from "@/types/user.type";
import { requestPasswordRecoveryUsecase, resetPasswordUsecase } from "@/usecases";

const router = new Hono();

router.post(
  "/request",
  baseDescribeRoute("Request password recovery"),
  validator(
    "json",
    z.object({
      credentialsType: z.nativeEnum(CredentialsType),
      identifier: z.string(),
    }),
  ),
  async (c) => {
    await requestPasswordRecoveryUsecase.execute(c.req.valid("json"));

    return apiResponse(c);
  },
);

router.post(
  "/reset",
  baseDescribeRoute("Reset password"),
  validator(
    "json",
    z.object({
      credentialsType: z.nativeEnum(CredentialsType),
      identifier: z.string(),
      token: z.string(),
      newPassword: z.string().min(8),
    }),
  ),
  async (c) => {
    await resetPasswordUsecase.execute(c.req.valid("json"));

    return apiResponse(c);
  },
);

export const passwordRecoveryRoute = router;
