import { MFAProvider } from "@prisma/client";
import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { z } from "zod";

import { apiResponse } from "@/lib/api-utils/api-response";
import { jwtAuth } from "@/lib/middlewares/jwt.middleware";
import { verifyMFA } from "@/lib/middlewares/mfa.middleware";
import { baseDescribeRoute } from "@/lib/openapi";
import { changePasswordUsecase, requestChangePasswordUsecase } from "@/usecases";

const router = new Hono();

router.post(
  "/request",
  baseDescribeRoute("Request change password"),
  jwtAuth,
  validator(
    "json",
    z.strictObject({
      mfaProvider: z.nativeEnum(MFAProvider).optional(),
    }),
  ),
  async (c) => {
    await requestChangePasswordUsecase.execute(c.get("user"), c.req.valid("json"));

    return apiResponse(c);
  },
);

router.post(
  "/",
  baseDescribeRoute("Change password"),
  jwtAuth,
  ...verifyMFA(true, "ChangePassword"),
  validator(
    "json",
    z.strictObject({
      newPassword: z.string().min(8),
    }),
  ),
  async (c) => {
    await changePasswordUsecase.execute(c.get("user"), c.req.valid("json"));

    return apiResponse(c);
  },
);

export const changePasswordRoute = router;
