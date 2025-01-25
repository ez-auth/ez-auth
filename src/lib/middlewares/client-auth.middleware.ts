import { createMiddleware } from "hono/factory";

import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { prisma } from "@/lib/prisma";

export const clientAuth = createMiddleware(async (c, next) => {
  const apiKey = c.req.header("X-Api-Key");
  if (!apiKey) {
    throw new UsecaseError(ApiCode.InvalidApiKey, "Invalid API key");
  }

  const clientApiKey = await prisma.clientApiKey.findUnique({
    where: {
      key: apiKey,
    },
  });

  if (!clientApiKey) {
    throw new UsecaseError(ApiCode.InvalidApiKey, "Invalid API key");
  }

  c.set("clientType", clientApiKey.type);

  return next();
});
