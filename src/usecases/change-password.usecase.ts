import { MFAProvider } from "@prisma/client";

import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { prisma } from "@/lib/prisma";
import { UserWithoutPassword } from "@/types/user.type";
import { verifyTotpUsecase } from ".";

interface ChangePasswordRequest {
  mfaProvider?: MFAProvider;
  token?: string;
  newPassword: string;
}

export class ChangePasswordUsecase {
  async execute(user: UserWithoutPassword, request: ChangePasswordRequest): Promise<void> {
    // Verify MFA
    if (request.mfaProvider === MFAProvider.TOTP && request.token) {
      const isVerified = await verifyTotpUsecase.execute({
        token: request.token,
        userId: user.id,
      });

      if (!isVerified) {
        throw new UsecaseError(ApiCode.InvalidOTP);
      }
    } else if (
      request.mfaProvider === MFAProvider.Email ||
      request.mfaProvider === MFAProvider.SMS
    ) {
      const verification = await prisma.mFAToken.findFirst({
        where: {
          type: "ChangePassword",
          userId: user.id,
          provider: request.mfaProvider,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      if (!verification) {
        throw new UsecaseError(ApiCode.InvalidOTP);
      }
      const isVerified = !verification.confirmedAt && verification.token === request.token;

      await prisma.mFAToken.update({
        where: {
          id: verification.id,
        },
        data: {
          confirmedAt: isVerified ? new Date() : null,
        },
      });
    }

    // Get user from database to check same password
    const currentPassword = (
      await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          password: true,
        },
      })
    )?.password;

    if (currentPassword && (await Bun.password.verify(request.newPassword, currentPassword))) {
      throw new UsecaseError(ApiCode.PasswordSame);
    }

    // Update password
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await Bun.password.hash(request.newPassword),
      },
    });
  }
}
