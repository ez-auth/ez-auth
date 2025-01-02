import dayjs from "dayjs";

import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { prisma } from "@/lib/prisma";
import { CredentialsType } from "@/types/user.type";
import { GenerateSignInDataUsecase } from "./generate-sign-in-data.usecase";

interface SignInWithCredentialsRequest {
  credentialsType: CredentialsType;
  identifier: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

interface SignInWithCredentialsResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export class SignInWithCredentialsUsecase {
  private generateSignInDataUsecase: GenerateSignInDataUsecase = new GenerateSignInDataUsecase();

  async execute(request: SignInWithCredentialsRequest): Promise<SignInWithCredentialsResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: request.credentialsType === CredentialsType.Email ? request.identifier : undefined,
        phone: request.credentialsType === CredentialsType.Phone ? request.identifier : undefined,
      },
    });

    if (!user || !user.password) {
      throw new UsecaseError(ApiCode.InvalidCredentials);
    }

    // Verify password
    const isPasswordValid = await Bun.password.verify(request.password, user.password);
    if (!isPasswordValid) {
      throw new UsecaseError(ApiCode.InvalidCredentials);
    }

    // Check user is confirmed
    let isVerified = false;
    switch (request.credentialsType) {
      case CredentialsType.Email:
        isVerified = user.isVerifiedEmail;
        break;
      case CredentialsType.Phone:
        isVerified = user.isVerifiedPhone;
        break;
    }
    if (!isVerified) {
      throw new UsecaseError(ApiCode.UserNotVerified);
    }

    // Check if the user is banned
    if (dayjs(user.bannedUntil).isAfter(dayjs())) {
      throw new UsecaseError(
        ApiCode.UserBanned,
        JSON.stringify({
          bannedAt: user.bannedAt,
          bannedUntil: user.bannedUntil,
          bannedReason: user.bannedReason,
        }),
      );
    }

    return this.generateSignInDataUsecase.execute({
      userId: user.id,
      deviceId: request.deviceId,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
    });
  }
}
