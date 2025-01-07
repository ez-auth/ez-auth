import { Hono } from "hono";
import "zod-openapi/extend";

import { apiResponse } from "@/lib/api-utils/api-response";
import { isSuperadmin } from "@/lib/middlewares/is-superadmin.middleware";
import { jwtAuth } from "@/lib/middlewares/jwt.middleware";
import { baseDescribeRoute } from "@/lib/openapi";

const route = new Hono();

route.post(
  "/system-settings",
  baseDescribeRoute("Update system settings"),
  jwtAuth,
  isSuperadmin,
  async (c) => {
    const user = c.get("user");
    const { password, ...userWithoutPassword } = user;
    return apiResponse(c, { data: userWithoutPassword });
  },
);

export const superadminRoute = route;
