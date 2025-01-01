import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { prisma } from "@/lib/prisma";
import type { UserWithoutPassword } from "@/types/user.type";

interface RevokeSessionRequest {
  sessionId: string;
}

export class RevokeSessionUsecase {
  async execute(user: UserWithoutPassword, request: RevokeSessionRequest): Promise<void> {
    // Find the session to revoke
    const session = await prisma.session.findUnique({
      where: {
        userId: user.id,
        id: request.sessionId,
      },
    });

    // Check if the session is valid
    if (!session || session.revokedAt) {
      throw new UsecaseError(ApiCode.InvalidSession);
    }

    // Revoke the session
    await prisma.session.update({
      where: {
        id: request.sessionId,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
