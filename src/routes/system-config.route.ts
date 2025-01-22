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
const tags = ["System configs"];

route.post(
  "/system-configs",
  baseDescribeRoute({ description: "Update system config", tags }),
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
  baseDescribeRoute({ description: "Get system config", tags }, envSchema),
  jwtAuth,
  isSuperadmin,
  async (c) => {
    const config = configService.getConfig();
    return apiResponse(c, { data: config });
  },
);

export const systemConfigRoute = route;
