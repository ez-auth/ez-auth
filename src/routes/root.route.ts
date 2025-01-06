import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { getConnInfo } from "hono/bun";
import { z } from "zod";
import "zod-openapi/extend";

import { apiResponse } from "@/lib/api-utils/api-response";
import { jwtAuth } from "@/lib/middlewares/jwt.middleware";
import { baseDescribeRoute } from "@/lib/openapi";
import {
  confirmSignUpResponseSchema,
  refreshTokenResponseSchema,
  signInWithCredentialsResponseSchema,
  userSchema,
} from "@/lib/openapi/schemas";
import { CredentialsType } from "@/types/user.type";
import {
  confirmSignUpUsecase,
  refreshTokenUsecase,
  revokeSessionUsecase,
  signInWithCredentialsUsecase,
  signUpWithCredentialsUsecase,
} from "@/usecases";

const route = new Hono();

route.get("/me", baseDescribeRoute("Get current user", userSchema), jwtAuth, async (c) => {
  const user = c.get("user");
  const { password, ...userWithoutPassword } = user;
  return apiResponse(c, { data: userWithoutPassword });
});

route.post(
  "/sign-up",
  baseDescribeRoute("Sign up with credentials"),
  validator(
    "json",
    z.strictObject({
      credentialsType: z.nativeEnum(CredentialsType).default(CredentialsType.Email),
      identifier: z.string(),
      password: z.string(),
      redirectUrl: z.string().url().optional(),
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
    z.strictObject({
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
  "/confirm-sign-up",
  baseDescribeRoute("Confirm sign up", confirmSignUpResponseSchema),
  validator(
    "query",
    z.strictObject({
      token: z.string(),
      type: z.nativeEnum(CredentialsType),
      identifier: z.string(),
      redirectUrl: z.string().optional(),
    }),
  ),
  async (c) => {
    await confirmSignUpUsecase.execute(c.req.valid("query"));

    // If redirectUrl is provided, redirect to it
    const redirectUrl = c.req.valid("query").redirectUrl;
    if (redirectUrl) {
      return c.redirect(redirectUrl);
    }

    return apiResponse(c);
  },
);

route.post(
  "/refresh-token",
  baseDescribeRoute("Refresh token", refreshTokenResponseSchema),
  validator("json", z.strictObject({ refreshToken: z.string() })),
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
