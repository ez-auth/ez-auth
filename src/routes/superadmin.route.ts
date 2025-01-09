import { Hono } from "hono";
import "zod-openapi/extend";
import { validator } from "hono-openapi/zod";

import { envSchema } from "@/config";
import { configService } from "@/config/config.service";
import { apiResponse } from "@/lib/api-utils/api-response";
import { isSuperadmin } from "@/lib/middlewares/is-superadmin.middleware";
import { jwtAuth } from "@/lib/middlewares/jwt.middleware";
import { baseDescribeRoute } from "@/lib/openapi";
import { UpdateSystemConfigUsecase } from "@/usecases/update-system-config.usecase";
import { z } from "zod";

const route = new Hono();

route.post(
  "/system-configs",
  baseDescribeRoute("Update system config"),
  jwtAuth,
  validator("json", z.any()),
  isSuperadmin,
  async (c) => {
    const updateSystemConfigUsecase = new UpdateSystemConfigUsecase();
    await updateSystemConfigUsecase.execute({ data: c.req.valid("json") });
    return apiResponse(c);
  },
);

route.get(
  "/system-configs",
  baseDescribeRoute("Get system config", envSchema),
  jwtAuth,
  isSuperadmin,
  async (c) => {
    const config = configService.getConfig();
    return apiResponse(c, { data: config });
  },
);

export const superadminRoute = route;
