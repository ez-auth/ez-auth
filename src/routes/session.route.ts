import { Hono } from "hono";
import { validator } from "hono-openapi/zod";
import { z } from "zod";

import { apiResponse } from "@/lib/api-utils/api-response";
import { jwtAuth } from "@/lib/middlewares/jwt.middleware";
import { baseDescribeRoute } from "@/lib/openapi";
import { listSessionSchema } from "@/lib/openapi/schemas";
import { getListSessionUsecase, revokeSessionUsecase } from "@/usecases";

const route = new Hono();

route.post(
  "/revoke",
  baseDescribeRoute("Revoke session"),
  jwtAuth,
  validator("json", z.strictObject({ sessionId: z.string() })),
  async (c) => {
    await revokeSessionUsecase.execute(c.get("user"), {
      sessionId: c.req.valid("json").sessionId,
    });

    return apiResponse(c);
  },
);

route.get(
  "/",
  baseDescribeRoute("Get list of sessions", listSessionSchema),
  jwtAuth,
  validator(
    "query",
    z.strictObject({
      revoked: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),
    }),
  ),
  async (c) => {
    const sessions = await getListSessionUsecase.execute(c.get("user"), {
      revoked: c.req.valid("query").revoked,
    });

    return apiResponse(c, { data: sessions });
  },
);

export const sessionRoute = route;
