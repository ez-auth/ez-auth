import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { getConnInfo } from "hono/bun";
import { z } from "zod";
import "zod-openapi/extend";

import { apiResponse } from "@/lib/api-utils/api-response";
import { jwtAuth } from "@/lib/middlewares/jwt.middleware";
import { baseDescribeRoute } from "@/lib/openapi";
import {
  refreshTokenResponseSchema,
  signInWithCredentialsResponseSchema,
  userSchema,
} from "@/lib/openapi/schemas";
import { CredentialsType } from "@/types/user.type";
import {
  confirmEmailUsecase,
  confirmPhoneUsecase,
  refreshTokenUsecase,
  revokeSessionUsecase,
  signInWithCredentialsUsecase,
  signUpWithCredentialsUsecase,
} from "@/usecases";

const route = new Hono();

route.get("/me", baseDescribeRoute("Get current user", userSchema), jwtAuth, async (c) => {
  return apiResponse(c, { data: c.get("user") });
});

route.post(
  "/sign-up",
  baseDescribeRoute("Sign up with credentials"),
  validator(
    "json",
    z.object({
      credentialsType: z.nativeEnum(CredentialsType).default(CredentialsType.Email),
      identifier: z.string(),
      password: z.string(),
      metadata: z.any().optional(),
    }),
  ),
  async (c) => {
    await signUpWithCredentialsUsecase.execute(c.req.valid("json"));

    return apiResponse(c);
  },
);

route.post(
  "/sign-in",
  baseDescribeRoute("Sign in with credentials", signInWithCredentialsResponseSchema),
  validator(
    "json",
    z.object({
      credentialsType: z.nativeEnum(CredentialsType),
      identifier: z.string(),
      password: z.string(),
    }),
  ),
  async (c) => {
    const clientInfo = getConnInfo(c);

    const response = await signInWithCredentialsUsecase.execute({
      ...c.req.valid("json"),
      ipAddress: clientInfo.remote.address,
      userAgent: c.req.header("User-Agent"),
    });

    return apiResponse(c, { data: response });
  },
);

route.get(
  "/confirm-email-sign-up",
  baseDescribeRoute("Confirm email sign up", signInWithCredentialsResponseSchema),
  validator("query", z.object({ token: z.string(), email: z.string() })),
  async (c) => {
    await confirmEmailUsecase.execute({
      token: c.req.valid("query").token,
      email: c.req.valid("query").email,
    });

    return apiResponse(c);
  },
);

route.get(
  "/confirm-phone-sign-up",
  baseDescribeRoute("Confirm phone sign up", signInWithCredentialsResponseSchema),
  validator("query", z.object({ token: z.string(), phone: z.string() })),
  async (c) => {
    await confirmPhoneUsecase.execute({
      token: c.req.valid("query").token,
      phone: c.req.valid("query").phone,
    });

    return apiResponse(c);
  },
);

route.post(
  "/refresh-token",
  baseDescribeRoute("Refresh token", refreshTokenResponseSchema),
  validator("json", z.object({ refreshToken: z.string() })),
  async (c) => {
    const response = await refreshTokenUsecase.execute({
      refreshToken: c.req.valid("json").refreshToken,
      ipAddress: getConnInfo(c).remote.address,
      userAgent: c.req.header("User-Agent"),
    });

    return apiResponse(c, { data: response });
  },
);

route.get("/sign-out", baseDescribeRoute("Sign out"), jwtAuth, async (c) => {
  await revokeSessionUsecase.execute(c.get("user"), {
    sessionId: c.get("sessionId"),
  });

  return apiResponse(c);
});

export const rootRoute = route;
