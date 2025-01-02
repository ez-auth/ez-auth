import type { Session } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/types/user.type";

interface GetListSessionRequest {
  revoked?: boolean;
}

export class GetListSessionUsecase {
  async execute(user: AuthUser, request: GetListSessionRequest): Promise<Session[]> {
    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        revokedAt: request.revoked
          ? {
              not: null,
            }
          : request.revoked === false
            ? null
            : undefined,
      },
    });

    return sessions;
  }
}
