import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { AuthUser } from "@/types/user.type";

type VariablesType = {
  user: AuthUser;
  sessionId: string;
  isSuperadmin: boolean;
};

export const isSuperadmin = createMiddleware<{ Variables: VariablesType }>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    throw new HTTPException(401);
  }

  const metadata = user.metadata;
  if (!metadata || !metadata.role || metadata.role !== "superadmin") {
    throw new HTTPException(403);
  }

  c.set("isSuperadmin", true);

  await next();
});