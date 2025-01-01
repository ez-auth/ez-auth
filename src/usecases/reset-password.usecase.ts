import dayjs from "dayjs";

import { config } from "@/config/config";
import { ApiCode } from "@/lib/api-utils/api-code";
import { UsecaseError } from "@/lib/api-utils/usecase-error";
import { prisma } from "@/lib/prisma";
import { CredentialsType } from "@/types/user.type";

interface ResetPasswordRequest {
  credentialsType: CredentialsType;
  identifier: string;
  token: string;
  newPassword: string;
}

export class ResetPasswordUsecase {
  async execute(request: ResetPasswordRequest): Promise<void> {
    // Find verification record
    const verification = await prisma.verification.findFirst({
      where: {
        token: request.token,
        type: "PasswordRecovery",
        confirmedAt: null,
        user: {
          email: request.credentialsType === CredentialsType.Email ? request.identifier : undefined,
          phone: request.credentialsType === CredentialsType.Phone ? request.identifier : undefined,
        },
      },
      orderBy: {
        sentAt: "desc",
      },
      include: {
        user: {
          select: {
            password: true,
          },
        },
      },
    });

    // Check if the token is valid
    if (
      !verification ||
      dayjs(verification.sentAt).add(config.VERIFICATION_EXPIRY, "second").isBefore(dayjs())
    ) {
      throw new UsecaseError(ApiCode.InvalidConfirmationToken);
    }

    // Check if the password is same
    if (
      verification.user.password &&
      (await Bun.password.verify(request.newPassword, verification.user.password))
    ) {
      throw new UsecaseError(ApiCode.PasswordSame);
    }

    // Hash password
    const hashedPassword = await Bun.password.hash(request.newPassword);

    // Update password
    await prisma.user.update({
      where: {
        id: verification.userId,
      },
      data: {
        password: hashedPassword,
        verifications: {
          update: {
            where: {
              id: verification.id,
            },
            data: {
              confirmedAt: new Date(),
            },
          },
        },
      },
    });
  }
}
