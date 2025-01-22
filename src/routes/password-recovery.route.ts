import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { z } from "zod";

import { configService } from "@/config/config.service";
import { apiResponse } from "@/lib/api-utils/api-response";
import { baseDescribeRoute } from "@/lib/openapi";
import { CredentialsType } from "@/types/user.type";
import { requestPasswordRecoveryUsecase, resetPasswordUsecase } from "@/usecases";
import { createPasswordSchema } from "@/utils/zod.util";

const router = new Hono();
const config = configService.getConfig();

router.post(
  "/request",
  baseDescribeRoute({ description: "Request password recovery", tags: ["Password Recovery"] }),
  validator(
    "json",
    z.strictObject({
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
  baseDescribeRoute({ description: "Reset password", tags: ["Password Recovery"] }),
  validator(
    "json",
    z.strictObject({
      credentialsType: z.nativeEnum(CredentialsType),
      identifier: z.string(),
      token: z.string(),
      newPassword: createPasswordSchema({
        minLength: config.PASSWORD_MIN_LENGTH,
        maxLength: config.PASSWORD_MAX_LENGTH,
        requireDigit: config.PASSWORD_REQUIRES_DIGIT,
        requireUppercase: config.PASSWORD_REQUIRES_UPPERCASE,
        requireLowercase: config.PASSWORD_REQUIRES_LOWERCASE,
        requireSymbol: config.PASSWORD_REQUIRES_SYMBOL,
      }),
    }),
  ),
  async (c) => {
    await resetPasswordUsecase.execute(c.req.valid("json"));

    return apiResponse(c);
  },
);

export const passwordRecoveryRoute = router;
