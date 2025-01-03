import dayjs from "dayjs";

import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { generateAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { generateRefreshTokenUsecase } from ".";

interface RefreshTokenRequest {
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUsecase {
  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    // Verify refresh token
    const session = await prisma.session.findUnique({
      where: {
        refreshToken: request.refreshToken,
      },
    });

    // Check if the session is valid
    if (
      !session ||
      session.revokedAt ||
      (!!session.expiresAt && dayjs(session.expiresAt).isBefore(dayjs()))
    ) {
      throw new UsecaseError(ApiCode.InvalidSession);
    }

    // Generate new token
    const accessToken = await generateAccessToken({
      userId: session.userId,
      sessionId: session.id,
    });

    // Generate new refresh token
    const refreshToken = await generateRefreshTokenUsecase.execute();

    // Update session
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        refreshToken,
        lastUsedAt: new Date(),
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        deviceId: request.deviceId,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
