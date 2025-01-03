import { MFAProvider, MFATokenType } from "@prisma/client";
import { validator } from "hono-openapi/zod";
import { createFactory } from "hono/factory";
import { z } from "zod";

import { AuthUser } from "@/types/user.type";
import { verifyMFATokenUsecase } from "@/usecases";
import { HTTPException } from "hono/http-exception";

type VariablesType = {
  user: AuthUser;
  sessionId: string;
};

const factory = createFactory<{ Variables: VariablesType }>();

const validateMFAInput = validator(
  "header",
  z.object({
    "X-MFA-Provider": z.nativeEnum(MFAProvider).optional(),
    "X-MFA-Token": z.string().optional(),
  }),
);

export const verifyMFA = (enabled: boolean, type: MFATokenType) =>
  factory.createHandlers(validateMFAInput, async (c, next) => {
    if (!enabled) {
      return next();
    }

    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401);
    }

    const { "X-MFA-Provider": provider, "X-MFA-Token": token } = c.req.valid("header");
    if (!provider || !token) {
      throw new HTTPException(401, { message: "Invalid MFA" });
    }

    const isVerified = await verifyMFATokenUsecase.execute(
      {
        type,
        provider,
        token,
      },
      user,
    );
    if (!isVerified) {
      throw new HTTPException(401, { message: "Invalid MFA" });
    }

    return next();
  });
