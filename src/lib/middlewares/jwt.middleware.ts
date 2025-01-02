import dayjs from "dayjs";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import type { UserWithoutPassword } from "@/types/user.type";

type VariablesType = {
  user: UserWithoutPassword;
  sessionId: string;
};

export const jwtAuth = createMiddleware<{ Variables: VariablesType }>(async (c, next) => {
  // Get token
  const token = c.req.header("Authorization")?.split(" ")?.[1];
  if (!token) {
    throw new HTTPException(401);
  }

  // Verify token
  const jwtPayload = await verifyAccessToken(token);
  if (!jwtPayload) {
    throw new HTTPException(401);
  }

  // Get user from database - only if session is valid
  const user = await prisma.user.findUnique({
    select: {
      id: true,
      email: true,
      phone: true,
      metadata: true,
      isAnonymous: true,
      bannedAt: true,
      bannedUntil: true,
      bannedReason: true,
      createdAt: true,
      updatedAt: true,
      mfaSettings: true,
      identities: true,
    },
    where: {
      id: jwtPayload.sub,
      sessions: {
        some: {
          id: jwtPayload.sessionId,
          revokedAt: null,
        },
      },
    },
  });
  if (!user) {
    throw new HTTPException(401);
  }

  // Check if user is banned
  if (user.bannedUntil && dayjs(user.bannedUntil).isAfter(dayjs())) {
    throw new UsecaseError(
      ApiCode.UserBanned,
      JSON.stringify({
        bannedAt: user.bannedAt,
        bannedUntil: user.bannedUntil,
        bannedReason: user.bannedReason,
      }),
    );
  }

  // Set data to context
  c.set("user", user);
  c.set("sessionId", jwtPayload.sessionId);

  await next();
});
