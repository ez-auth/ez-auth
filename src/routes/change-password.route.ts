import { MFAProvider } from "@prisma/client";
import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { z } from "zod";

import { config } from "@/config/config";
import { apiResponse } from "@/lib/api-utils/api-response";
import { jwtAuth } from "@/lib/middlewares/jwt.middleware";
import { verifyMFA } from "@/lib/middlewares/mfa.middleware";
import { baseDescribeRoute } from "@/lib/openapi";
import { changePasswordUsecase, requestChangePasswordUsecase } from "@/usecases";
import { createPasswordSchema } from "@/utils/zod.util";

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
    z
      .strictObject({
        currentPassword: z.string(),
        newPassword: createPasswordSchema({
          minLength: config.PASSWORD_MIN_LENGTH,
          maxLength: config.PASSWORD_MAX_LENGTH,
          requireDigit: config.PASSWORD_REQUIRES_DIGIT,
          requireUppercase: config.PASSWORD_REQUIRES_UPPERCASE,
          requireLowercase: config.PASSWORD_REQUIRES_LOWERCASE,
          requireSymbol: config.PASSWORD_REQUIRES_SYMBOL,
        }),
      })
      .refine(({ currentPassword, newPassword }) => currentPassword !== newPassword, {
        message: "Current password and new password must be different",
        path: ["newPassword"],
      }),
  ),
  async (c) => {
    await changePasswordUsecase.execute(c.get("user"), c.req.valid("json"));

    return apiResponse(c);
  },
);

export const changePasswordRoute = router;
