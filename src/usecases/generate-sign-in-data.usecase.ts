import dayjs from "dayjs";

import { config } from "@/config/config";
import { generateAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { generateRefreshTokenUsecase } from ".";

interface GenerateSignInDataRequest {
  userId: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface GenerateSignInDataResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export class GenerateSignInDataUsecase {
  async execute(request: GenerateSignInDataRequest): Promise<GenerateSignInDataResponse> {
    // Create new session
    const refreshToken = await generateRefreshTokenUsecase.execute();
    const session = await prisma.session.create({
      data: {
        userId: request.userId,
        deviceId: request.deviceId,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        refreshToken,
        lastUsedAt: new Date(),
        expiresAt: dayjs().add(config.SESSION_EXPIRY, "second").toDate(),
      },
    });

    // Generate access token
    const accessToken = await generateAccessToken({
      userId: request.userId,
      sessionId: session.id,
    });

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
    };
  }
}
